import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  User,
  ExternalLink,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  ArrowRight,
  ChevronRight,
  Flag,
  Activity,
  Download,
  Star,
  Target,
  Eye,
  Briefcase
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectTasksViewer() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  const [loading, setLoading] = useState(true);

  const handleTabChange = (tabId: string) => {
    console.log('Tab changed to:', tabId);
    setActiveTab(tabId);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(collection(db, "projects"));
        const projectData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const snap = await getDocs(collection(db, "employees"));
        const empMap = {};
        snap.docs.forEach((doc) => {
          const data = doc.data();
          empMap[doc.id] = {
            name: data.name,
            email: data.email,
          };
        });
        setEmployeesMap(empMap);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, "tasks"),
          where("project_id", "==", selectedProjectId)
        );
        const snap = await getDocs(q);
        const taskList = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(taskList);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
      }
    };
    fetchTasks();
  }, [selectedProjectId]);

  const calculatePerformance = (createdAt: any, dueDate: string, updatedAt: any) => {
    if (!updatedAt || !createdAt || !dueDate) return "-";

    const start = new Date(createdAt.seconds * 1000);
    const end = new Date(`${dueDate}T23:59:59`);
    const done = new Date(updatedAt.seconds * 1000);

    const totalTime = end.getTime() - start.getTime();
    const usedTime = done.getTime() - start.getTime();

    if (totalTime <= 0 || usedTime <= 0) return "0%";

    const rawPercent = ((1 - usedTime / totalTime) * 100).toFixed(1);
    const clamped = Math.max(0, Math.min(100, Number(rawPercent)));
    return `${clamped}%`;
  };

  const isLateSubmission = (task: any) => {
    if (
      task.status !== "completed" ||
      !task.progress_updated_at ||
      !task.due_date
    )
      return false;

    const updated = new Date(task.progress_updated_at.seconds * 1000);
    const due = new Date(`${task.due_date}T23:59:59`);

    return updated > due;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "pending":
        return <Circle className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30";
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
      case "pending":
        return "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30";
      default:
        return "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30";
    }
  };

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : statusFilter === "late"
      ? tasks.filter((task) => isLateSubmission(task))
      : tasks.filter((task) => task.status === statusFilter);

  const searchedTasks = filteredTasks.filter((task) =>
    searchTerm
      ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const selectedProject = projects.find((proj: any) => proj.id === selectedProjectId);

  // Board View Component
  const BoardView = () => {
    const columns = [
      { id: "pending", title: "To Do", tasks: searchedTasks.filter(t => t.status === "pending") },
      { id: "in_progress", title: "In Progress", tasks: searchedTasks.filter(t => t.status === "in_progress") },
      { id: "completed", title: "Done", tasks: searchedTasks.filter(t => t.status === "completed") },
    ];

    const TaskCard = ({ task }: { task: any }) => (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="liquid-glass-card p-3 mb-3 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 dark:text-purple-100 text-sm line-clamp-2">
            {task.title}
          </h4>
          <button className="text-gray-400 hover:text-gray-600 p-0.5">
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 dark:text-purple-300/70 mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                employeesMap[task.assigned_to]?.name || task.assigned_to
              )}`}
              alt="avatar"
              className="w-5 h-5 rounded-full"
            />
            <span className="text-xs text-gray-600 dark:text-purple-300/70">
              {employeesMap[task.assigned_to]?.name || task.assigned_to}
            </span>
          </div>

          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-purple-300/70">
              <Calendar className="w-3 h-3" />
              {task.due_date}
            </div>
          )}
        </div>

        {task.priority === "high" && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs rounded-full">
              <Flag className="w-2 h-2" />
              High Priority
            </span>
          </div>
        )}
      </motion.div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 p-3 liquid-glass rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  column.id === "pending" ? "bg-gray-400" :
                  column.id === "in_progress" ? "bg-blue-500" : "bg-green-500"
                }`} />
                <h3 className="font-medium text-gray-900 dark:text-purple-100">
                  {column.title}
                </h3>
                <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/30">
                  {column.tasks.length}
                </span>
              </div>
              <button className="text-gray-400 hover:text-purple-600 p-1">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {column.tasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}

              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-purple-300/50">
                  <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Timeline View Component
  const TimelineView = () => {
    const sortedTasks = [...searchedTasks].sort((a, b) => {
      const dateA = new Date(a.due_date || a.created_at?.seconds * 1000 || Date.now());
      const dateB = new Date(b.due_date || b.created_at?.seconds * 1000 || Date.now());
      return dateA.getTime() - dateB.getTime();
    });

    const getMonthYear = (dateStr: string | any) => {
      let date;
      if (typeof dateStr === 'string') {
        date = new Date(dateStr);
      } else if (dateStr?.seconds) {
        date = new Date(dateStr.seconds * 1000);
      } else {
        date = new Date();
      }
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const groupedTasks = sortedTasks.reduce((acc, task) => {
      const monthYear = getMonthYear(task.due_date || task.created_at);
      if (!acc[monthYear]) acc[monthYear] = [];
      acc[monthYear].push(task);
      return acc;
    }, {} as Record<string, any[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([monthYear, tasks]) => (
          <div key={monthYear} className="relative">
            <div className="sticky top-0 liquid-glass py-2 z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-100 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {monthYear}
              </h3>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-purple-200 dark:bg-purple-500/30" />

              <div className="space-y-4">
                {tasks.map((task: any, index: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className={`absolute -left-5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      task.status === "completed" ? "bg-green-500" :
                      task.status === "in_progress" ? "bg-blue-500" : "bg-gray-400"
                    }`} />

                    <div className="liquid-glass-card p-4 ml-2">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-purple-100 mb-1">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-purple-300/70 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              employeesMap[task.assigned_to]?.name || task.assigned_to
                            )}`}
                            alt="avatar"
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-gray-600 dark:text-purple-300/80">
                            {employeesMap[task.assigned_to]?.name || task.assigned_to}
                          </span>
                        </div>

                        {task.due_date && (
                          <div className="flex items-center gap-1 text-gray-500 dark:text-purple-300/70">
                            <Clock className="w-3 h-3" />
                            Due {task.due_date}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 dark:text-purple-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-purple-100 mb-2">
              No tasks to display
            </h3>
            <p className="text-gray-600 dark:text-purple-300/70">
              Select a project to view its timeline
            </p>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    {
      id: "table",
      label: "Table",
      icon: FileText,
      active: activeTab === "table",
    },
    {
      id: "board",
      label: "Board",
      icon: Users,
      active: activeTab === "board",
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Calendar,
      active: activeTab === "timeline",
    },
  ];

  console.log('Current activeTab:', activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-transparent flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="liquid-glass border-b border-gray-200 dark:border-purple-500/30 px-6 py-4 shadow-sm dark:shadow-purple-500/20 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-purple-100">
              Project Tasks
            </h1>
            <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Task Viewer
            </span>
            {selectedProject && (
              <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                {selectedProject.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const exportData = {
                  project: selectedProject,
                  tasks: searchedTasks,
                  totalCount: searchedTasks.length,
                  exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `project-tasks-${selectedProject?.name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success("Tasks data exported! 📊");
              }}
              disabled={!selectedProject}
              className="px-4 py-2 text-sm bg-white dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-500/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-b-2 border-purple-500 pb-2">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-base font-medium text-purple-600 dark:text-purple-400">Task Management</span>
            </div>
            <div className="flex items-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm dark:shadow-purple-500/20 backdrop-blur-sm w-48"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Tasks: {searchedTasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Project Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass-card mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Project
              </h3>
              <p className="text-sm text-gray-500 dark:text-purple-300/70">
                Choose a project to view its tasks and progress
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project: any) => (
              <motion.button
                key={project.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedProjectId(project.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedProjectId === project.id
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-500/20"
                    : "border-gray-200 dark:border-purple-500/30 bg-white dark:bg-gray-800/50 hover:border-purple-300 dark:hover:border-purple-500/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h3 className="font-medium text-gray-900 dark:text-purple-100">
                    {project.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-purple-300/70 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-purple-300/70">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.deadline}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Team
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Filters */}
          {selectedProjectId && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-purple-500/30">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-purple-200 mb-2">
                    Filter by Status
                  </label>
                  <select
                    className="px-3 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="late">Late Submissions</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Content Views */}
        <AnimatePresence mode="wait">
          {selectedProjectId && (
            <motion.div
              key={`${selectedProjectId}-${activeTab}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* Table View */}
              {activeTab === 'table' && (
                <div className="liquid-glass-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30">
                      <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tasks for {selectedProject?.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-purple-300/70">
                        {searchedTasks.length} tasks found
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Task
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Assignee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {searchedTasks.map((task: any, index: number) => (
                          <motion.tr
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-start gap-3">
                                {getStatusIcon(task.status)}
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {task.title}
                                  </div>
                                  {task.description && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                    employeesMap[task.assigned_to]?.name ||
                                      employeesMap[task.assigned_to]?.email ||
                                      task.assigned_to
                                  )}`}
                                  alt="avatar"
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                  {employeesMap[task.assigned_to]?.name ||
                                    employeesMap[task.assigned_to]?.email ||
                                    task.assigned_to}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {task.due_date}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="w-full">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {task.progress_status || "Not started"}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      task.progress_status === "completed"
                                        ? "bg-green-500"
                                        : task.progress_status === "in progress"
                                        ? "bg-blue-500"
                                        : "bg-gray-400"
                                    }`}
                                    style={{
                                      width:
                                        task.progress_status === "completed"
                                          ? "100%"
                                          : task.progress_status === "in progress"
                                          ? "50%"
                                          : "10%",
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {task.status === "completed"
                                  ? calculatePerformance(
                                      task.created_at,
                                      task.due_date,
                                      task.progress_updated_at
                                    )
                                  : "-"}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                {task.progress_link && (
                                  <a
                                    href={task.progress_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="View progress link"
                                  >
                                    <ExternalLink className="w-4 h-4 text-blue-600" />
                                  </a>
                                )}
                                <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <User className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {searchedTasks.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-purple-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-purple-100">
                        No tasks found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-purple-300/70">
                        {statusFilter === "all"
                          ? "This project doesn't have any tasks yet."
                          : `No tasks with status "${statusFilter}" found.`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Board View */}
              {activeTab === 'board' && (
                <div key="board-view" className="h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-100">
                      {selectedProject?.name} - Board View
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-purple-300/70">
                      {searchedTasks.length} tasks • Active Tab: {activeTab}
                    </p>
                  </div>
                  <BoardView />
                </div>
              )}

              {/* Timeline View */}
              {activeTab === 'timeline' && (
                <div key="timeline-view" className="h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-purple-100">
                      {selectedProject?.name} - Timeline View
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-purple-300/70">
                      {searchedTasks.length} tasks • Active Tab: {activeTab}
                    </p>
                  </div>
                  <TimelineView />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!selectedProjectId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-purple-100 mb-3">
              Project Task Management
            </h3>
            <p className="text-gray-600 dark:text-purple-300/80 mb-6">
              Select a project above to view and manage its tasks across different views
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-purple-300/70">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Table View</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Kanban Board</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Timeline</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
