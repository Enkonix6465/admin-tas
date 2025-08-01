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
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
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
  });

  useEffect(() => {
    const unsubscribers: any[] = [];
    let mounted = true;

    const setupRealtimeListeners = async () => {
      try {
        // Real-time listeners for data with comprehensive error handling
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
              // Set fallback mock data for tasks
              setTasks([
                {
                  id: "mock-task-1",
                  title: "Sample Task",
                  description: "This is a sample task for demonstration",
                  status: "pending",
                  progress_status: "pending",
                  priority: "medium",
                  assigned_to: "mock-user",
                  due_date: "2024-02-15",
                  created_at: { seconds: Date.now() / 1000 }
                },
                {
                  id: "mock-task-2",
                  title: "In Progress Task",
                  description: "Task currently being worked on",
                  status: "in_progress",
                  progress_status: "in_progress",
                  priority: "high",
                  assigned_to: "mock-user-2",
                  due_date: "2024-02-20",
                  created_at: { seconds: Date.now() / 1000 }
                },
                {
                  id: "mock-task-3",
                  title: "Completed Task",
                  description: "Task that has been completed",
                  status: "completed",
                  progress_status: "completed",
                  priority: "low",
                  assigned_to: "mock-user-3",
                  due_date: "2024-02-10",
                  created_at: { seconds: Date.now() / 1000 }
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
                  name: "Sample Project",
                  description: "Demo project for testing"
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
                  name: "Demo User",
                  email: "demo@example.com"
                },
                {
                  id: "mock-user-2",
                  name: "Test User",
                  email: "test@example.com"
                },
                {
                  id: "mock-user-3",
                  name: "Sample User",
                  email: "sample@example.com"
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
          // Set fallback data when Firebase is completely unavailable
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

  // Close dropdown when clicking outside
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

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !selectedDate || task.due_date === selectedDate;
    const matchesProject = !selectedProject || task.project_id === selectedProject;
    
    return matchesSearch && matchesDate && matchesProject;
  });

  const columns = [
    {
      id: "pending",
      title: "Backlog",
      status: "pending",
      color: "bg-gray-100",
      tasks: filteredTasks.filter((t: any) => t.status === "pending" || t.progress_status === "pending"),
    },
    {
      id: "in_progress", 
      title: "In Progress",
      status: "in_progress",
      color: "bg-blue-100",
      tasks: filteredTasks.filter((t: any) => t.status === "in_progress" || t.progress_status === "in_progress"),
    },
    {
      id: "review",
      title: "Review/QA",
      status: "review",
      color: "bg-yellow-100",
      tasks: filteredTasks.filter((t: any) => t.status === "review" || t.status === "testing" || t.progress_status === "review"),
    },
    {
      id: "completed",
      title: "Done",
      status: "completed",
      color: "bg-green-100",
      tasks: filteredTasks.filter((t: any) => t.status === "completed" || t.progress_status === "completed"),
    },
  ];

  // Add new task to database
  const handleAddTask = async () => {
    if (!newTaskForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      // Check if Firebase is available
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
      });

      toast.success("Task added successfully!");
      setNewTaskForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        assigned_to: "",
        project_id: "",
      });
      setShowNewTaskModal(false);
      setNewTaskColumn("");
    } catch (error: any) {
      console.error("Error adding task:", error);

      // Provide specific error messages
      if (error.code === 'unavailable') {
        toast.error("Service temporarily unavailable. Please try again later.");
      } else if (error.code === 'permission-denied') {
        toast.error("You don't have permission to add tasks.");
      } else if (error.message?.includes('Failed to fetch')) {
        toast.error("Network connection error. Please check your internet connection.");
      } else {
        toast.error(`Failed to add task: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Update task status when moved between columns
  const handleTaskMove = async (task: any, newStatus: string) => {
    try {
      // Check if Firebase is available
      if (!db) {
        throw new Error("Database connection not available");
      }

      await updateDoc(doc(db, "tasks", task.id), {
        status: newStatus,
        progress_status: newStatus,
        progress_updated_at: Timestamp.now(),
      });

      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
    } catch (error: any) {
      console.error("Error updating task:", error);

      // Provide specific error messages
      if (error.code === 'unavailable') {
        toast.error("Service temporarily unavailable. Changes not saved.");
      } else if (error.code === 'permission-denied') {
        toast.error("You don't have permission to update tasks.");
      } else if (error.message?.includes('Failed to fetch')) {
        toast.error("Network connection error. Please check your internet connection.");
      } else {
        toast.error(`Failed to update task: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Drag and drop handlers
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "review":
        return <Circle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const TaskCard = ({ task }: { task: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3 mb-2 hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
          {task.title}
        </h4>
        <div className="flex items-center gap-1">
          {getStatusIcon(task.status)}
          <button className="text-gray-400 hover:text-gray-600 p-0.5">
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center gap-1 mb-2">
        <span className={`px-2 py-0.5 text-xs rounded ${
          task.priority === "high" ? "bg-red-100 text-red-700" :
          task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
          "bg-green-100 text-green-700"
        }`}>
          {task.priority}
        </span>
        {task.project_id && (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
            {projects.find(p => p.id === task.project_id)?.name || "Project"}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              getEmployeeName(task.assigned_to) || "User"
            )}`}
            alt="avatar"
            className="w-5 h-5 rounded-full"
          />
          <span>{getEmployeeName(task.assigned_to)}</span>
        </div>
        <div className="flex items-center gap-1">
          {task.due_date && (
            <>
              <Calendar className="w-3 h-3" />
              <span>{task.due_date}</span>
            </>
          )}
          {task.comments?.length > 0 && (
            <>
              <MessageCircle className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Kanban board...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            If this takes too long, there might be a connection issue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-3">
      {/* Offline Mode Banner */}
      {!navigator.onLine && (
        <div className="mb-3 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              You're currently offline
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              Task changes may not save until connection is restored
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Project Board [2024]</span>
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
            {navigator.onLine ? 'On track' : 'Offline'}
          </span>
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
            {filteredTasks.length} tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-40"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative filter-dropdown">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Filter className="w-3 h-3" />
              Filter
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 p-3">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Projects</option>
                      {projects.map((project: any) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setSelectedDate("");
                        setSelectedProject("");
                        setFilterOpen(false);
                      }}
                      className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board with 4 columns including Done */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  column.id === "pending" ? "bg-gray-400" :
                  column.id === "in_progress" ? "bg-blue-500" :
                  column.id === "review" ? "bg-yellow-500" : "bg-green-500"
                }`} />
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {column.title}
                </h2>
                <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  {column.tasks.length}
                </span>
              </div>
              <button 
                onClick={() => {
                  setNewTaskColumn(column.status);
                  setShowNewTaskModal(true);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
                title={`Add task to ${column.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Content */}
            <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
              <AnimatePresence>
                {column.tasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              
              {/* Empty state */}
              {column.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  {getStatusIcon(column.status)}
                  <p className="text-xs mt-2">No tasks</p>
                  <button 
                    onClick={() => {
                      setNewTaskColumn(column.status);
                      setShowNewTaskModal(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Add first task
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowNewTaskModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add New Task
                </h2>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter task title..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTaskForm.description}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Task description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTaskForm.due_date}
                      onChange={(e) => setNewTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign To
                  </label>
                  <select
                    value={newTaskForm.assigned_to}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select assignee...</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || emp.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project
                  </label>
                  <select
                    value={newTaskForm.project_id}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select project...</option>
                    {projects.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {newTaskColumn && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This task will be added to: <strong>{columns.find(c => c.status === newTaskColumn)?.title}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KanbanPage;
