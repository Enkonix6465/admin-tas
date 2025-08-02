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
  Sync,
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
        { id: "proj-1", name: "Mobile app design", color: "#3b82f6" },
        { id: "proj-2", name: "Process", color: "#10b981" },
        { id: "proj-3", name: "Creative group", color: "#f59e0b" },
        { id: "proj-4", name: "HR", color: "#ef4444" },
        { id: "proj-5", name: "Landing (empty)", color: "#6366f1" },
        { id: "proj-6", name: "Upgrade Defnox", color: "#8b5cf6" },
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
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#10b981";
      default: return "#6b7280";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "review": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "pending": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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
    <div className="h-full bg-stone-100 dark:bg-gray-900 flex overflow-hidden">
      {/* Project Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 20 }}
        className="w-80 bg-stone-50 dark:bg-gray-800 border-r border-stone-200 dark:border-gray-700 flex flex-col flex-shrink-0 overflow-hidden shadow-lg"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-stone-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Project Board [{new Date().getFullYear()}]
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-stone-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </motion.button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">ON TRACK</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => toggleView("calendar")}
              className={`px-2 py-1 rounded transition-colors ${
                activeView === "calendar" ? "text-blue-600 font-medium bg-blue-50" : "hover:bg-stone-200"
              }`}
            >
              Calendar
            </button>
            <span>•</span>
            <button
              onClick={() => toggleView("timeline")}
              className={`px-2 py-1 rounded transition-colors ${
                activeView === "timeline" ? "text-blue-600 font-medium bg-blue-50" : "hover:bg-stone-200"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedProject("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedProject === "all"
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-stone-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4 h-4" />
                <span>All Projects</span>
              </div>
            </button>

            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group ${
                  selectedProject === project.id
                    ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-stone-200 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm shadow-sm"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 truncate">{project.name}</span>
                  <MoreHorizontal className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
            >
              <Folder className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {getDateLabel()}
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevPeriod}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextPeriod}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: "day", icon: Eye, label: "Day" },
                { id: "week", icon: List, label: "Week" },
                { id: "month", icon: Grid, label: "Month" }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
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

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-4"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <div className="space-y-2">
                        {["pending", "in_progress", "review", "completed"].map((status) => (
                          <label key={status} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="capitalize">{status.replace("_", " ")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Today
            </button>

            <div className="relative">
              <button 
                onClick={handleSettings}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              {settingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-3"
                >
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      Calendar Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      Export Calendar
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      Sync Settings
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="h-full bg-white dark:bg-gray-800 m-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            {/* Week Headers - Only show for month and week view */}
            {viewMode !== "day" && (
              <div className={`grid ${viewMode === "week" ? "grid-cols-7" : "grid-cols-7"} border-b border-gray-200 dark:border-gray-700 flex-shrink-0`}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50"
                  >
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* Calendar Days */}
            <div className={`flex-1 overflow-auto ${
              viewMode === "day" ? "p-4" : 
              viewMode === "week" ? "grid grid-cols-7" : 
              "grid grid-cols-7"
            }`}>
              {viewMode === "day" ? (
                // Day view - single day layout
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {format(currentDate, "EEEE")}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
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
                        className={`p-4 rounded-lg border ${getStatusColor(event.status)}`}
                        style={{ 
                          borderLeftWidth: "4px",
                          borderLeftColor: getEventColor(event)
                        }}
                      >
                        <div className="font-medium text-lg mb-2">{event.title}</div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="capitalize">{event.type}</span>
                          <span>•</span>
                          <span className="capitalize">{event.status}</span>
                          {event.priority && (
                            <>
                              <span>•</span>
                              <span className={`capitalize ${
                                event.priority === "high" ? "text-red-600" :
                                event.priority === "medium" ? "text-yellow-600" :
                                "text-green-600"
                              }`}>
                                {event.priority} priority
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    {getEventsForDate(currentDate).length === 0 && (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No events for today</p>
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
                      className={`p-2 ${viewMode === "week" ? "min-h-[200px]" : "min-h-[120px]"} border-r border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative ${
                        !isCurrentMonth ? "text-gray-400 bg-gray-50/50 dark:bg-gray-800/50" : ""
                      } ${isToday_ ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday_ 
                          ? "w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs" 
                          : ""
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
                            className={`text-xs px-2 py-1 rounded border text-left cursor-pointer hover:shadow-sm transition-all ${getStatusColor(event.status)}`}
                            style={{ 
                              borderLeftWidth: "3px",
                              borderLeftColor: getEventColor(event)
                            }}
                            title={`${event.title} - ${event.status}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            {event.assigned_to && viewMode === "week" && (
                              <div className="flex items-center gap-1 mt-1 opacity-75">
                                <User className="w-2 h-2" />
                                <span className="truncate">Assigned</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                        
                        {dayEvents.length > (viewMode === "week" ? 6 : 3) && (
                          <div className="text-xs text-gray-500 px-2 py-1">
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
        </div>
      </div>

      {/* Selected Date Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getEventColor(event) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {event.title}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{event.type}</span>
                        <span>•</span>
                        <span className="capitalize">{event.status}</span>
                        {event.priority && (
                          <>
                            <span>•</span>
                            <span className={`capitalize ${
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
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
