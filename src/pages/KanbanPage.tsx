import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
  Circle,
  X,
  Save,
  User,
  Flag,
  ArrowRight,
  AlertCircle,
  Star,
  Edit,
  Trash2,
  Eye,
  Users,
  Layers,
  Target,
  Zap,
  TrendingUp,
  Activity,
  Timer,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const KanbanPage = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("board"); // board, list, timeline, table
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskColumn, setNewTaskColumn] = useState("");
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assigned_to: "",
    project_id: "",
    tags: "",
  });

  useEffect(() => {
    const unsubscribers: any[] = [];
    let mounted = true;
    let connectionTimeout: NodeJS.Timeout;
    let hasConnected = false;

    // Enhanced mock data with purple theme colors
    const getMockTasks = () => [
      {
        id: "mock-task-1",
        title: "Design System Enhancement",
        description: "Update the design system components with new branding guidelines and color schemes",
        status: "pending",
        progress_status: "pending",
        priority: "high",
        assigned_to: "mock-user",
        due_date: "2024-02-15",
        created_at: { seconds: Date.now() / 1000 },
        tags: "design,urgent,ui",
        progress: 0,
        comments: []
      },
      {
        id: "mock-task-2",
        title: "Payment API Integration",
        description: "Integrate third-party payment API for checkout flow with enhanced security",
        status: "in_progress",
        progress_status: "in_progress",
        priority: "high",
        assigned_to: "mock-user-2",
        due_date: "2024-02-20",
        created_at: { seconds: Date.now() / 1000 },
        tags: "backend,api,security",
        progress: 65,
        comments: [{ id: 1, text: "Working on authentication flow" }]
      },
      {
        id: "mock-task-3",
        title: "User Experience Testing",
        description: "Conduct comprehensive user testing for the new dashboard interface",
        status: "review",
        progress_status: "review",
        priority: "medium",
        assigned_to: "mock-user-3",
        due_date: "2024-02-18",
        created_at: { seconds: Date.now() / 1000 },
        tags: "testing,ux,analytics",
        progress: 90,
        comments: [{ id: 1, text: "Initial feedback looks positive" }]
      },
      {
        id: "mock-task-4",
        title: "API Documentation Update",
        description: "Update comprehensive API documentation with new endpoints and examples",
        status: "completed",
        progress_status: "completed",
        priority: "low",
        assigned_to: "mock-user",
        due_date: "2024-02-10",
        created_at: { seconds: Date.now() / 1000 },
        tags: "docs,api",
        progress: 100,
        comments: []
      },
      {
        id: "mock-task-5",
        title: "Performance Optimization",
        description: "Optimize application performance and reduce bundle size",
        status: "in_progress",
        progress_status: "in_progress",
        priority: "medium",
        assigned_to: "mock-user-2",
        due_date: "2024-02-25",
        created_at: { seconds: Date.now() / 1000 },
        tags: "performance,optimization",
        progress: 35,
        comments: []
      }
    ];

    const getMockProjects = () => [
      {
        id: "mock-project-1",
        name: "Website Redesign",
        description: "Complete website redesign project with modern UI",
        color: "#8b5cf6"
      },
      {
        id: "mock-project-2",
        name: "Mobile Application", 
        description: "iOS and Android app development",
        color: "#a855f7"
      },
      {
        id: "mock-project-3",
        name: "Analytics Dashboard",
        description: "Real-time analytics and reporting dashboard",
        color: "#9333ea"
      }
    ];

    const getMockEmployees = () => [
      {
        id: "mock-user",
        name: "Alice Johnson",
        email: "alice@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        role: "Senior Designer"
      },
      {
        id: "mock-user-2",
        name: "Bob Smith",
        email: "bob@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        role: "Full Stack Developer"
      },
      {
        id: "mock-user-3",
        name: "Carol Davis",
        email: "carol@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        role: "QA Engineer"
      },
      {
        id: "mock-user-4",
        name: "David Wilson",
        email: "david@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        role: "Product Manager"
      }
    ];

    const setupFirebaseWithTimeout = async () => {
      try {
        connectionTimeout = setTimeout(() => {
          if (!hasConnected && mounted) {
            console.warn("Firebase connection timeout - switching to offline mode");
            toast.error("Connection timeout - using offline mode");
            loadMockData();
          }
        }, 3000);

        const testConnection = async () => {
          try {
            await collection(db, "tasks");
            hasConnected = true;
            clearTimeout(connectionTimeout);

            if (mounted) {
              setupRealtimeListeners();
            }
          } catch (error) {
            throw error;
          }
        };

        await testConnection();

      } catch (error) {
        console.error("Firebase connection failed:", error);
        if (mounted) {
          toast.error("Firebase connection failed - using offline mode");
          loadMockData();
        }
      }
    };

    const loadMockData = () => {
      if (mounted) {
        setTasks(getMockTasks());
        setProjects(getMockProjects());
        setEmployees(getMockEmployees());
        setLoading(false);
      }
    };

    const setupRealtimeListeners = () => {
      try {
        const tasksUnsub = onSnapshot(
          collection(db, "tasks"),
          (snapshot) => {
            if (mounted) {
              hasConnected = true;
              setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
              setLoading(false);
            }
          },
          (error) => {
            console.warn("Tasks listener error:", error);
            toast.error("Tasks data connection lost - using cached data");
            if (mounted) {
              setTasks(getMockTasks());
              setLoading(false);
            }
          }
        );

        const projectsUnsub = onSnapshot(
          collection(db, "projects"),
          (snapshot) => {
            if (mounted) {
              setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
          },
          (error) => {
            console.warn("Projects listener error:", error);
            if (mounted) {
              setProjects(getMockProjects());
            }
          }
        );

        const employeesUnsub = onSnapshot(
          collection(db, "employees"),
          (snapshot) => {
            if (mounted) {
              setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
          },
          (error) => {
            console.warn("Employees listener error:", error);
            if (mounted) {
              setEmployees(getMockEmployees());
            }
          }
        );

        unsubscribers.push(tasksUnsub, projectsUnsub, employeesUnsub);
      } catch (error) {
        console.error("Failed to setup Firebase listeners:", error);
        if (mounted) {
          toast.error("Connection error - using offline mode");
          loadMockData();
        }
      }
    };

    setupFirebaseWithTimeout();

    return () => {
      mounted = false;

      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }

      unsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch (error) {
          console.warn("Error unsubscribing:", error);
        }
      });
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterOpen && !(event.target as Element).closest('.filter-dropdown')) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const getEmployeeName = (empId: string) =>
    employees.find((emp: any) => emp.id === empId)?.name || "Unassigned";

  const getEmployeeAvatar = (empId: string) => {
    const emp = employees.find((emp: any) => emp.id === empId);
    return emp?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${empId}`;
  };

  const getProjectColor = (projectId: string) => {
    const project = projects.find((p: any) => p.id === projectId);
    return project?.color || "#8b5cf6";
  };

  // Enhanced filter logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !selectedDate || task.due_date === selectedDate;
    const matchesProject = !selectedProject || task.project_id === selectedProject;
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    const matchesAssignee = !selectedAssignee || task.assigned_to === selectedAssignee;
    
    return matchesSearch && matchesDate && matchesProject && matchesPriority && matchesAssignee;
  });

  const columns = [
    {
      id: "pending",
      title: "📋 Backlog",
      status: "pending", 
      color: "from-purple-100/90 via-purple-50/80 to-purple-100/90",
      borderColor: "border-purple-300/40 dark:border-purple-400/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-gradient-to-br from-purple-50/60 via-white/80 to-purple-100/60 dark:from-purple-900/40 dark:via-gray-800/60 dark:to-purple-800/40",
      glassEffect: "backdrop-blur-xl bg-white/80 dark:bg-gradient-to-br dark:from-purple-900/60 dark:via-gray-800/80 dark:to-purple-800/60",
      tasks: filteredTasks.filter((t: any) => t.status === "pending" || t.progress_status === "pending"),
    },
    {
      id: "in_progress",
      title: "🚀 In Progress",
      status: "in_progress",
      color: "from-purple-200/90 via-purple-100/80 to-purple-200/90",
      borderColor: "border-purple-400/40 dark:border-purple-500/30",
      iconColor: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-gradient-to-br from-purple-100/60 via-white/80 to-purple-200/60 dark:from-purple-800/40 dark:via-gray-800/60 dark:to-purple-700/40",
      glassEffect: "backdrop-blur-xl bg-white/80 dark:bg-gradient-to-br dark:from-purple-800/60 dark:via-gray-800/80 dark:to-purple-700/60",
      tasks: filteredTasks.filter((t: any) => t.status === "in_progress" || t.progress_status === "in_progress"),
    },
    {
      id: "review",
      title: "👀 Review",
      status: "review",
      color: "from-purple-300/90 via-purple-200/80 to-purple-300/90",
      borderColor: "border-purple-500/40 dark:border-purple-400/30",
      iconColor: "text-purple-800 dark:text-purple-200",
      bgColor: "bg-gradient-to-br from-purple-200/60 via-white/80 to-purple-300/60 dark:from-purple-700/40 dark:via-gray-800/60 dark:to-purple-600/40",
      glassEffect: "backdrop-blur-xl bg-white/80 dark:bg-gradient-to-br dark:from-purple-700/60 dark:via-gray-800/80 dark:to-purple-600/60",
      tasks: filteredTasks.filter((t: any) => t.status === "review" || t.status === "testing" || t.progress_status === "review"),
    },
    {
      id: "completed",
      title: "✅ Done",
      status: "completed",
      color: "from-green-100/90 via-emerald-100/80 to-green-100/90",
      borderColor: "border-green-300/40 dark:border-green-400/30",
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-gradient-to-br from-green-50/60 via-white/80 to-emerald-100/60 dark:from-green-900/40 dark:via-gray-800/60 dark:to-emerald-800/40",
      glassEffect: "backdrop-blur-xl bg-white/80 dark:bg-gradient-to-br dark:from-green-900/60 dark:via-gray-800/80 dark:to-emerald-800/60",
      tasks: filteredTasks.filter((t: any) => t.status === "completed" || t.progress_status === "completed"),
    },
  ];

  const handleAddTask = async () => {
    if (!newTaskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      if (!db) {
        throw new Error("Database connection not available");
      }

      const addTaskPromise = addDoc(collection(db, "tasks"), {
        ...newTaskForm,
        status: newTaskColumn || "pending",
        progress_status: newTaskColumn || "pending",
        created_by: user?.uid || "anonymous",
        created_at: Timestamp.now(),
        task_id: `TASK-${Date.now()}`,
        progress: 0,
        comments: [],
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), 5000)
      );

      await Promise.race([addTaskPromise, timeoutPromise]);

      toast.success("Task created successfully! 🎉");
      setNewTaskForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assigned_to: "",
        project_id: "",
        tags: "",
      });
      setShowNewTaskModal(false);
      setNewTaskColumn("");
    } catch (error: any) {
      console.error("Error adding task:", error);

      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        toast.error("Connection timeout - task not saved. Please try again.");
      } else {
        toast.error(`Failed to add task: ${error.message || 'Connection error'}`);
      }
    }
  };

  const handleTaskMove = async (task: any, newStatus: string) => {
    try {
      if (!db) {
        throw new Error("Database connection not available");
      }

      const updateTaskPromise = updateDoc(doc(db, "tasks", task.id), {
        status: newStatus,
        progress_status: newStatus,
        progress_updated_at: Timestamp.now(),
        progress: newStatus === "completed" ? 100 : task.progress || 0,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), 5000)
      );

      await Promise.race([updateTaskPromise, timeoutPromise]);

      toast.success(`Task moved to ${newStatus.replace('_', ' ')} 📈`);
    } catch (error: any) {
      console.error("Error updating task:", error);

      if (error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        toast.error("Connection timeout - task status not updated. Please try again.");
      } else {
        toast.error(`Failed to update task: ${error.message || 'Connection error'}`);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnStatus) {
      handleTaskMove(draggedTask, columnStatus);
    }
    setDraggedTask(null);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flag className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Flag className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <Flag className="w-4 h-4 text-green-500" />;
      default:
        return <Flag className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100/80 text-red-700 border-red-200/50 dark:bg-red-900/40 dark:text-red-300 dark:border-red-600/30";
      case "medium":
        return "bg-yellow-100/80 text-yellow-700 border-yellow-200/50 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-600/30";
      case "low":
        return "bg-green-100/80 text-green-700 border-green-200/50 dark:bg-green-900/40 dark:text-green-300 dark:border-green-600/30";
      default:
        return "bg-gray-100/80 text-gray-700 border-gray-200/50 dark:bg-gray-900/40 dark:text-gray-300 dark:border-gray-600/30";
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

    const getCardBgColor = () => {
      if (isOverdue) return 'bg-white/95 dark:bg-gray-800/95 border-l-4 border-l-red-500 border border-red-100 dark:border-red-900/30 shadow-sm';

      switch (task.status) {
        case 'completed':
          return 'bg-white/95 dark:bg-gray-800/95 border-l-4 border-l-green-500 border border-gray-200/60 dark:border-gray-700/60 shadow-sm';
        case 'in_progress':
          return 'bg-white/95 dark:bg-gray-800/95 border-l-4 border-l-blue-500 border border-gray-200/60 dark:border-gray-700/60 shadow-sm';
        case 'review':
          return 'bg-white/95 dark:bg-gray-800/95 border-l-4 border-l-amber-500 border border-gray-200/60 dark:border-gray-700/60 shadow-sm';
        default:
          return 'bg-white/95 dark:bg-gray-800/95 border-l-4 border-l-gray-400 border border-gray-200/60 dark:border-gray-700/60 shadow-sm';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.3)"
        }}
        whileTap={{ scale: 0.98 }}
        layout
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onClick={() => {
          setSelectedTask(task);
          setShowTaskDetailModal(true);
        }}
        className={`${getCardBgColor()} rounded-2xl p-5 mb-4 transition-all duration-500 cursor-pointer group relative overflow-hidden hover:shadow-2xl`}
      >


        {/* Priority stripe */}
        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
          task.priority === "high" ? "bg-gradient-to-r from-red-500 to-pink-500" :
          task.priority === "medium" ? "bg-gradient-to-r from-purple-500 to-purple-600" :
          "bg-gradient-to-r from-green-500 to-emerald-500"
        }`} />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 leading-tight mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
              {task.title}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {getPriorityIcon(task.priority)}
              <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${getPriorityBadge(task.priority)}`}>
                {task.priority?.toUpperCase()}
              </span>
              {isOverdue && (
                <span className="px-2 py-0.5 text-xs bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full border border-red-200/50 dark:border-red-600/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>
          <button 
            className="opacity-0 group-hover:opacity-100 text-purple-400 hover:text-purple-600 dark:text-purple-300 dark:hover:text-purple-200 p-1 transition-opacity rounded-lg hover:bg-purple-100/60 dark:hover:bg-purple-900/60"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        {/* Description */}
        {task.description && (
          <p className="text-xs text-purple-700 dark:text-purple-300 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Progress Bar */}
        {task.progress > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3"
          >
            <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-300 mb-2">
              <span className="font-medium">Progress</span>
              <motion.span
                className="font-bold text-purple-700 dark:text-purple-200"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {task.progress}%
              </motion.span>
            </div>
            <div className="w-full bg-purple-100/60 dark:bg-purple-900/40 rounded-full h-2.5 shadow-inner backdrop-blur-sm">
              <motion.div
                className={`h-2.5 rounded-full shadow-lg ${
                  task.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  'bg-gradient-to-r from-purple-500 to-purple-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Tags */}
        {task.tags && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {task.tags.split(',').slice(0, 3).map((tag: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="px-2 py-1 text-xs bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200/50 dark:border-purple-600/30 font-medium shadow-sm backdrop-blur-sm"
              >
                #{tag.trim()}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Project Badge */}
        {task.project_id && (
          <div className="mb-3">
            <span 
              className="px-2 py-1 text-xs text-white rounded-md font-medium shadow-sm"
              style={{ backgroundColor: getProjectColor(task.project_id) }}
            >
              {projects.find(p => p.id === task.project_id)?.name || "Project"}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-300">
          <div className="flex items-center gap-2">
            <img
              src={getEmployeeAvatar(task.assigned_to)}
              alt="avatar"
              className="w-6 h-6 rounded-full border-2 border-white dark:border-purple-600 shadow-lg ring-2 ring-purple-100/50 dark:ring-purple-400/30"
            />
            <span className="font-medium">{getEmployeeName(task.assigned_to)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {task.due_date && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:bg-gradient-to-br dark:from-[#0f1129] dark:via-[#1a1b3a] dark:to-[#2d1b69] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-600 border-t-purple-600 dark:border-t-purple-400 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-purple-700 dark:text-purple-300 font-medium">Loading your workspace...</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
            Preparing the ultimate kanban experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:bg-gradient-to-br dark:from-[#0f1129] dark:via-[#1a1b3a] dark:to-[#2d1b69]">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 via-transparent to-purple-900/5 dark:from-purple-400/10 dark:via-transparent dark:to-purple-600/10 pointer-events-none" />
      
      {/* Enhanced Header */}
      <div className="relative backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-purple-200/30 dark:border-purple-600/30 p-4 flex-shrink-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-white/10 to-purple-600/5 dark:from-purple-400/10 dark:via-gray-900/10 dark:to-purple-600/10" />
        
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden">

                <Layers className="w-6 h-6 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                  Project Board
                </h1>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  {filteredTasks.length} tasks • {projects.length} projects
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/40 dark:to-emerald-900/40 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-600/30 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm">
                <Activity className="w-3 h-3" />
                {navigator.onLine ? 'Live' : 'Offline'}
              </span>
              <span className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-100/80 to-purple-200/80 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-600/30 rounded-full backdrop-blur-sm shadow-sm">
                {Math.round((columns.find(c => c.id === "completed")?.tasks.length || 0) / Math.max(filteredTasks.length, 1) * 100)}% Complete
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-purple-100/60 dark:bg-purple-900/60 rounded-xl p-1 backdrop-blur-sm border border-purple-200/50 dark:border-purple-600/30 shadow-sm">
              {[
              { id: "board", icon: Layers, label: "Board" },
              { id: "list", icon: Eye, label: "List" },
              { id: "timeline", icon: TrendingUp, label: "Timeline" },
              { id: "table", icon: Activity, label: "Table" }
            ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setViewMode(mode.id);
                    if (mode.id === 'list') {
                      toast.success('Switched to List view! 📋');
                    } else if (mode.id === 'timeline') {
                      toast.success('Switched to Timeline view! ⏰');
                    } else if (mode.id === 'table') {
                      toast.success('Switched to Table view! 📊');
                    } else if (mode.id === 'board') {
                      toast.success('Switched to Board view! 📋');
                    }
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${
                    viewMode === mode.id
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                      : 'text-purple-600 dark:text-purple-400 hover:bg-purple-200/50 dark:hover:bg-purple-800/50'
                  }`}
                >
                  <mode.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Enhanced Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Search tasks, tags, or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-900 dark:text-purple-100 placeholder:text-purple-400 dark:placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 dark:focus:border-purple-400 shadow-lg w-64"
              />
            </div>

            {/* Enhanced Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-700 dark:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-900/80 transition-colors shadow-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className="w-4 h-4" />
              </button>

              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-80 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-purple-200/50 dark:border-purple-600/50 rounded-xl shadow-2xl z-50 p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white/50 dark:from-purple-900/50 dark:to-gray-900/50 rounded-xl" />
                  
                  <div className="relative">
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-4">Filter Tasks</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Priority
                          </label>
                          <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          >
                            <option value="">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                          Assignee
                        </label>
                        <select
                          value={selectedAssignee}
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        >
                          <option value="">All Assignees</option>
                          {employees.map((emp: any) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name || emp.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-2">
                          Project
                        </label>
                        <select
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        >
                          <option value="">All Projects</option>
                          {projects.map((project: any) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t border-purple-200/50 dark:border-purple-600/50">
                        <button
                          onClick={() => {
                            setSelectedDate("");
                            setSelectedProject("");
                            setSelectedPriority("");
                            setSelectedAssignee("");
                            setFilterOpen(false);
                          }}
                          className="px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="text-center">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {column.tasks.length}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                {column.title.replace(/[^\w\s]/gi, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Kanban Board */}
      <div className="flex-1 min-h-0 p-6 relative">
        {viewMode === "board" && (
          <div className="flex gap-6 h-full min-w-max overflow-x-auto w-full pb-4">
          {columns.map((column) => (
            <motion.div 
              key={column.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: columns.indexOf(column) * 0.1 }}
              className="flex flex-col w-80 min-w-80 max-w-80 h-full flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Enhanced Column Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${column.glassEffect} rounded-t-2xl p-5 border-2 ${column.borderColor} relative overflow-hidden shadow-lg`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-purple-50/5 dark:from-purple-900/10 dark:to-gray-900/10"></div>
                <div className="relative flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      className={`w-12 h-12 rounded-2xl bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl flex items-center justify-center ${column.iconColor} shadow-xl border border-white/50 dark:border-purple-600/50`}
                    >
                      {column.id === "pending" && <Circle className="w-5 h-5" />}
                      {column.id === "in_progress" && <Clock className="w-5 h-5" />}
                      {column.id === "review" && <Eye className="w-5 h-5" />}
                      {column.id === "completed" && <CheckCircle className="w-5 h-5" />}
                    </motion.div>
                    <div>
                      <h2 className="text-sm font-bold text-purple-900 dark:text-purple-100">
                        {column.title}
                      </h2>
                      <motion.p
                        key={column.tasks.length}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-purple-600 dark:text-purple-300 font-medium"
                      >
                        {column.tasks.length} tasks
                      </motion.p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setNewTaskColumn(column.status);
                      setShowNewTaskModal(true);
                    }}
                    className="w-9 h-9 bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-xl border border-white/50 dark:border-purple-600/50"
                    title={`Add task to ${column.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Enhanced Progress indicator */}
                <div className="relative w-full bg-white/30 dark:bg-purple-900/30 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((column.tasks.length / Math.max(filteredTasks.length, 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full shadow-sm"
                  />
                </div>
              </motion.div>

              {/* Enhanced Column Content */}
              <div className={`flex-1 ${column.glassEffect} rounded-b-2xl border-2 border-t-0 ${column.borderColor} p-5 overflow-y-auto custom-scrollbar`}>
                <AnimatePresence>
                  {column.tasks.map((task: any, index: number) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Enhanced Empty State */}
                {column.tasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-purple-400 dark:text-purple-500"
                  >
                    <div className="w-16 h-16 bg-purple-100/60 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-purple-200/30 dark:border-purple-600/30">
                      {column.id === "pending" && <Circle className="w-6 h-6" />}
                      {column.id === "in_progress" && <Zap className="w-6 h-6" />}
                      {column.id === "review" && <Eye className="w-6 h-6" />}
                      {column.id === "completed" && <Target className="w-6 h-6" />}
                    </div>
                    <p className="text-sm font-medium mb-2">No tasks yet</p>
                    <p className="text-xs text-center mb-4">
                      {column.id === "pending" && "Tasks start their journey here"}
                      {column.id === "in_progress" && "Active work happens here"}
                      {column.id === "review" && "Quality checks happen here"}
                      {column.id === "completed" && "Completed tasks celebrate here"}
                    </p>
                    <button 
                      onClick={() => {
                        setNewTaskColumn(column.status);
                        setShowNewTaskModal(true);
                      }}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                    >
                      + Add first task
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
          </div>
        )}

        {/* List View with purple theme */}
        {viewMode === "list" && (
          <div className="flex-1 w-full">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-purple-200/50 dark:border-purple-600/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent flex items-center gap-3">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Task List View
                </h2>
                <span className="text-sm text-purple-600 dark:text-purple-400">{filteredTasks.length} tasks</span>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-sm bg-gradient-to-r from-white/80 to-purple-50/60 dark:from-gray-800/80 dark:to-purple-900/40 rounded-xl p-4 border border-purple-200/50 dark:border-purple-600/30 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskDetailModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === "high" ? "bg-red-500" :
                          task.priority === "medium" ? "bg-purple-500" : "bg-green-500"
                        }`} />

                        <div className="flex-1">
                          <h3 className="font-semibold text-purple-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            {task.description || "No description"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={getEmployeeAvatar(task.assigned_to)}
                            alt="avatar"
                            className="w-8 h-8 rounded-full border-2 border-purple-200 dark:border-purple-600 shadow-sm"
                          />
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            task.status === "completed" ? "bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300" :
                            task.status === "in_progress" ? "bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" :
                            task.status === "review" ? "bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" :
                            "bg-gray-100/80 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300"
                          }`}>
                            {task.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {task.due_date && (
                          <span className="text-xs text-purple-500 dark:text-purple-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                      </div>
                    </div>

                    {task.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-purple-100/60 dark:bg-purple-900/40 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-purple-300 dark:text-purple-600 mx-auto mb-4" />
                    <p className="text-purple-600 dark:text-purple-400">No tasks found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View with purple theme */}
        {viewMode === "timeline" && (
          <div className="flex-1 w-full">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-purple-200/50 dark:border-purple-600/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Timeline View
                </h2>
                <span className="text-sm text-purple-600 dark:text-purple-400">{filteredTasks.length} tasks</span>
              </div>

              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-700"></div>

                <div className="space-y-6">
                  {filteredTasks
                    .sort((a, b) => new Date(a.due_date || a.created_at?.seconds * 1000).getTime() - new Date(b.due_date || b.created_at?.seconds * 1000).getTime())
                    .map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start gap-6"
                    >
                      <div className={`relative z-10 w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 shadow-lg ${
                        task.status === "completed" ? "bg-green-500" :
                        task.status === "in_progress" ? "bg-purple-500" :
                        task.status === "review" ? "bg-yellow-500" :
                        "bg-gray-400"
                      }`}>
                        {task.status === "in_progress" && (
                          <div className="absolute inset-0 rounded-full animate-ping bg-purple-400" />
                        )}
                      </div>

                      <motion.div
                        whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)" }}
                        className="flex-1 backdrop-blur-sm bg-gradient-to-r from-white/80 to-purple-50/60 dark:from-gray-800/80 dark:to-purple-900/40 rounded-xl p-4 border border-purple-200/50 dark:border-purple-600/30 cursor-pointer group"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetailModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                              {task.title}
                            </h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                              {task.description || "No description"}
                            </p>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getEmployeeAvatar(task.assigned_to)}
                                  alt="avatar"
                                  className="w-6 h-6 rounded-full border-2 border-purple-200 dark:border-purple-600 shadow-sm"
                                />
                                <span className="text-sm text-purple-600 dark:text-purple-400">
                                  {getEmployeeName(task.assigned_to)}
                                </span>
                              </div>

                              {task.due_date && (
                                <div className="flex items-center gap-1 text-sm text-purple-500 dark:text-purple-400">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}

                              <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getPriorityBadge(task.priority)}`}>
                                {task.priority?.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <Timer className="w-5 h-5 text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors" />
                        </div>

                        {task.progress > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 mb-2">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-purple-100/60 dark:bg-purple-900/40 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}

                  {filteredTasks.length === 0 && (
                    <div className="text-center py-12 ml-16">
                      <TrendingUp className="w-12 h-12 text-purple-300 dark:text-purple-600 mx-auto mb-4" />
                      <p className="text-purple-600 dark:text-purple-400">No tasks in timeline</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View with purple theme */}
        {viewMode === "table" && (
          <div className="flex-1 w-full">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-purple-200/50 dark:border-purple-600/50 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-purple-200/50 dark:border-purple-600/50">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent flex items-center gap-3">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Table View
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50/60 dark:bg-purple-900/40">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-200/50 dark:divide-purple-600/30">
                    {filteredTasks.map((task, index) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="bg-white/60 dark:bg-gray-900/60 hover:bg-purple-50/60 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              task.priority === "high" ? "bg-red-500" :
                              task.priority === "medium" ? "bg-purple-500" : "bg-green-500"
                            }`} />
                            <div>
                              <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">{task.title}</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400 truncate max-w-xs">
                                {task.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={getEmployeeAvatar(task.assigned_to)}
                              alt="avatar"
                              className="w-8 h-8 rounded-full border-2 border-purple-200 dark:border-purple-600 shadow-sm"
                            />
                            <span className="text-sm text-purple-900 dark:text-purple-100">
                              {getEmployeeName(task.assigned_to)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium border ${
                            task.status === "completed" ? "bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-600/30" :
                            task.status === "in_progress" ? "bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-600/30" :
                            task.status === "review" ? "bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200/50 dark:border-yellow-600/30" :
                            "bg-gray-100/80 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30"
                          }`}>
                            {task.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(task.priority)}
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityBadge(task.priority)}`}>
                              {task.priority?.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.progress > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-purple-100/60 dark:bg-purple-900/40 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-purple-600 dark:text-purple-400">{task.progress}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-purple-400">Not started</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {task.due_date ? (
                            <div className={`flex items-center gap-1 text-sm ${
                              new Date(task.due_date) < new Date() && task.status !== "completed" ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'
                            }`}>
                              <Calendar className="w-4 h-4" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-xs text-purple-400">No due date</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                                setShowTaskDetailModal(true);
                              }}
                              className="p-1 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                              title="Edit Task"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-purple-300 dark:text-purple-600 mx-auto mb-4" />
                    <p className="text-purple-600 dark:text-purple-400">No tasks found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced New Task Modal */}
      <AnimatePresence>
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewTaskModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-600/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white/50 dark:from-purple-900/50 dark:to-gray-900/50 rounded-2xl" />
              
              <div className="relative flex items-center justify-between p-6 border-b border-purple-200/50 dark:border-purple-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                    Create New Task
                  </h2>
                </div>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors rounded-lg hover:bg-purple-100/60 dark:hover:bg-purple-900/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 text-purple-900 dark:text-purple-100 placeholder:text-purple-400"
                    placeholder="Enter a clear, actionable task title..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 text-purple-900 dark:text-purple-100 placeholder:text-purple-400"
                    placeholder="Provide context and details for this task..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 text-purple-900 dark:text-purple-100"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskForm.due_date}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 text-purple-900 dark:text-purple-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Assign To
                  </label>
                  <select
                    value={newTaskForm.assigned_to}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full px-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 text-purple-900 dark:text-purple-100"
                  >
                    <option value="">👤 Select team member...</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || emp.email} {emp.role && `(${emp.role})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Project
                    </label>
                    <select
                      value={newTaskForm.project_id}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, project_id: e.target.value }))}
                      className="w-full px-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 text-purple-900 dark:text-purple-100"
                    >
                      <option value="">📁 Select project...</option>
                      {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={newTaskForm.tags}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 text-purple-900 dark:text-purple-100 placeholder:text-purple-400"
                      placeholder="frontend, api, urgent"
                    />
                  </div>
                </div>

                {newTaskColumn && (
                  <div className="bg-purple-50/80 dark:bg-purple-900/40 p-4 rounded-xl border border-purple-200/50 dark:border-purple-600/30">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        This task will be added to: <strong>{columns.find(c => c.status === newTaskColumn)?.title}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex justify-end gap-3 p-6 border-t border-purple-200/50 dark:border-purple-600/50">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-6 py-3 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <Save className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enhanced Task Detail Modal */}
      <AnimatePresence>
        {showTaskDetailModal && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowTaskDetailModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-4xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-purple-200/50 dark:border-purple-600/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white/50 dark:from-purple-900/50 dark:to-gray-900/50 rounded-3xl" />
              
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white relative overflow-hidden rounded-t-3xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                    >
                      {getPriorityIcon(selectedTask.priority)}
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold text-white"
                      >
                        {selectedTask.title}
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-purple-100 text-sm"
                      >
                        Task #{selectedTask.id?.slice(-8)} • {selectedTask.status?.replace('_', ' ').toUpperCase()}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    onClick={() => setShowTaskDetailModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors rounded-xl hover:bg-white/20 backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="relative p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Description</h3>
                      <p className="text-purple-600 dark:text-purple-400">
                        {selectedTask.description || "No description provided."}
                      </p>
                    </div>

                    {selectedTask.progress > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Progress</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-purple-100/60 dark:bg-purple-900/40 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedTask.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            {selectedTask.progress}%
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedTask.tags && (
                      <div>
                        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTask.tags.split(',').map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-sm bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200/50 dark:border-purple-600/30"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Status</h3>
                      <span className={`px-3 py-1 text-sm rounded-lg border ${
                        selectedTask.status === "completed" ? "bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200/50 dark:border-green-600/30" :
                        selectedTask.status === "in_progress" ? "bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-600/30" :
                        selectedTask.status === "review" ? "bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200/50 dark:border-yellow-600/30" :
                        "bg-gray-100/80 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-gray-600/30"
                      }`}>
                        {selectedTask.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Priority</h3>
                      <span className={`px-3 py-1 text-sm rounded-lg border ${getPriorityBadge(selectedTask.priority)}`}>
                        {selectedTask.priority?.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Assignee</h3>
                      <div className="flex items-center gap-2">
                        <img
                          src={getEmployeeAvatar(selectedTask.assigned_to)}
                          alt="avatar"
                          className="w-8 h-8 rounded-full border-2 border-purple-200 dark:border-purple-600"
                        />
                        <span className="text-sm text-purple-900 dark:text-purple-100">
                          {getEmployeeName(selectedTask.assigned_to)}
                        </span>
                      </div>
                    </div>

                    {selectedTask.due_date && (
                      <div>
                        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Due Date</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                          <span className="text-sm text-purple-900 dark:text-purple-100">
                            {new Date(selectedTask.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedTask.project_id && (
                      <div>
                        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Project</h3>
                        <span 
                          className="px-3 py-1 text-sm text-white rounded-lg font-medium"
                          style={{ backgroundColor: getProjectColor(selectedTask.project_id) }}
                        >
                          {projects.find(p => p.id === selectedTask.project_id)?.name || "Unknown Project"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KanbanPage;
