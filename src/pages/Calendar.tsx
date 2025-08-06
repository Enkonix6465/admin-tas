import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Search,
  Grid3X3,
  List,
  Share,
  Settings,
  Star,
  MoreHorizontal,
  Clock,
  User,
  Tag,
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import dayjs from "dayjs";

interface Task {
  id: string;
  task_id: string;
  title: string;
  description: string;
  due_date: any;
  progress_status: string;
  priority: "low" | "medium" | "high";
  project_name?: string;
  assigned_to: string;
  created_by: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<"month" | "week" | "table">("month");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
  }, [user]);

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
      setTasks(tasksList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const firstDay = currentDate.startOf("month").startOf("week");
    const lastDay = currentDate.endOf("month").endOf("week");
    const days = [];
    let current = firstDay;

    while (current.isBefore(lastDay) || current.isSame(lastDay, "day")) {
      days.push(current);
      current = current.add(1, "day");
    }

    return days;
  };

  const getTasksForDate = (date: dayjs.Dayjs) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = dayjs(task.due_date.toDate ? task.due_date.toDate() : task.due_date);
      return taskDate.isSame(date, "day");
    });
  };

  const getTaskColor = (task: Task) => {
    if (task.progress_status === "completed") return "bg-green-500 text-white";
    if (task.progress_status === "in_progress") return "bg-blue-500 text-white";
    if (task.priority === "high") return "bg-red-500 text-white";
    if (task.priority === "medium") return "bg-orange-500 text-white";
    return "bg-gray-500 text-white";
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.format("MMMM YYYY");

  const TaskCard = ({ task }: { task: Task }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      className={`text-xs p-2 rounded-lg mb-1 cursor-pointer transition-all duration-200 ${getTaskColor(task)} truncate`}
      title={`${task.task_id}: ${task.title}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{task.task_id}</span>
        {task.priority === "high" && (
          <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
        )}
      </div>
      <div className="text-white/90 truncate">{task.title}</div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass border-b border-cyan-200 dark:border-purple-500/30 px-6 py-4 shadow-sm dark:shadow-purple-500/20 relative z-10 rounded-t-3xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-orange-500 to-cyan-600 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                  Project Board [2023]
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-purple-300">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>On track</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm bg-white/80 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-500/30 rounded-lg transition-all duration-200">
                Share
              </button>
              <button className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-600 to-orange-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                Create
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 p-1 rounded-xl border border-cyan-200 dark:border-purple-500/30">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    viewMode === "month"
                      ? "bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-purple-200 hover:bg-cyan-100 dark:hover:bg-purple-700/40"
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-purple-200 hover:bg-cyan-100 dark:hover:bg-purple-700/40"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    viewMode === "calendar"
                      ? "bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-purple-200 hover:bg-cyan-100 dark:hover:bg-purple-700/40"
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    viewMode === "timeline"
                      ? "bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-purple-200 hover:bg-cyan-100 dark:hover:bg-purple-700/40"
                  }`}
                >
                  Timeline
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-purple-800/60 text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-purple-500 focus:border-transparent backdrop-blur-sm w-48"
                />
              </div>
              <button className="p-2 border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-purple-800 text-gray-700 dark:text-purple-300 hover:bg-gray-50 dark:hover:bg-purple-700 transition-all">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-purple-800 text-gray-700 dark:text-purple-300 hover:bg-gray-50 dark:hover:bg-purple-700 transition-all">
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Calendar Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="liquid-glass border-b border-cyan-200 dark:border-purple-500/30 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-purple-700/40 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-purple-300" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-48 text-center">
                  {monthName}
                </h2>
                <button
                  onClick={() => setCurrentDate(currentDate.add(1, "month"))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-purple-700/40 rounded-lg transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-purple-300" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={currentDate.format("YYYY-MM")}
                  onChange={(e) => setCurrentDate(dayjs(e.target.value))}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-purple-800/60 text-gray-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-purple-500"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = dayjs().month(i);
                    return (
                      <option key={i} value={month.format("YYYY-MM")}>
                        {month.format("MMMM YYYY")}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-purple-300">Month</span>
              <button
                onClick={() => setCurrentDate(dayjs())}
                className="px-3 py-2 text-sm bg-cyan-100 dark:bg-purple-900/30 text-cyan-700 dark:text-purple-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-purple-900/50 transition-all"
              >
                Today
              </button>
            </div>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass-card rounded-b-3xl"
        >
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-purple-500/20 rounded-t-lg overflow-hidden">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="bg-gray-50 dark:bg-purple-800/30 p-4 text-center text-sm font-semibold text-gray-700 dark:text-purple-200"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-purple-500/20">
            <AnimatePresence>
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day);
                const isCurrentMonth = day.month() === currentDate.month();
                const isToday = day.isSame(dayjs(), "day");
                const isSelected = selectedDate === day.format("YYYY-MM-DD");

                return (
                  <motion.div
                    key={day.format("YYYY-MM-DD")}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => setSelectedDate(day.format("YYYY-MM-DD"))}
                    className={`min-h-32 bg-white dark:bg-purple-900/10 p-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-purple-800/20 ${
                      !isCurrentMonth ? "opacity-40" : ""
                    } ${isSelected ? "ring-2 ring-cyan-500 dark:ring-purple-500" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? "w-6 h-6 bg-cyan-500 dark:bg-purple-500 text-white rounded-full flex items-center justify-center"
                            : isCurrentMonth
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-purple-400"
                        }`}
                      >
                        {day.date()}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-purple-300">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 max-h-20 overflow-hidden">
                      {dayTasks.slice(0, 3).map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-purple-400 text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Task Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Tasks", value: tasks.length, color: "text-cyan-600 dark:text-cyan-400" },
            { label: "Completed", value: tasks.filter(t => t.progress_status === "completed").length, color: "text-green-600 dark:text-green-400" },
            { label: "In Progress", value: tasks.filter(t => t.progress_status === "in_progress").length, color: "text-blue-600 dark:text-blue-400" },
            { label: "Overdue", value: tasks.filter(t => {
              if (!t.due_date) return false;
              const taskDate = dayjs(t.due_date.toDate ? t.due_date.toDate() : t.due_date);
              return taskDate.isBefore(dayjs(), "day") && t.progress_status !== "completed";
            }).length, color: "text-red-600 dark:text-red-400" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="liquid-glass-stats text-center"
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-purple-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Calendar;
