import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
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
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const enabledDark = storedTheme === "dark" || (!storedTheme && prefersDark);

    setIsDarkMode(enabledDark);
    document.documentElement.classList.toggle("dark", enabledDark);
  }, []);

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
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
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
    <div className="min-h-screen h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Minimal Sidebar */}
      <div className={`${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-[194px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out flex flex-col`}>

        {/* Minimal Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="relative workspace-dropdown">
            <button
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 py-1"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Enkonix Tas</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {workspaceOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 p-2">
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Workspaces</div>
                  <button
                    onClick={() => setWorkspaceOpen(false)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Enkonix Tas</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setWorkspaceOpen(false)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Personal</span>
                    </div>
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => setWorkspaceOpen(false)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"
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

        {/* Search - Minimal */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation - Hierarchical */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <nav className="space-y-1">

            {/* Dashboard Section */}
            <div>
              <button
                onClick={() => toggleSection('dashboard')}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-3 h-3" />
                  Dashboard
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.dashboard ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              {expandedSections.dashboard && (
                <div className="ml-5 mt-1 space-y-1">
                  <Link
                    to="/"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Grid3X3 className="w-3 h-3" />
                    Overview
                  </Link>
                  <Link
                    to="/PerformMatrix"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/PerformMatrix")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    Performance
                  </Link>
                  <Link
                    to="/KanbanPage"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/KanbanPage")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <CheckSquare className="w-3 h-3" />
                    Kanban Board
                  </Link>
                  <Link
                    to="/Analytics"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/Analytics")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <BarChart3 className="w-3 h-3" />
                    Analytics
                  </Link>
                  <Link
                    to="/Reports"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/Reports")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    Reports
                  </Link>
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div>
              <button
                onClick={() => toggleSection('projects')}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3" />
                  Projects
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedSections.projects ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              {expandedSections.projects && (
                <div className="ml-5 mt-1 space-y-1">
                  <Link
                    to="/ProjectTasksViewer"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/ProjectTasksViewer")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    Project Tasks
                  </Link>
                  <Link
                    to="/ProjectDashboard"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/ProjectDashboard")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Briefcase className="w-3 h-3" />
                    Project Dashboard
                  </Link>
                  <Link
                    to="/ProjectDocCreator"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/ProjectDocCreator")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    Document Creator
                  </Link>
                </div>
              )}
            </div>

            {/* Tickets Section */}
            <div>
              <button
                onClick={() => toggleSection('tickets')}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3 h-3" />
                  Tickets
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform ${expandedSections.tickets ? 'rotate-90' : 'rotate-0'}`} />
              </button>
              {expandedSections.tickets && (
                <div className="ml-5 mt-1 space-y-1">
                  <Link
                    to="/RaiseProjectTicket"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/RaiseProjectTicket")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    Raise Ticket
                  </Link>
                  <Link
                    to="/ViewTickets"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/ViewTickets")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <CheckSquare className="w-3 h-3" />
                    View Tickets
                  </Link>
                </div>
              )}
            </div>

            {/* Administration Section */}
            <div>
              <button
                onClick={() => toggleSection('administration')}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Administration
                </div>
                <ChevronRight className={`w-3 h-3 transition-transform ${expandedSections.administration ? 'rotate-90' : 'rotate-0'}`} />
              </button>
              {expandedSections.administration && (
                <div className="ml-5 mt-1 space-y-1">
                  <Link
                    to="/AddUsers"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/AddUsers")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <UserPlus className="w-3 h-3" />
                    Add Users
                  </Link>
                  <Link
                    to="/Makeleader"
                    onClick={closeSidebar}
                    className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
                      isActive("/Makeleader")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <Users className="w-3 h-3" />
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
                className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${
                  isActive("/MyTasks")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Clock className="w-3 h-3" />
                My Tasks
              </Link>
              <Link
                to="/calendar"
                onClick={closeSidebar}
                className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${
                  isActive("/calendar")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Calendar className="w-3 h-3" />
                Calendar
              </Link>
              <Link
                to="/settings"
                onClick={closeSidebar}
                className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${
                  isActive("/settings")
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Settings className="w-3 h-3" />
                Settings
              </Link>
            </div>
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-2">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1.5">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              CE
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                ceo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                localhost:5173/ProjectDashboard
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3 text-gray-500 dark:text-gray-400" />
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
        {/* Minimal Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
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
                  className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 py-1"
                >
                  <span>Project Board [2023]</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {projectOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 p-2">
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Recent Projects</div>
                      <button
                        onClick={() => setProjectOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        📋 Project Board [2023]
                      </button>
                      <button
                        onClick={() => setProjectOpen(false)}
                        className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        🚀 Product Launch Q4
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
                  className="pl-6 pr-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-32"
                />
              </div>

              <div className="relative filter-dropdown">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Filter className="w-3 h-3" />
                  Filter
                  <ChevronDown className="w-3 h-3" />
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
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Sort
                  <ChevronDown className="w-3 h-3" />
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
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                title="Copy project link"
              >
                Share
              </button>

             
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="h-full"
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
