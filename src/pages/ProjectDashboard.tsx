import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Activity,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Eye,
  MoreHorizontal,
  Building2,
  Layers3,
  Download,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projSnap = await getDocs(query(collection(db, "projects")));
        const teamSnap = await getDocs(query(collection(db, "teams")));
        const empSnap = await getDocs(query(collection(db, "employees")));

        setProjects(projSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setTeams(teamSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setEmployees(empSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        setError("Connection failed. Using demo data.");

        // Fallback to mock data
        setProjects([
          {
            id: "1",
            name: "Website Redesign Project",
            description: "Complete redesign of company website with modern UI/UX principles and responsive design for all devices.",
            startDate: "2024-01-15",
            deadline: "2024-03-30",
            created_by: "emp1",
            teamId: "team1",
          },
          {
            id: "2",
            name: "Mobile App Development",
            description: "Development of native mobile application for iOS and Android platforms with real-time features.",
            startDate: "2024-02-01",
            deadline: "2024-05-15",
            created_by: "emp2",
            teamId: "team2",
          },
          {
            id: "3",
            name: "Database Migration",
            description: "Migration of legacy database systems to modern cloud infrastructure with improved performance.",
            startDate: "2024-01-10",
            deadline: "2024-04-20",
            created_by: "emp1",
            teamId: "team1",
          },
          {
            id: "4",
            name: "AI Integration Platform",
            description: "Implementation of machine learning algorithms and AI features into existing business processes.",
            startDate: "2024-02-15",
            deadline: "2024-06-30",
            created_by: "emp3",
            teamId: "team3",
          },
          {
            id: "5",
            name: "Security Audit & Enhancement",
            description: "Comprehensive security review and implementation of enhanced security measures across all systems.",
            startDate: "2024-01-20",
            deadline: "2024-04-10",
            created_by: "emp2",
            teamId: "team2",
          }
        ]);

        setTeams([
          {
            id: "team1",
            teamName: "Frontend Development Team",
            description: "Specializes in user interface and user experience development",
            members: ["emp1", "emp2", "emp3"],
            teamLead: "emp1"
          },
          {
            id: "team2",
            teamName: "Backend Development Team",
            description: "Focuses on server-side development and database management",
            members: ["emp2", "emp4", "emp5"],
            teamLead: "emp2"
          },
          {
            id: "team3",
            teamName: "DevOps & Infrastructure",
            description: "Manages deployment, monitoring, and infrastructure",
            members: ["emp3", "emp5", "emp6"],
            teamLead: "emp3"
          }
        ]);

        setEmployees([
          { id: "emp1", name: "Sarah Johnson", title: "Senior Frontend Developer" },
          { id: "emp2", name: "Michael Chen", title: "Backend Team Lead" },
          { id: "emp3", name: "Emily Rodriguez", title: "DevOps Engineer" },
          { id: "emp4", name: "David Kim", title: "Full Stack Developer" },
          { id: "emp5", name: "Lisa Wang", title: "Database Specialist" },
          { id: "emp6", name: "James Wilson", title: "Infrastructure Architect" }
        ]);

        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEmployeeName = (id) =>
    employees.find((emp) => emp.id === id)?.name || "Unknown";

  const getTeamName = (id) =>
    teams.find((team) => team.id === id)?.teamName || "Unknown";

  const handleTeamClick = (teamId) => {
    setSelectedTeam(selectedTeam === teamId ? null : teamId);
  };

  const getProjectProgress = (project) => {
    // Mock progress calculation based on project data
    const today = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.deadline);
    const total = end - start;
    const elapsed = today - start;
    return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const end = new Date(deadline);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-transparent flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="liquid-glass border-b border-gray-200 dark:border-purple-500/30 px-6 py-4 shadow-sm dark:shadow-purple-500/20 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-purple-100">
              Project Dashboard
            </h1>
            <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Project Hub
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-purple-100 dark:bg-purple-500/20 rounded-lg p-1 border border-purple-200 dark:border-purple-500/30">
              {[
                { id: "grid", icon: Grid, label: "Grid" },
                { id: "list", icon: List, label: "List" }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    viewMode === mode.id
                      ? 'bg-white dark:bg-purple-500/30 text-purple-700 dark:text-purple-200 shadow-lg'
                      : 'text-purple-600 dark:text-purple-300 hover:bg-white/50 dark:hover:bg-purple-500/15'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">{mode.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const exportData = {
                  projects: projects,
                  teams: teams,
                  totalProjects: projects.length,
                  exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `projects-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success("Projects data exported! 📊");
              }}
              className="px-4 py-2 text-sm bg-white dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-500/30 rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">New Project</span>
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-b-2 border-purple-500 pb-2">
              <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-base font-medium text-purple-600 dark:text-purple-400">Project Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm dark:shadow-purple-500/20 backdrop-blur-sm w-64"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Projects: {filteredProjects.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Connection Issue</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30">
                <Layers3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-purple-100">{projects.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-purple-100 mb-1">Total Projects</h3>
            <p className="text-sm text-gray-600 dark:text-purple-300/70">Active and completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-purple-100">{teams.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-purple-100 mb-1">Active Teams</h3>
            <p className="text-sm text-gray-600 dark:text-purple-300/70">Working on projects</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-purple-100">{employees.length}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-purple-100 mb-1">Team Members</h3>
            <p className="text-sm text-gray-600 dark:text-purple-300/70">Across all teams</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500/30">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-purple-100">
                {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + getProjectProgress(p), 0) / projects.length) : 0}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-purple-100 mb-1">Avg Progress</h3>
            <p className="text-sm text-gray-600 dark:text-purple-300/70">Across all projects</p>
          </motion.div>
        </div>

        {/* Projects Grid */}
        <div className={`grid gap-6 ${
          viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
        }`}>
          <AnimatePresence>
            {filteredProjects.map((project, index) => {
              const progress = getProjectProgress(project);
              const daysRemaining = getDaysRemaining(project.deadline);
              const isExpanded = selectedTeam === project.teamId;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onHoverStart={() => setHoveredCard(project.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group relative liquid-glass-card overflow-hidden hover:shadow-2xl dark:hover:shadow-purple-500/20 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/30">
                              #{index + 1}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                              daysRemaining > 30 ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30' :
                              daysRemaining > 7 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30' :
                              'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30'
                            }`}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 bg-purple-50 dark:bg-purple-500/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/30 transition-colors group-hover:scale-110">
                          <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </button>
                        <button className="p-2 bg-purple-50 dark:bg-purple-500/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/30 transition-colors group-hover:scale-110">
                          <MoreHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-purple-100 mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors">
                      {project.name}
                    </h2>

                    <p className="text-gray-600 dark:text-purple-300/80 text-sm leading-relaxed mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-purple-300/80">Progress</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-purple-100">{progress}%</span>
                      </div>
                      <div className="w-full bg-purple-200/50 dark:bg-purple-900/30 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-purple-500 dark:text-purple-300/70 text-xs">Start Date</p>
                          <p className="font-medium text-gray-900 dark:text-purple-100">{project.startDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-purple-500 dark:text-purple-300/70 text-xs">Deadline</p>
                          <p className="font-medium text-gray-900 dark:text-purple-100">{project.deadline}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-4">
                      <User className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-purple-500 dark:text-purple-300/70 text-xs">Created By</p>
                        <p className="font-medium text-gray-900 dark:text-purple-100">{getEmployeeName(project.created_by)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Team Section */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => handleTeamClick(project.teamId)}
                      className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-500/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/30 transition-all group-hover:shadow-md border border-purple-200 dark:border-purple-500/30"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-purple-100">{getTeamName(project.teamId)}</p>
                          <p className="text-xs text-purple-600 dark:text-purple-300/70">
                            {teams.find(t => t.id === project.teamId)?.members?.length || 0} members
                          </p>
                        </div>
                      </div>
                      {isExpanded ?
                        <ChevronUp className="w-5 h-5 text-purple-400 transform transition-transform" /> :
                        <ChevronDown className="w-5 h-5 text-purple-400 transform transition-transform" />
                      }
                    </button>

                    {/* Team Members Expansion */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-purple-50 dark:bg-purple-500/20 rounded-xl p-4 border border-purple-200 dark:border-purple-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <Star className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                              <span className="font-medium text-gray-900 dark:text-purple-100 text-sm">Team Members</span>
                            </div>
                            <div className="space-y-3">
                              {teams
                                .find((t) => t.id === selectedTeam)
                                ?.members.map((memberId, memberIndex) => (
                                  <motion.div
                                    key={memberId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: memberIndex * 0.1 }}
                                    className="flex items-center gap-3 p-3 bg-white dark:bg-purple-500/30 rounded-lg shadow-sm border border-purple-200 dark:border-purple-500/30"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 dark:text-purple-100 text-sm">
                                        {getEmployeeName(memberId)}
                                      </p>
                                      <p className="text-xs text-purple-600 dark:text-purple-300/70">Team Member</p>
                                    </div>
                                  </motion.div>
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-100/20 dark:to-purple-700/20 rounded-2xl transition-opacity duration-300 pointer-events-none ${
                    hoveredCard === project.id ? 'opacity-100' : 'opacity-0'
                  }`} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-purple-100 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-purple-300/70 mb-6">
              Try adjusting your search terms
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg"
            >
              Clear Search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
