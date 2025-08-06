import React, { useEffect, useState } from "react";
import {
  Calendar,
  Card,
  Typography,
  Modal,
  Table,
  Tag,
  Spin,
  Collapse,
  Button,
  Row,
  Col,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar as CalendarIcon,
  Target,
  Award,
  Zap,
  BarChart3,
  Activity,
} from "lucide-react";

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dayTasks, setDayTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    (async function fetchData() {
      setLoading(true);
      try {
        const empSnap = await getDocs(
          query(collection(db, "employees"), where("id", "==", user.uid))
        );
        setEmployee(empSnap.docs[0]?.data());

        const tSnap = await getDocs(
          query(collection(db, "tasks"), where("assigned_to", "==", user.uid))
        );
        const enriched = await Promise.all(
          tSnap.docs.map(async (d) => {
            const t = { id: d.id, ...d.data() } as any;
            if (t.project_id) {
              const ps = await getDoc(doc(db, "projects", t.project_id));
              t.project_name = ps.exists() ? ps.data()?.name : t.project_id;
            }
            if (t.created_by) {
              const es = await getDocs(
                query(
                  collection(db, "employees"),
                  where("id", "==", t.created_by)
                )
              );
              t.assigned_by_name = es.docs[0]?.data()?.name || t.created_by;
            }
            return t;
          })
        );

        const allCommentIds = new Set<string>();
        enriched.forEach((t) =>
          (t.comments || []).forEach((c: any) => allCommentIds.add(c.userId))
        );

        const empAll = await getDocs(collection(db, "employees"));
        const idToName: Record<string, string> = {};
        empAll.forEach((d) => {
          const dt = d.data();
          if (allCommentIds.has(dt.id)) idToName[dt.id] = dt.name;
        });

        const finalTasks = enriched.map((t) => ({
          ...t,
          comments: (t.comments || []).map((c: any) => ({
            ...c,
            userName: idToName[c.userId] || c.userId,
          })),
        }));

        setTasks(finalTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="neon-spinner h-16 w-16"></div>
      </div>
    );
  }

  const total = tasks.length;
  const completedCount = tasks.filter(
    (t) => t.progress_status === "completed"
  ).length;
  const inProgressCount = tasks.filter(
    (t) => t.progress_status === "in_progress"
  ).length;
  const pendingCount = total - completedCount - inProgressCount;

  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const statCards = [
    {
      title: "Total Tasks",
      value: total,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      change: "+12%",
    },
    {
      title: "Completed",
      value: completedCount,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      change: "+8%",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      change: "+3%",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      change: "-5%",
    },
  ];

  const cellRender = (current: Dayjs, info: any) => {
    if (info.type !== 'date') return info.originNode;

    const d = current.format("YYYY-MM-DD");
    const list = tasks.filter((t) => t.due_date?.startsWith(d));
    if (!list.length) return info.originNode;

    return (
      <div className="ant-picker-cell-inner ant-picker-calendar-date">
        <div className="ant-picker-calendar-date-value">{current.date()}</div>
        <div className="ant-picker-calendar-date-content">
          <div className="space-y-1">
            {list.slice(0, 3).map((task) => {
              const isOverdue =
                task.progress_status === "pending" &&
                dayjs(task.due_date).isBefore(dayjs(), "day");
              let icon = "⏳";
              if (task.progress_status === "completed") icon = "✅";
              else if (task.progress_status === "in_progress") icon = "🔄";
              else if (isOverdue) icon = "❌";

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedDate(d);
                    setDayTasks(tasks.filter((t) => t.due_date?.startsWith(d)));
                    setModalVisible(true);
                  }}
                  className="cursor-pointer text-xs whitespace-nowrap hover:underline p-1 rounded bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                >
                  <span className="mr-1">{icon}</span>
                  <span className="font-medium">{task.task_id}</span>
                </div>
              );
            })}
            {list.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{list.length - 3} more
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const onSelect = (value: Dayjs) => {
    const dateString = value.format("YYYY-MM-DD");
    setSelectedDate(dateString);
    setDayTasks(tasks.filter((t) => t.due_date?.startsWith(dateString)));
    setModalVisible(true);
  };

  const columns = [
    { title: "Task ID", dataIndex: "task_id", key: "task_id" },
    { title: "Task", dataIndex: "title", key: "title" },
    { title: "Project", dataIndex: "project_name", key: "project_name" },
    {
      title: "Status",
      dataIndex: "progress_status",
      key: "progress_status",
      render: (s: string) => (
        <Tag
          className={`${
            s === "completed" ? "status-completed" :
            s === "in_progress" ? "status-progress" : "status-pending"
          }`}
        >
          {s?.replace('_', ' ').toUpperCase() || 'PENDING'}
        </Tag>
      ),
    },
    { title: "Due Date", dataIndex: "due_date", key: "due_date" },
    {
      title: "Assigned By",
      dataIndex: "assigned_by_name",
      key: "assigned_by_name",
    },
  ];

  const today = dayjs();
  const upcoming = tasks.filter(
    (t) =>
      t.progress_status !== "completed" &&
      dayjs(t.due_date).isAfter(today.subtract(1, "day")) &&
      dayjs(t.due_date).isBefore(today.add(4, "day"))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your project overview for today
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg"
          >
            <Award className="h-5 w-5" />
            <span className="font-semibold">{completionRate}% Complete</span>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="liquid-glass-stats relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500 font-medium">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center mb-4">
              <Zap className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/mytasks')}
                className="w-full p-3 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
              >
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    View My Tasks
                  </span>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/calendar')}
                className="w-full p-3 text-left bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-all cursor-pointer"
              >
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Check Calendar
                  </span>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/Performance')}
                className="w-full p-3 text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
              >
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-500 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    View Performance
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 liquid-glass-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-orange-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upcoming Due Tasks
                </h3>
              </div>
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                {upcoming.length} tasks
              </span>
            </div>
            {upcoming.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {upcoming.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {task.task_id} - {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Due: {dayjs(task.due_date).format("MMM DD, YYYY")}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.progress_status === "in_progress" 
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      }`}>
                        {task.progress_status || "pending"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No upcoming due tasks. Great job! 🎉
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Enhanced Task Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-2 bg-gradient-to-r from-cyan-500 to-orange-500 dark:from-purple-500 dark:to-purple-600 rounded-xl mr-3"
              >
                <CalendarIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-orange-500 to-cyan-600 dark:from-purple-400 dark:via-purple-500 dark:to-purple-600 bg-clip-text text-transparent">
                  Task Calendar Board
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your deadlines and schedule
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                {tasks.length} tasks
              </span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border-2 border-cyan-200 dark:border-purple-500/30 shadow-lg">
            <div className="bg-gradient-to-r from-cyan-100 to-orange-100 dark:from-purple-900/50 dark:to-purple-800/50 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {dayjs().format("MMMM YYYY")} Overview
                </h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">In Progress</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-700 dark:text-gray-300">Overdue</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="calendar-enhanced">
              <Calendar
                fullscreen
                onSelect={onSelect}
                cellRender={cellRender}
                className="calendar-custom bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          {/* Calendar Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl border border-cyan-200 dark:border-purple-500/30"
            >
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {tasks.filter(t => t.progress_status === "completed").length}
              </div>
              <div className="text-sm text-cyan-700 dark:text-cyan-300">Completed</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl border border-orange-200 dark:border-purple-500/30"
            >
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {tasks.filter(t => t.progress_status === "in_progress").length}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">In Progress</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl border border-red-200 dark:border-purple-500/30"
            >
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {tasks.filter(t => {
                  if (!t.due_date) return false;
                  const dueDate = t.due_date.toDate ? t.due_date.toDate() : new Date(t.due_date);
                  return new Date() > dueDate && t.progress_status !== "completed";
                }).length}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Overdue</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {modalVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-backdrop"
              onClick={() => setModalVisible(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="modal-content w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tasks on {dayjs(selectedDate).format("MMMM DD, YYYY")}
                  </h2>
                  <button
                    onClick={() => setModalVisible(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <Table
                  dataSource={dayTasks}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  className="mb-6"
                />

                <Collapse accordion className="mt-4">
                  {dayTasks.map((t) => (
                    <Panel
                      header={
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {t.task_id} – {t.title}
                          </span>
                          <Tag className={`${
                            t.progress_status === "completed" ? "status-completed" :
                            t.progress_status === "in_progress" ? "status-progress" : "status-pending"
                          }`}>
                            {t.progress_status || "pending"}
                          </Tag>
                        </div>
                      }
                      key={t.id}
                    >
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Description
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {t.description || "No description provided"}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Comments
                          </h4>
                          {(t.comments || []).length > 0 ? (
                            <div className="space-y-2">
                              {t.comments.map((c: any, i: number) => (
                                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <p className="text-gray-700 dark:text-gray-300">{c.text}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    by {c.userName}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">No comments</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Additional Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Attachments</p>
                              <p className="text-gray-900 dark:text-white">
                                {(t.attachments || []).join(", ") || "None"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Manager Feedback</p>
                              <p className="text-gray-900 dark:text-white">
                                {t.manager_review || "None"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
