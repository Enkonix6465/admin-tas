import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "framer-motion";
import {
  Star,
  Settings,
  Share2,
  Search,
  Filter,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
  TrendingUp,
  Activity,
  Target,
  Briefcase,
} from "lucide-react";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [projectsSnap, tasksSnap, teamsSnap, employeesSnap] =
        await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "tasks")),
          getDocs(collection(db, "teams")),
          getDocs(collection(db, "employees")),
        ]);

      setProjects(
        projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setTasks(tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setTeams(teamsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setEmployees(
        employeesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.warn("Failed to fetch data:", error);
      // Fallback to mock data
      setProjects([
        {
          id: "1",
          name: "Website Redesign",
          description: "Complete redesign of company website with new branding",
          deadline: "2024-03-15",
          teamId: "team-1",
        },
        {
          id: "2", 
          name: "Mobile App Development",
          description: "iOS and Android app for customer engagement",
          deadline: "2024-04-30",
          teamId: "team-2",
        },
        {
          id: "3",
          name: "API Integration",
          description: "Third-party payment gateway integration", 
          deadline: "2024-02-28",
          teamId: "team-1",
        }
      ]);
      
      setTasks([
        {
          id: "1",
          title: "Design System Update",
          description: "Update design tokens and components",
          status: "pending",
          assigned_to: "emp-1",
          due_date: "2024-02-15",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "1"
        },
        {
          id: "2",
          title: "API Documentation", 
          description: "Complete API documentation for v2",
          status: "in_progress",
          assigned_to: "emp-2",
          due_date: "2024-02-20",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "2"
        },
        {
          id: "3",
          title: "User Testing Session",
          description: "Conduct usability testing",
          status: "completed",
          assigned_to: "emp-3", 
          due_date: "2024-02-10",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "1"
        }
      ]);
      
      setTeams([
        { id: "team-1", teamName: "Design Team" },
        { id: "team-2", teamName: "Development Team" }
      ]);
      
      setEmployees([
        { id: "emp-1", name: "Sarah Johnson" },
        { id: "emp-2", name: "Mike Chen" },
        { id: "emp-3", name: "Emily Davis" }
      ]);
    }
  };

  const getEmployeeName = (empId: string) =>
    employees.find((emp: any) => emp.id === empId)?.name || "-";
  const getTeamName = (teamId: string) =>
    teams.find((team: any) => team.id === teamId)?.teamName || "-";
  const getProjectTasks = (projectId: string) =>
    tasks.filter((t: any) => t.project_id === projectId);

  const filteredTasks = tasks.filter((task: any) => {
    const matchesDate = filterDate ? task.due_date === filterDate : true;
    const matchesProject = selectedProject
      ? task.project_id === selectedProject
      : true;
    const matchesSearch = searchTerm
      ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesDate && matchesProject && matchesSearch;
  });

  const pendingTasks = filteredTasks.filter((t: any) => t.status === "pending");
  const completedTasks = filteredTasks.filter((t: any) => t.status === "completed");
  const inProgressTasks = filteredTasks.filter((t: any) => t.status === "in_progress");

  const isOverdue = (task: any) => {
    const today = new Date().toISOString().split("T")[0];
    return task.due_date < today && task.status !== "completed";
  };

  const overdueTasks = filteredTasks.filter(isOverdue);

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t: any) => t.status === "completed").length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const recentTasks = tasks
    .sort((a: any, b: any) => new Date(b.created_at?.seconds * 1000).getTime() - new Date(a.created_at?.seconds * 1000).getTime())
    .slice(0, 5);

  return (
    <div className="h-full bg-gray-50 dark:bg-transparent flex flex-col">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gradient-to-r dark:from-[rgba(15,17,41,0.8)] dark:to-[rgba(26,27,58,0.6)] backdrop-blur-xl border-b border-gray-200 dark:border-purple-500/30 px-4 py-3 shadow-sm dark:shadow-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-purple-100">
              Dashboard Overview
            </h1>
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full font-medium border dark:border-green-500/30">
              Active
            </span>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-purple-500/20">
              <Star className="w-4 h-4 text-gray-400 dark:text-purple-300" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
              Share
            </button>
            <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-purple-500/20">
              <Settings className="w-4 h-4 text-gray-600 dark:text-purple-300" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-b-2 border-purple-500 pb-1">
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm dark:shadow-purple-500/20 backdrop-blur-sm"
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
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Projects</option>
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 dark:bg-gradient-to-br dark:from-[rgba(139,92,246,0.1)] dark:to-[rgba(59,130,246,0.05)] backdrop-blur-sm rounded-xl border border-gray-200 dark:border-purple-500/20 p-4 shadow-lg dark:shadow-purple-500/10 hover:shadow-xl dark:hover:shadow-purple-500/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-purple-300">
                  Total Projects
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-purple-100">
                  {projects.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-blue-500/20 rounded-lg shadow-sm">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                +12%
              </span>
              <span className="text-gray-600 dark:text-purple-300/70 ml-1">
                from last month
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 dark:bg-gradient-to-br dark:from-[rgba(251,191,36,0.1)] dark:to-[rgba(245,158,11,0.05)] backdrop-blur-sm rounded-xl border border-gray-200 dark:border-yellow-500/20 p-4 shadow-lg dark:shadow-yellow-500/10 hover:shadow-xl dark:hover:shadow-yellow-500/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-yellow-300">
                  Pending Tasks
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-yellow-100">
                  {pendingTasks.length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-gradient-to-br dark:from-yellow-500/20 dark:to-orange-500/20 rounded-lg shadow-sm">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" />
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                {overdueTasks.length} overdue
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 dark:bg-gradient-to-br dark:from-[rgba(59,130,246,0.1)] dark:to-[rgba(29,78,216,0.05)] backdrop-blur-sm rounded-xl border border-gray-200 dark:border-blue-500/20 p-4 shadow-lg dark:shadow-blue-500/10 hover:shadow-xl dark:hover:shadow-blue-500/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-blue-300">
                  In Progress
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-blue-100">
                  {inProgressTasks.length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-cyan-500/20 rounded-lg shadow-sm">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-blue-900/30 rounded-full h-1.5">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${tasks.length > 0 ? (inProgressTasks.length / tasks.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 dark:bg-gradient-to-br dark:from-[rgba(16,185,129,0.1)] dark:to-[rgba(5,150,105,0.05)] backdrop-blur-sm rounded-xl border border-gray-200 dark:border-green-500/20 p-4 shadow-lg dark:shadow-green-500/10 hover:shadow-xl dark:hover:shadow-green-500/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-green-300">
                  Completed
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-green-100">
                  {completedTasks.length}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-gradient-to-br dark:from-green-500/20 dark:to-emerald-500/20 rounded-lg shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs">
              <Target className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </span>
              <span className="text-gray-600 dark:text-green-300/70 ml-1">
                completion rate
              </span>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Projects List */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 dark:bg-gradient-to-br dark:from-[rgba(15,17,41,0.8)] dark:to-[rgba(26,27,58,0.6)] backdrop-blur-sm rounded-xl border border-gray-200 dark:border-purple-500/20 shadow-lg dark:shadow-purple-500/10">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-purple-500/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-purple-100">
                    Projects
                  </h2>
                  <button className="text-sm text-blue-600 dark:text-purple-400 hover:text-blue-800 dark:hover:text-purple-300 font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.slice(0, 5).map((project: any, index: number) => {
                  const progress = getProjectProgress(project.id);
                  const projectTasks = getProjectTasks(project.id);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {project.name}
                          </h3>
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            {projectTasks.length} tasks
                          </span>
                        </div>
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {project.deadline}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-3 h-3" />
                            {getTeamName(project.teamId)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Tasks
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {recentTasks.map((task: any, index: number) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    {task.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : task.status === "in_progress" ? (
                      <Circle className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Assigned to {getEmployeeName(task.assigned_to)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Due: {task.due_date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
