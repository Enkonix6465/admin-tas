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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen, sortOpen]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const isActive = (path: string) => location.pathname === path;
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/KanbanPage", icon: CheckSquare, label: "Board" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/ProjectDashboard", icon: Briefcase, label: "Projects" },
    { path: "/MyTasks", icon: Clock, label: "My Tasks" },
    { path: "/Analytics", icon: BarChart3, label: "Analytics" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Minimal Sidebar */}
      <div className={`${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out flex flex-col`}>

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

        {/* Navigation - Minimal */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <item.icon className="w-3 h-3" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Profile - Minimal */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-1">
          <div className="flex items-center gap-2">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                user?.email || "User"
              )}`}
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.email?.split("@")[0] || "User"}
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

              <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                Share
              </button>

              <div className="flex items-center gap-1">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user?.email || "User"
                  )}`}
                  alt="avatar"
                  className="w-5 h-5 rounded-full"
                />
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=User2`}
                  alt="avatar"
                  className="w-5 h-5 rounded-full -ml-1"
                />
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=User3`}
                  alt="avatar"
                  className="w-5 h-5 rounded-full -ml-1"
                />
              </div>
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
