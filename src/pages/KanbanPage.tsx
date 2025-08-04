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

    const setupRealtimeListeners = async () => {
      try {
        const tasksUnsub = onSnapshot(
          collection(db, "tasks"),
          (snapshot) => {
            if (mounted) {
              setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
              setLoading(false);
            }
          },
          (error) => {
            console.warn("Tasks listener error:", error);
            toast.error("Failed to load tasks data");
            if (mounted) {
              setTasks([
                {
                  id: "mock-task-1",
                  title: "Design System Update",
                  description: "Update the design system components with new branding guidelines",
                  status: "pending",
                  progress_status: "pending",
                  priority: "high",
                  assigned_to: "mock-user",
                  due_date: "2024-02-15",
                  created_at: { seconds: Date.now() / 1000 },
                  tags: "design,urgent",
                  progress: 0,
                  comments: []
                },
                {
                  id: "mock-task-2",
                  title: "API Integration",
                  description: "Integrate third-party payment API for checkout flow",
                  status: "in_progress",
                  progress_status: "in_progress",
                  priority: "high",
                  assigned_to: "mock-user-2",
                  due_date: "2024-02-20",
                  created_at: { seconds: Date.now() / 1000 },
                  tags: "backend,api",
                  progress: 65,
                  comments: [{ id: 1, text: "Working on authentication" }]
                },
                {
                  id: "mock-task-3",
                  title: "User Testing",
                  description: "Conduct user testing for the new dashboard interface",
                  status: "review",
                  progress_status: "review",
                  priority: "medium",
                  assigned_to: "mock-user-3",
                  due_date: "2024-02-18",
                  created_at: { seconds: Date.now() / 1000 },
                  tags: "testing,ux",
                  progress: 90,
                  comments: []
                },
                {
                  id: "mock-task-4",
                  title: "Documentation Update",
                  description: "Update API documentation with new endpoints",
                  status: "completed",
                  progress_status: "completed",
                  priority: "low",
                  assigned_to: "mock-user",
                  due_date: "2024-02-10",
                  created_at: { seconds: Date.now() / 1000 },
                  tags: "docs",
                  progress: 100,
                  comments: []
                }
              ]);
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
              setProjects([
                {
                  id: "mock-project-1",
                  name: "Website Redesign",
                  description: "Complete website redesign project",
                  color: "#3b82f6"
                },
                {
                  id: "mock-project-2",
                  name: "Mobile App",
                  description: "iOS and Android app development",
                  color: "#10b981"
                }
              ]);
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
              setEmployees([
                {
                  id: "mock-user",
                  name: "Alice Johnson",
                  email: "alice@example.com",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
                  role: "Designer"
                },
                {
                  id: "mock-user-2",
                  name: "Bob Smith",
                  email: "bob@example.com",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
                  role: "Developer"
                },
                {
                  id: "mock-user-3",
                  name: "Carol Davis",
                  email: "carol@example.com",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
                  role: "QA Engineer"
                }
              ]);
            }
          }
        );

        unsubscribers.push(tasksUnsub, projectsUnsub, employeesUnsub);
      } catch (error) {
        console.error("Failed to setup Firebase listeners:", error);
        toast.error("Connection error - using offline mode");

        if (mounted) {
          setTasks([]);
          setProjects([]);
          setEmployees([]);
          setLoading(false);
        }
      }
    };

    setupRealtimeListeners();

    return () => {
      mounted = false;
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
    return project?.color || "#6366f1";
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
      color: "from-slate-50 to-slate-100",
      borderColor: "border-slate-200",
      iconColor: "text-slate-500",
      bgColor: "bg-slate-50",
      tasks: filteredTasks.filter((t: any) => t.status === "pending" || t.progress_status === "pending"),
    },
    {
      id: "in_progress", 
      title: "🚀 In Progress",
      status: "in_progress",
      color: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      tasks: filteredTasks.filter((t: any) => t.status === "in_progress" || t.progress_status === "in_progress"),
    },
    {
      id: "review",
      title: "👀 Review",
      status: "review",
      color: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      tasks: filteredTasks.filter((t: any) => t.status === "review" || t.status === "testing" || t.progress_status === "review"),
    },
    {
      id: "completed",
      title: "✅ Done",
      status: "completed",
      color: "from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50",
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

      await addDoc(collection(db, "tasks"), {
        ...newTaskForm,
        status: newTaskColumn || "pending",
        progress_status: newTaskColumn || "pending",
        created_by: user?.uid || "anonymous",
        created_at: Timestamp.now(),
        task_id: `TASK-${Date.now()}`,
        progress: 0,
        comments: [],
      });

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
      toast.error(`Failed to add task: ${error.message || 'Unknown error'}`);
    }
  };

  const handleTaskMove = async (task: any, newStatus: string) => {
    try {
      if (!db) {
        throw new Error("Database connection not available");
      }

      await updateDoc(doc(db, "tasks", task.id), {
        status: newStatus,
        progress_status: newStatus,
        progress_updated_at: Timestamp.now(),
        progress: newStatus === "completed" ? 100 : task.progress || 0,
      });

      toast.success(`Task moved to ${newStatus.replace('_', ' ')} 📈`);
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast.error(`Failed to update task: ${error.message || 'Unknown error'}`);
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
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

    const getCardBgColor = () => {
      if (isOverdue) return 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-700';

      switch (task.status) {
        case 'completed':
          return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700';
        case 'in_progress':
          return 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700';
        case 'review':
          return 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700';
        default:
          return 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-750 border-gray-200 dark:border-gray-600';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        whileTap={{ scale: 0.98 }}
        layout
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onClick={() => {
          setSelectedTask(task);
          setShowTaskDetailModal(true);
        }}
        className={`${getCardBgColor()} rounded-xl border-2 p-4 mb-3 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden backdrop-blur-sm`}
      >
        {/* Priority stripe */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
          task.priority === "high" ? "bg-red-500" :
          task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
        }`} />

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight mb-1">
              {task.title}
            </h4>
            <div className="flex items-center gap-2">
              {getPriorityIcon(task.priority)}
              <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityBadge(task.priority)}`}>
                {task.priority?.toUpperCase()}
              </span>
              {isOverdue && (
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full border border-red-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
          </div>
          <button 
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // Add menu options
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
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
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium">Progress</span>
              <motion.span
                className="font-bold text-blue-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {task.progress}%
              </motion.span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full shadow-sm"
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
            {task.tags.split(',').map((tag: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="px-2 py-1 text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg border border-blue-200 font-medium shadow-sm"
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
              className="px-2 py-1 text-xs text-white rounded-md"
              style={{ backgroundColor: getProjectColor(task.project_id) }}
            >
              {projects.find(p => p.id === task.project_id)?.name || "Project"}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <img
              src={getEmployeeAvatar(task.assigned_to)}
              alt="avatar"
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
            />
            <span className="font-medium">{getEmployeeName(task.assigned_to)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {task.due_date && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
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
      <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your workspace...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Preparing the ultimate kanban experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-transparent">
      {/* Enhanced Header */}
      <div className="liquid-glass border-b border-gray-200 dark:border-purple-500/30 p-4 flex-shrink-0 shadow-sm dark:shadow-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-purple-100">
                  Project Board
                </h1>
                <p className="text-sm text-gray-500 dark:text-purple-300/70">
                  {filteredTasks.length} tasks • {projects.length} projects
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 rounded-full flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {navigator.onLine ? 'Live' : 'Offline'}
              </span>
              <span className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 rounded-full">
                {Math.round((columns.find(c => c.id === "completed")?.tasks.length || 0) / Math.max(filteredTasks.length, 1) * 100)}% Complete
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-purple-500/20 rounded-lg p-1">
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
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-all ${
                    viewMode === mode.id
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <mode.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Enhanced Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, tags, or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Enhanced Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors z-30 relative"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className="w-4 h-4" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Filter Tasks</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Priority
                        </label>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Priorities</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Assignee
                      </label>
                      <select
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Projects</option>
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          setSelectedDate("");
                          setSelectedProject("");
                          setSelectedPriority("");
                          setSelectedAssignee("");
                          setFilterOpen(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {column.tasks.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {column.title.replace(/[^\w\s]/gi, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Kanban Board */}
      <div className="flex-1 min-h-0 p-6">
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
                className={`bg-gradient-to-r ${column.color} rounded-t-xl p-4 border-2 ${column.borderColor} relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/5"></div>
                <div className="relative flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center ${column.iconColor} shadow-lg`}
                    >
                      {column.id === "pending" && <Circle className="w-5 h-5" />}
                      {column.id === "in_progress" && <Clock className="w-5 h-5" />}
                      {column.id === "review" && <Eye className="w-5 h-5" />}
                      {column.id === "completed" && <CheckCircle className="w-5 h-5" />}
                    </motion.div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {column.title}
                      </h2>
                      <motion.p
                        key={column.tasks.length}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-gray-600 dark:text-gray-400 font-medium"
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
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-lg"
                    title={`Add task to ${column.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Enhanced Progress indicator */}
                <div className="relative w-full bg-white/30 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((column.tasks.length / Math.max(filteredTasks.length, 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-gray-700 to-gray-800 h-2 rounded-full shadow-sm"
                  />
                </div>
              </motion.div>

              {/* Enhanced Column Content */}
              <div className={`flex-1 ${column.bgColor} dark:bg-gray-800/50 rounded-b-xl border-2 border-t-0 ${column.borderColor} p-4 overflow-y-auto`}>
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
                    className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500"
                  >
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
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
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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

        {/* List View */}
        {viewMode === "list" && (
          <div className="flex-1 w-full">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                  Task List View
                </h2>
                <span className="text-sm text-gray-500">{filteredTasks.length} tasks</span>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskDetailModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === "high" ? "bg-red-500" :
                          task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                        }`} />

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description || "No description"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={getEmployeeAvatar(task.assigned_to)}
                            alt="avatar"
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          />
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            task.status === "completed" ? "bg-green-100 text-green-700" :
                            task.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                            task.status === "review" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {task.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {task.due_date && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>

                    {task.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tasks found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === "timeline" && (
          <div className="flex-1 w-full">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  Timeline View
                </h2>
                <span className="text-sm text-gray-500">{filteredTasks.length} tasks</span>
              </div>

              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500"></div>

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
                      <div className={`relative z-10 w-4 h-4 rounded-full border-4 border-white shadow-lg ${
                        task.status === "completed" ? "bg-green-500" :
                        task.status === "in_progress" ? "bg-blue-500" :
                        task.status === "review" ? "bg-yellow-500" :
                        "bg-gray-400"
                      }`}>
                        {task.status === "in_progress" && (
                          <div className="absolute inset-0 rounded-full animate-ping bg-blue-400" />
                        )}
                      </div>

                      <motion.div
                        whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        className="flex-1 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600 cursor-pointer group"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetailModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {task.description || "No description"}
                            </p>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getEmployeeAvatar(task.assigned_to)}
                                  alt="avatar"
                                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {getEmployeeName(task.assigned_to)}
                                </span>
                              </div>

                              {task.due_date && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}

                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityBadge(task.priority)}`}>
                                {task.priority?.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <Timer className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </div>

                        {task.progress > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
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
                      <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No tasks in timeline</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="flex-1 w-full">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-green-600" />
                  Table View
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredTasks.map((task, index) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              task.priority === "high" ? "bg-red-500" :
                              task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                            }`} />
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{task.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
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
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {getEmployeeName(task.assigned_to)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            task.status === "completed" ? "bg-green-100 text-green-700 border border-green-200" :
                            task.status === "in_progress" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                            task.status === "review" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                            "bg-gray-100 text-gray-700 border border-gray-200"
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
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">{task.progress}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not started</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {task.due_date ? (
                            <div className={`flex items-center gap-1 text-sm ${
                              new Date(task.due_date) < new Date() && task.status !== "completed" ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              <Calendar className="w-4 h-4" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No due date</span>
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
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
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
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tasks found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* High Priority Tasks Sidebar - Only show in board view */}
        {viewMode === "board" && (
          <div className="w-80 flex-shrink-0">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 h-full flex flex-col">
            <div className="p-4 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <Flag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    🔥 High Priority Tasks
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {filteredTasks.filter(t => t.priority === 'high').length} urgent tasks
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {filteredTasks
                  .filter((task: any) => task.priority === 'high')
                  .slice(0, 10)
                  .map((task: any) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-lg border-2 border-red-200 dark:border-red-800 p-3 hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetailModal(true);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <img
                              src={getEmployeeAvatar(task.assigned_to)}
                              alt="avatar"
                              className="w-4 h-4 rounded-full"
                            />
                            <span>{getEmployeeName(task.assigned_to)}</span>
                            {task.due_date && (
                              <>
                                <span>•</span>
                                <span className={new Date(task.due_date) < new Date() ? 'text-red-600' : ''}>
                                  {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'review' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                {filteredTasks.filter(t => t.priority === 'high').length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No high priority tasks</p>
                  </div>
                )}
              </div>
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
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Create New Task
                  </h2>
                </div>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter a clear, actionable task title..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Provide context and details for this task..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskForm.due_date}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Assign To
                  </label>
                  <select
                    value={newTaskForm.assigned_to}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Project
                    </label>
                    <select
                      value={newTaskForm.project_id}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, project_id: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={newTaskForm.tags}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="frontend, api, urgent"
                    />
                  </div>
                </div>

                {newTaskColumn && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        This task will be added to: <strong>{columns.find(c => c.status === newTaskColumn)?.title}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
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
              className="relative w-full max-w-4xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
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
                        className="text-blue-100 text-sm"
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

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTask.description || "No description provided."}
                      </p>
                    </div>

                    {selectedTask.progress > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Progress</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedTask.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {selectedTask.progress}%
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedTask.tags && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTask.tags.split(',').map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg"
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
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                      <span className={`px-3 py-1 text-sm rounded-lg ${
                        selectedTask.status === "completed" ? "bg-green-100 text-green-700" :
                        selectedTask.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        selectedTask.status === "review" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {selectedTask.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</h3>
                      <span className={`px-3 py-1 text-sm rounded-lg border ${getPriorityBadge(selectedTask.priority)}`}>
                        {selectedTask.priority?.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assignee</h3>
                      <div className="flex items-center gap-2">
                        <img
                          src={getEmployeeAvatar(selectedTask.assigned_to)}
                          alt="avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {getEmployeeName(selectedTask.assigned_to)}
                        </span>
                      </div>
                    </div>

                    {selectedTask.due_date && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(selectedTask.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedTask.project_id && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project</h3>
                        <span 
                          className="px-3 py-1 text-sm text-white rounded-lg"
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
