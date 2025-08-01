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
  };

  const getEmployeeName = (empId: string) =>
    employees.find((emp: any) => emp.id === empId)?.name || "Unassigned";

  const columns = [
    {
      id: "backlog",
      title: "Backlog",
      count: 4,
      tasks: tasks.filter((t: any) => t.status === "pending").slice(0, 4),
    },
    {
      id: "in_progress", 
      title: "In progress",
      count: 3,
      tasks: tasks.filter((t: any) => t.status === "in_progress").slice(0, 3),
    },
    {
      id: "qa",
      title: "QA",
      count: 4,
      tasks: tasks.filter((t: any) => t.status === "review" || t.status === "testing").slice(0, 4),
    },
  ];

  const TaskCard = ({ task }: { task: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2 mb-2 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
          {task.title || "Contact customers with failed new payments or who churned"}
        </h4>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex items-center gap-1 mb-2">
        <span className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
          design
        </span>
        {task.priority === "high" && (
          <span className="px-1 py-0.5 text-xs bg-red-100 text-red-600 rounded">
            bug
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              getEmployeeName(task.assigned_to) || "User"
            )}`}
            alt="avatar"
            className="w-4 h-4 rounded-full"
          />
          <span>{getEmployeeName(task.assigned_to)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{task.due_date || "Aug 6"}</span>
          <Circle className="w-2 h-2" />
          <span>2</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-3">
      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {column.title}
                </h2>
                <span className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  {column.count}
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Content */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {column.tasks.map((task: any, index: number) => (
                <TaskCard key={task.id || index} task={task} />
              ))}
              
              {/* Sample cards when no tasks */}
              {column.tasks.length === 0 && (
                <>
                  <TaskCard task={{
                    title: column.id === "backlog" 
                      ? "Contact customers with failed new payments or who churned"
                      : column.id === "in_progress"
                      ? "Lead feedback sessions"
                      : "Invoices: fixed-fee projects",
                    assigned_to: "user1",
                    due_date: "Aug 6",
                    priority: column.id === "backlog" ? "high" : "normal"
                  }} />
                  
                  <TaskCard task={{
                    title: column.id === "backlog"
                      ? "Reporting: Design concept of visual dashboard"
                      : column.id === "in_progress" 
                      ? "Add Projects to templates and layouts [2023]"
                      : "Time search - not last response with results appears",
                    assigned_to: "user2", 
                    due_date: "Sep 2",
                    priority: "normal"
                  }} />
                  
                  {column.id !== "in_progress" && (
                    <TaskCard task={{
                      title: column.id === "backlog"
                        ? "Task detail modal: Ideas"
                        : "Pricing page: new iteration and few mockups and ideas",
                      assigned_to: "user3",
                      due_date: column.id === "backlog" ? "Aug 6" : "Nov 3",
                      priority: "normal"
                    }} />
                  )}
                  
                  {column.id === "backlog" && (
                    <TaskCard task={{
                      title: "@dev QA: regression ( before/after release)",
                      assigned_to: "user4",
                      due_date: "Sep 2",
                      priority: "normal"
                    }} />
                  )}
                </>
              )}

              {/* Add Task Button */}
              <button className="w-full flex items-center gap-2 p-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <Plus className="w-3 h-3" />
                Add task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
