import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, addDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Folder,
  Settings,
  Star,
  MoreHorizontal,
  User,
  Flag,
  Grid,
  List,
  Eye,
  Menu,
  X,
  Download,
  Bell,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("month"); // month, week, day, timeline
  const [selectedProject, setSelectedProject] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState("calendar"); // calendar, timeline
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    projects: []
  });
  const [tempFilters, setTempFilters] = useState({
    status: [],
    priority: [],
    projects: []
  });

  useEffect(() => {
    fetchEvents();
    fetchProjects();
  }, []);

  const fetchEvents = async () => {
    try {
      const tasksSnap = await getDocs(collection(db, "tasks"));
      const taskEvents = tasksSnap.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        date: new Date(doc.data().due_date || Date.now()),
        type: "task",
        status: doc.data().status,
        priority: doc.data().priority,
        project_id: doc.data().project_id,
        assigned_to: doc.data().assigned_to,
        ...doc.data(),
      }));
      setEvents(taskEvents);
    } catch (error) {
      console.warn("Calendar data fetch failed:", error);
      // Mock data for fallback
      setEvents([
        {
          id: "1",
          title: "Contact customers at..",
          date: new Date(),
          type: "task",
          status: "pending",
          priority: "high",
          project_id: "proj-1"
        },
        {
          id: "2", 
          title: "Task status review",
          date: new Date(Date.now() + 86400000),
          type: "task",
          status: "in_progress",
          priority: "medium",
          project_id: "proj-1"
        },
        {
          id: "3",
          title: "Developer services",
          date: new Date(Date.now() + 172800000),
          type: "task", 
          status: "review",
          priority: "low",
          project_id: "proj-2"
        }
      ]);
    }
  };

  const fetchProjects = async () => {
    try {
      const projectsSnap = await getDocs(collection(db, "projects"));
      const projectsData = projectsSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        color: doc.data().color || '#3b82f6',
        ...doc.data(),
      }));
      setProjects(projectsData);
    } catch (error) {
      console.warn("Projects data fetch failed:", error);
      // Mock data for fallback
      setProjects([
        { id: "proj-1", name: "Mobile app design", color: "#8b5cf6" },
        { id: "proj-2", name: "Process", color: "#a855f7" },
        { id: "proj-3", name: "Creative group", color: "#9333ea" },
        { id: "proj-4", name: "HR", color: "#7c3aed" },
        { id: "proj-5", name: "Landing (empty)", color: "#6d28d9" },
        { id: "proj-6", name: "Upgrade Defnox", color: "#5b21b6" },
      ]);
    }
  };

  // Calendar date calculations based on view mode
  const getCalendarDays = () => {
    if (viewMode === "day") {
      return [currentDate];
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  };

  const calendarDays = getCalendarDays();

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventMatches = isSameDay(event.date, date);
      const projectMatches = selectedProject === "all" || event.project_id === selectedProject;
      const searchMatches = !searchTerm || event.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply filter criteria
      const statusMatches = filters.status.length === 0 || filters.status.includes(event.status);
      const priorityMatches = filters.priority.length === 0 || filters.priority.includes(event.priority);
      const projectFilterMatches = filters.projects.length === 0 || filters.projects.includes(event.project_id);

      return eventMatches && projectMatches && searchMatches && statusMatches && priorityMatches && projectFilterMatches;
    });
  };

  const getAllFilteredEvents = () => {
    return events.filter(event => {
      const projectMatches = selectedProject === "all" || event.project_id === selectedProject;
      const searchMatches = !searchTerm || event.title.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply filter criteria
      const statusMatches = filters.status.length === 0 || filters.status.includes(event.status);
      const priorityMatches = filters.priority.length === 0 || filters.priority.includes(event.priority);
      const projectFilterMatches = filters.projects.length === 0 || filters.projects.includes(event.project_id);

      return projectMatches && searchMatches && statusMatches && priorityMatches && projectFilterMatches;
    });
  };

  const nextPeriod = () => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const prevPeriod = () => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, -1));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const getEventColor = (event: any) => {
    const project = projects.find(p => p.id === event.project_id);
    if (project) return project.color;
    
    switch (event.priority) {
      case "high": return "#dc2626";
      case "medium": return "#ea580c";
      case "low": return "#059669";
      default: return "#8b5cf6";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-50/80 text-green-700 border-green-200/50";
      case "in_progress": return "bg-purple-50/80 text-purple-700 border-purple-200/50";
      case "review": return "bg-yellow-50/80 text-yellow-700 border-yellow-200/50";
      case "pending": return "bg-gray-50/80 text-gray-700 border-gray-200/50";
      default: return "bg-gray-50/80 text-gray-700 border-gray-200/50";
    }
  };

  const getDateLabel = () => {
    if (viewMode === "day") {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  };

  const handleSettings = () => {
    setSettingsOpen(!settingsOpen);
    toast.success("Settings panel opened! ⚙️");
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setFilterOpen(false);
    toast.success("Filters applied successfully! 🔍");
  };

  const clearFilters = () => {
    const emptyFilters = { status: [], priority: [], projects: [] };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    setFilterOpen(false);
    toast.success("Filters cleared! ✨");
  };

  const handleFilterChange = (type: string, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const toggleView = (view: string) => {
    setActiveView(view);
    if (view === "timeline") {
      setViewMode("timeline");
      toast.success("Timeline view activated! 📅");
    } else {
      setViewMode("month");
      toast.success("Calendar view activated! 📅");
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:bg-gradient-to-br dark:from-[#0f1129] dark:via-[#1a1b3a] dark:to-[#2d1b69] flex overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 via-transparent to-purple-900/5 dark:from-purple-400/10 dark:via-transparent dark:to-purple-600/10 pointer-events-none" />
      
      {/* Project Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-80 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-r border-purple-200/30 dark:border-purple-600/30 flex flex-col flex-shrink-0 overflow-hidden shadow-xl"
      >
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-purple-400/5 to-purple-600/10 dark:from-purple-400/20 dark:via-purple-500/10 dark:to-purple-600/20 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60" />
        
        {/* Sidebar Header */}
        <div className="relative p-6 border-b border-purple-200/30 dark:border-purple-600/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                Project Board [{new Date().getFullYear()}]
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-purple-100/60 dark:hover:bg-purple-900/60 rounded-lg transition-colors"
              >
                <Menu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </motion.button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">ON TRACK</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => toggleView("calendar")}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeView === "calendar"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-900/60"
              }`}
            >
              Calendar
            </button>
            <span className="text-purple-400">•</span>
            <button
              onClick={() => toggleView("timeline")}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                activeView === "timeline"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-100/60 dark:hover:bg-purple-900/60"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="relative flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedProject("all")}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all ${
                selectedProject === "all"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25"
                  : "text-purple-700 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/60 backdrop-blur-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4 h-4" />
                <span className="font-medium">All Projects</span>
              </div>
            </button>

            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all group ${
                  selectedProject === project.id
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25"
                    : "text-purple-700 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/60 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm shadow-sm"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 truncate font-medium">{project.name}</span>
                  <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Compact Header Bar */}
        <div className="relative backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-b border-purple-200/30 dark:border-purple-600/30 p-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-white/10 to-purple-600/5 dark:from-purple-400/10 dark:via-gray-900/10 dark:to-purple-600/10" />

          <div className="relative flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
              {getDateLabel()}
            </h1>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevPeriod}
                className="p-2 hover:bg-purple-100/60 dark:hover:bg-purple-900/60 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextPeriod}
                className="p-2 hover:bg-purple-100/60 dark:hover:bg-purple-900/60 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </motion.button>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            {/* View Mode Toggle */}
            {activeView === "calendar" && (
              <div className="flex items-center bg-purple-100/60 dark:bg-purple-900/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                {[
                  { id: "day", icon: Eye, label: "Day" },
                  { id: "week", icon: List, label: "Week" },
                  { id: "month", icon: Grid, label: "Month" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all font-medium ${
                      viewMode === mode.id
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/25'
                        : 'text-purple-600 dark:text-purple-400 hover:bg-purple-200/50 dark:hover:bg-purple-800/50'
                    }`}
                  >
                    <mode.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-900 dark:text-purple-100 placeholder-purple-400 dark:placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 dark:focus:border-purple-400 w-52 shadow-sm"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm border border-purple-200/50 dark:border-purple-600/50 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-purple-700 dark:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-900/80 transition-colors shadow-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-80 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-purple-200/50 dark:border-purple-600/50 rounded-xl shadow-2xl z-20 p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white/50 dark:from-purple-900/50 dark:to-gray-900/50 rounded-xl" />

                  <div className="relative">
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-4">Filter Events</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                          Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["pending", "in_progress", "review", "completed"].map((status) => (
                            <label key={status} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="rounded border-purple-300 dark:border-purple-600 text-purple-600 focus:ring-purple-500/20"
                                checked={tempFilters.status.includes(status)}
                                onChange={() => handleFilterChange("status", status)}
                              />
                              <span className="capitalize text-purple-700 dark:text-purple-300">{status.replace("_", " ")}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                          Priority
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {["high", "medium", "low"].map((priority) => (
                            <label key={priority} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="rounded border-purple-300 dark:border-purple-600 text-purple-600 focus:ring-purple-500/20"
                                checked={tempFilters.priority.includes(priority)}
                                onChange={() => handleFilterChange("priority", priority)}
                              />
                              <span className="capitalize text-purple-700 dark:text-purple-300">{priority}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                          Projects
                        </label>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {projects.map((project) => (
                            <label key={project.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="rounded border-purple-300 dark:border-purple-600 text-purple-600 focus:ring-purple-500/20"
                                checked={tempFilters.projects.includes(project.id)}
                                onChange={() => handleFilterChange("projects", project.id)}
                              />
                              <div
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="truncate text-purple-700 dark:text-purple-300">{project.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between pt-3 border-t border-purple-200/50 dark:border-purple-600/50">
                        <button
                          onClick={clearFilters}
                          className="px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={applyFilters}
                          className="px-4 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/25"
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
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/25 font-medium"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto relative">
          {activeView === "timeline" ? (
            // Enhanced Timeline View with Completion Tracking
            <div className="h-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm m-4 rounded-2xl border border-purple-200/30 dark:border-purple-600/30 overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white/30 dark:from-purple-900/50 dark:to-gray-900/30 rounded-2xl" />

              <div className="relative p-6 border-b border-purple-200/30 dark:border-purple-600/30">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">Project Timeline Chart</h2>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Task completion schedule with time tracking</p>
              </div>

              <div className="relative flex-1 overflow-y-auto p-6">
                {/* Timeline Chart Visualization */}
                <div className="relative">
                  {/* Timeline Axis */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-700"></div>

                  <div className="space-y-6">
                    {getAllFilteredEvents()
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((event, index) => {
                        const isCompleted = event.status === 'completed';
                        const isOverdue = new Date(event.date) < new Date() && !isCompleted;
                        const daysTillCompletion = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const completionProgress = isCompleted ? 100 : (daysTillCompletion < 0 ? 0 : Math.max(0, 100 - (daysTillCompletion * 10)));

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start gap-6"
                          >
                            {/* Timeline Node */}
                            <div className="relative flex flex-col items-center z-10">
                              <motion.div
                                className={`w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                                  isCompleted ? 'bg-green-500' :
                                  isOverdue ? 'bg-red-500' :
                                  'bg-purple-500'
                                }`}
                                whileHover={{ scale: 1.2 }}
                                style={{ backgroundColor: getEventColor(event) }}
                              />
                              {/* Completion Progress Ring */}
                              <div className="absolute -inset-1">
                                <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                                  <circle
                                    cx="16"
                                    cy="16"
                                    r="12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-purple-200"
                                  />
                                  <circle
                                    cx="16"
                                    cy="16"
                                    r="12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray={`${completionProgress * 0.75} 75`}
                                    className={`${
                                      isCompleted ? 'text-green-500' :
                                      isOverdue ? 'text-red-500' :
                                      'text-purple-500'
                                    }`}
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Event Card */}
                            <motion.div
                              whileHover={{ y: -2, boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.3)" }}
                              className="flex-1 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-xl border border-purple-200/50 dark:border-purple-600/50 p-4 shadow-lg"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-white/30 dark:from-purple-900/30 dark:to-gray-900/30 rounded-xl" />
                              
                              {/* Card Header */}
                              <div className="relative flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-lg mb-1">
                                    {event.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                                    <Clock className="w-4 h-4" />
                                    <span>{format(event.date, "MMM d, yyyy 'at' h:mm a")}</span>
                                    {daysTillCompletion > 0 && (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                        {daysTillCompletion} days left
                                      </span>
                                    )}
                                    {isOverdue && (
                                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                        {Math.abs(daysTillCompletion)} days overdue
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                    {completionProgress.toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400">completion</div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="relative mb-3">
                                <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 mb-1">
                                  <span>Progress</span>
                                  <span>{completionProgress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-purple-100/60 dark:bg-purple-900/60 rounded-full h-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionProgress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-2 rounded-full transition-all ${
                                      isCompleted ? 'bg-green-500' :
                                      isOverdue ? 'bg-red-500' :
                                      'bg-gradient-to-r from-purple-500 to-purple-600'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Status and Project Info */}
                              <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                                    {event.status.replace("_", " ")}
                                  </span>
                                  {event.priority && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      event.priority === "high" ? "bg-red-100 text-red-700" :
                                      event.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                                      "bg-green-100 text-green-700"
                                    }`}>
                                      {event.priority} priority
                                    </span>
                                  )}
                                </div>

                                {event.project_id && (
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-sm"
                                      style={{ backgroundColor: getEventColor(event) }}
                                    />
                                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                                      {projects.find(p => p.id === event.project_id)?.name}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Time Estimate */}
                              <div className="relative mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-600/50">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-purple-600 dark:text-purple-400">
                                    Estimated completion time:
                                  </span>
                                  <span className="font-medium text-purple-900 dark:text-purple-100">
                                    {isCompleted ? 'Completed' :
                                     isOverdue ? 'Overdue' :
                                     daysTillCompletion <= 1 ? 'Due today' :
                                     `${daysTillCompletion} days remaining`}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                  </div>

                  {getAllFilteredEvents().length === 0 && (
                    <div className="text-center py-16 text-purple-600 dark:text-purple-400">
                      <CalendarIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-medium mb-2">No events in timeline</p>
                      <p className="text-sm">Add some tasks to see the timeline visualization</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Calendar View
            <div className="h-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm m-4 rounded-2xl border border-purple-200/30 dark:border-purple-600/30 overflow-hidden flex flex-col shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white/30 dark:from-purple-900/50 dark:to-gray-900/30 rounded-2xl" />
              
              {/* Week Headers - Only show for month and week view */}
              {viewMode !== "day" && (
                <div className={`relative grid ${viewMode === "week" ? "grid-cols-7" : "grid-cols-7"} border-b border-purple-200/30 dark:border-purple-600/30 flex-shrink-0`}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50/60 dark:bg-purple-900/60 backdrop-blur-sm"
                    >
                      {day}
                    </div>
                  ))}
                </div>
              )}

              {/* Calendar Days */}
              <div className={`relative flex-1 overflow-auto ${
                viewMode === "day" ? "p-4" :
                viewMode === "week" ? "grid grid-cols-7" :
                "grid grid-cols-7"
              }`}>
                {viewMode === "day" ? (
                  // Day view - single day layout
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                        {format(currentDate, "EEEE")}
                      </h2>
                      <p className="text-lg text-purple-600 dark:text-purple-400 mt-1">
                        {format(currentDate, "MMMM d, yyyy")}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {getEventsForDate(currentDate).map((event, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-xl border backdrop-blur-sm ${getStatusColor(event.status)}`}
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: getEventColor(event)
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-50/30 to-white/30 rounded-xl" />
                          <div className="relative">
                            <div className="font-medium text-lg mb-2 text-purple-900 dark:text-purple-100">{event.title}</div>
                            <div className="flex items-center gap-4 text-sm text-purple-600 dark:text-purple-400">
                              <span className="capitalize">{event.type}</span>
                              <span>•</span>
                              <span className="capitalize">{event.status}</span>
                              {event.priority && (
                                <>
                                  <span>•</span>
                                  <span className={`capitalize font-medium ${
                                    event.priority === "high" ? "text-red-600" :
                                    event.priority === "medium" ? "text-yellow-600" :
                                    "text-green-600"
                                  }`}>
                                    {event.priority} priority
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {getEventsForDate(currentDate).length === 0 && (
                        <div className="text-center py-12 text-purple-600 dark:text-purple-400">
                          <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No events for today</p>
                          <p className="text-sm">Your schedule is clear!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Week and Month view - grid layout
                  calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    const isToday_ = isToday(day);
                    const isCurrentMonth = viewMode === "week" || isSameMonth(day, currentDate);

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className={`p-2 ${viewMode === "week" ? "min-h-[200px]" : "min-h-[120px]"} border-r border-b border-purple-200/30 dark:border-purple-600/30 hover:bg-purple-50/30 dark:hover:bg-purple-900/30 transition-colors cursor-pointer relative ${
                          !isCurrentMonth ? "text-purple-400 bg-purple-50/20 dark:bg-purple-900/20" : ""
                        } ${isToday_ ? "bg-purple-100/60 dark:bg-purple-900/60" : ""}`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={`text-sm font-medium mb-2 ${
                          isToday_
                            ? "w-6 h-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-xs shadow-lg"
                            : "text-purple-700 dark:text-purple-300"
                        }`}>
                          {format(day, "d")}
                        </div>

                        <div className="space-y-1 overflow-hidden">
                          {dayEvents.slice(0, viewMode === "week" ? 6 : 3).map((event, eventIndex) => (
                            <motion.div
                              key={eventIndex}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: eventIndex * 0.1 }}
                              className={`text-xs px-2 py-1 rounded-lg border text-left cursor-pointer hover:shadow-sm transition-all backdrop-blur-sm ${getStatusColor(event.status)}`}
                              style={{
                                borderLeftWidth: "3px",
                                borderLeftColor: getEventColor(event)
                              }}
                              title={`${event.title} - ${event.status}`}
                            >
                              <div className="font-medium truncate text-purple-900 dark:text-purple-100">{event.title}</div>
                              {event.assigned_to && viewMode === "week" && (
                                <div className="flex items-center gap-1 mt-1 opacity-75">
                                  <User className="w-2 h-2" />
                                  <span className="truncate text-purple-600 dark:text-purple-400">Assigned</span>
                                </div>
                              )}
                            </motion.div>
                          ))}

                          {dayEvents.length > (viewMode === "week" ? 6 : 3) && (
                            <div className="text-xs text-purple-500 dark:text-purple-400 px-2 py-1 font-medium">
                              +{dayEvents.length - (viewMode === "week" ? 6 : 3)} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Date Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl border border-purple-200/50 dark:border-purple-600/50 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-white/30 dark:from-purple-900/50 dark:to-gray-900/30 rounded-2xl" />

              <div className="relative mb-4">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Click outside to close
                </p>
              </div>
              
              <div className="relative space-y-3">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-purple-50/60 dark:bg-purple-900/60 backdrop-blur-sm rounded-xl border border-purple-200/30 dark:border-purple-600/30"
                  >
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getEventColor(event) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                        {event.title}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-purple-600 dark:text-purple-400">
                        <span className="capitalize">{event.type}</span>
                        <span>•</span>
                        <span className="capitalize">{event.status}</span>
                        {event.priority && (
                          <>
                            <span>•</span>
                            <span className={`capitalize font-medium ${
                              event.priority === "high" ? "text-red-600" :
                              event.priority === "medium" ? "text-yellow-600" :
                              "text-green-600"
                            }`}>
                              {event.priority} priority
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getEventsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-purple-600">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No events for this date</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
