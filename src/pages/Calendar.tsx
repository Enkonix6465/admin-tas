import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Star,
  Settings,
  Share2,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "task" | "project";
  status: string;
  assignedTo?: string;
  project?: string;
  description?: string;
  priority?: string;
}

// Helper function to safely get date
const getDate = (date: any): Date | null => {
  if (!date) return null;
  if (date.toDate) return date.toDate();
  if (typeof date === "string") return new Date(date);
  return null;
};

const statusColors = {
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200", 
  completed: "bg-green-100 text-green-700 border-green-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

const priorityColors = {
  high: "bg-red-50 border-l-red-400",
  medium: "bg-yellow-50 border-l-yellow-400", 
  low: "bg-green-50 border-l-green-400",
};

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployees] = useState<Record<string, any>>({});
  const [projects, setProjects] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchEmployees = async () => {
      const snap = await getDocs(collection(db, "employees"));
      const empMap: Record<string, any> = {};
      snap.docs.forEach((doc) => {
        empMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setEmployees(empMap);
    };

    const fetchProjects = async () => {
      const snap = await getDocs(collection(db, "projects"));
      const projMap: Record<string, any> = {};
      snap.docs.forEach((doc) => {
        projMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setProjects(projMap);
    };

    fetchEmployees();
    fetchProjects();
  }, []);

  const { data: events = [], isLoading } = useQuery(
    "calendar-events",
    async () => {
      const events: CalendarEvent[] = [];

      // Fetch tasks
      const tasksSnapshot = await getDocs(collection(db, "tasks"));
      for (const taskDoc of tasksSnapshot.docs) {
        const task = taskDoc.data();
        const dueDate = getDate(task.due_date);
        if (dueDate) {
          const isOverdue = dueDate < new Date() && task.status !== "completed";
          events.push({
            id: taskDoc.id,
            title: task.title,
            date: dueDate,
            type: "task",
            status: isOverdue ? "overdue" : task.status,
            assignedTo: task.assigned_to,
            project: task.project_id,
            description: task.description,
            priority: task.priority,
          });
        }
      }

      // Fetch projects
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      projectsSnapshot.forEach((doc) => {
        const project = doc.data();
        const deadline = getDate(project.deadline);
        if (deadline) {
          events.push({
            id: doc.id,
            title: project.name,
            date: deadline,
            type: "project",
            status: project.status,
            description: project.description,
          });
        }
      });

      return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const filteredEvents = events.filter(event => {
    const searchMatch = searchTerm
      ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const statusMatch = statusFilter === "all" || event.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const EventCard = ({ event }: { event: CalendarEvent }) => {
    const assignedUser = employees[event.assignedTo || ""];
    const projectData = projects[event.project || ""];

    return (
      <div
        onClick={() => setSelectedEvent(event)}
        className={`p-2 mb-1 rounded border-l-2 text-xs cursor-pointer hover:shadow-sm transition-all ${
          priorityColors[event.priority as keyof typeof priorityColors] || "bg-gray-50 border-l-gray-400"
        }`}
      >
        <div className="font-medium text-gray-900 truncate mb-1">
          {event.title}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${
              statusColors[event.status as keyof typeof statusColors] || "bg-gray-100 text-gray-700 border-gray-200"
            }`}>
              {event.status.replace("_", " ")}
            </span>
            {event.type === "project" && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                Project
              </span>
            )}
          </div>
          {assignedUser && (
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                assignedUser.name || assignedUser.email
              )}`}
              alt="avatar"
              className="w-4 h-4 rounded-full"
            />
          )}
        </div>
        {projectData && (
          <div className="text-xs text-gray-600 mt-1 truncate">
            {projectData.name}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Project Board [2023]
            </h1>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
              On track
            </span>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Star className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Share
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 pb-2">
              Board
            </button>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 pb-2">
              Timeline
            </button>
            <div className="flex items-center gap-2 border-b-2 border-blue-500 pb-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Calendar</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className="w-4 h-4" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === "month"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === "week"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Week
              </button>
            </div>

            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main Calendar */}
        <div className="flex-1 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300 text-center bg-gray-50 dark:bg-gray-800"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
                      !isSameMonth(day, currentDate)
                        ? "bg-gray-50 dark:bg-gray-800/50"
                        : "bg-white dark:bg-gray-800"
                    } ${isToday(day) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    <div
                      className={`text-sm font-medium mb-2 ${
                        !isSameMonth(day, currentDate)
                          ? "text-gray-400 dark:text-gray-600"
                          : isToday(day)
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          {selectedEvent ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Event Details
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {selectedEvent.title}
                  </h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      statusColors[selectedEvent.status as keyof typeof statusColors] || "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {selectedEvent.status.replace("_", " ")}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {selectedEvent.type}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {format(selectedEvent.date, "PPP")}
                  </div>
                </div>

                {selectedEvent.assignedTo && employees[selectedEvent.assignedTo] && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assignee
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          employees[selectedEvent.assignedTo].name || employees[selectedEvent.assignedTo].email
                        )}`}
                        alt="avatar"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {employees[selectedEvent.assignedTo].name || employees[selectedEvent.assignedTo].email}
                      </span>
                    </div>
                  </div>
                )}

                {selectedEvent.project && projects[selectedEvent.project] && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project
                    </label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {projects[selectedEvent.project].name}
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {selectedEvent.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No event selected
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Click on an event to view its details
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Priority
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
