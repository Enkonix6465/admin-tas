import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import PageHeader from "../components/PageHeader";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
} from "lucide-react";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [dateRange, setDateRange] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("tasks");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && projects.length > 0 && employees.length > 0) {
      calculateAnalytics();
    }
  }, [tasks, projects, employees, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksSnap, projectsSnap, employeesSnap, teamsSnap] = await Promise.all([
        getDocs(collection(db, "tasks")),
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "employees")),
        getDocs(collection(db, "teams")),
      ]);

      setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setProjects(projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEmployees(employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTeams(teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const today = new Date();
    const daysAgo = new Date(today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);

    // Filter tasks by date range
    const recentTasks = tasks.filter(task => {
      const createdAt = task.created_at?.toDate ? task.created_at.toDate() : new Date(task.created_at);
      return createdAt >= daysAgo;
    });

    // Calculate basic metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const overdueTasks = tasks.filter(t => {
      const dueDate = new Date(t.due_date);
      return dueDate < today && t.status !== "completed";
    }).length;

    // Task completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Project metrics
    const activeProjects = projects.filter(p => p.status !== "completed").length;
    const completedProjects = projects.filter(p => p.status === "completed").length;

    // Employee performance
    const employeePerformance = employees.map(emp => {
      const empTasks = tasks.filter(t => t.assigned_to === emp.id);
      const empCompleted = empTasks.filter(t => t.status === "completed").length;
      const empRate = empTasks.length > 0 ? (empCompleted / empTasks.length) * 100 : 0;
      return {
        name: emp.name || emp.email,
        tasks: empTasks.length,
        completed: empCompleted,
        rate: empRate,
      };
    }).sort((a, b) => b.rate - a.rate);

    // Daily task creation/completion trend (last 7 days)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const created = tasks.filter(t => {
        const createdAt = t.created_at?.toDate ? t.created_at.toDate() : new Date(t.created_at);
        return createdAt.toISOString().split('T')[0] === dateStr;
      }).length;

      const completed = tasks.filter(t => {
        const completedAt = t.progress_updated_at?.toDate ? t.progress_updated_at.toDate() : null;
        return completedAt && completedAt.toISOString().split('T')[0] === dateStr && t.status === "completed";
      }).length;

      dailyTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created,
        completed,
      });
    }

    // Project status distribution
    const projectStatusData = [
      { name: "Active", value: activeProjects, color: "#3b82f6" },
      { name: "Completed", value: completedProjects, color: "#10b981" },
      { name: "Planning", value: projects.filter(p => p.status === "planning").length, color: "#f59e0b" },
    ];

    // Task status distribution
    const taskStatusData = [
      { name: "Completed", value: completedTasks, color: "#10b981" },
      { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
      { name: "Pending", value: pendingTasks, color: "#6b7280" },
      { name: "Overdue", value: overdueTasks, color: "#ef4444" },
    ];

    setAnalytics({
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      activeProjects,
      completedProjects,
      employeePerformance,
      dailyTrend,
      projectStatusData,
      taskStatusData,
    });
  };

  const filterContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Range
        </label>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Primary Metric
        </label>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          <option value="tasks">Task Analytics</option>
          <option value="projects">Project Analytics</option>
          <option value="performance">Team Performance</option>
        </select>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      active: true,
    },
    {
      id: "trends",
      label: "Trends",
      icon: TrendingUp,
      active: false,
    },
    {
      id: "performance",
      label: "Performance",
      icon: Target,
      active: false,
    },
  ];

  if (loading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        <PageHeader
          title="Analytics"
          status="Loading"
          statusColor="bg-blue-100 text-blue-700"
          tabs={tabs}
          showActions={false}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Insights and metrics"
        status="Live"
        statusColor="bg-green-100 text-green-700"
        tabs={tabs}
        showFilters={true}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen(!filterOpen)}
        filterContent={filterContent}
        customActions={
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Tasks"
            value={analytics.totalTasks || 0}
            icon={Activity}
            color="blue"
            trend="+12%"
            trendUp={true}
          />
          <MetricCard
            title="Completion Rate"
            value={`${(analytics.completionRate || 0).toFixed(1)}%`}
            icon={CheckCircle}
            color="green"
            trend="+5.2%"
            trendUp={true}
          />
          <MetricCard
            title="Active Projects"
            value={analytics.activeProjects || 0}
            icon={Target}
            color="blue"
            trend="+2"
            trendUp={true}
          />
          <MetricCard
            title="Overdue Tasks"
            value={analytics.overdueTasks || 0}
            icon={Clock}
            color="red"
            trend="-8%"
            trendUp={false}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Task Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="created" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Task Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.taskStatusData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(analytics.taskStatusData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Team Performance
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Top performers by completion rate
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(analytics.employeePerformance || []).slice(0, 6).map((emp, index) => (
              <motion.div
                key={emp.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.name)}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {emp.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {emp.tasks} tasks assigned
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {emp.rate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${emp.rate}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, trend, trendUp }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20",
    green: "bg-green-100 text-green-600 dark:bg-green-900/20",
    red: "bg-red-100 text-red-600 dark:bg-red-900/20",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trendUp ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trend}
          </span>
          <span className="text-gray-600 dark:text-gray-400 ml-1">
            from last period
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
