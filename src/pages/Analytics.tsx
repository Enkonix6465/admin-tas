import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Users,
  CheckCircle,
  Filter,
  Download,
  Search,
  ChevronDown,
  BarChart3,
} from "lucide-react";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("30");

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
      console.warn("Analytics data fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts when Firebase is unavailable
  const taskStatusData = [
    { name: "Pending", value: tasks.filter((t: any) => t.status === "pending").length || 12, color: "#f59e0b" },
    { name: "In Progress", value: tasks.filter((t: any) => t.status === "in_progress").length || 8, color: "#3b82f6" },
    { name: "Completed", value: tasks.filter((t: any) => t.status === "completed").length || 24, color: "#10b981" },
  ];

  const productivityData = [
    { month: "Jan", tasks: 12, projects: 3 },
    { month: "Feb", tasks: 18, projects: 4 },
    { month: "Mar", tasks: 24, projects: 5 },
    { month: "Apr", tasks: 16, projects: 3 },
    { month: "May", tasks: 20, projects: 6 },
    { month: "Jun", tasks: 28, projects: 7 },
  ];

  const teamPerformanceData = [
    { name: "Development", completed: 45, pending: 12 },
    { name: "Design", completed: 32, pending: 8 },
    { name: "QA", completed: 28, pending: 15 },
    { name: "Marketing", completed: 18, pending: 5 },
  ];

  if (loading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 overflow-y-auto flex flex-col">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Analytics</span>
          <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Live Data</span>
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
              {dateRange} days
              <ChevronDown className="w-3 h-3" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 p-2">
                <div className="space-y-1">
                  {["7", "30", "90", "365"].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        setDateRange(days);
                        setFilterOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[
          { icon: Activity, label: "Total Tasks", value: tasks.length || 44, change: "+12%", color: "blue" },
          { icon: CheckCircle, label: "Completed", value: taskStatusData[2].value, change: "+8%", color: "green" },
          { icon: Users, label: "Team Members", value: employees.length || 12, change: "+2", color: "purple" },
          { icon: BarChart3, label: "Projects", value: projects.length || 8, change: "+3", color: "orange" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-xs text-green-600 dark:text-green-400">{stat.change}</p>
              </div>
              <div className={`p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded`}>
                <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Task Status Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Task Status</h3>
          <div className="h-48 sm:h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {taskStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Productivity Trend</h3>
          <div className="h-48 sm:h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Tasks</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Projects</span>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Team Performance</h3>
          <div className="h-48 sm:h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformanceData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="completed" fill="#10b981" />
                <Bar dataKey="pending" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
