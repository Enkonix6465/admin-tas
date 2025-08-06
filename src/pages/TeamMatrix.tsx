import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  // ... other imports if needed
} from "firebase/firestore";

import { db } from "../lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useAuthStore } from "../store/authStore";
const CustomTooltip = ({ performanceData, children }) => {
  const [show, setShow] = useState(false);

  console.log("Tooltip performanceData:", performanceData); // Debugging

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-[320px] whitespace-pre-line text-sm p-4 bg-white border border-gray-200 rounded-xl shadow-xl">
          <div className="font-semibold mb-2">
            ⭐️ Performance Score Breakdown
          </div>
          <div className="space-y-1 text-gray-800">
            <p>
              🟦 <strong>Productivity Score:</strong>{" "}
              {performanceData?.productivityScore ?? "0"} / 100
            </p>
            <p>
              🟩 <strong>Completion Rate:</strong>{" "}
              {performanceData?.completionRate?.toFixed(1) ?? "0.0"}% / 100%
            </p>
            <p>
              🟨 <strong>On-Time Delivery:</strong>{" "}
              {performanceData?.onTimeRate?.toFixed(1) ?? "0.0"}% / 100%
            </p>
            <p>
              🟪 <strong>Review Score:</strong>{" "}
              {performanceData?.reviewScore ?? "0"} / 100
            </p>
            <p>
              🔵 <strong>HR Score:</strong>{" "}
              {performanceData?.hrFeedbackScore !== undefined
                ? Number(performanceData.hrFeedbackScore).toFixed(1)
                : "0.0"}{" "}
              / 100
            </p>
          </div>
          <hr className="my-2" />
          <p className="font-bold text-gray-900">
            🏁 Final Score: {performanceData?.totalPerformanceScore ?? "0"}% /
            100%
          </p>
        </div>
      )}
    </div>
  );
};
export default function EmployeePerformancePage() {
  const { user } = useAuthStore(); // ✅ Move this here

  const [tasks, setTasks] = useState([]);
  //const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [groupedEmployees, setGroupedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noTeam, setNoTeam] = useState(false);
  const [teamTasks, setTeamTasks] = useState({});

  //const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [performanceData, setPerformanceData] = useState({});
  const [monthChartData, setMonthChartData] = useState([]);
  const [dateChartData, setDateChartData] = useState([]);
  console.log("👤 Current user from store:", user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔥 useEffect triggered");
        console.log("👤 Current user:", user);

        if (!user?.uid) {
          console.warn("⚠️ User UID not available yet");
          setLoading(false);
          return;
        }

        const teamsSnap = await getDocs(
          query(collection(db, "teams"), where("created_by", "==", user.uid))
        );

        if (teamsSnap.empty) {
          console.warn("❌ No teams found for this user");
          setEmployees([]);
          setGroupedEmployees([]);
          setNoTeam(true); // 👈
          setLoading(false); // 👈
          return;
        }

        const empSnap = await getDocs(collection(db, "employees"));
        const allEmployees = empSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const grouped = teamsSnap.docs.map((teamDoc) => {
          const teamData = teamDoc.data();
          const memberIds = teamData.members || [];

          const members = allEmployees.filter((emp) =>
            memberIds.includes(emp.id)
          );

          const lead = allEmployees.find(
            (emp) => emp.id === teamData.created_by
          );

          return {
            teamId: teamDoc.id,
            teamName: teamData.teamName || "Unnamed Team",
            teamLead: lead?.name || "Unknown Lead",
            members,
          };
        });

        setGroupedEmployees(grouped);
        // 🔢 Fetch task count per team
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const allTasks = tasksSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const taskCounts = {};

        grouped.forEach((team) => {
          const taskCount = allTasks.filter(
            (task) => task.teamId === team.teamId
          ).length;
          taskCounts[team.teamId] = taskCount;
        });

        setTeamTasks(taskCounts);

        const flatEmployees = grouped.flatMap((g) => g.members);
        setEmployees(allEmployees); // 🔁 Use full list for lookups

        const taskSnap = await getDocs(collection(db, "tasks"));
        const tasksData = taskSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTasks(tasksData);
      } catch (error) {
        console.error("❌ Error loading data", error);
      } finally {
        setLoading(false); // 👈 Ensure it ends
      }
    };

    fetchData();
  }, [user?.uid]);

  useEffect(() => {
    if (!selectedEmployee || tasks.length === 0) return;

    const empTasks = tasks.filter(
      (task) => task.assigned_to === selectedEmployee.id
    );

    const perf = {
      total: empTasks.length,
      completed: 0,
      onTime: 0,
      reassigned: 0,
    };

    const dateMap = {};
    const monthMap = {};

    empTasks.forEach((task) => {
      const {
        progress_status,
        due_date,
        progress_updated_at,
        reassign_history = [],
      } = task;

      const completeDate = progress_updated_at?.toDate?.() || new Date();
      const dateKey = completeDate.toISOString().split("T")[0];
      const monthKey = completeDate.toISOString().slice(0, 7);

      if (!monthMap[monthKey])
        monthMap[monthKey] = { Completed: 0, Reassigned: 0 };
      if (!dateMap[dateKey]) dateMap[dateKey] = { Completed: 0, Reassigned: 0 };

      if (progress_status === "completed") {
        perf.completed++;

        const due = new Date(due_date);
        if (completeDate <= due) {
          perf.onTime++;
        }

        dateMap[dateKey].Completed++;
        monthMap[monthKey].Completed++;
      }

      if (reassign_history.length > 0) {
        const count = reassign_history.length;
        perf.reassigned += count;
        dateMap[dateKey].Reassigned += count;
        monthMap[monthKey].Reassigned += count;
      }
    });

    const completionRate = (perf.completed / perf.total) * 100 || 0;
    const onTimeRate =
      perf.completed > 0 ? (perf.onTime / perf.completed) * 100 : 0;

    const team = groupedEmployees.find((g) =>
      g.members.some((m) => m.id === selectedEmployee.id)
    );

    const peerMembers =
      team?.members?.filter((m) => m.id !== selectedEmployee.id) || [];
    const peerTasks = tasks.filter((t) =>
      peerMembers.some((m) => m.id === t.assigned_to)
    );

    const avgWorkload =
      peerMembers.length > 0 ? peerTasks.length / peerMembers.length : 0;

    let penalty = perf.reassigned * 0.5; // 🔁 Each reassigned task deducts 0.5%

    // 👇 Move reviewScore calculation here
    const empReviews = empTasks
      .map((t) => t.reviewpoints)
      .filter((p) => typeof p === "number");

    const avgReviewScore =
      empReviews.length > 0
        ? empReviews.reduce((a, b) => a + b, 0) / empReviews.length
        : 0;

    // 👇 Move productivity calculation here
    const empProductivity = empTasks
      .map((task) => {
        const assignedAt = task.created_at?.toDate?.();
        const dueAt = new Date(task.due_date);
        const completedAt = task.progress_updated_at?.toDate?.();

        if (!assignedAt || !dueAt || !completedAt) return null;

        const totalTime = dueAt.getTime() - assignedAt.getTime();
        const timeLeft = dueAt.getTime() - completedAt.getTime();
        const timeOverdue = completedAt.getTime() - dueAt.getTime();

        if (completedAt <= dueAt) {
          const leftRatio = timeLeft / totalTime;
          if (leftRatio >= 0.5) return 100;
          if (leftRatio >= 0 && leftRatio < 0.1) return 70;
          return 60;
        } else {
          const overdueRatio = timeOverdue / totalTime;
          if (overdueRatio <= 0.1) return 50;
          if (overdueRatio <= 0.5) return 30;
          return 10;
        }
      })
      .filter((s) => s !== null);

    const avgProductivityScore =
      empProductivity.length > 0
        ? empProductivity.reduce((a, b) => a + b, 0) / empProductivity.length
        : 0;

    // ✅ Now safe to use these in score calculation
    const fetchHRFeedbackAndCalculate = async () => {
      const empId = selectedEmployee.id;
      const today = new Date();
      const dateKey = today.toISOString().split("T")[0]; // YYYY-MM-DD
      const feedbackDocId = `${empId}_${dateKey}`;

      let hrFeedbackScore = 0;

      try {
        const hrDocRef = doc(db, "HR_feedback", feedbackDocId);
        const hrDocSnap = await getDoc(hrDocRef);
        if (hrDocSnap.exists()) {
          const data = hrDocSnap.data();
          if (typeof data.score === "number") {
            hrFeedbackScore = data.score;
          }
        }
      } catch (error) {
        console.error("Failed to fetch HR feedback:", error);
      }

      const hrWeighted = hrFeedbackScore * 0.1;

      const totalPerformanceScore = Math.max(
        (
          avgProductivityScore * 0.2 +
          completionRate * 0.25 +
          onTimeRate * 0.25 +
          avgReviewScore * 0.2 +
          hrWeighted
        ).toFixed(2),
        0
      );

      setPerformanceData({
        ...perf,
        completionRate,
        onTimeRate,
        workloadComparison: {
          employee: perf.total,
          average: avgWorkload.toFixed(1),
        },
        reviewScore: avgReviewScore.toFixed(1),
        productivityScore: avgProductivityScore.toFixed(1),
        hrFeedbackScore: hrFeedbackScore.toFixed(1), // important for tooltip
        totalPerformanceScore,
      });

      const dateData = Object.entries(dateMap).map(([date, val]) => ({
        date,
        ...val,
      }));

      const monthData = Object.entries(monthMap).map(([month, val]) => ({
        month,
        ...val,
      }));

      setDateChartData(dateData);
      setMonthChartData(monthData);
    };

    fetchHRFeedbackAndCalculate();
  }, [selectedEmployee, tasks, groupedEmployees]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="text-gray-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (noTeam) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg font-semibold">
          You are not a team leader.
        </p>
      </div>
    );
  }
  const SummaryCard = ({ label, value, color = "blue", tooltip }) => {
    const colorMap = {
      blue: "text-blue-600",
      green: "text-green-600",
      yellow: "text-yellow-600",
    };

    return (
      <div className="relative group">
        <div className="bg-gray-50 rounded-md shadow-inner p-4 border cursor-default">
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-xl font-bold ${colorMap[color]}`}>{value}</p>
        </div>
        {tooltip && (
          <div className="absolute z-10 hidden group-hover:block bg-white border shadow rounded p-2 text-xs text-gray-600 w-64 mt-1">
            {tooltip}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Employee List */}
      <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto h-[85vh]">
        <h2 className="text-lg font-bold text-blue-800 mb-3">Employees</h2>
        <div className="space-y-4">
          {groupedEmployees.map((team) => (
            <div key={team.teamId}>
              <h3 className="text-sm font-semibold text-blue-600 mb-1">
                {team.teamName}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Lead: {team.teamLead}
              </p>

              <ul className="space-y-1">
                {team.members.map((emp) => (
                  <li
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-2 rounded cursor-pointer border ${
                      selectedEmployee?.id === emp.id
                        ? "bg-blue-100 border-blue-500"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-800">
                      {emp.name}
                    </p>
                    <p className="text-xs text-gray-500">{emp.department}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      <div className="col-span-1 md:col-span-3 bg-white rounded-lg shadow p-6 space-y-6">
        {selectedEmployee ? (
          <>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedEmployee.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedEmployee.department}
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard
                label="Tasks Assigned"
                value={performanceData.total}
                tooltip="Total number of tasks assigned to this employee."
              />
              <SummaryCard
                label="Tasks Completed"
                value={performanceData.completed}
                color="green"
                tooltip="Total tasks marked as completed by the employee."
              />
              <SummaryCard
                label="Reassigned"
                value={performanceData.reassigned}
                color="yellow"
                tooltip="Total times tasks were reassigned from or to this employee."
              />
              <SummaryCard
                label="On-Time"
                value={`${
                  performanceData.onTime
                } (${performanceData.onTimeRate?.toFixed(1)}%)`}
                color="blue"
                tooltip="Number and percentage of tasks completed before or on the due date."
              />
              <CustomTooltip performanceData={performanceData}>
                <SummaryCard
                  label="Total Performance Score"
                  value={`${performanceData.totalPerformanceScore}%`}
                  color="blue"
                />
              </CustomTooltip>
            </div>

            {/* Completion Bars */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-600">
                Completion Rate
              </p>
              <div className="w-full bg-gray-200 h-4 rounded-full">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${performanceData.completionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {performanceData.completionRate?.toFixed(1)}%
              </p>
            </div>

            {/* Month Wise Tasks Chart */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Month-wise Task Summary
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Completed" fill="#10b981" />
                  <Bar dataKey="Reassigned" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Date Wise Chart */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Date-wise Performance
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dateChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Completed" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="Reassigned" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Task Detail Table */}
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Detailed Task Information
              </h3>
              <div className="overflow-x-auto max-h-[400px] border rounded shadow-inner">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Ticket ID
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Due Date
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Created At
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Updated At
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Reassigned
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Completion Status
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Created By
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Review
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Productivity
                      </th>

                      <th className="px-4 py-2 text-left font-semibold text-gray-600">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {tasks
                      .filter((t) => t.assigned_to === selectedEmployee.id)
                      .map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-800">
                            {task.task_id}
                          </td>

                          <td className="px-4 py-2 text-gray-700">
                            {task.title}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {task.description || "-"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                task.progress_status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {task.progress_status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {task.due_date || "-"}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {task.created_at?.toDate?.().toLocaleString() ||
                              "-"}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {task.progress_updated_at
                              ?.toDate?.()
                              .toLocaleString() || "-"}
                          </td>
                          <td className="px-4 py-2 text-center text-gray-600">
                            {task.reassign_history?.length || 0}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {(() => {
                              const due = new Date(task.due_date);
                              const completed =
                                task.progress_updated_at?.toDate?.();
                              if (!completed || isNaN(due)) return "-";

                              // Strip time for date-only comparison
                              const dueDate = new Date(
                                due.getFullYear(),
                                due.getMonth(),
                                due.getDate()
                              );
                              const completeDate = new Date(
                                completed.getFullYear(),
                                completed.getMonth(),
                                completed.getDate()
                              );

                              const diffTime =
                                completeDate.getTime() - dueDate.getTime();
                              const diffDays = Math.floor(
                                diffTime / (1000 * 60 * 60 * 24)
                              );

                              if (diffDays < 0) {
                                return (
                                  <span className="text-green-600 font-medium">
                                    Early by {Math.abs(diffDays)} day
                                    {Math.abs(diffDays) !== 1 ? "s" : ""}
                                  </span>
                                );
                              } else if (diffDays === 0) {
                                return (
                                  <span className="text-gray-700 font-medium">
                                    On Time
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-red-600 font-semibold">
                                    Delayed by {diffDays} day
                                    {diffDays !== 1 ? "s" : ""}
                                  </span>
                                );
                              }
                            })()}
                          </td>
                          <td className="px-4 py-2 text-gray-700 text-sm">
                            {(() => {
                              const creator = employees.find(
                                (emp) =>
                                  emp.id?.trim() === task.created_by?.trim()
                              );
                              return creator?.name || task.created_by || "-";
                            })()}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-2">
                              {/* Status badge */}
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {task.status}
                              </span>

                              {/* Small score beside status */}
                              <span className="text-xs text-gray-500">
                                {task.reviewpoints} / 100
                              </span>
                            </div>

                            {/* Star rating below */}
                            <div className="flex mt-1">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const isFilled =
                                  task.reviewpoints >= (index + 1) * 20;
                                return (
                                  <svg
                                    key={index}
                                    className={`w-4 h-4 ${
                                      isFilled
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.948a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.443a1 1 0 00-.364 1.118l1.287 3.948c.3.921-.755 1.688-1.538 1.118l-3.36-2.443a1 1 0 00-1.175 0l-3.36 2.443c-.783.57-1.838-.197-1.538-1.118l1.287-3.948a1 1 0 00-.364-1.118L2.075 9.375c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.948z" />
                                  </svg>
                                );
                              })}
                            </div>
                          </td>

                          <td className="px-4 py-2 text-sm font-semibold">
                            {(() => {
                              const assignedAt = task.created_at?.toDate?.();
                              const dueAt = new Date(task.due_date);
                              const completedAt =
                                task.progress_updated_at?.toDate?.();

                              if (!assignedAt || !dueAt || !completedAt)
                                return "-";

                              const totalTime =
                                dueAt.getTime() - assignedAt.getTime();
                              const timeLeft =
                                dueAt.getTime() - completedAt.getTime();
                              const timeOverdue =
                                completedAt.getTime() - dueAt.getTime();

                              let score = "-";
                              let explanation = "";

                              if (completedAt <= dueAt) {
                                const leftRatio = timeLeft / totalTime;
                                if (leftRatio >= 0.5) {
                                  score = 100;
                                  explanation = `Task completed early — approximately ${(
                                    timeLeft /
                                    (1000 * 60 * 60)
                                  ).toFixed(
                                    1
                                  )} hours ahead of schedule.\nMore than 50% of the time was left unused, reflecting excellent time management.`;
                                } else if (leftRatio >= 0 && leftRatio < 0.1) {
                                  score = 70;
                                  explanation = `Task was completed just before the deadline with ~${(
                                    leftRatio * 100
                                  ).toFixed(
                                    1
                                  )}% of time remaining.\nThis shows timely execution with minimal buffer.`;
                                } else {
                                  explanation = `Task completed on time but with less than 10% of the total time remaining.\nNo penalty, but little margin left — consider earlier completion next time.`;
                                }
                              } else {
                                const overdueRatio = timeOverdue / totalTime;
                                if (overdueRatio <= 0.1) {
                                  score = 50;
                                  explanation = `Task completed slightly late — by ${(
                                    timeOverdue /
                                    (1000 * 60 * 60)
                                  ).toFixed(1)} hours (~${(
                                    overdueRatio * 100
                                  ).toFixed(
                                    1
                                  )}% past deadline).\nMinor delay, but still acceptable.`;
                                } else if (overdueRatio <= 0.5) {
                                  score = 30;
                                  explanation = `Task moderately late by ${(
                                    timeOverdue /
                                    (1000 * 60 * 60)
                                  ).toFixed(1)} hours (~${(
                                    overdueRatio * 100
                                  ).toFixed(
                                    1
                                  )}% overdue).\nShows room for improvement in time handling.`;
                                } else {
                                  score = 10;
                                  explanation = `Task completed severely late by ${(
                                    timeOverdue /
                                    (1000 * 60 * 60)
                                  ).toFixed(1)} hours (~${(
                                    overdueRatio * 100
                                  ).toFixed(
                                    1
                                  )}% beyond deadline).\nSignificant delay — strongly affects productivity score.`;
                                }
                              }

                              const colorClass =
                                score === 100
                                  ? "text-green-600"
                                  : score === 70
                                  ? "text-yellow-600"
                                  : score === 50
                                  ? "text-orange-500"
                                  : score === 30
                                  ? "text-yellow-800"
                                  : score === 10
                                  ? "text-red-600"
                                  : "text-gray-600";

                              return (
                                <div className="relative group cursor-pointer inline-block">
                                  <span className={`${colorClass}`}>
                                    {score}
                                  </span>
                                  <div className="absolute z-50 hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-2 text-xs max-w-xs w-fit min-w-[200px] whitespace-pre-wrap left-1/2 -translate-x-1/2 top-full mt-2 transition-all duration-200">
                                    {explanation}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          <td className="px-4 py-2 text-gray-500">
                            {task.comments?.length > 0 ? (
                              <div className="relative group cursor-pointer">
                                <span className="underline text-blue-500">
                                  {task.comments.length} comment(s)
                                </span>
                                <div className="absolute z-20 hidden group-hover:block bg-white border rounded shadow p-2 text-xs w-64 mt-1">
                                  {task.comments.map((c, i) => (
                                    <div key={i} className="mb-1">
                                      <p className="text-gray-700">
                                        • {c.text}
                                      </p>
                                      <p className="text-gray-400 text-[10px]">
                                        {new Date(c.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-center py-32 text-lg font-medium">
            Select an employee to view performance.
          </div>
        )}
      </div>
    </div>
  );
}

const SummaryCard = ({ label, value, color = "blue" }) => {
  const colorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
  };

  return (
    <div className="bg-gray-50 rounded-md shadow-inner p-4 border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
};
