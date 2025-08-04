import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Search,
  Bell,
  Plus,
  Star,
  MoreHorizontal,
  ChevronRight,
  Folder,
  FileText,
  UserPlus,
  Shield,
  BarChart3,
  Clock,
  Filter,
  ArrowUpDown,
  Grid3X3,
  TrendingUp,
  Target,
  Activity,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function Layout() {
  const { signOut, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    dashboard: true,
    projects: false,
    tickets: false,
    administration: false,
  });

  useEffect(() => {
    // Apply theme from store
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as Element;

      if (filterOpen && !target.closest('.filter-dropdown')) {
        setFilterOpen(false);
      }
      if (sortOpen && !target.closest('.sort-dropdown')) {
        setSortOpen(false);
      }
      if (workspaceOpen && !target.closest('.workspace-dropdown')) {
        setWorkspaceOpen(false);
      }
      if (projectOpen && !target.closest('.project-dropdown')) {
        setProjectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen, sortOpen, workspaceOpen, projectOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const isActive = (path: string) => location.pathname === path;
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };



  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-[#0f1129] dark:via-[#1a1b3a] dark:to-[#2d1b69] flex overflow-hidden">
      {/* Compact Sidebar */}
      <div className={`${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-[200px] lg:w-[220px] bg-white/95 dark:bg-gradient-to-b dark:from-[rgba(15,17,41,0.98)] dark:to-[rgba(26,27,58,0.95)] backdrop-blur-xl border-r border-gray-200 dark:border-purple-500/20 shadow-2xl dark:shadow-purple-500/20 transition-all duration-300 ease-in-out flex flex-col`}>

        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-purple-500/30 bg-gradient-to-r from-white to-gray-50 dark:from-[rgba(15,17,41,0.9)] dark:to-[rgba(35,36,71,0.8)]">
          <div className="relative workspace-dropdown">
            <button
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-purple-500/20 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-md dark:hover:shadow-purple-500/20"
            >
              <span className="text-base font-semibold text-gray-900 dark:text-purple-200">Task Board</span>
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-purple-300" />
            </button>
            {workspaceOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-gradient-to-b dark:from-[rgba(15,17,41,0.95)] dark:to-[rgba(26,27,58,0.9)] border border-gray-200 dark:border-purple-500/30 rounded-lg shadow-xl dark:shadow-purple-500/30 backdrop-blur-xl z-10 p-2">
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-purple-200">Workspaces</div>
                  <button
                    onClick={() => setWorkspaceOpen(false)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-purple-500/20 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="dark:text-purple-100">Task Board</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setWorkspaceOpen(false)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-purple-500/20 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="dark:text-purple-100">Personal</span>
                    </div>
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-purple-500/30" />
                  <button
                    onClick={() => setWorkspaceOpen(false)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-purple-500/20 rounded text-blue-600 dark:text-purple-300"
                  >
                    + Create workspace
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search - Compact */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent shadow-sm dark:shadow-purple-500/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Navigation - Compact */}
        <div className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar">
          <nav className="space-y-1">

            {/* Dashboard Section */}
            <div>
              <button
                onClick={() => toggleSection('dashboard')}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-500/20 rounded-lg transition-all duration-200 hover:shadow-sm dark:hover:shadow-purple-500/20"
              >
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-3 h-3" />
                  Dashboard
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.dashboard ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              {expandedSections.dashboard && (
                <div className="ml-4 mt-1 space-y-0.5">
                  <Link
                    to="/"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/")
                        ? "bg-purple-50 dark:bg-purple-500/30 text-purple-700 dark:text-purple-200 font-medium shadow-sm dark:shadow-purple-500/20"
                        : "text-gray-600 dark:text-purple-300 hover:bg-gray-100 dark:hover:bg-purple-500/15 hover:text-gray-900 dark:hover:text-purple-200"
                    }`}
                  >
                    <Grid3X3 className="w-3 h-3" />
                    Overview
                  </Link>
                  <Link
                    to="/PerformMatrix"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/PerformMatrix")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Performance
                  </Link>
                  <Link
                    to="/KanbanPage"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/KanbanPage")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    Kanban Board
                  </Link>
                  <Link
                    to="/Analytics"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/Analytics")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Link>
                  <Link
                    to="/Reports"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/Reports")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Reports
                  </Link>
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div>
              <button
                onClick={() => toggleSection('projects')}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Projects
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.projects ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              {expandedSections.projects && (
                <div className="ml-5 mt-1 space-y-1">
                  <Link
                    to="/ProjectTasksViewer"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/ProjectTasksViewer")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Project Tasks
                  </Link>
                  <Link
                    to="/ProjectDashboard"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/ProjectDashboard")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Project Dashboard
                  </Link>
                  <Link
                    to="/ProjectDocCreator"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/ProjectDocCreator")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Document Creator
                  </Link>
                </div>
              )}
            </div>

            {/* Tickets Section */}
            <div>
              <button
                onClick={() => toggleSection('tickets')}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Tickets
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform ${expandedSections.tickets ? 'rotate-90' : 'rotate-0'}`} />
              </button>
              {expandedSections.tickets && (
                <div className="ml-5 mt-1 space-y-1">
                  <Link
                    to="/RaiseProjectTicket"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/RaiseProjectTicket")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Raise Ticket
                  </Link>
                  <Link
                    to="/ViewTickets"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/ViewTickets")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    View Tickets
                  </Link>
                </div>
              )}
            </div>

            {/* Administration Section */}
            <div>
              <button
                onClick={() => toggleSection('administration')}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Administration
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform ${expandedSections.administration ? 'rotate-90' : 'rotate-0'}`} />
              </button>
              {expandedSections.administration && (
                <div className="ml-5 mt-1 space-y-1">
                  <Link
                    to="/AddUsers"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/AddUsers")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Users
                  </Link>
                  <Link
                    to="/Makeleader"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 hover:shadow-sm ${
                      isActive("/Makeleader")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Make Team Lead
                  </Link>
                </div>
              )}
            </div>

            {/* Standalone Items */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/MyTasks"
                onClick={closeSidebar}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isActive("/MyTasks")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Clock className="w-4 h-4" />
                My Tasks
              </Link>
              <Link
                to="/calendar"
                onClick={closeSidebar}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isActive("/calendar")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </Link>
              <Link
                to="/settings"
                onClick={closeSidebar}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isActive("/settings")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-purple-500/30 px-2 py-2 bg-gradient-to-r from-gray-50 to-white dark:from-[rgba(15,17,41,0.8)] dark:to-[rgba(35,36,71,0.6)]">
          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-[rgba(139,92,246,0.1)] dark:to-[rgba(59,130,246,0.1)] rounded-lg px-2 py-1.5 shadow-sm dark:shadow-purple-500/20 border dark:border-purple-500/20">
            <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-purple-200">
                Admin
              </p>
              <p className="text-xs text-gray-500 dark:text-purple-300/70 truncate">
                Project Manager
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-purple-500/20"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3 text-gray-500 dark:text-purple-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Top Header */}
        <header className="bg-stone-100/95 dark:bg-gradient-to-r dark:from-[rgba(15,17,41,0.95)] dark:to-[rgba(26,27,58,0.9)] backdrop-blur-xl border-b border-stone-200 dark:border-purple-500/30 px-4 py-2 shadow-lg dark:shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="relative project-dropdown">
                <button
                  onClick={() => setProjectOpen(!projectOpen)}
                  className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1.5 transition-all duration-200 hover:shadow-sm"
                >
                  <span>Project Board </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {projectOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 p-2">
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Recent Projects</div>
                      <button
                        onClick={() => setProjectOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        📋 Project Board
                      </button>
                      <button
                        onClick={() => setProjectOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        ���� Product Launch Q4
                      </button>
                      <button
                        onClick={() => setProjectOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        💼 Client Portal
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => setProjectOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"
                      >
                        + Create project
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded">On track</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Minimal Search */}
              <div className="hidden sm:block relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-6 pr-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-36 shadow-sm transition-all duration-200"
                />
              </div>

              <div className="relative filter-dropdown">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  <ChevronDown className="w-4 h-4" />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Completed</option>
                          <option>On Hold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Assignee
                        </label>
                        <select className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option>All Members</option>
                          <option>Me</option>
                          <option>Team Lead</option>
                          <option>Unassigned</option>
                        </select>
                      </div>
                      <div className="flex justify-between pt-2">
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative sort-dropdown">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                  <ChevronDown className="w-4 h-4" />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 p-2">
                    <div className="space-y-1">
                      <button
                        onClick={() => setSortOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Date Created
                      </button>
                      <button
                        onClick={() => setSortOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Due Date
                      </button>
                      <button
                        onClick={() => setSortOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Priority
                      </button>
                      <button
                        onClick={() => setSortOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        Alphabetical
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // You could add a toast notification here
                }}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                title="Copy project link"
              >
                Share
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-200 hover:shadow-md"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col min-h-0 bg-stone-50/50 dark:bg-gradient-to-br dark:from-[rgba(15,17,41,0.4)] dark:via-[rgba(26,27,58,0.3)] dark:to-[rgba(35,36,71,0.2)] m-2 rounded-xl shadow-xl dark:shadow-purple-500/10 backdrop-blur-sm border dark:border-purple-500/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex-1 min-h-0 overflow-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default Layout;
