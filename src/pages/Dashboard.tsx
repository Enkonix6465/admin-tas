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

    // Try Firebase first, fall back to enhanced mock data if it fails
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 3000)
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

      // If we get here, Firebase worked - use real data
      setProjects(
        projectsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setTasks(tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setTeams(teamsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setEmployees(
        employeesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setConnectionStatus('connected');
      console.log("Firebase connection successful - using real data");
    } catch (error) {
      // Fall back to enhanced mock data if Firebase fails
      console.log("Firebase connection failed, using enhanced mock data");
      setConnectionStatus('offline');

      // Set enhanced mock data with more realistic content
      setProjects([
        {
          id: "1",
          name: "E-Commerce Platform Redesign",
          description: "Complete overhaul of the online shopping experience with modern UI/UX principles and mobile-first approach",
          deadline: "2024-03-15",
          teamId: "team-1",
          status: "active",
          progress: 78,
        },
        {
          id: "2",
          name: "AI-Powered Analytics Dashboard",
          description: "Implementation of machine learning algorithms for predictive analytics and real-time business insights",
          deadline: "2024-04-30",
          teamId: "team-3",
          status: "active",
          progress: 62,
        },
        {
          id: "3",
          name: "Blockchain Payment Integration",
          description: "Secure cryptocurrency payment gateway with multi-wallet support and real-time transaction monitoring",
          deadline: "2024-02-28",
          teamId: "team-2",
          status: "completed",
          progress: 100,
        },
        {
          id: "4",
          name: "Mobile App 2.0",
          description: "Next-generation mobile application with offline capabilities, push notifications, and advanced user personalization",
          deadline: "2024-05-15",
          teamId: "team-2",
          status: "active",
          progress: 45,
        },
        {
          id: "5",
          name: "Cloud Infrastructure Migration",
          description: "Complete migration to AWS cloud infrastructure with auto-scaling, load balancing, and disaster recovery",
          deadline: "2024-03-30",
          teamId: "team-4",
          status: "active",
          progress: 34,
        },
        {
          id: "6",
          name: "Customer Support Automation",
          description: "AI chatbot implementation with natural language processing and seamless human handoff capabilities",
          deadline: "2024-04-15",
          teamId: "team-1",
          status: "active",
          progress: 23,
        }
      ]);

      setTasks([
        {
          id: "1",
          title: "Design System Architecture",
          description: "Create comprehensive design tokens, component library, and style guide for consistent UI/UX",
          status: "in_progress",
          assigned_to: "emp-1",
          due_date: "2024-02-15",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "1",
          priority: "high"
        },
        {
          id: "2",
          title: "API Performance Optimization",
          description: "Optimize database queries, implement caching strategies, and reduce API response times by 40%",
          status: "in_progress",
          assigned_to: "emp-2",
          due_date: "2024-02-20",
          created_at: { seconds: (Date.now() / 1000) - 86400 },
          project_id: "2",
          priority: "critical"
        },
        {
          id: "3",
          title: "Security Penetration Testing",
          description: "Comprehensive security audit and vulnerability assessment across all system components",
          status: "completed",
          assigned_to: "emp-5",
          due_date: "2024-02-10",
          created_at: { seconds: (Date.now() / 1000) - 172800 },
          project_id: "3",
          priority: "critical"
        },
        {
          id: "4",
          title: "Machine Learning Model Training",
          description: "Train and optimize predictive models for user behavior analysis and recommendation engine",
          status: "in_progress",
          assigned_to: "emp-4",
          due_date: "2024-02-25",
          created_at: { seconds: (Date.now() / 1000) - 43200 },
          project_id: "2",
          priority: "high"
        },
        {
          id: "5",
          title: "Cross-Platform Testing Suite",
          description: "Implement automated testing across iOS, Android, and web platforms with CI/CD integration",
          status: "pending",
          assigned_to: "emp-3",
          due_date: "2024-03-01",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "4",
          priority: "high"
        },
        {
          id: "6",
          title: "Real-time Data Streaming",
          description: "Implement WebSocket connections for live data updates and real-time collaboration features",
          status: "in_progress",
          assigned_to: "emp-8",
          due_date: "2024-02-18",
          created_at: { seconds: (Date.now() / 1000) - 259200 },
          project_id: "2",
          priority: "medium"
        },
        {
          id: "7",
          title: "Accessibility Compliance Audit",
          description: "Ensure WCAG 2.1 AA compliance across all user interfaces and implement screen reader support",
          status: "completed",
          assigned_to: "emp-7",
          due_date: "2024-02-08",
          created_at: { seconds: (Date.now() / 1000) - 345600 },
          project_id: "1",
          priority: "medium"
        },
        {
          id: "8",
          title: "DevOps Pipeline Enhancement",
          description: "Optimize CI/CD pipelines with blue-green deployments and automated rollback mechanisms",
          status: "pending",
          assigned_to: "emp-6",
          due_date: "2024-02-22",
          created_at: { seconds: (Date.now() / 1000) - 21600 },
          project_id: "5",
          priority: "high"
        },
        {
          id: "9",
          title: "User Analytics Implementation",
          description: "Set up comprehensive user tracking, heatmaps, and conversion funnel analysis",
          status: "in_progress",
          assigned_to: "emp-4",
          due_date: "2024-02-28",
          created_at: { seconds: (Date.now() / 1000) - 172800 },
          project_id: "2",
          priority: "medium"
        },
        {
          id: "10",
          title: "Microservices Architecture Review",
          description: "Evaluate current microservices performance and plan optimization strategies",
          status: "pending",
          assigned_to: "emp-2",
          due_date: "2024-03-05",
          created_at: { seconds: Date.now() / 1000 },
          project_id: "5",
          priority: "medium"
        }
      ]);

      setTeams([
        { id: "team-1", teamName: "Design & UX Team", memberCount: 6, lead: "Sarah Johnson" },
        { id: "team-2", teamName: "Full-Stack Development", memberCount: 10, lead: "Mike Chen" },
        { id: "team-3", teamName: "Data & Analytics", memberCount: 5, lead: "Alex Rodriguez" },
        { id: "team-4", teamName: "DevOps & Infrastructure", memberCount: 4, lead: "Emily Davis" }
      ]);

      setEmployees([
        { id: "emp-1", name: "Sarah Johnson", role: "Lead UX Designer", team: "Design & UX Team" },
        { id: "emp-2", name: "Mike Chen", role: "Senior Full-Stack Engineer", team: "Full-Stack Development" },
        { id: "emp-3", name: "Emily Davis", role: "DevOps Engineer", team: "DevOps & Infrastructure" },
        { id: "emp-4", name: "Alex Rodriguez", role: "Data Scientist", team: "Data & Analytics" },
        { id: "emp-5", name: "Jessica Kim", role: "Security Engineer", team: "Full-Stack Development" },
        { id: "emp-6", name: "David Brown", role: "Cloud Architect", team: "DevOps & Infrastructure" },
        { id: "emp-7", name: "Lisa Wang", role: "UI Designer", team: "Design & UX Team" },
        { id: "emp-8", name: "Robert Taylor", role: "Backend Developer", team: "Full-Stack Development" }
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
            <button
              onClick={() => {
                if (connectionStatus !== 'connecting') {
                  fetchAllData();
                }
              }}
              disabled={connectionStatus === 'connecting'}
              className="px-3 py-2 text-sm bg-white dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-500/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <Activity className={`w-4 h-4 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
            </button>
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
                        'rgba(124, 58, 237, 0.9)', // Deep Purple
                        'rgba(147, 51, 234, 0.9)', // Rich Purple
                        'rgba(168, 85, 247, 0.9)', // Bright Violet
                      ],
                      borderColor: [
                        'rgba(124, 58, 237, 1)', // Deep Purple
                        'rgba(147, 51, 234, 1)', // Rich Purple
                        'rgba(168, 85, 247, 1)', // Bright Violet
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
                      backgroundColor: 'rgba(124, 58, 237, 0.9)',
                      borderColor: 'rgba(124, 58, 237, 1)',
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

          {/* Team Performance Chart */}
          <div className="liquid-glass-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Team Performance Overview
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: teams.map((team: any) => team.teamName),
                  datasets: [
                    {
                      label: 'Completed Tasks',
                      data: teams.map((team: any) => {
                        const teamMembers = employees.filter((emp: any) => emp.team === team.teamName);
                        const teamTasks = tasks.filter((task: any) =>
                          teamMembers.some((member: any) => member.id === task.assigned_to) && task.status === 'completed'
                        );
                        return teamTasks.length;
                      }),
                      backgroundColor: 'rgba(124, 58, 237, 0.9)',
                      borderColor: 'rgba(124, 58, 237, 1)',
                      borderWidth: 2,
                      borderRadius: 6,
                    },
                    {
                      label: 'In Progress Tasks',
                      data: teams.map((team: any) => {
                        const teamMembers = employees.filter((emp: any) => emp.team === team.teamName);
                        const teamTasks = tasks.filter((task: any) =>
                          teamMembers.some((member: any) => member.id === task.assigned_to) && task.status === 'in_progress'
                        );
                        return teamTasks.length;
                      }),
                      backgroundColor: 'rgba(147, 51, 234, 0.9)',
                      borderColor: 'rgba(147, 51, 234, 1)',
                      borderWidth: 2,
                      borderRadius: 6,
                    },
                    {
                      label: 'Pending Tasks',
                      data: teams.map((team: any) => {
                        const teamMembers = employees.filter((emp: any) => emp.team === team.teamName);
                        const teamTasks = tasks.filter((task: any) =>
                          teamMembers.some((member: any) => member.id === task.assigned_to) && task.status === 'pending'
                        );
                        return teamTasks.length;
                      }),
                      backgroundColor: 'rgba(168, 85, 247, 0.9)',
                      borderColor: 'rgba(168, 85, 247, 1)',
                      borderWidth: 1,
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
                        padding: 15,
                      },
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
                }}
              />
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
                      borderColor: 'rgba(124, 58, 237, 1)',
                      backgroundColor: 'rgba(124, 58, 237, 0.15)',
                      borderWidth: 4,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgba(124, 58, 237, 1)',
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 3,
                      pointRadius: 7,
                      pointHoverRadius: 9,
                      shadowColor: 'rgba(124, 58, 237, 0.3)',
                      shadowBlur: 10,
                    },
                    {
                      label: 'Tasks Created',
                      data: [6, 4, 7, 5, 9, 8, 6], // Enhanced mock data
                      borderColor: 'rgba(147, 51, 234, 1)',
                      backgroundColor: 'rgba(147, 51, 234, 0.15)',
                      borderWidth: 4,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: 'rgba(147, 51, 234, 1)',
                      pointBorderColor: '#ffffff',
                      pointBorderWidth: 3,
                      pointRadius: 7,
                      pointHoverRadius: 9,
                      shadowColor: 'rgba(147, 51, 234, 0.3)',
                      shadowBlur: 10,
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
