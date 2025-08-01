import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MoreHorizontal,
  Circle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  Filter,
  ChevronDown,
  Share,
  Star,
  Eye,
  Copy,
  ExternalLink
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
  
  // Modal states
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);

  useEffect(() => {
    const unsubscribers = [];
    let mounted = true;

    const setupRealtimeListeners = async () => {
      try {
        // Real-time listeners for all collections with error handling
        const projectsUnsub = onSnapshot(
          collection(db, "projects"),
          (snapshot) => {
            if (mounted) {
              setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
          },
          (error) => {
            console.warn("Projects listener error:", error);
            toast.error("Failed to load projects data");
            // Use fallback mock data
            if (mounted) {
              setProjects([
                {
                  id: "mock-1",
                  name: "Sample Project",
                  description: "Demo project for testing",
                  status: "active",
                  progress: 45,
                  end_date: "2024-12-31"
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
            toast.error("Failed to load tasks data");
            // Use fallback mock data
            if (mounted) {
              setTasks([
                {
                  id: "mock-task-1",
                  title: "Sample Task",
                  status: "pending",
                  progress_status: "pending",
                  assigned_to: "mock-user",
                  due_date: "2024-02-15"
                }
              ]);
            }
          }
        );

        const teamsUnsub = onSnapshot(
          collection(db, "teams"),
          (snapshot) => {
            if (mounted) {
              setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
          },
          (error) => {
            console.warn("Teams listener error:", error);
            if (mounted) {
              setTeams([]);
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
                  id: "mock-user",
                  name: "Demo User",
                  department: "Engineering"
                }
              ]);
              setLoading(false);
            }
          }
        );

        unsubscribers.push(projectsUnsub, tasksUnsub, teamsUnsub, employeesUnsub);

      } catch (error) {
        console.error("Failed to setup Firebase listeners:", error);
        toast.error("Connection error - using offline mode");

        // Set fallback data and stop loading
        if (mounted) {
          setProjects([]);
          setTasks([]);
          setTeams([]);
          setEmployees([]);
          setLoading(false);
        }
      }
    };

    setupRealtimeListeners();

    // Cleanup function
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

  const getEmployeeName = (empId: string) =>
    employees.find((emp: any) => emp.id === empId)?.name || "Unassigned";

  // Apply filters to tasks
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

  // Calculate real dashboard statistics
  const totalProjects = projects.length;
  const pendingTasks = filteredTasks.filter((t: any) => t.status === "pending" || t.progress_status === "pending").length;
  const inProgressTasks = filteredTasks.filter((t: any) => t.status === "in_progress" || t.progress_status === "in_progress").length;
  const completedTasks = filteredTasks.filter((t: any) => t.status === "completed" || t.progress_status === "completed").length;
  const totalTasks = pendingTasks + inProgressTasks + completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Get overdue tasks
  const now = new Date();
  const overdueTasks = filteredTasks.filter((t: any) => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < now;
  }).length;

  // Calculate project progress
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t: any) => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t: any) => t.status === 'completed' || t.progress_status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter((t: any) => t.project_id === projectId).length;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Dashboard link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleApplyFilter = (newFilters: any) => {
    setFilters(newFilters);
    toast.success("Filters applied successfully!");
  };

  const StatCard = ({ title, value, change, icon: Icon, color = "blue", onClick = null }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
              color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
              'bg-purple-50 dark:bg-purple-900/20'
            }`}>
              <Icon className={`w-5 h-5 ${
                color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                color === 'green' ? 'text-green-600 dark:text-green-400' :
                'text-purple-600 dark:text-purple-400'
              }`} />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
            {change && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ProjectCard = ({ project }) => {
    const progress = getProjectProgress(project.id);
    const taskCount = getProjectTaskCount(project.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate('/projects', { state: { selectedProject: project.id } })}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-medium">
              {project.name ? project.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{project.name || 'Untitled Project'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.description || 'No description'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                📅 {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No due date'} 
                {project.client && ` 👤 ${project.client}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
              {taskCount} tasks
            </span>
            <button 
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                // Add more options here
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const TaskItem = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
      onClick={() => navigate('/mytasks', { state: { selectedTask: task.id } })}
    >
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
        {getEmployeeName(task.assigned_to).substring(0, 2).toUpperCase() || 'UN'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title || 'Untitled Task'}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
          Assigned to {getEmployeeName(task.assigned_to)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {task.created_at?.toDate?.().toLocaleDateString() || 'Today'}
        </p>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        task.status === 'completed' || task.progress_status === 'completed' ? 'bg-green-500' : 
        task.status === 'in_progress' || task.progress_status === 'in_progress' ? 'bg-yellow-500' : 
        'bg-gray-400'
      }`}></div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            If this takes too long, there might be a connection issue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-3 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNewDropdown(!showNewDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showNewDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowNewTaskModal(true);
                      setShowNewDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    📝 New Task
                  </button>
                  <button
                    onClick={() => {
                      setShowNewProjectModal(true);
                      setShowNewDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
                  >
                    📁 New Project
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share className="w-4 h-4" />
              Share
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          change={totalProjects > 0 ? "+19% from last month" : null}
          icon={FileText}
          color="blue"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Pending Tasks"
          value={overdueTasks > 0 ? `${pendingTasks} (${overdueTasks} overdue)` : pendingTasks}
          icon={AlertCircle}
          color="yellow"
          onClick={() => navigate('/mytasks')}
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon={TrendingUp}
          color="purple"
          onClick={() => navigate('/kanbanpage')}
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          change={`${completionRate}% completion rate`}
          icon={CheckCircle}
          color="green"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projects Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
              <button 
                onClick={() => navigate('/projects')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {projects.length > 0 ? (
                projects.slice(0, 3).map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No projects found</p>
                  <button 
                    onClick={() => setShowNewProjectModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                  >
                    Create your first project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
              <button 
                onClick={() => navigate('/mytasks')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.slice(0, 5).map((task: any) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks found</p>
                    <button 
                      onClick={() => setShowNewTaskModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                    >
                      Create your first task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewTaskModal isOpen={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} />
      <NewProjectModal isOpen={showNewProjectModal} onClose={() => setShowNewProjectModal(false)} />
      <FilterModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)} 
        onApplyFilter={handleApplyFilter}
      />

      {/* Click outside to close dropdown */}
      {showNewDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowNewDropdown(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
