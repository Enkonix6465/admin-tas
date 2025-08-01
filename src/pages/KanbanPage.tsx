import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "framer-motion";
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  MessageCircle,
} from "lucide-react";

const KanbanPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksSnap, projectsSnap, employeesSnap] = await Promise.all([
        getDocs(collection(db, "tasks")),
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "employees")),
      ]);

      setTasks(tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setProjects(projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setEmployees(employeesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.warn("Firebase data fetch failed, using mock data:", error);
      setTasks([]);
      setProjects([]);
      setEmployees([]);
    }
  };

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

  const columns = [
    {
      id: "backlog",
      title: "Backlog",
      count: 4,
      tasks: tasks.filter((t: any) => t.status === "pending").slice(0, 4),
    },
    {
      id: "in_progress", 
      title: "In progress",
      count: 3,
      tasks: tasks.filter((t: any) => t.status === "in_progress").slice(0, 3),
    },
    {
      id: "qa",
      title: "QA",
      count: 4,
      tasks: tasks.filter((t: any) => t.status === "review" || t.status === "testing").slice(0, 4),
    },
  ];

  const TaskCard = ({ task }: { task: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2 mb-2 hover:shadow-sm transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
          {task.title || "Contact customers with failed new payments or who churned"}
        </h4>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex items-center gap-1 mb-2">
        <span className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          design
        </span>
        {task.priority === "high" && (
          <span className="px-1 py-0.5 text-xs bg-red-100 text-red-600 rounded">
            bug
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
            className="w-4 h-4 rounded-full"
          />
          <span>{getEmployeeName(task.assigned_to)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{task.due_date || "Aug 6"}</span>
          {task.comments?.length > 0 && (
            <>
              <span>•</span>
              <span>{task.comments.length}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-3">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Project Board [2023]</span>
          <span className="px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded">On track</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-32"
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

          <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
            Share
          </button>
        </div>
      </div>

      {/* Minimal Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {column.title}
                </h2>
                <span className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  {column.count}
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Content */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {column.tasks.map((task: any, index: number) => (
                <TaskCard key={task.id || index} task={task} />
              ))}
              
              {/* Sample cards when no tasks */}
              {column.tasks.length === 0 && (
                <>
                  <TaskCard task={{
                    title: column.id === "backlog" 
                      ? "Contact customers with failed new payments or who churned"
                      : column.id === "in_progress"
                      ? "Lead feedback sessions"
                      : "Invoices: fixed-fee projects",
                    assigned_to: "user1",
                    due_date: "Aug 6",
                    priority: column.id === "backlog" ? "high" : "normal"
                  }} />
                  
                  <TaskCard task={{
                    title: column.id === "backlog"
                      ? "Reporting: Design concept of visual dashboard"
                      : column.id === "in_progress" 
                      ? "Add Projects to templates and layouts [2023]"
                      : "Time search - not last response with results appears",
                    assigned_to: "user2", 
                    due_date: "Sep 2",
                    priority: "normal"
                  }} />
                  
                  {column.id !== "in_progress" && (
                    <TaskCard task={{
                      title: column.id === "backlog"
                        ? "Task detail modal: Ideas"
                        : "Pricing page: new iteration and few mockups and ideas",
                      assigned_to: "user3",
                      due_date: column.id === "backlog" ? "Aug 6" : "Nov 3",
                      priority: "normal"
                    }} />
                  )}
                  
                  {column.id === "backlog" && (
                    <TaskCard task={{
                      title: "@dev QA: regression ( before/after release)",
                      assigned_to: "user4",
                      due_date: "Sep 2",
                      priority: "normal"
                    }} />
                  )}
                </>
              )}

              {/* Add Task Button */}
              <button className="w-full flex items-center gap-2 p-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <Plus className="w-3 h-3" />
                Add task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanPage;
