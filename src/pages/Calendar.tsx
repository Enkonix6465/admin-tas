import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Plus,
  ChevronDown,
} from "lucide-react";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEvents();
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
        ...doc.data(),
      }));
      setEvents(taskEvents);
    } catch (error) {
      console.warn("Calendar data fetch failed:", error);
      setEvents([]);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-3">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Calendar</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {format(currentDate, "MMMM yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
            />
          </div>
          <div className="relative">
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
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Tasks
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" className="rounded" defaultChecked />
                    Projects
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" className="rounded" />
                    Meetings
                  </label>
                </div>
              </div>
            )}
          </div>
          <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Today
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday_ = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={index}
                className={`p-2 min-h-[80px] border-r border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !isCurrentMonth ? "text-gray-400 bg-gray-50 dark:bg-gray-800" : ""
                } ${isToday_ ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-xs font-medium mb-1 ${isToday_ ? "text-blue-600" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {event.type} • {event.status}
                  </div>
                </div>
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                No events for this date
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
