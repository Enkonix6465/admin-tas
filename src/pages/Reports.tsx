import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import PageHeader from "../components/PageHeader";
import { motion } from "framer-motion";
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
} from "lucide-react";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedReport, setSelectedReport] = useState("task-summary");
  const [dateRange, setDateRange] = useState("30");
  const [selectedProject, setSelectedProject] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && projects.length > 0 && employees.length > 0) {
      generateReportData();
    }
  }, [tasks, projects, employees, selectedReport, dateRange, selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksSnap, projectsSnap, employeesSnap] = await Promise.all([
        getDocs(collection(db, "tasks")),
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "employees")),
      ]);

      setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setProjects(projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEmployees(employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReportData = () => {
    const today = new Date();
    const daysAgo = new Date(today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);

    // Filter tasks by date range and project
    let filteredTasks = tasks.filter(task => {
      const createdAt = task.created_at?.toDate ? task.created_at.toDate() : new Date(task.created_at);
      const dateFilter = createdAt >= daysAgo;
      const projectFilter = selectedProject === "all" || task.project_id === selectedProject;
      return dateFilter && projectFilter;
    });

    // Generate report based on selected type
    let data = {};

    switch (selectedReport) {
      case "task-summary":
        data = generateTaskSummaryReport(filteredTasks);
        break;
      case "project-status":
        data = generateProjectStatusReport();
        break;
      case "employee-performance":
        data = generateEmployeePerformanceReport(filteredTasks);
        break;
      case "time-tracking":
        data = generateTimeTrackingReport(filteredTasks);
        break;
      case "completion-trends":
        data = generateCompletionTrendsReport(filteredTasks);
        break;
      default:
        data = generateTaskSummaryReport(filteredTasks);
    }

    setReportData(data);
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

    const byPriority = {
      high: filteredTasks.filter(t => t.priority === "high").length,
      medium: filteredTasks.filter(t => t.priority === "medium").length,
      low: filteredTasks.filter(t => t.priority === "low").length,
    };

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
      byPriority,
      details: filteredTasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority || "medium",
        dueDate: task.due_date,
        assignee: employees.find(e => e.id === task.assigned_to)?.name || task.assigned_to,
        project: projects.find(p => p.id === task.project_id)?.name || "Unknown",
      })),
    };
  };

  const generateProjectStatusReport = () => {
    const projectStats = projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const completedTasks = projectTasks.filter(t => t.status === "completed").length;
      const totalTasks = projectTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

      return {
        id: project.id,
        name: project.name,
        status: project.status || "active",
        totalTasks,
        completedTasks,
        completionRate,
        startDate: project.startDate,
        deadline: project.deadline,
        teamLead: employees.find(e => e.id === project.created_by)?.name || project.created_by,
      };
    });

    return {
      type: "Project Status Report",
      summary: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status !== "completed").length,
        completedProjects: projects.filter(p => p.status === "completed").length,
        averageCompletion: (projectStats.reduce((acc, p) => acc + parseFloat(p.completionRate), 0) / projectStats.length).toFixed(1),
      },
      details: projectStats,
    };
  };

  const generateEmployeePerformanceReport = (filteredTasks) => {
    const employeeStats = employees.map(employee => {
      const empTasks = filteredTasks.filter(t => t.assigned_to === employee.id);
      const completedTasks = empTasks.filter(t => t.status === "completed").length;
      const onTimeTasks = empTasks.filter(t => {
        if (t.status !== "completed" || !t.progress_updated_at || !t.due_date) return false;
        const completedDate = t.progress_updated_at.toDate ? t.progress_updated_at.toDate() : new Date(t.progress_updated_at);
        const dueDate = new Date(t.due_date);
        return completedDate <= dueDate;
      }).length;

      return {
        id: employee.id,
        name: employee.name || employee.email,
        email: employee.email,
        department: employee.department || "Unknown",
        totalTasks: empTasks.length,
        completedTasks,
        pendingTasks: empTasks.filter(t => t.status === "pending").length,
        inProgressTasks: empTasks.filter(t => t.status === "in_progress").length,
        onTimeTasks,
        completionRate: empTasks.length > 0 ? (completedTasks / empTasks.length * 100).toFixed(1) : 0,
        onTimeRate: completedTasks > 0 ? (onTimeTasks / completedTasks * 100).toFixed(1) : 0,
      };
    });

    return {
      type: "Employee Performance Report",
      summary: {
        totalEmployees: employees.length,
        activeEmployees: employeeStats.filter(e => e.totalTasks > 0).length,
        averageTasksPerEmployee: (employeeStats.reduce((acc, e) => acc + e.totalTasks, 0) / employees.length).toFixed(1),
        averageCompletionRate: (employeeStats.reduce((acc, e) => acc + parseFloat(e.completionRate), 0) / employees.length).toFixed(1),
      },
      details: employeeStats.sort((a, b) => parseFloat(b.completionRate) - parseFloat(a.completionRate)),
    };
  };

  const generateTimeTrackingReport = (filteredTasks) => {
    const completedTasksWithTime = filteredTasks.filter(t => 
      t.status === "completed" && t.created_at && t.progress_updated_at
    );

    const timeStats = completedTasksWithTime.map(task => {
      const startTime = task.created_at.toDate ? task.created_at.toDate() : new Date(task.created_at);
      const endTime = task.progress_updated_at.toDate ? task.progress_updated_at.toDate() : new Date(task.progress_updated_at);
      const duration = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)); // days

      return {
        id: task.id,
        title: task.title,
        assignee: employees.find(e => e.id === task.assigned_to)?.name || task.assigned_to,
        project: projects.find(p => p.id === task.project_id)?.name || "Unknown",
        duration,
        startDate: startTime.toLocaleDateString(),
        endDate: endTime.toLocaleDateString(),
      };
    });

    const averageDuration = timeStats.length > 0 ? 
      (timeStats.reduce((acc, t) => acc + t.duration, 0) / timeStats.length).toFixed(1) : 0;

    return {
      type: "Time Tracking Report",
      summary: {
        trackedTasks: timeStats.length,
        averageDuration: `${averageDuration} days`,
        fastestCompletion: timeStats.length > 0 ? Math.min(...timeStats.map(t => t.duration)) : 0,
        slowestCompletion: timeStats.length > 0 ? Math.max(...timeStats.map(t => t.duration)) : 0,
      },
      details: timeStats.sort((a, b) => a.duration - b.duration),
    };
  };

  const generateCompletionTrendsReport = (filteredTasks) => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const completed = filteredTasks.filter(t => {
        const completedAt = t.progress_updated_at?.toDate ? t.progress_updated_at.toDate() : null;
        return completedAt && completedAt.toISOString().split('T')[0] === dateStr && t.status === "completed";
      }).length;

      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
      });
    }

    const bestDay = last30Days.reduce((max, day) => day.completed > max.completed ? day : max, last30Days[0] || {date: 'N/A', completed: 0});

    return {
      type: "Completion Trends Report",
      summary: {
        totalCompleted: filteredTasks.filter(t => t.status === "completed").length,
        dailyAverage: (last30Days.reduce((acc, day) => acc + day.completed, 0) / 30).toFixed(1),
        bestDay: `${bestDay.date} (${bestDay.completed} tasks)`,
        trend: "upward", // simplified
      },
      details: last30Days,
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
  };

  const reportTypes = [
    { id: "task-summary", name: "Task Summary", icon: CheckCircle, description: "Overview of all tasks and their status" },
    { id: "project-status", name: "Project Status", icon: Target, description: "Detailed project progress and metrics" },
    { id: "employee-performance", name: "Employee Performance", icon: Users, description: "Individual and team performance analysis" },
    { id: "time-tracking", name: "Time Tracking", icon: Clock, description: "Task duration and time analytics" },
    { id: "completion-trends", name: "Completion Trends", icon: TrendingUp, description: "Historical completion patterns" },
  ];

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
          Project
        </label>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      active: true,
    },
    {
      id: "schedules",
      label: "Scheduled",
      icon: Calendar,
      active: false,
    },
    {
      id: "exports",
      label: "Exports",
      icon: Download,
      active: false,
    },
  ];

  if (loading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        <PageHeader
          title="Reports"
          status="Loading"
          statusColor="bg-blue-100 text-blue-700"
          tabs={tabs}
          showActions={false}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and export detailed reports"
        status="Live"
        statusColor="bg-green-100 text-green-700"
        tabs={tabs}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search reports..."
        showFilters={true}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen(!filterOpen)}
        filterContent={filterContent}
        customActions={
          <div className="flex items-center gap-2">
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Report Types Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Report Types
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {reportTypes.map((report) => (
              <motion.button
                key={report.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedReport === report.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedReport === report.id 
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300" 
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                    <report.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {report.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {reportData.type ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Report Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {reportData.type}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Generated on {new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* Summary Cards */}
                {reportData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(reportData.summary).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Report Details */}
              {reportData.details && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Detailed Breakdown
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          {reportData.details.length > 0 && Object.keys(reportData.details[0]).map((key) => (
                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {reportData.details.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {Object.values(row).map((value, valueIndex) => (
                              <td key={valueIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                {typeof value === "string" && value.length > 50 
                                  ? `${value.substring(0, 50)}...` 
                                  : String(value)
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Report Type
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a report from the sidebar to generate insights
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
