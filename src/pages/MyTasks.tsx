import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
// Note: react-beautiful-dnd has known compatibility warnings with React 18+
// The library uses deprecated defaultProps in memo components, but it's still functional
// Warning is suppressed in main.tsx until library is updated or replaced
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  Link2,
  MessageSquare,
  Eye,
  Archive,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  GitBranch,
} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

interface Task {
  id: string;
  task_id: string;
  title: string;
  description: string;
  due_date: any;
  created_by: string;
  assigned_to: string;
  status: string;
  progress_status: string;
  progress_description?: string;
  progress_link?: string;
  linked_ticket?: string;
  priority?: "low" | "medium" | "high";
  comments?: any[];
  reassign_count?: number;
}

interface Column {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  tasks: Task[];
  description: string;
}

const priorityColors = {
  high: "border-l-4 border-red-500 dark:border-red-400",
  medium: "border-l-4 border-orange-500 dark:border-orange-400", 
  low: "border-l-4 border-green-500 dark:border-green-400",
};

const priorityIcons = {
  high: <ArrowUp className="h-4 w-4 text-red-500" />,
  medium: <Minus className="h-4 w-4 text-orange-500" />,
  low: <ArrowDown className="h-4 w-4 text-green-500" />,
};

const statusMapping = {
  "backlog": "backlog",
  "pending": "todo", 
  "in_progress": "progress",
  "under_review": "review",
  "completed": "done"
};

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [progressData, setProgressData] = useState<{ [key: string]: any }>({});
  const { user } = useAuthStore();
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [droppablesReady, setDroppablesReady] = useState(false);
  const [dragDropErrors, setDragDropErrors] = useState(0);
  const [useFallbackMode, setUseFallbackMode] = useState(false);

  // Static column definitions (stable for react-beautiful-dnd)
  const columnDefinitions = useMemo(() => [
    {
      id: "backlog",
      title: "Backlog",
      icon: <Archive className="h-5 w-5" />,
      color: "text-gray-500",
      bgColor: "bg-gray-100 dark:bg-gray-800/30",
      description: "Ideas and future tasks",
    },
    {
      id: "todo",
      title: "To Do",
      icon: <Target className="h-5 w-5" />,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      description: "Ready to start",
    },
    {
      id: "progress",
      title: "In Progress",
      icon: <PlayCircle className="h-5 w-5" />,
      color: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      description: "Work in progress",
    },
    {
      id: "review",
      title: "Under Review",
      icon: <Eye className="h-5 w-5" />,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      description: "Awaiting review",
    },
    {
      id: "done",
      title: "Done",
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      description: "Completed tasks",
    },
  ], []);

  // Function to get tasks for a specific column
  const getTasksForColumn = useCallback((columnId: string) => {
    switch (columnId) {
      case "backlog":
        return filteredTasks.filter((task) => task.progress_status === "backlog" || (!task.progress_status && task.status === "pending"));
      case "todo":
        return filteredTasks.filter((task) => task.progress_status === "pending" || task.progress_status === "todo");
      case "progress":
        return filteredTasks.filter((task) => task.progress_status === "in_progress");
      case "review":
        return filteredTasks.filter((task) => task.progress_status === "under_review" || task.status === "under_review");
      case "done":
        return filteredTasks.filter((task) => task.progress_status === "completed" || task.status === "completed");
      default:
        return [];
    }
  }, [filteredTasks]);

  // Columns with tasks populated dynamically
  const columns: Column[] = useMemo(() =>
    columnDefinitions.map(col => ({
      ...col,
      tasks: getTasksForColumn(col.id)
    })),
    [columnDefinitions, getTasksForColumn]
  );

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "tasks"),
        where("assigned_to", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const tasksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        priority: doc.data().priority || "medium",
      })) as Task[];

      const createdByIds = [
        ...new Set(tasksList.map((task) => task.created_by)),
      ];

      const usersSnap = await Promise.all(
        createdByIds.map((id) => getDoc(doc(db, "employees", id)))
      );

      const userMapping: { [key: string]: string } = {};
      usersSnap.forEach((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          userMapping[docSnap.id] = data.name || docSnap.id;
        }
      });

      const enrichedTasks = tasksList.map((task) => ({
        ...task,
        created_by: userMapping[task.created_by] || task.created_by,
      }));

      setUserMap(userMapping);
      setTasks(enrichedTasks);
      setFilteredTasks(enrichedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        progress_status: newStatus,
        progress_updated_at: serverTimestamp(),
      });
      
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, progress_status: newStatus } : task
        )
      );
      
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDragEnd = useCallback((result: any) => {
    try {
      const { destination, source, draggableId } = result;

      console.log('Drag end called:', { destination, source, draggableId });

      // If dropped outside a valid destination
      if (!destination) {
        console.log('No destination, aborting drag');
        return;
      }

      // If dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        console.log('Same position, aborting drag');
        return;
      }

      // Check if all droppables exist
      const currentDroppableIds = columns.map(c => c.id);
      console.log('Current droppables:', currentDroppableIds);

      if (!currentDroppableIds.includes(destination.droppableId)) {
        console.error(`Destination droppable ${destination.droppableId} not found in current columns:`, currentDroppableIds);

        // Track errors and enable fallback mode if too many
        const newErrorCount = dragDropErrors + 1;
        setDragDropErrors(newErrorCount);

        if (newErrorCount >= 3) {
          console.warn('Too many drag and drop errors, enabling fallback mode');
          setUseFallbackMode(true);
        } else {
          // Force refresh droppables
          setDroppablesReady(false);
          setTimeout(() => setDroppablesReady(true), 200);
        }
        return;
      }

      // Map column IDs to status values
      const statusMap: { [key: string]: string } = {
        backlog: "backlog",
        todo: "pending",
        progress: "in_progress",
        review: "under_review",
        done: "completed",
      };

      const newStatus = statusMap[destination.droppableId];
      if (newStatus) {
        console.log(`Updating task ${draggableId} to status ${newStatus}`);
        updateTaskStatus(draggableId, newStatus);
      } else {
        console.error(`No status mapping for droppable ${destination.droppableId}`);
      }
    } catch (error) {
      console.error('Drag and drop error:', error);

      // Track errors and enable fallback mode if too many
      const newErrorCount = dragDropErrors + 1;
      setDragDropErrors(newErrorCount);

      if (newErrorCount >= 3) {
        console.warn('Too many drag and drop errors, enabling fallback mode');
        setUseFallbackMode(true);
      } else {
        // Reset droppables on error
        setDroppablesReady(false);
        setTimeout(() => setDroppablesReady(true), 200);
      }
    }
  }, [columns]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleUpdateProgress = async (taskId: string) => {
    const data = progressData[taskId] || {};
    if (!data.progress_status) {
      toast.error("Please select a progress status.");
      return;
    }

    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        progress_status: data.progress_status,
        progress_description: data.progress_description || "",
        progress_link: data.progress_link || "",
        progress_updated_at: serverTimestamp(),
      });
      
      setSelectedTask((prev) =>
        prev ? { ...prev, ...data } : null
      );
      
      toast.success("Progress updated successfully!");
      fetchTasks();
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Update failed.");
    }
  };

  const handleInputChange = (taskId: string, field: string, value: any) => {
    setProgressData((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  };

  const isOverdue = (dueDate: any) => {
    if (!dueDate) return false;
    const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return new Date() > date;
  };

  const applyFilters = useCallback(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.task_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || task.progress_status === filterStatus || 
                           (filterStatus === "pending" && !task.progress_status);
      
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority]);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Debug: Log when columns change to track stability
  useEffect(() => {
    const droppableIds = columns.map(c => c.id);
    console.log('Columns updated, droppable IDs:', droppableIds);
    console.log('Done column exists:', droppableIds.includes('done'));
    console.log('Done column tasks:', columns.find(c => c.id === 'done')?.tasks.length || 0);

    // Ensure droppables are ready after columns are stable
    const timer = setTimeout(() => {
      setDroppablesReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [columns]);

  const TaskCard = ({ task, index }: { task: Task; index: number }) => (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => handleTaskClick(task)}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`group cursor-pointer p-4 rounded-xl shadow-lg border transition-all duration-300 mb-3 ${
              task.priority ? priorityColors[task.priority] : ""
            } ${
              isOverdue(task.due_date) && task.progress_status !== "completed" 
                ? "ring-2 ring-red-500 ring-opacity-50" : ""
            } ${
              snapshot.isDragging 
                ? "rotate-3 shadow-2xl scale-105 bg-white dark:bg-gray-800" 
                : "bg-white dark:bg-gray-800"
            }`}
            style={snapshot.isDragging ? { transform: "rotate(3deg)" } : {}}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className="text-xs font-mono px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                >
                  {task.task_id}
                </motion.span>
                {task.priority && (
                  <motion.div whileHover={{ scale: 1.2 }}>
                    {priorityIcons[task.priority]}
                  </motion.div>
                )}
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Due Date */}
            {task.due_date && (
              <div className={`flex items-center text-xs mb-3 px-2 py-1 rounded-lg ${
                isOverdue(task.due_date) && task.progress_status !== "completed" 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}>
                <Clock className="h-3 w-3 mr-1" />
                {dayjs(task.due_date.toDate?.() || task.due_date).format("MMM DD")}
                {isOverdue(task.due_date) && task.progress_status !== "completed" && (
                  <span className="ml-1 font-semibold">Overdue</span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {task.linked_ticket && (
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                    <Link2 className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-16">{task.linked_ticket}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {task.comments && task.comments.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {task.comments.length}
                  </div>
                )}
                <motion.img
                  whileHover={{ scale: 1.2 }}
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.created_by}`}
                  alt="Assignee"
                  className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-600 shadow-md"
                  title={`Assigned by: ${task.created_by}`}
                />
              </div>
            </div>

            {/* Drag indicator */}
            {snapshot.isDragging && (
              <div className="absolute top-2 right-2 text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zM7 14a1 1 0 000 2h6a1 1 0 100-2H7z"/>
                </svg>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-900/20 p-6">
      {/* Dark theme overlay */}
      <div className="fixed inset-0 opacity-0 dark:opacity-100 transition-opacity pointer-events-none"
           style={{
             background: "linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(124, 58, 237, 0.3) 50%, rgba(147, 51, 234, 0.2) 100%)",
           }} />
      
      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 4 }).map((_, i) => {
            // Generate random positions with better spacing
            const positions = [
              { left: 15, top: 20 },
              { left: 75, top: 60 },
              { left: 25, top: 80 },
              { left: 85, top: 25 }
            ];
            const pos = positions[i];

            return (
              <motion.div
                key={i}
                className="absolute w-24 h-24 rounded-full opacity-15"
                style={{
                  background: i % 2 === 0
                    ? "linear-gradient(45deg, #0891b2, #06b6d4)"
                    : "linear-gradient(45deg, #ea580c, #f97316)",
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                }}
                animate={{
                  x: [0, 30, 0],
                  y: [0, -30, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8 + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 shadow-lg"
              >
                <Layers className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-orange-500 to-cyan-600 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent mb-2">
                  My Task Board
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Drag & drop to manage your workflow
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round((columns[4].tasks.length / filteredTasks.length) * 100) || 0}% Complete
                </span>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span className="font-semibold">Add Task</span>
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass-card p-6"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-3 flex-1 min-w-64">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks across all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="backlog">Backlog</option>
                  <option value="pending">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="under_review">Under Review</option>
                  <option value="completed">Done</option>
                </select>
              </div>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 dark:focus:ring-purple-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTasks}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all"
              >
                <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </motion.button>

              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Kanban Board with Drag & Drop */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-cyan-500 dark:border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        ) : useFallbackMode ? (
          <div className="space-y-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>Fallback Mode:</strong> Drag & drop is temporarily disabled due to errors. You can still view and manage tasks using the task details modal.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {columns.map((column, index) => (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-h-[600px]"
                >
                  <div className={`h-full p-4 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 ${column.bgColor} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl`}>
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          className={`p-2 rounded-lg ${column.bgColor} ${column.color}`}
                        >
                          {column.icon}
                        </motion.div>
                        <div>
                          <h2 className={`text-lg font-bold ${column.color}`}>
                            {column.title}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {column.description}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1 rounded-full text-sm font-bold ${column.bgColor} ${column.color} border-2 border-current`}
                      >
                        {column.tasks.length}
                      </motion.div>
                    </div>

                    {/* Tasks Container (no drag and drop) */}
                    <div className="min-h-96" style={{ minHeight: '400px' }}>
                      {column.tasks.map((task, taskIndex) => (
                        <div key={task.id}>
                          <TaskCard task={task} index={taskIndex} />
                        </div>
                      ))}

                      {column.tasks.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <motion.div
                            animate={{
                              y: [0, -10, 0],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="text-6xl mb-4"
                          >
                            {column.id === "backlog" ? "📋" :
                             column.id === "todo" ? "🎯" :
                             column.id === "progress" ? "⚡" :
                             column.id === "review" ? "👀" : "🎉"}
                          </motion.div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            No tasks here
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {column.description}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : droppablesReady ? (
          <DragDropContext key={`kanban-${columns.map(c => c.id).join('-')}-${droppablesReady}`} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {columns.map((column, index) => (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="min-h-[600px]"
                >
                  <div className={`h-full p-4 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 ${column.bgColor} backdrop-blur-sm transition-all duration-300 hover:shadow-2xl`}>
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          className={`p-2 rounded-lg ${column.bgColor} ${column.color}`}
                        >
                          {column.icon}
                        </motion.div>
                        <div>
                          <h2 className={`text-lg font-bold ${column.color}`}>
                            {column.title}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {column.description}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1 rounded-full text-sm font-bold ${column.bgColor} ${column.color} border-2 border-current`}
                      >
                        {column.tasks.length}
                      </motion.div>
                    </div>

                    {/* Droppable Tasks Container */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-96 ${
                            snapshot.isDraggingOver
                              ? "bg-cyan-50 dark:bg-purple-900/20 border-2 border-dashed border-cyan-400 dark:border-purple-400"
                              : ""
                          }`}
                          style={{ minHeight: '400px' }}
                        >
                          {column.tasks.map((task, taskIndex) => (
                            <TaskCard key={task.id} task={task} index={taskIndex} />
                          ))}
                          {provided.placeholder}
                          
                          {column.tasks.length === 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12"
                            >
                              <motion.div
                                animate={{ 
                                  y: [0, -10, 0],
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="text-6xl mb-4"
                              >
                                {column.id === "backlog" ? "📋" : 
                                 column.id === "todo" ? "🎯" :
                                 column.id === "progress" ? "⚡" :
                                 column.id === "review" ? "👀" : "🎉"}
                              </motion.div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">
                                Drop tasks here
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {column.description}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </motion.div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="text-center py-12">
            <div className="neon-spinner h-16 w-16 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Initializing kanban board...</p>
          </div>
        )}

        {/* Task Detail Modal */}
        <AnimatePresence>
          {showTaskModal && selectedTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowTaskModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="p-3 bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 rounded-2xl"
                    >
                      <Zap className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedTask.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full font-mono">
                          {selectedTask.task_id}
                        </span>
                        {selectedTask.priority && (
                          <div className="flex items-center space-x-2">
                            {priorityIcons[selectedTask.priority]}
                            <span className="capitalize font-medium">{selectedTask.priority} Priority</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl font-bold"
                  >
                    ×
                  </motion.button>
                </div>

                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <GitBranch className="h-5 w-5 mr-2" />
                      Description
                    </h3>
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedTask.description || "No description provided"}
                      </p>
                    </div>
                  </div>

                  {/* Task Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Assigned By
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        {selectedTask.created_by}
                      </p>
                    </div>

                    {selectedTask.due_date && (
                      <div className={`p-6 rounded-2xl border ${
                        isOverdue(selectedTask.due_date) && selectedTask.progress_status !== "completed"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      }`}>
                        <h4 className={`font-bold mb-3 flex items-center ${
                          isOverdue(selectedTask.due_date) && selectedTask.progress_status !== "completed"
                            ? "text-red-900 dark:text-red-300"
                            : "text-green-900 dark:text-green-300"
                        }`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Due Date
                        </h4>
                        <p className={`font-medium ${
                          isOverdue(selectedTask.due_date) && selectedTask.progress_status !== "completed"
                            ? "text-red-800 dark:text-red-200"
                            : "text-green-800 dark:text-green-200"
                        }`}>
                          {dayjs(
                            selectedTask.due_date.toDate?.() || selectedTask.due_date
                          ).format("MMMM DD, YYYY")}
                          {isOverdue(selectedTask.due_date) && selectedTask.progress_status !== "completed" && (
                            <span className="block text-red-600 dark:text-red-400 font-bold text-sm mt-1">
                              ⚠️ Overdue
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Update Section */}
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <h3 className="text-xl font-bold text-purple-900 dark:text-purple-300 mb-6 flex items-center">
                      <Award className="h-6 w-6 mr-2" />
                      Update Progress
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-purple-800 dark:text-purple-200 mb-3">
                          Status
                        </label>
                        <select
                          value={progressData[selectedTask.id]?.progress_status || selectedTask.progress_status || "backlog"}
                          onChange={(e) =>
                            handleInputChange(selectedTask.id, "progress_status", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-purple-300 dark:border-purple-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="pending">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="under_review">Under Review</option>
                          <option value="completed">Done</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-800 dark:text-purple-200 mb-3">
                          Progress Description
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Describe your progress, challenges, or next steps..."
                          defaultValue={selectedTask.progress_description}
                          onChange={(e) =>
                            handleInputChange(selectedTask.id, "progress_description", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-purple-300 dark:border-purple-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-800 dark:text-purple-200 mb-3">
                          Progress Link
                        </label>
                        <input
                          type="url"
                          placeholder="https://link-to-work-or-demo..."
                          defaultValue={selectedTask.progress_link}
                          onChange={(e) =>
                            handleInputChange(selectedTask.id, "progress_link", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-purple-300 dark:border-purple-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpdateProgress(selectedTask.id)}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-6 w-6" />
                        <span>Update Progress</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {selectedTask.comments && selectedTask.comments.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <MessageSquare className="h-6 w-6 mr-2" />
                        Comments
                      </h3>
                      <div className="space-y-4">
                        {selectedTask.comments.map((comment, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                          >
                            <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.text}</p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <User className="h-3 w-3 mr-1" />
                              {comment.userName || "Anonymous"}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
