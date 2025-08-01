import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/PageHeader";
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
} from "lucide-react";

export default function ProjectTasksViewer() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const snap = await getDocs(collection(db, "projects"));
      const projectData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectData);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
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
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchTasks = async () => {
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
        return "bg-green-50 text-green-700 border-green-200";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
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

  const filterContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );

  const tabs = [
    {
      id: "table",
      label: "Table",
      icon: FileText,
      active: true,
    },
    {
      id: "board",
      label: "Board",
      icon: Users,
      active: false,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Calendar,
      active: false,
    },
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader
        title="Project Tasks"
        subtitle={selectedProject ? `• ${selectedProject.name}` : ""}
        status="On track"
        statusColor="bg-green-100 text-green-700"
        tabs={tabs}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search tasks..."
        showFilters={true}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen(!filterOpen)}
        filterContent={filterContent}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {/* Project Selection */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Select Project
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project: any) => (
              <motion.button
                key={project.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedProjectId(project.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedProjectId === project.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {project.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
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
        </div>

        {/* Tasks Table */}
        <AnimatePresence>
          {selectedProjectId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Tasks for {selectedProject?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {searchedTasks.length} tasks
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {task.due_date}
                          </div>
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3">
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
                <div className="px-6 py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No tasks found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {statusFilter === "all"
                      ? "This project doesn't have any tasks yet."
                      : `No tasks with status "${statusFilter}" found.`}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
