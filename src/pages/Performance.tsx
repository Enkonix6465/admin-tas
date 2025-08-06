import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import {
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  BarChart3,
  Activity,
  Calendar as CalendarIcon,
  Star,
  ArrowUp,
  ArrowDown,
  Users,
  Briefcase,
  Zap,
  RefreshCw,
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
import dayjs from "dayjs";

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

export default function Performance() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchData();
  }, [user?.uid]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tasks assigned to the user
      const tasksQuery = query(
        collection(db, "tasks"),
        where("assigned_to", "==", user?.uid)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasksList = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch projects
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      const projectsList = projectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch teams
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const teamsList = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch employees
      const employeesSnapshot = await getDocs(collection(db, "employees"));
      const employeesList = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(tasksList);
      setProjects(projectsList);
      setTeams(teamsList);
      setEmployees(employeesList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.progress_status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.progress_status === "in_progress").length;
  const pendingTasks = tasks.filter((t) => t.progress_status === "pending" || !t.progress_status).length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    const dueDate = t.due_date.toDate ? t.due_date.toDate() : new Date(t.due_date);
    return new Date() > dueDate && t.progress_status !== "completed";
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const onTimeRate = totalTasks > 0 ? Math.round(((totalTasks - overdueTasks) / totalTasks) * 100) : 100;

  const statCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: Target,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      change: "+8%",
      trend: "up",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      change: "+3%",
      trend: "up",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      change: "-5%",
      trend: "down",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-900/20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 dark:border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 shadow-lg"
            >
              <BarChart3 className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Performance Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Track your productivity and achievements
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <Award className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {completionRate}% Complete
              </span>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="p-3 bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="liquid-glass-stats relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                        from last month
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.div>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Rate Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Status Distribution
              </h3>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Overall Performance
                </span>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
                  datasets: [
                    {
                      data: [completedTasks, inProgressTasks, pendingTasks, overdueTasks],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.9)', // Green
                        'rgba(249, 115, 22, 0.9)', // Orange
                        'rgba(59, 130, 246, 0.9)', // Blue
                        'rgba(239, 68, 68, 0.9)', // Red
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(239, 68, 68, 1)',
                      ],
                      borderWidth: 3,
                      hoverBorderWidth: 4,
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
                        font: {
                          size: 13,
                          weight: 'bold'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: 'rgba(59, 130, 246, 1)',
                      borderWidth: 2,
                      cornerRadius: 12,
                      displayColors: true,
                      boxPadding: 6
                    }
                  },
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1500,
                    easing: 'easeInOutQuart'
                  },
                  cutout: '45%',
                  radius: '90%',
                }}
              />
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance Metrics
              </h3>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Key Indicators
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Completion Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Completion Rate
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-lg"
                  />
                </div>
              </div>

              {/* On-time Delivery */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    On-time Delivery
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {onTimeRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${onTimeRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-lg"
                  />
                </div>
              </div>

              {/* Productivity Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Productivity Score
                  </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {Math.round((completionRate + onTimeRate) / 2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((completionRate + onTimeRate) / 2)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full shadow-lg"
                  />
                </div>
              </div>

              {/* Quality Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quality Score
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    95%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "95%" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.9 }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Task Completion Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Task Completion Trend (Last 7 Days)
            </h3>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Weekly Overview
              </span>
            </div>
          </div>
          <div className="h-80">
            <Line
              data={{
                labels: ['7 days ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday'],
                datasets: [
                  {
                    label: 'Tasks Completed',
                    data: [3, 5, 2, 8, 6, 4, 7],
                    borderColor: 'rgba(6, 182, 212, 1)',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(6, 182, 212, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 7,
                    pointHoverRadius: 9,
                  },
                  {
                    label: 'Tasks Created',
                    data: [6, 4, 7, 5, 9, 8, 6],
                    borderColor: 'rgba(234, 88, 12, 1)',
                    backgroundColor: 'rgba(234, 88, 12, 0.15)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(234, 88, 12, 1)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 7,
                    pointHoverRadius: 9,
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
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="performance-card performance-card-light dark:performance-card-dark text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                <Briefcase className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-cyan-800 dark:text-white mb-2">
              {projects.length}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              Total Projects
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="performance-card performance-card-light dark:performance-card-dark text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-800 dark:text-white mb-2">
              {teams.length}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              Active Teams
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="performance-card performance-card-light dark:performance-card-dark text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-800 dark:text-white mb-2">
              {Math.round((completionRate + onTimeRate) / 2)}%
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              Efficiency Score
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
