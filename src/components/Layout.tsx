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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function Layout() {
  const { signOut, user } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    projects: true,
    dashboard: true,
    tickets: false,
    admin: false,
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

  const menuSections = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      items: [
        { path: "/", icon: LayoutDashboard, label: "Overview" },
        { path: "/PerformMatrix", icon: BarChart3, label: "Performance" },
        { path: "/KanbanPage", icon: CheckSquare, label: "Kanban Board" },
        { path: "/Analytics", icon: BarChart3, label: "Analytics" },
        { path: "/Reports", icon: FileText, label: "Reports" },
      ]
    },
    {
      id: "projects",
      title: "Projects",
      icon: Briefcase,
      items: [
        { path: "/ProjectTasksViewer", icon: FileText, label: "Project Tasks" },
        { path: "/ProjectDashboard", icon: Briefcase, label: "Project Dashboard" },
        { path: "/ProjectDocCreator", icon: FileText, label: "Document Creator" },
      ]
    },
    {
      id: "tickets",
      title: "Tickets",
      icon: CheckSquare,
      items: [
        { path: "/RaiseProjectTicket", icon: Plus, label: "Raise Ticket" },
        { path: "/ViewTickets", icon: CheckSquare, label: "View Tickets" },
      ]
    },
    {
      id: "admin",
      title: "Administration",
      icon: Shield,
      items: [
        { path: "/AddUsers", icon: UserPlus, label: "Add Users" },
        { path: "/Makeleader", icon: Users, label: "Make Team Lead" },
      ]
    }
  ];

  const standaloneItems = [
    { path: "/MyTasks", icon: Clock, label: "My Tasks" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out flex flex-col`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            
            <span className="font-semibold text-gray-900 dark:text-gray-100">Enkonix Tas</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-2">
            {menuSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-4 h-4" />
                    {section.title}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      expandedSections[section.id as keyof typeof expandedSections] ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {expandedSections[section.id as keyof typeof expandedSections] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeSidebar}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive(item.path)
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              {standaloneItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Upgrade Section */}
          
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                user?.email || "User"
              )}`}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden md:flex items-center gap-2">
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden sm:block relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative">
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    user?.email || "User"
                  )}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-gray-200 dark:ring-gray-600"
                />
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
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
