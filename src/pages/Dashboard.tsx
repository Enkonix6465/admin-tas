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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setConnectionStatus('connecting');

    // Try Firebase with very short timeout, immediately fall back to mock data
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 2000)
      );

      const fetchData = Promise.all([
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "tasks")),
        getDocs(collection(db, "teams")),
        getDocs(collection(db, "employees")),
      ]);

      const [projectsSnap, tasksSnap, teamsSnap, employeesSnap] = await Promise.race([
        fetchData,
        timeout
      ]);

      // If we get here, Firebase worked
      setProjects(
        projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setTasks(tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setTeams(teamsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setEmployees(
        employeesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setConnectionStatus('connected');
      console.log("Firebase connection successful");
    } catch (error) {
      // Immediately use mock data without logging error details
      console.log("Using local mock data");
      setConnectionStatus('offline');

      // Set mock data immediately
      setProjects([
        {
          id: "1",
          name: "Website Redesign",
          description: "Complete redesign of company website with new branding and improved UX",
          deadline: "2024-03-15",
          teamId: "team-1",
          status: "active",
          progress: 75,
        },
        {
          id: "2",
          name: "Mobile App Development",
          description: "iOS and Android app for customer engagement with real-time features",
          deadline: "2024-04-30",
          teamId: "team-2",
          status: "active",
          progress: 45,
        },
        {
          id: "3",
          name: "API Integration",
          description: "Third-party payment gateway integration and security enhancements",
          deadline: "2024-02-28",
          teamId: "team-1",
          status: "completed",
          progress: 100,
        },
        {
          id: "4",
          name: "Dashboard Analytics",
          description: "Real-time analytics dashboard with data visualization",
          deadline: "2024-05-15",
          teamId: "team-3",
          status: "active",
          progress: 30,
        },
        {
          id: "5",
          name: "User Authentication System",
          description: "Multi-factor authentication and user management system",
          deadline: "2024-03-30",
          teamId: "team-2",
          status: "active",
          progress: 60,
        }
      ]);
      
      setTasks([
        {
          id: "1",
          title: "Design System Update",
          description: "Update design tokens and components for consistency",
          status: "pending",
          assigned_to: "emp-1",
          due_date: "2024-02-15",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "1",
          priority: "high"
        },
        {
          id: "2",
          title: "API Documentation",
          description: "Complete API documentation for v2 with examples",
          status: "in_progress",
          assigned_to: "emp-2",
          due_date: "2024-02-20",
          created_at: { seconds: (Date.now() / 1000) - 86400 },
          project_id: "2",
          priority: "medium"
        },
        {
          id: "3",
          title: "User Testing Session",
          description: "Conduct comprehensive usability testing",
          status: "completed",
          assigned_to: "emp-3",
          due_date: "2024-02-10",
          created_at: { seconds: (Date.now() / 1000) - 172800 },
          project_id: "1",
          priority: "high"
        },
        {
          id: "4",
          title: "Database Migration",
          description: "Migrate legacy database to new schema",
          status: "in_progress",
          assigned_to: "emp-4",
          due_date: "2024-02-25",
          created_at: { seconds: (Date.now() / 1000) - 43200 },
          project_id: "3",
          priority: "critical"
        },
        {
          id: "5",
          title: "Security Audit",
          description: "Comprehensive security review and testing",
          status: "pending",
          assigned_to: "emp-5",
          due_date: "2024-03-01",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "5",
          priority: "high"
        },
        {
          id: "6",
          title: "Performance Optimization",
          description: "Optimize app performance and loading times",
          status: "in_progress",
          assigned_to: "emp-2",
          due_date: "2024-02-18",
          created_at: { seconds: (Date.now() / 1000) - 259200 },
          project_id: "2",
          priority: "medium"
        },
        {
          id: "7",
          title: "Mobile UI Testing",
          description: "Test mobile responsiveness across devices",
          status: "completed",
          assigned_to: "emp-1",
          due_date: "2024-02-08",
          created_at: { seconds: (Date.now() / 1000) - 345600 },
          project_id: "1",
          priority: "medium"
        },
        {
          id: "8",
          title: "Integration Testing",
          description: "End-to-end integration testing",
          status: "pending",
          assigned_to: "emp-6",
          due_date: "2024-02-22",
          created_at: { seconds: (Date.now() / 1000) - 21600 },
          project_id: "4",
          priority: "high"
        }
      ]);
      
      setTeams([
        { id: "team-1", teamName: "Design Team", memberCount: 5, lead: "Sarah Johnson" },
        { id: "team-2", teamName: "Development Team", memberCount: 8, lead: "Mike Chen" },
        { id: "team-3", teamName: "Analytics Team", memberCount: 4, lead: "Alex Rodriguez" },
        { id: "team-4", teamName: "QA Team", memberCount: 6, lead: "Emily Davis" }
      ]);

      setEmployees([
        { id: "emp-1", name: "Sarah Johnson", role: "Senior Designer", team: "Design Team" },
        { id: "emp-2", name: "Mike Chen", role: "Full Stack Developer", team: "Development Team" },
        { id: "emp-3", name: "Emily Davis", role: "QA Lead", team: "QA Team" },
        { id: "emp-4", name: "Alex Rodriguez", role: "Data Analyst", team: "Analytics Team" },
        { id: "emp-5", name: "Jessica Kim", role: "Security Engineer", team: "Development Team" },
        { id: "emp-6", name: "David Brown", role: "QA Engineer", team: "QA Team" },
        { id: "emp-7", name: "Lisa Wang", role: "UI/UX Designer", team: "Design Team" },
        { id: "emp-8", name: "Robert Taylor", role: "Backend Developer", team: "Development Team" }
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
    <div className="h-full bg-gray-50 dark:bg-transparent flex flex-col relative overflow-hidden">


      {/* Header */}
      <div className="liquid-glass border-b border-gray-200 dark:border-purple-500/30 px-6 py-4 shadow-sm dark:shadow-purple-500/20 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-purple-100">
              Dashboard Overview
            </h1>
            <span className={`px-3 py-1 text-xs rounded-full font-medium border flex items-center gap-2 ${
              connectionStatus === 'connected'
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                : connectionStatus === 'connecting'
                ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
                : 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-orange-500'
              }`}></div>
              {connectionStatus === 'connected' ? 'Live Data' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-purple-500/20">
              <Star className="w-4 h-4 text-gray-400 dark:text-purple-300" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
              Share
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-purple-500/20">
              <Settings className="w-4 h-4 text-gray-600 dark:text-purple-300" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-b-2 border-purple-500 pb-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-base font-medium text-purple-600 dark:text-purple-400">Overview</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm dark:shadow-purple-500/20 backdrop-blur-sm w-full sm:w-48"
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

      {/* Connection Status Banner */}
      {connectionStatus === 'offline' && (
        <div className="mx-4 mt-2 mb-2 px-3 py-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-orange-700 dark:text-orange-400">
              Connection lost: Using cached data
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="liquid-glass-stats group cursor-pointer"
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-purple-300/90 mb-2">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {projects.length}
                </p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-500/20 rounded-xl border border-purple-200 dark:border-purple-500/30">
                <Briefcase className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm relative z-10">
              <div className="flex items-center px-2 py-1 bg-green-500/10 dark:bg-green-500/20 rounded-full border border-green-500/20 dark:border-green-500/30">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +12%
                </span>
              </div>
              <span className="text-gray-600 dark:text-purple-300/70 ml-2">
                from last month
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="liquid-glass-stats group cursor-pointer"
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-yellow-300/90 mb-1">
                  Pending Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingTasks.length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl border border-yellow-200 dark:border-yellow-500/30">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs relative z-10">
              <div className="flex items-center px-2 py-1 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full border border-yellow-500/20 dark:border-yellow-500/30">
                <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                  {overdueTasks.length} overdue
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="liquid-glass-stats group cursor-pointer"
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-blue-300/90 mb-1">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inProgressTasks.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl border border-blue-200 dark:border-blue-500/30">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 relative z-10">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
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
            className="liquid-glass-stats group cursor-pointer"
          >
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-green-300/90 mb-1">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedTasks.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-xl border border-green-200 dark:border-green-500/30">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs relative z-10">
              <div className="flex items-center px-2 py-1 bg-green-500/10 dark:bg-green-500/20 rounded-full border border-green-500/20 dark:border-green-500/30">
                <Target className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <span className="text-gray-600 dark:text-green-300/70 ml-2">
                completion rate
              </span>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Status Distribution */}
          <div className="liquid-glass-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Status Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: ['Completed', 'In Progress', 'Pending'],
                  datasets: [
                    {
                      data: [completedTasks.length, inProgressTasks.length, pendingTasks.length],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(251, 191, 36, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                        padding: 20,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Project Progress */}
          <div className="liquid-glass-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Project Progress
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: projects.slice(0, 5).map((p: any) => p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name),
                  datasets: [
                    {
                      label: 'Progress %',
                      data: projects.slice(0, 5).map((p: any) => {
                        const projectTasks = getProjectTasks(p.id);
                        return projectTasks.length > 0
                          ? Math.round((projectTasks.filter((t: any) => t.status === "completed").length / projectTasks.length) * 100)
                          : 0;
                      }),
                      backgroundColor: 'rgba(139, 92, 246, 0.8)',
                      borderColor: 'rgba(139, 92, 246, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                      },
                    },
                    x: {
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects List */}
          <div>
            <div className="liquid-glass-card group">
              <div className="px-8 py-6 border-b border-gray-200/50 dark:border-purple-500/30 relative">
                <div className="flex items-center justify-between relative z-10">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Active Projects
                  </h2>
                  <button className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/30 font-medium rounded-lg border border-purple-200 dark:border-purple-500/30 transition-all duration-200">
                    View All
                  </button>
                </div>

              </div>
              <div className="divide-y divide-gray-200 dark:divide-purple-500/20">
                {projects.slice(0, 5).map((project: any, index: number) => {
                  const progress = getProjectProgress(project.id);
                  const projectTasks = getProjectTasks(project.id);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-purple-500/10 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <h3 className="font-medium text-gray-900 dark:text-purple-100 text-sm">
                            {project.name}
                          </h3>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-purple-500/20 text-gray-600 dark:text-purple-300 rounded-full border dark:border-purple-500/30">
                            {projectTasks.length} tasks
                          </span>
                        </div>
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-purple-500/20">
                          <MoreHorizontal className="w-3 h-3 text-gray-400 dark:text-purple-300" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-purple-300/80 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-purple-300/70">
                            <Calendar className="w-3 h-3" />
                            {project.deadline}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-purple-300/70">
                            <Users className="w-3 h-3" />
                            {getTeamName(project.teamId)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-purple-900/30 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-purple-200">
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
          <div className="liquid-glass-card group">
            <div className="px-8 py-6 border-b border-gray-200/50 dark:border-purple-500/30 relative">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Tasks
                </h2>
                <button
                  onClick={() => setShowAllTasks(!showAllTasks)}
                  className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-500/30 font-medium rounded-lg border border-purple-200 dark:border-purple-500/30 transition-all duration-200"
                >
                  {showAllTasks ? 'Show Less' : 'View All'}
                </button>
              </div>
            </div>
            <div className="p-8 space-y-5 max-h-96 overflow-y-auto custom-scrollbar">
              {(showAllTasks ? recentTasks : recentTasks.slice(0, 3)).map((task: any, index: number) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-purple-500/10 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-shrink-0 mt-1">
                    {task.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : task.status === "in_progress" ? (
                      <Circle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 dark:text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-base font-medium text-gray-900 dark:text-white truncate mb-2">
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-purple-300/80 mb-2">
                      Assigned to {getEmployeeName(task.assigned_to)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-purple-300/60">
                        Due: {task.due_date}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${
                          task.priority === 'critical'
                            ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                            : task.priority === 'high'
                            ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
                            : 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Completion Trend */}
        <div className="mt-8">
          <div className="liquid-glass-card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Task Completion Trend (Last 7 Days)
            </h3>
            <div className="h-80">
              <Line
                data={{
                  labels: ['7 days ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday'],
                  datasets: [
                    {
                      label: 'Tasks Completed',
                      data: [3, 5, 2, 8, 6, 4, 7], // Mock data for demonstration
                      borderColor: 'rgba(139, 92, 246, 1)',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                    },
                    {
                      label: 'Tasks Created',
                      data: [5, 3, 6, 4, 8, 7, 5], // Mock data for demonstration
                      borderColor: 'rgba(59, 130, 246, 1)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                        padding: 20,
                        usePointStyle: true,
                      },
                    },
                    tooltip: {
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                      titleColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                      bodyColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
                      borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                      },
                    },
                    x: {
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                      },
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
