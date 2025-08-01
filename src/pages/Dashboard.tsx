import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Circle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  FileText,
  Filter,
  ChevronDown,
  Share,
  Star,
  Eye,
} from "lucide-react";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

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
      console.warn("Firebase data fetch failed, using mock data:", error);
      setProjects([]);
      setTasks([]);
      setTeams([]);
      setEmployees([]);
    }
  };

  const getEmployeeName = (empId: string) =>
    employees.find((emp: any) => emp.id === empId)?.name || "Unassigned";

  // Calculate dashboard statistics
  const totalProjects = projects.length || 3;
  const pendingTasks = tasks.filter((t: any) => t.status === "pending").length || 10;
  const inProgressTasks = tasks.filter((t: any) => t.status === "in_progress").length || 2;
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length || 40;
  const completionRate = completedTasks > 0 ? Math.round((completedTasks / (completedTasks + pendingTasks + inProgressTasks)) * 100) : 54;

  // Mock projects data matching the design
  const mockProjects = [
    {
      id: 1,
      name: "Word Press",
      type: "WordPress Project",
      tasks: 45,
      progress: 57,
      dueDate: "2023-09-28",
      team: "Word Presi",
      color: "blue"
    },
    {
      id: 2,
      name: "TAS TESTING PROJECT",
      type: "TAS TESTING PROJECT",
      tasks: 17,
      progress: 17,
      dueDate: "2023-07-31",
      team: "TESTING TEAM - GOKUL",
      color: "blue"
    }
  ];

  // Mock recent tasks
  const mockRecentTasks = [
    {
      id: 1,
      title: "Site G6",
      description: "Assigned to Mellanaly GuollermArchitect...",
      time: "Dec 26,2022 17:18:00",
      user: "MG"
    },
    {
      id: 2,
      title: "QC Pending",
      description: "Assigned to developers via general...",
      time: "Dec 26,2022 07:12:00",
      user: "DV"
    },
    {
      id: 3,
      title: "QC Pending",
      description: "Assigned to Test Request Business...",
      time: "Dec 26,2022 07:12:00",
      user: "TR"
    },
    {
      id: 4,
      title: "QC Pending",
      description: "Assigned to Sample Development...",
      time: "Dec 26,2022 07:12:00",
      user: "SD"
    }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
              color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              color === 'green' ? 'bg-green-50 dark:bg-green-900/20' :
              'bg-purple-50 dark:bg-purple-900/20'
            }`}>
              <Icon className={`w-5 h-5 ${
                color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                color === 'green' ? 'text-green-600 dark:text-green-400' :
                'text-purple-600 dark:text-purple-400'
              }`} />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
            {change && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ProjectCard = ({ project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-medium">
            {project.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{project.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{project.type}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              📅 {project.dueDate} 👥 {project.team}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
            {project.tasks} tasks
          </span>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );

  const TaskItem = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
        {task.user}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{task.description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{task.time}</p>
      </div>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    </motion.div>
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-3 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              New
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Share
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          change="+19% from last month"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks || "10 overdue"}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          change={`${completionRate}% completion rate`}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="p-6 space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 2).map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                mockProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {tasks.length > 0 ? (
                  tasks.slice(0, 4).map((task: any) => (
                    <TaskItem 
                      key={task.id} 
                      task={{
                        id: task.id,
                        title: task.title || "Untitled Task",
                        description: `Assigned to ${getEmployeeName(task.assigned_to)}`,
                        time: task.created_at?.toDate?.().toLocaleDateString() || "Today",
                        user: getEmployeeName(task.assigned_to).substring(0, 2).toUpperCase()
                      }} 
                    />
                  ))
                ) : (
                  mockRecentTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
