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
  Target,
  Clock,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Activity,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Share,
  ExternalLink,
  X,
  Zap,
  Sparkles,
  Layers,
  BarChart3,
  PieChart,
  Award,
  Flag,
  Globe,
  Shield,
  Diamond,
  Rocket,
  Heart,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid, list, stats
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { currentUser } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projSnap = await getDocs(query(collection(db, "projects")));
        const teamSnap = await getDocs(query(collection(db, "teams")));
        const empSnap = await getDocs(query(collection(db, "employees")));

        const projectsData = projSnap.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          // Add mock data for demonstration
          progress: Math.floor(Math.random() * 100),
          status: ['active', 'completed', 'paused', 'planning'][Math.floor(Math.random() * 4)],
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          budget: `$${(Math.random() * 100000 + 10000).toFixed(0)}`,
          client: ['TechCorp', 'StartupXYZ', 'Enterprise Ltd', 'Innovation Inc'][Math.floor(Math.random() * 4)],
        }));

        setProjects(projectsData);
        setTeams(teamSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setEmployees(empSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
        // Mock data fallback
        setProjects([
          {
            id: "1",
            name: "AI-Powered Analytics Platform",
            description: "Revolutionary analytics platform using machine learning for real-time insights and predictive analytics.",
            startDate: "2024-01-15",
            deadline: "2024-06-30",
            created_by: "admin",
            teamId: "team1",
            progress: 75,
            status: "active",
            priority: "high",
            budget: "$85,000",
            client: "TechCorp",
          },
          {
            id: "2", 
            name: "Mobile Banking Revolution",
            description: "Next-generation mobile banking app with biometric security and AI-powered financial advice.",
            startDate: "2024-02-01",
            deadline: "2024-08-15",
            created_by: "admin",
            teamId: "team2",
            progress: 45,
            status: "active",
            priority: "high",
            budget: "$120,000",
            client: "FinanceBank",
          },
          {
            id: "3",
            name: "E-Commerce Transformation",
            description: "Complete digital transformation of e-commerce platform with advanced personalization features.",
            startDate: "2024-01-10",
            deadline: "2024-05-20",
            created_by: "admin",
            teamId: "team1",
            progress: 90,
            status: "completed",
            priority: "medium",
            budget: "$65,000",
            client: "RetailPro",
          }
        ]);
        setTeams([
          {
            id: "team1",
            teamName: "Innovation Squad",
            description: "Cutting-edge technology development team",
            members: ["emp1", "emp2", "emp3"],
            created_by: "admin",
            teamLead: "emp1"
          },
          {
            id: "team2", 
            teamName: "Digital Pioneers",
            description: "Mobile and web application specialists",
            members: ["emp4", "emp5", "emp6"],
            created_by: "admin",
            teamLead: "emp4"
          }
        ]);
        setEmployees([
          { id: "emp1", name: "Sarah Chen", title: "Senior Tech Lead", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
          { id: "emp2", name: "Marcus Johnson", title: "Full Stack Developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" },
          { id: "emp3", name: "Elena Rodriguez", title: "UI/UX Designer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" },
          { id: "emp4", name: "David Kim", title: "Mobile Lead", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
          { id: "emp5", name: "Ashley Turner", title: "Backend Developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ashley" },
          { id: "emp6", name: "Ryan Foster", title: "DevOps Engineer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan" }
        ]);
        toast.error("Using demo data - database connection failed");
      }
    };

    fetchData();
  }, []);

  const getEmployeeName = (id) =>
    employees.find((emp) => emp.id === id)?.name || "Unknown";

  const getTeamName = (id) =>
    teams.find((team) => team.id === id)?.teamName || "Unknown";

  const getTeamData = (id) =>
    teams.find((team) => team.id === id) || {};

  const handleTeamClick = (teamId) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'from-black to-gray-800';
      case 'completed': return 'from-gray-600 to-gray-800';
      case 'paused': return 'from-gray-400 to-gray-600';
      case 'planning': return 'from-gray-300 to-gray-500';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <Flag className="w-4 h-4 text-red-500" />;
      case 'medium': return <Flag className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Flag className="w-4 h-4 text-green-500" />;
      default: return <Flag className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const ProjectCard = ({ project, index }) => {
    const team = getTeamData(project.teamId);
    const isExpanded = expandedTeams.has(project.teamId);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="group relative overflow-hidden"
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(project.status)} opacity-90 rounded-2xl`} />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Card Content */}
        <div className="relative p-6 text-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                  Project #{index + 1}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getPriorityIcon(project.priority)}
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                  <Share className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors">
              {project.name}
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-3 line-clamp-2">
              {project.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-white/70 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{project.startDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{project.deadline}</span>
              </div>
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3" />
                <span>{project.client}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-bold">{project.progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-gray-600 to-gray-400 rounded-full shadow-lg"
              />
            </div>
          </div>

          {/* Team Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium text-sm">Team</span>
              </div>
              <button
                onClick={() => handleTeamClick(project.teamId)}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all"
              >
                <span className="text-sm font-medium">{team.teamName}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Team Members */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white/80">Team Members</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {team.members?.length || 0} members
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {team.members?.map((memberId) => {
                        const member = employees.find(emp => emp.id === memberId);
                        return (
                          <div key={memberId} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                            <img
                              src={member?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId}`}
                              alt={member?.name || 'Member'}
                              className="w-6 h-6 rounded-full border border-white/30"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{member?.name || 'Unknown'}</p>
                              <p className="text-xs text-white/60 truncate">{member?.title || 'Member'}</p>
                            </div>
                            {team.teamLead === memberId && (
                              <Star className="w-3 h-3 text-yellow-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Budget:</span>
              <span className="text-sm font-bold">{project.budget}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                project.status === 'active' ? 'bg-green-100 text-green-700' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                project.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8" />
          <Sparkles className="w-5 h-5 opacity-50" />
        </div>
        <h3 className="text-3xl font-bold mb-1">{value}</h3>
        <p className="text-white/80 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                  Project Galaxy
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Innovative project management dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                {[
                  { id: "grid", icon: Grid, label: "Grid" },
                  { id: "list", icon: List, label: "List" }, 
                  { id: "stats", icon: BarChart3, label: "Stats" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                      viewMode === mode.id
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </button>
            </div>
          </div>

          {/* Enhanced Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, descriptions, or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="planning">Planning</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {viewMode === "stats" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatsCard
              title="Total Projects"
              value={projects.length}
              icon={Briefcase}
              color="from-black to-gray-800"
              subtitle="Across all teams"
            />
            <StatsCard
              title="Active Projects"
              value={projects.filter(p => p.status === 'active').length}
              icon={Zap}
              color="from-gray-600 to-gray-800"
              subtitle="Currently running"
            />
            <StatsCard
              title="Completed"
              value={projects.filter(p => p.status === 'completed').length}
              icon={CheckCircle}
              color="from-gray-400 to-gray-600"
              subtitle="Successfully delivered"
            />
            <StatsCard
              title="Team Performance"
              value="92%"
              icon={Award}
              color="from-gray-300 to-gray-500"
              subtitle="Average success rate"
            />
          </motion.div>
        )}

        {/* Projects Grid/List */}
        <div className={`grid gap-6 ${
          viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" :
          viewMode === "list" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
        }`}>
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedProject.name}
                  </h2>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {selectedProject.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Date:</span>
                        <span className="font-medium">{selectedProject.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Deadline:</span>
                        <span className="font-medium">{selectedProject.deadline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-medium">{selectedProject.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Client:</span>
                        <span className="font-medium">{selectedProject.client}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Team Details</h3>
                    <div className="space-y-3">
                      {getTeamData(selectedProject.teamId).members?.map((memberId) => {
                        const member = employees.find(emp => emp.id === memberId);
                        return (
                          <div key={memberId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img
                              src={member?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId}`}
                              alt={member?.name || 'Member'}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{member?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{member?.title || 'Member'}</p>
                            </div>
                            {getTeamData(selectedProject.teamId).teamLead === memberId && (
                              <Star className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
