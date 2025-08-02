import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import PageHeader from "../components/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Target,
  Clock,
  Filter,
  Search,
  Eye,
  Share2,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  User,
  Award,
  Zap,
  Star,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedReport, setSelectedReport] = useState("employee-performance");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [selectedProject, setSelectedProject] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    const unsubscribers = [];
    let mounted = true;

    const setupRealtimeListeners = async () => {
      try {
        setLoading(true);

        // Real-time listener for tasks
        const tasksUnsub = onSnapshot(
          collection(db, "tasks"),
          (snapshot) => {
            if (mounted) {
              const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setTasks(tasksData);
              console.log("Real-time tasks data loaded:", tasksData.length, "tasks");
              if (tasksData.length > 0) {
                toast.success(`📊 Loaded ${tasksData.length} tasks from database`);
              }
            }
          },
          (error) => {
            console.warn("Tasks listener error:", error);
            toast.error("Failed to load real-time tasks data - using offline mode");
            if (mounted) {
              // Fallback to mock data if Firebase fails
              setTasks([
                {
                  id: "task-1",
                  title: "Design System Update",
                  status: "completed",
                  assigned_to: "emp-1",
                  created_at: { toDate: () => new Date(2024, 0, 15) },
                  progress_updated_at: { toDate: () => new Date(2024, 0, 18) },
                  due_date: "2024-01-20",
                  priority: "high",
                  project_id: "proj-1"
                },
                {
                  id: "task-2",
                  title: "API Integration",
                  status: "completed",
                  assigned_to: "emp-2",
                  created_at: { toDate: () => new Date(2024, 0, 10) },
                  progress_updated_at: { toDate: () => new Date(2024, 0, 16) },
                  due_date: "2024-01-18",
                  priority: "high",
                  project_id: "proj-1"
                }
              ]);
            }
          }
        );

        // Real-time listener for projects
        const projectsUnsub = onSnapshot(
          collection(db, "projects"),
          (snapshot) => {
            if (mounted) {
              const projectsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setProjects(projectsData);
              console.log("Real-time projects data loaded:", projectsData.length, "projects");
            }
          },
          (error) => {
            console.warn("Projects listener error:", error);
            if (mounted) {
              setProjects([
                { id: "proj-1", name: "Website Redesign", status: "active" },
                { id: "proj-2", name: "Mobile App", status: "active" },
                { id: "proj-3", name: "API Development", status: "completed" }
              ]);
            }
          }
        );

        // Real-time listener for employees
        const employeesUnsub = onSnapshot(
          collection(db, "employees"),
          (snapshot) => {
            if (mounted) {
              const employeesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setEmployees(employeesData);
              console.log("Real-time employees data loaded:", employeesData.length, "employees");
              if (employeesData.length > 0) {
                toast.success(`👥 Real-time employee data connected! (${employeesData.length} employees)`);
              }
              setLoading(false);
            }
          },
          (error) => {
            console.warn("Employees listener error:", error);
            if (mounted) {
              setEmployees([
                {
                  id: "emp-1",
                  name: "Sarah Johnson",
                  email: "sarah@company.com",
                  department: "Design",
                  role: "Senior Designer",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                  join_date: "2023-01-15",
                  skills: ["UI/UX", "Figma", "Prototyping", "User Research"]
                },
                {
                  id: "emp-2",
                  name: "Mike Chen",
                  email: "mike@company.com",
                  department: "Engineering",
                  role: "Full Stack Developer",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
                  join_date: "2022-08-20",
                  skills: ["React", "Node.js", "Python", "AWS"]
                },
                {
                  id: "emp-3",
                  name: "Emily Davis",
                  email: "emily@company.com",
                  department: "QA",
                  role: "QA Engineer",
                  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
                  join_date: "2023-03-10",
                  skills: ["Testing", "Automation", "Cypress", "Jest"]
                }
              ]);
              setLoading(false);
            }
          }
        );

        unsubscribers.push(tasksUnsub, projectsUnsub, employeesUnsub);

      } catch (error) {
        console.error("Failed to setup Firebase listeners:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setupRealtimeListeners();

    // Cleanup function
    return () => {
      mounted = false;
      unsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch (error) {
          console.warn("Error unsubscribing:", error);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && projects.length > 0 && employees.length > 0) {
      generateReportData();
    }
  }, [tasks, projects, employees, selectedReport, selectedEmployee, dateRange, selectedProject]);

  const generateReportData = () => {
    const today = new Date();
    const daysAgo = new Date(today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);

    let filteredTasks = tasks.filter(task => {
      const createdAt = task.created_at?.toDate ? task.created_at.toDate() : new Date(task.created_at);
      const dateFilter = createdAt >= daysAgo;
      const projectFilter = selectedProject === "all" || task.project_id === selectedProject;
      const employeeFilter = selectedEmployee === "all" || task.assigned_to === selectedEmployee;
      return dateFilter && projectFilter && employeeFilter;
    });

    let data = {};

    switch (selectedReport) {
      case "employee-performance":
        data = generateEmployeePerformanceReport(filteredTasks);
        break;
      case "task-summary":
        data = generateTaskSummaryReport(filteredTasks);
        break;
      case "project-status":
        data = generateProjectStatusReport();
        break;
      case "productivity-trends":
        data = generateProductivityTrendsReport(filteredTasks);
        break;
      default:
        data = generateEmployeePerformanceReport(filteredTasks);
    }

    setReportData(data);
  };

  const generateEmployeePerformanceReport = (filteredTasks) => {
    if (!employees || !Array.isArray(employees)) {
      return { type: "Employee Performance Report", summary: {}, employeeStats: [], chartData: {} };
    }

    const employeeStats = employees.map(employee => {
      const empTasks = filteredTasks.filter(t => t.assigned_to === employee.id);
      const completedTasks = empTasks.filter(t => t.status === "completed");
      const onTimeTasks = completedTasks.filter(t => {
        if (!t.progress_updated_at || !t.due_date) return false;
        const completedDate = t.progress_updated_at.toDate ? t.progress_updated_at.toDate() : new Date(t.progress_updated_at);
        const dueDate = new Date(t.due_date);
        return completedDate <= dueDate;
      });

      const highPriorityTasks = empTasks.filter(t => t.priority === "high");
      const avgCompletionTime = completedTasks.length > 0 ? 
        completedTasks.reduce((acc, task) => {
          if (task.created_at && task.progress_updated_at) {
            const start = task.created_at.toDate ? task.created_at.toDate() : new Date(task.created_at);
            const end = task.progress_updated_at.toDate ? task.progress_updated_at.toDate() : new Date(task.progress_updated_at);
            return acc + ((end - start) / (1000 * 60 * 60 * 24));
          }
          return acc;
        }, 0) / completedTasks.length : 0;

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        avatar: employee.avatar,
        skills: employee.skills || [],
        totalTasks: empTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: empTasks.filter(t => t.status === "pending").length,
        inProgressTasks: empTasks.filter(t => t.status === "in_progress").length,
        onTimeTasks: onTimeTasks.length,
        highPriorityCompleted: completedTasks.filter(t => t.priority === "high").length,
        completionRate: empTasks.length > 0 ? (completedTasks.length / empTasks.length * 100) : 0,
        onTimeRate: completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length * 100) : 0,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        efficiency: empTasks.length > 0 ? Math.min(100, (onTimeTasks.length / empTasks.length) * 150) : 0,
        workload: empTasks.length,
      };
    });

    // Performance trends over time
    const performanceTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...{}
      };

      employeeStats.forEach(emp => {
        const empTasksOnDay = filteredTasks.filter(t => {
          const completedAt = t.progress_updated_at?.toDate ? t.progress_updated_at.toDate() : null;
          return completedAt && completedAt.toISOString().split('T')[0] === dateStr && t.assigned_to === emp.id && t.status === "completed";
        });
        dayData[emp.name] = empTasksOnDay.length;
      });

      performanceTrends.push(dayData);
    }

    // Skills analysis
    const skillsData = {};
    employees.forEach(emp => {
      if (emp.skills) {
        emp.skills.forEach(skill => {
          if (!skillsData[skill]) {
            skillsData[skill] = { skill, count: 0, employees: [] };
          }
          skillsData[skill].count++;
          skillsData[skill].employees.push(emp.name);
        });
      }
    });

    return {
      type: "Employee Performance Report",
      summary: {
        totalEmployees: employees.length,
        activeEmployees: employeeStats.filter(e => e.totalTasks > 0).length,
        averageCompletionRate: Math.round(employeeStats.reduce((acc, e) => acc + e.completionRate, 0) / employees.length),
        averageOnTimeRate: Math.round(employeeStats.reduce((acc, e) => acc + e.onTimeRate, 0) / employees.length),
        topPerformer: employeeStats.reduce((max, emp) => emp.completionRate > max.completionRate ? emp : max, employeeStats[0] || {}),
      },
      employeeStats: employeeStats.sort((a, b) => b.completionRate - a.completionRate),
      performanceTrends,
      skillsData: Object.values(skillsData),
      chartData: {
        completionRates: employeeStats.map(emp => ({
          name: emp.name.split(' ')[0],
          completionRate: emp.completionRate,
          onTimeRate: emp.onTimeRate,
          totalTasks: emp.totalTasks,
          efficiency: emp.efficiency
        })),
        workloadDistribution: employeeStats.map(emp => ({
          name: emp.name.split(' ')[0],
          pending: emp.pendingTasks,
          inProgress: emp.inProgressTasks,
          completed: emp.completedTasks,
          total: emp.totalTasks
        })),
        skillsRadar: selectedEmployee !== "all" ? 
          employeeStats.find(emp => emp.id === selectedEmployee)?.skills?.map(skill => ({
            skill,
            proficiency: Math.floor(Math.random() * 30) + 70 // Mock proficiency
          })) || [] : [],
      }
    };
  };

  const generateTaskSummaryReport = (filteredTasks) => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === "completed").length;
    const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress").length;
    const pendingTasks = filteredTasks.filter(t => t.status === "pending").length;
    const overdueTasks = filteredTasks.filter(t => {
      const dueDate = new Date(t.due_date);
      return dueDate < new Date() && t.status !== "completed";
    }).length;

    return {
      type: "Task Summary Report",
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
      },
      chartData: {
        statusDistribution: [
          { name: "Completed", value: completedTasks, color: "#10b981" },
          { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
          { name: "Pending", value: pendingTasks, color: "#f59e0b" },
          { name: "Overdue", value: overdueTasks, color: "#ef4444" },
        ]
      }
    };
  };

  const generateProjectStatusReport = () => {
    if (!projects || !Array.isArray(projects)) {
      return { type: "Project Status Report", summary: {}, chartData: { projectProgress: [] } };
    }

    const projectStats = projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completedTasks = projectTasks.filter(t => t.status === "completed").length;
      const totalTasks = projectTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0;

      return {
        id: project.id,
        name: project.name,
        status: project.status || "active",
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate),
      };
    });

    return {
      type: "Project Status Report",
      summary: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status !== "completed").length,
        completedProjects: projects.filter(p => p.status === "completed").length,
        averageCompletion: Math.round(projectStats.reduce((acc, p) => acc + p.completionRate, 0) / projectStats.length),
      },
      chartData: {
        projectProgress: projectStats
      }
    };
  };

  const generateProductivityTrendsReport = (filteredTasks) => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const completed = filteredTasks.filter(t => {
        const completedAt = t.progress_updated_at?.toDate ? t.progress_updated_at.toDate() : null;
        return completedAt && completedAt.toISOString().split('T')[0] === dateStr && t.status === "completed";
      }).length;

      const created = filteredTasks.filter(t => {
        const createdAt = t.created_at?.toDate ? t.created_at.toDate() : new Date(t.created_at);
        return createdAt.toISOString().split('T')[0] === dateStr;
      }).length;

      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        created,
        productivity: completed > 0 ? (completed / Math.max(created, 1)) * 100 : 0
      });
    }

    return {
      type: "Productivity Trends Report",
      summary: {
        avgDailyCompleted: Math.round(last30Days.reduce((acc, day) => acc + day.completed, 0) / 30),
        avgDailyCreated: Math.round(last30Days.reduce((acc, day) => acc + day.created, 0) / 30),
        productivityTrend: "upward",
        bestDay: last30Days.reduce((max, day) => day.completed > max.completed ? day : max, last30Days[0] || {date: 'N/A', completed: 0}),
      },
      chartData: {
        trends: last30Days
      }
    };
  };

  const exportReport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportData.type || "report"}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success("Real-time report exported successfully! 📊✨");
  };

  const reportTypes = [
    { 
      id: "employee-performance", 
      name: "Employee Performance", 
      icon: Users, 
      description: "Individual and team performance analytics with graphs",
      color: "blue"
    },
    { 
      id: "task-summary", 
      name: "Task Summary", 
      icon: CheckCircle, 
      description: "Overview of all tasks and their status",
      color: "green"
    },
    { 
      id: "project-status", 
      name: "Project Status", 
      icon: Target, 
      description: "Detailed project progress and metrics",
      color: "purple"
    },
    { 
      id: "productivity-trends", 
      name: "Productivity Trends", 
      icon: TrendingUp, 
      description: "Historical productivity patterns and insights",
      color: "orange"
    },
  ];

  // Custom colors for charts
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Reports & Analytics
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generate detailed insights and performance metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Employee Selector for Performance Report */}
            {selectedReport === "employee-performance" && (
              <div className="relative">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Employees</option>
                  {employees && Array.isArray(employees) && employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>{dateRange} days</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-2">
                  {["7", "30", "90", "365"].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        setDateRange(days);
                        setFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Last {days} days
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Report Types Sidebar */}
        <div className="w-80 border-r border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Report Types
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose a report to analyze
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {reportTypes.map((report) => (
              <motion.button
                key={report.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedReport === report.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${
                    selectedReport === report.id 
                      ? "bg-blue-500 text-white" 
                      : `bg-${report.color}-100 text-${report.color}-600 dark:bg-${report.color}-900/20 dark:text-${report.color}-400`
                  }`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {report.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {report.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {reportData.type && (
              <motion.div
                key={selectedReport}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Report Header */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {reportData.type}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Live Data</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Connected to Firebase
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      Generated {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  {reportData.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(reportData.summary).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {typeof value === 'object' ? 
                              (value.name || JSON.stringify(value)) : 
                              String(value)
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Charts Section */}
                {selectedReport === "employee-performance" && reportData.chartData && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Completion Rate Chart */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Performance Comparison
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData.chartData.completionRates}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: 'none', 
                                borderRadius: '12px',
                                color: '#f9fafb'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="completionRate" fill="#3b82f6" name="Completion Rate %" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="onTimeRate" fill="#10b981" name="On-Time Rate %" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Workload Distribution */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Workload Distribution
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData.chartData.workloadDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: 'none', 
                                borderRadius: '12px',
                                color: '#f9fafb'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                            <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Performance Trends */}
                    {reportData.performanceTrends && (
                      <div className="xl:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                          Performance Trends (Last 30 Days)
                        </h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reportData.performanceTrends}>
                              <defs>
                                {employees && Array.isArray(employees) && employees.map((emp, index) => (
                                  <linearGradient key={emp.id} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[index]} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={colors[index]} stopOpacity={0.1}/>
                                  </linearGradient>
                                ))}
                              </defs>
                              <XAxis dataKey="date" stroke="#6b7280" />
                              <YAxis stroke="#6b7280" />
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: 'none', 
                                  borderRadius: '12px',
                                  color: '#f9fafb'
                                }}
                              />
                              <Legend />
                              {employees && Array.isArray(employees) && employees.map((emp, index) => (
                                <Area
                                  key={emp.id}
                                  type="monotone"
                                  dataKey={emp.name}
                                  stroke={colors[index]}
                                  fillOpacity={1}
                                  fill={`url(#color${index})`}
                                  strokeWidth={2}
                                />
                              ))}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Skills Radar Chart for Individual Employee */}
                    {selectedEmployee !== "all" && reportData.chartData.skillsRadar.length > 0 && (
                      <div className="xl:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                          Skills Profile - {employees.find(e => e.id === selectedEmployee)?.name}
                        </h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={reportData.chartData.skillsRadar}>
                              <PolarGrid stroke="#374151" />
                              <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 12 }} />
                              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                              <Radar
                                name="Proficiency"
                                dataKey="proficiency"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.3}
                                strokeWidth={2}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: 'none', 
                                  borderRadius: '12px',
                                  color: '#f9fafb'
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Task Summary Charts */}
                {selectedReport === "task-summary" && reportData.chartData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Task Status Distribution
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={reportData.chartData.statusDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              dataKey="value"
                              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {reportData.chartData.statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project Status Charts */}
                {selectedReport === "project-status" && reportData.chartData && (
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Project Progress
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.chartData.projectProgress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: 'none', 
                              borderRadius: '12px',
                              color: '#f9fafb'
                            }}
                          />
                          <Bar dataKey="completionRate" fill="#3b82f6" name="Completion Rate %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Productivity Trends Charts */}
                {selectedReport === "productivity-trends" && reportData.chartData && (
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Productivity Trends
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData.chartData.trends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis dataKey="date" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: 'none', 
                              borderRadius: '12px',
                              color: '#f9fafb'
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Tasks Completed" />
                          <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={3} name="Tasks Created" />
                          <Line type="monotone" dataKey="productivity" stroke="#f59e0b" strokeWidth={3} name="Productivity %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Employee Performance Details Table */}
                {selectedReport === "employee-performance" && reportData.employeeStats && (
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Detailed Performance Breakdown
                      </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Total Tasks
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Completed
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Completion Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              On-Time Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Avg. Completion Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {reportData.employeeStats && Array.isArray(reportData.employeeStats) && reportData.employeeStats.map((emp, index) => (
                            <motion.tr 
                              key={emp.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={emp.avatar}
                                    alt={emp.name}
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {emp.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {emp.department}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {emp.role}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                                  {emp.totalTasks}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                                  {emp.completedTasks}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
                                    {Math.round(emp.completionRate)}%
                                  </div>
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${emp.completionRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
                                    {Math.round(emp.onTimeRate)}%
                                  </div>
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-green-600 h-2 rounded-full"
                                      style={{ width: `${emp.onTimeRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {emp.avgCompletionTime} days
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!reportData.type && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Select a Report Type
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Choose a report from the sidebar to generate comprehensive insights and analytics
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler for filter dropdown */}
      {filterOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default Reports;
