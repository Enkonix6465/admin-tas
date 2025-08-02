import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MoreHorizontal,
  Circle,
  CheckCircle,
  Clock,
  Users,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  Filter,
  ChevronDown,

  Star,
  Eye,
  Copy,
  ExternalLink,
  Activity,
  Target,
  Zap,
  BarChart3,
  PieChart,
  ArrowRight,
  Bell,
  Search,
  Grid,
  List,
  Settings,
  Bookmark,
  MessageSquare,
  Timer,
  Award,
  Flame,
  Layers,
  Briefcase,
  Calendar as CalendarIcon,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { NewTaskModal, NewProjectModal, FilterModal } from "../components/Modals";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [activeTab, setActiveTab] = useState("overview"); // overview, projects, tasks, team
  
  // Modal states
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedTeamLeads, setExpandedTeamLeads] = useState(new Set());

  useEffect(() => {
    const unsubscribers = [];
    let mounted = true;

    const setupRealtimeListeners = async () => {
      try {
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
                  id: "mock-1",
                  name: "Website Redesign",
                  description: "Complete redesign of company website with new branding",
                  status: "active",
                  progress: 65,
                  end_date: "2024-03-15",
                  priority: "high",
                  client: "Internal",
                  team_size: 5,
                  budget: "$25,000",
                  color: "#3b82f6"
                },
                {
                  id: "mock-2",
                  name: "Mobile App Development",
                  description: "iOS and Android app for customer engagement",
                  status: "active",
                  progress: 40,
                  end_date: "2024-04-30",
                  priority: "high",
                  client: "TechCorp",
                  team_size: 8,
                  budget: "$80,000",
                  color: "#10b981"
                },
                {
                  id: "mock-3",
                  name: "API Integration",
                  description: "Third-party payment gateway integration",
                  status: "planning",
                  progress: 15,
                  end_date: "2024-02-28",
                  priority: "medium",
                  client: "FinanceInc",
                  team_size: 3,
                  budget: "$15,000",
                  color: "#f59e0b"
                }
              ]);
            }
          }
        );

        const tasksUnsub = onSnapshot(
          collection(db, "tasks"),
          (snapshot) => {
            if (mounted) {
              setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
          },
          (error) => {
            console.warn("Tasks listener error:", error);
            if (mounted) {
              setTasks([
                {
                  id: "mock-task-1",
                  title: "Design System Update",
                  status: "pending",
                  progress_status: "pending",
                  assigned_to: "mock-user-1",
                  due_date: "2024-02-15",
                  priority: "high",
                  project_id: "mock-1",
                  created_at: { seconds: Date.now() / 1000 - 86400 },
                  description: "Update design tokens and components"
                },
                {
                  id: "mock-task-2",
                  title: "API Documentation",
                  status: "in_progress",
                  progress_status: "in_progress",
                  assigned_to: "mock-user-2",
                  due_date: "2024-02-20",
                  priority: "medium",
                  project_id: "mock-2",
                  created_at: { seconds: Date.now() / 1000 - 172800 },
                  description: "Complete API documentation for v2"
                },
                {
                  id: "mock-task-3",
                  title: "User Testing Session",
                  status: "completed",
                  progress_status: "completed",
                  assigned_to: "mock-user-3",
                  due_date: "2024-02-10",
                  priority: "high",
                  project_id: "mock-1",
                  created_at: { seconds: Date.now() / 1000 - 259200 },
                  description: "Conduct usability testing"
                },
                {
                  id: "mock-task-4",
                  title: "Database Migration",
                  status: "review",
                  progress_status: "review",
                  assigned_to: "mock-user-1",
                  due_date: "2024-02-18",
                  priority: "high",
                  project_id: "mock-3",
                  created_at: { seconds: Date.now() / 1000 - 345600 },
                  description: "Migrate legacy database to new schema"
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
              setLoading(false);
            }
          },
          (error) => {
            console.warn("Employees listener error:", error);
            if (mounted) {
              setEmployees([
                {
                  id: "mock-user-1",
                  name: "Sarah Johnson",
                  email: "sarah@company.com",
                  role: "Design Team Lead",
                  department: "Design",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                  status: "online",
                  tasks_completed: 28,
                  tasks_pending: 5,
                  isTeamLead: true,
                  teamMembers: ["mock-user-4", "mock-user-5"]
                },
                {
                  id: "mock-user-2",
                  name: "Mike Chen",
                  email: "mike@company.com",
                  role: "Engineering Team Lead",
                  department: "Engineering",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
                  status: "busy",
                  tasks_completed: 42,
                  tasks_pending: 8,
                  isTeamLead: true,
                  teamMembers: ["mock-user-6", "mock-user-7"]
                },
                {
                  id: "mock-user-3",
                  name: "Emily Davis",
                  email: "emily@company.com",
                  role: "Product Team Lead",
                  department: "Product",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
                  status: "away",
                  tasks_completed: 35,
                  tasks_pending: 3,
                  isTeamLead: true,
                  teamMembers: ["mock-user-8"]
                },
                {
                  id: "mock-user-4",
                  name: "Alice Cooper",
                  email: "alice@company.com",
                  role: "UI Designer",
                  department: "Design",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
                  status: "online",
                  tasks_completed: 15,
                  tasks_pending: 3,
                  teamLead: "mock-user-1"
                },
                {
                  id: "mock-user-5",
                  name: "Bob Wilson",
                  email: "bob@company.com",
                  role: "UX Designer",
                  department: "Design",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
                  status: "busy",
                  tasks_completed: 22,
                  tasks_pending: 4,
                  teamLead: "mock-user-1"
                },
                {
                  id: "mock-user-6",
                  name: "Carol Smith",
                  email: "carol@company.com",
                  role: "Frontend Developer",
                  department: "Engineering",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
                  status: "online",
                  tasks_completed: 38,
                  tasks_pending: 6,
                  teamLead: "mock-user-2"
                },
                {
                  id: "mock-user-7",
                  name: "David Lee",
                  email: "david@company.com",
                  role: "Backend Developer",
                  department: "Engineering",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
                  status: "away",
                  tasks_completed: 31,
                  tasks_pending: 7,
                  teamLead: "mock-user-2"
                },
                {
                  id: "mock-user-8",
                  name: "Grace Kim",
                  email: "grace@company.com",
                  role: "Product Analyst",
                  department: "Product",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
                  status: "online",
                  tasks_completed: 19,
                  tasks_pending: 2,
                  teamLead: "mock-user-3"
                }
              ]);
              setLoading(false);
            }
          }
        );

        unsubscribers.push(projectsUnsub, tasksUnsub, employeesUnsub);

      } catch (error) {
        console.error("Failed to setup Firebase listeners:", error);
        toast.error("Connection error - using offline mode");

        if (mounted) {
          setProjects([]);
          setTasks([]);
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

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQuickActions || showNotifications) {
        const target = event.target as Element;
        if (!target.closest('.dropdown-container')) {
          setShowQuickActions(false);
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuickActions, showNotifications]);

  const getEmployeeName = (empId: string) =>
    employees.find((emp: any) => emp.id === empId)?.name || "Unassigned";

  const filteredTasks = tasks.filter((task: any) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assignee && task.assigned_to !== filters.assignee) return false;
    
    if (filters.dateRange) {
      const now = new Date();
      const taskDate = new Date(task.due_date);
      
      switch (filters.dateRange) {
        case 'today':
          return taskDate.toDateString() === now.toDateString();
        case 'this_week':
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          return taskDate >= weekStart;
        case 'this_month':
          return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
        case 'overdue':
          return taskDate < now && task.status !== 'completed';
        default:
          return true;
      }
    }
    
    return true;
  });

  // Enhanced statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    pendingTasks: filteredTasks.filter((t: any) => t.status === "pending" || t.progress_status === "pending").length,
    inProgressTasks: filteredTasks.filter((t: any) => t.status === "in_progress" || t.progress_status === "in_progress").length,
    completedTasks: filteredTasks.filter((t: any) => t.status === "completed" || t.progress_status === "completed").length,
    reviewTasks: filteredTasks.filter((t: any) => t.status === "review" || t.progress_status === "review").length,
    totalTasks: filteredTasks.length,
    teamMembers: employees.length,
    overdueTasks: filteredTasks.filter((t: any) => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < new Date();
    }).length
  };

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t: any) => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t: any) => t.status === 'completed' || t.progress_status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter((t: any) => t.project_id === projectId).length;
  };



  const handleApplyFilter = (newFilters: any) => {
    setFilters(newFilters);
    toast.success("Filters applied! 🔍");
  };

  // Notification functions
  const getNotifications = () => {
    const today = new Date();
    const notifications = [];

    // Overdue tasks
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      return new Date(task.due_date) < today;
    });

    overdueTasks.forEach(task => {
      notifications.push({
        id: `overdue-${task.id}`,
        title: "Overdue Task",
        message: `Task "${task.title}" is overdue`,
        type: "warning",
        time: task.due_date,
        action: () => navigate('/kanbanpage')
      });
    });

    // Tasks due today
    const dueTodayTasks = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate.toDateString() === today.toDateString();
    });

    dueTodayTasks.forEach(task => {
      notifications.push({
        id: `due-today-${task.id}`,
        title: "Due Today",
        message: `Task "${task.title}" is due today`,
        type: "info",
        time: task.due_date,
        action: () => navigate('/kanbanpage')
      });
    });

    // High priority tasks
    const highPriorityTasks = tasks.filter(task =>
      task.priority === 'high' && task.status !== 'completed'
    ).slice(0, 3);

    highPriorityTasks.forEach(task => {
      notifications.push({
        id: `high-priority-${task.id}`,
        title: "High Priority Task",
        message: `Task "${task.title}" needs attention`,
        type: "urgent",
        time: task.created_at?.seconds ? new Date(task.created_at.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        action: () => navigate('/kanbanpage')
      });
    });

    return notifications.slice(0, 10); // Limit to 10 notifications
  };

  const notifications = getNotifications();
  const unreadNotifications = notifications.length;

  // Filter tasks based on current filters
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (filters.project) {
      filtered = filtered.filter(task => task.project_id === filters.project);
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status || task.progress_status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.assigned) {
      filtered = filtered.filter(task => task.assigned_to === filters.assigned);
    }

    if (filters.overdue) {
      const today = new Date();
      filtered = filtered.filter(task => {
        if (!task.due_date || task.status === 'completed') return false;
        return new Date(task.due_date) < today;
      });
    }

    return filtered;
  };

  // Navigate to specific task
  const navigateToTask = (task: any) => {
    navigate('/mytasks', { state: { selectedTask: task.id, highlight: true } });
  };

  // Enhanced Stat Card Component
  const StatCard = ({ title, value, change, icon: Icon, color = "blue", trend, onClick = null, subtitle = null }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-gradient-to-br ${
        color === 'blue' ? 'from-blue-500 to-indigo-600' :
        color === 'green' ? 'from-emerald-500 to-green-600' :
        color === 'yellow' ? 'from-amber-500 to-orange-600' :
        color === 'red' ? 'from-red-500 to-pink-600' :
        color === 'purple' ? 'from-purple-500 to-indigo-600' :
        'from-gray-500 to-slate-600'
      } rounded-2xl p-6 text-white ${
        onClick ? 'cursor-pointer hover:shadow-2xl' : 'hover:shadow-lg'
      } transition-all duration-300 relative overflow-hidden group shadow-lg`}
      onClick={onClick}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {onClick && (
            <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-white">{value}</span>
            {change && (
              <span className="text-sm font-medium flex items-center gap-1 text-white/90">
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-white/70">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Enhanced Project Card
  const ProjectCard = ({ project }) => {
    const progress = project.progress || getProjectProgress(project.id);
    const taskCount = getProjectTaskCount(project.id);
    const isOverdue = project.end_date && new Date(project.end_date) < new Date();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
        onClick={() => navigate('/projects', { state: { selectedProject: project.id } })}
      >
        {/* Priority stripe */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
          project.priority === 'high' ? 'bg-red-500' :
          project.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
              style={{ backgroundColor: project.color || '#6366f1' }}
            >
              {project.name ? project.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">
                {project.name || 'Untitled Project'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {project.description || 'No description'}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.team_size || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {taskCount} tasks
                </span>
                {project.budget && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {project.budget}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`px-3 py-1 text-xs rounded-full ${
              project.status === 'active' ? 'bg-green-100 text-green-700' :
              project.status === 'planning' ? 'bg-blue-100 text-blue-700' :
              project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {project.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
            </span>
            {isOverdue && (
              <div className="mt-2">
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-2 rounded-full"
              style={{ backgroundColor: project.color || '#6366f1' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {project.end_date && (
              <>
                <Calendar className="w-3 h-3" />
                <span className={isOverdue ? 'text-red-600' : ''}>
                  Due {new Date(project.end_date).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </motion.div>
    );
  };

  // Enhanced Task Item
  const TaskItem = ({ task, showProject = true }) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
    const project = projects.find(p => p.id === task.project_id);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4, scale: 1.01 }}
        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
        onClick={() => navigateToTask(task)}
      >
        {/* Status indicator */}
        <div className={`w-3 h-3 rounded-full ${
          task.status === 'completed' ? 'bg-emerald-500' :
          task.status === 'in_progress' ? 'bg-blue-500' :
          task.status === 'review' ? 'bg-amber-500' :
          'bg-gray-400'
        }`} />

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {task.title || 'Untitled Task'}
            </h4>
            {task.priority === 'high' && (
              <Flame className="w-4 h-4 text-red-500" />
            )}
            {isOverdue && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                Overdue
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {getEmployeeName(task.assigned_to)}
            </span>
            {task.due_date && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="w-3 h-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {showProject && project && (
              <span 
                className="px-2 py-0.5 text-xs text-white rounded"
                style={{ backgroundColor: project.color || '#6366f1' }}
              >
                {project.name}
              </span>
            )}
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </motion.div>
    );
  };

  // Enhanced Team Member Card with Lead Functionality
  const TeamMemberCard = ({ member, isExpanded = false, onToggleExpand = null }) => {
    const isTeamLead = member.isTeamLead;
    const teamMembers = isTeamLead ? employees.filter(emp => member.teamMembers?.includes(emp.id)) : [];

    return (
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 transition-all cursor-pointer ${
            isTeamLead
              ? 'border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800'
              : 'border-gray-100 dark:border-gray-700 hover:shadow-lg'
          }`}
          onClick={() => {
            if (isTeamLead && onToggleExpand) {
              onToggleExpand();
            } else {
              navigate('/team', { state: { selectedMember: member.id } });
            }
          }}
        >
          <div className="text-center">
            <div className="relative inline-block mb-3">
              <img
                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                alt={member.name}
                className={`w-12 h-12 rounded-full border-2 shadow-lg ${
                  isTeamLead ? 'border-blue-500' : 'border-white'
                }`}
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                member.status === 'online' ? 'bg-green-500' :
                member.status === 'busy' ? 'bg-red-500' :
                member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
              {isTeamLead && (
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {member.name}
              </h4>
              {isTeamLead && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                </motion.div>
              )}
            </div>

            <p className={`text-xs mb-2 ${
              isTeamLead ? 'text-blue-600 font-medium' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {member.role}
            </p>

            {isTeamLead && (
              <p className="text-xs text-blue-500 mb-2">
                Team: {teamMembers.length} members
              </p>
            )}

            <div className="flex justify-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {member.tasks_completed || 0}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {member.tasks_pending || 0}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Team Members (shown when expanded) */}
        <AnimatePresence>
          {isTeamLead && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-4 space-y-2"
            >
              {teamMembers.map((teamMember) => (
                <motion.div
                  key={teamMember.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => navigate('/team', { state: { selectedMember: teamMember.id } })}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={teamMember.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teamMember.name}`}
                      alt={teamMember.name}
                      className="w-8 h-8 rounded-full border border-gray-300"
                    />
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {teamMember.name}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {teamMember.role}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-emerald-600">
                        {teamMember.tasks_completed || 0}
                      </span>
                      <span className="text-blue-600">
                        {teamMember.tasks_pending || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your workspace...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Preparing your personalized dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Grid className="w-6 h-6 text-white" />
              </div>
              <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard Overview
              </h1>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Welcome back! Here's what's happening with your projects
              </p>
            </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Actions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showQuickActions && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 py-2">
                  <button
                    onClick={() => {
                      setShowNewTaskModal(true);
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>New Task</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNewProjectModal(true);
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <Briefcase className="w-4 h-4 text-green-600" />
                    <span>New Project</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/calendar');
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                    <span>Schedule Meeting</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/team');
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <Users className="w-4 h-4 text-orange-600" />
                    <span>Invite Team Member</span>
                  </button>
                </div>
              )}
            </div>


            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-500">{notifications.length} notifications</p>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            notification.action();
                            setShowNotifications(false);
                          }}
                          className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'urgent' ? 'bg-red-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.time).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {[
            { id: "overview", label: "Overview", icon: Grid },
            { id: "projects", label: "Projects", icon: Briefcase },
            { id: "tasks", label: "Tasks", icon: Target },
            { id: "team", label: "Team", icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            change="+2 this week"
            trend="up"
            icon={Briefcase}
            color="blue"
            onClick={() => navigate('/projects')}
            subtitle={`${stats.totalProjects} total projects`}
          />
          <StatCard
            title="Tasks in Progress"
            value={stats.inProgressTasks}
            change={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "+5% this week"}
            trend={stats.overdueTasks > 0 ? "down" : "up"}
            icon={Timer}
            color={stats.overdueTasks > 0 ? "red" : "yellow"}
            onClick={() => navigate('/kanbanpage')}
            subtitle={`${stats.totalTasks} total tasks`}
          />
          <StatCard
            title="Completed Today"
            value={stats.completedTasks}
            change={`${completionRate}% completion rate`}
            trend="up"
            icon={CheckCircle}
            color="green"
            onClick={() => navigate('/reports')}
            subtitle="Great progress!"
          />
          <StatCard
            title="Team Members"
            value={stats.teamMembers}
            change="All active"
            icon={Users}
            color="purple"
            onClick={() => navigate('/team')}
            subtitle="Productive team"
          />
        </div>

        {/* Dynamic Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Recent Projects */}
              <div className="lg:col-span-2 min-h-0">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden h-full flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Active Projects</h2>
                    <button 
                      onClick={() => navigate('/projects')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      View All <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
                    {projects.slice(0, 3).map((project: any) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                    {projects.length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium mb-1">No projects yet</p>
                        <p className="text-sm mb-4">Create your first project to get started</p>
                        <button 
                          onClick={() => setShowNewProjectModal(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Create Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Tasks & Team */}
              <div className="space-y-4 sm:space-y-6 min-h-0 flex flex-col">
                {/* Recent Tasks */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex-1 flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
                    <button 
                      onClick={() => navigate('/mytasks')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      View All <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto">
                    <div className="space-y-1">
                      {filteredTasks.slice(0, 5).map((task: any) => (
                        <TaskItem key={task.id} task={task} showProject={true} />
                      ))}
                      {filteredTasks.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No tasks found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Overview */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex-shrink-0">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Team</h2>
                    <button 
                      onClick={() => navigate('/team')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      View All <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {employees.filter(emp => emp.isTeamLead).slice(0, 3).map((member: any) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          isExpanded={expandedTeamLeads.has(member.id)}
                          onToggleExpand={() => {
                            const newExpanded = new Set(expandedTeamLeads);
                            if (newExpanded.has(member.id)) {
                              newExpanded.delete(member.id);
                            } else {
                              newExpanded.add(member.id);
                            }
                            setExpandedTeamLeads(newExpanded);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "projects" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          )}

          {activeTab === "tasks" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Tasks</h2>

                  {/* Task Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Project Filter */}
                    <select
                      value={filters.project || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                      className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Projects</option>
                      {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>

                    {/* Status Filter */}
                    <select
                      value={filters.status || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                      value={filters.priority || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    {/* Assigned Filter */}
                    <select
                      value={filters.assigned || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, assigned: e.target.value }))}
                      className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">All Assignees</option>
                      {employees.map((employee: any) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name || employee.email}
                        </option>
                      ))}
                    </select>

                    {/* Special Filters */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.overdue || false}
                          onChange={(e) => setFilters(prev => ({ ...prev, overdue: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Overdue</span>
                      </label>
                    </div>

                    {/* Clear Filters */}
                    {Object.keys(filters).length > 0 && (
                      <button
                        onClick={() => setFilters({})}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="space-y-1">
                  {getFilteredTasks().map((task: any) => (
                    <TaskItem key={task.id} task={task} showProject={true} />
                  ))}
                  {getFilteredTasks().length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks match the current filters</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "team" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {employees.filter(emp => emp.isTeamLead).map((member: any) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isExpanded={expandedTeamLeads.has(member.id)}
                  onToggleExpand={() => {
                    const newExpanded = new Set(expandedTeamLeads);
                    if (newExpanded.has(member.id)) {
                      newExpanded.delete(member.id);
                    } else {
                      newExpanded.add(member.id);
                    }
                    setExpandedTeamLeads(newExpanded);
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <NewTaskModal isOpen={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} />
      <NewProjectModal isOpen={showNewProjectModal} onClose={() => setShowNewProjectModal(false)} />
      <FilterModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)} 
        onApplyFilter={handleApplyFilter}
      />

      {/* Click outside handlers */}
      {showQuickActions && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
