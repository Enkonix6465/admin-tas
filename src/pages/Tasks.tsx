import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "react-query";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
// Add this before your component or import from utils

function Projects() {
  const [taskForms, setTaskForms] = useState({});
  const [selectedTeamMembers, setSelectedTeamMembers] = useState({});
  const [projectTasks, setProjectTasks] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [projectTickets, setProjectTickets] = useState([]);
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(
    null
  );

  const { user } = useAuthStore();
  const sendTaskAssignmentEmail = async ({
    toEmail,
    taskId = "Not provided",
    taskTitle = "Untitled Task",
    dueDate = "Not specified",
    description = "No description",
  }) => {
    const subject = `New Task Assigned: ${taskTitle}`;
    const text = `
You have been assigned a new task.

Task ID: ${taskId}
Title: ${taskTitle}
Due Date: ${dueDate}
Description: ${description}
  `;

    console.log("📨 Sending Email with payload:", {
      to: toEmail,
      subject,
      text,
    });

    const response = await fetch(
      "https://tas-email-next.vercel.app/api/send-email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toEmail, subject, text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Email sending failed:", errorText);
      throw new Error("Email sending failed");
    }

    console.log("✅ Email sent successfully");
  };

  const { data: teams = [] } = useQuery(["teams", user?.uid], async () => {
    if (!user?.uid) return [];
    const q = query(
      collection(db, "teams"),
      where("created_by", "==", user.uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });

  const { data: projects = [] } = useQuery(
    ["projects", user?.uid],
    async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, "projects"),
        where("created_by", "==", user.uid)
      );
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
  );

  const { data: employees = [] } = useQuery("employees", async () => {
    const snap = await getDocs(collection(db, "employees"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });

  const getEmployeeName = (id) =>
    employees.find((e) => e.id === id)?.name || id;

  const createTask = useMutation(
    async (taskData) => {
      await addDoc(collection(db, "tasks"), taskData);
    },
    {
      onSuccess: () => toast.success("Task(s) assigned successfully"),
      onError: () => toast.error("Failed to assign task"),
    }
  );

  const updateStatus = useMutation(
    async ({ id, status }) => {
      await updateDoc(doc(db, "tasks", id), { status });
    },
    {
      onSuccess: () => toast.success("Task updated"),
      onError: () => toast.error("Failed to update task"),
    }
  );

  const getProjectTasks = async (projectId) => {
    const q = query(
      collection(db, "tasks"),
      where("project_id", "==", projectId)
    );
    const snap = await getDocs(q);
    setProjectTasks((prev) => ({
      ...prev,
      [projectId]: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    }));
  };

  useEffect(() => {
    projects.forEach((project) => {
      getProjectTasks(project.id);
    });
  }, [projects]);
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const snap = await getDocs(collection(db, "raiseTickets"));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("🔥 Tickets fetched:", data);
        setProjectTickets(data);
      } catch (err) {
        console.error("❌ Error fetching tickets:", err);
      }
    };
    fetchTickets();
  }, []);

  const getTaskForm = (projectId) => {
    return (
      taskForms[projectId] || {
        title: "",
        description: "",
        dueDate: "",
        assignToAll: false,
        assignToMember: "",
        linkedTicket: "",
        sendEmailOnAssign: false, // ✅ new field
      }
    );
  };

  const updateTaskForm = (projectId, field, value) => {
    setTaskForms((prev) => ({
      ...prev,
      [projectId]: {
        ...getTaskForm(projectId),
        [field]: value,
      },
    }));
  };

  const handleAssignTask = async (projectId, teamId) => {
    setAssigningProjectId(projectId); // Start loading

    const form = getTaskForm(projectId);
    if (!form.title || !form.dueDate) {
      toast.error("Title and Due Date required");
      setAssigningProjectId(null); // Stop loading on error
      return;
    }

    let members = selectedTeamMembers[teamId];
    if (!members) {
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      const data = teamDoc.data();
      members = data?.members || [];
      setSelectedTeamMembers((prev) => ({ ...prev, [teamId]: members }));
    }

    const project = projects.find((p) => p.id === projectId);
    const projectPrefix = project?.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    const existingTasks = projectTasks[projectId] || [];
    let taskCount = existingTasks.length;

    const createTaskWithID = (assignedTo) => {
      taskCount += 1;
      const taskId = `Task-${projectPrefix}${taskCount}`;

      const { title, description, dueDate, sendEmailOnAssign } =
        getTaskForm(projectId);
      const memberEmail =
        employees.find((e) => e.id === assignedTo)?.email || "";

      const task = {
        title,
        task_id: taskId,
        description,
        due_date: dueDate,
        project_id: projectId,
        created_by: user?.uid,
        created_at: serverTimestamp(),
        status: "pending",
        progress_status: "pending",
        progress_description: "",
        progress_link: "",
        progress_updated_at: null,
        assigned_to: assignedTo,
        linked_ticket: form.linkedTicket || "",
      };

      return new Promise((resolve) => {
        createTask.mutate(task, {
          onSuccess: async () => {
            console.log("📧 Preparing email with:", {
              taskId,
              title,
              description,
              dueDate,
              memberEmail,
            });

            if (!sendEmailOnAssign) return resolve();

            if (!memberEmail) {
              toast("Task assigned (no email found)");
              return resolve();
            }

            try {
              await sendTaskAssignmentEmail({
                toEmail: memberEmail,
                taskId,
                taskTitle: title,
                dueDate,
                description,
              });

              toast.success("Task assigned and email sent");
            } catch (err) {
              console.error("❌ Email error:", err);
              toast.error("Task assigned but email failed");
            } finally {
              resolve();
            }
          },
        });
      });
    };

    try {
      if (form.assignToAll) {
        await Promise.all(
          members.map((memberId) => createTaskWithID(memberId))
        );
      } else if (form.assignToMember) {
        await createTaskWithID(form.assignToMember);
      } else {
        toast.error("Select member or choose assign to all");
        return;
      }

      setTaskForms((prev) => ({
        ...prev,
        [projectId]: {
          title: "",
          description: "",
          dueDate: "",
          assignToAll: false,
          assignToMember: "",
          sendEmailOnAssign: false,
        },
      }));

      getProjectTasks(projectId);
    } catch (err) {
      console.error("❌ Error assigning task:", err);
    } finally {
      setAssigningProjectId(null); // Stop loading
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditedTask({
      title: task.title,
      due_date: task.due_date,
      description: task.description,
    });
  };

  const handleEditSave = async (taskId, projectId) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), editedTask);
      toast.success("Task updated");
      setEditingTaskId(null);
      getProjectTasks(projectId);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (taskId, projectId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      toast.success("Task deleted");
      getProjectTasks(projectId);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    // Only the return JSX is updated — all state, hooks, logic remain unchanged.

    <div className="p-4 space-y-8">
      {teams.map((team) => {
        const teamProjects = projects.filter((p) => p.teamId === team.id);

        return (
          <div
            key={team.id}
            className="border rounded-xl p-6 bg-white shadow-md"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Team: {team.teamName}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Members: {team.members.map(getEmployeeName).join(", ")}
            </p>

            {teamProjects.map((project) => {
              const form = getTaskForm(project.id);
              const tasks = [...(projectTasks[project.id] || [])]
                .filter((task) => !!task.created_at)
                .sort((a, b) => {
                  const dateA =
                    a.created_at?.toDate?.() || new Date(a.created_at);
                  const dateB =
                    b.created_at?.toDate?.() || new Date(b.created_at);
                  return dateB.getTime() - dateA.getTime();
                });

              return (
                <div key={project.id} className="border-t pt-4 mt-6">
                  <h3
                    className="text-lg font-semibold text-blue-700 cursor-pointer hover:underline mb-1"
                    onClick={() =>
                      setExpandedProject((p) =>
                        p === project.id ? null : project.id
                      )
                    }
                  >
                    📁 {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {project.description}
                  </p>

                  {expandedProject === project.id && (
                    <>
                      {/* Task Form */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                          placeholder="Task Title"
                          value={form.title || ""}
                          onChange={(e) =>
                            updateTaskForm(project.id, "title", e.target.value)
                          }
                          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <div className="flex flex-col">
                          <label className="text-sm text-gray-600 mb-1">
                            Due Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={form.dueDate || ""}
                            onChange={(e) =>
                              updateTaskForm(
                                project.id,
                                "dueDate",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Enter due date and time"
                          />
                        </div>

                        <textarea
                          placeholder="Task Description"
                          value={form.description || ""}
                          onChange={(e) =>
                            updateTaskForm(
                              project.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="border p-2 rounded-lg col-span-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={getTaskForm(project.id).sendEmailOnAssign}
                            onChange={(e) =>
                              updateTaskForm(
                                project.id,
                                "sendEmailOnAssign",
                                e.target.checked
                              )
                            }
                          />
                          Send email to assignee(s)
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.assignToAll}
                            onChange={() =>
                              updateTaskForm(
                                project.id,
                                "assignToAll",
                                !form.assignToAll
                              )
                            }
                          />
                          <label className="text-sm">Assign to all</label>
                        </div>
                        {!form.assignToAll && (
                          <select
                            value={form.assignToMember || ""}
                            onChange={(e) =>
                              updateTaskForm(
                                project.id,
                                "assignToMember",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded-lg"
                          >
                            <option value="">Select Member</option>
                            {team.members.map((id) => (
                              <option key={id} value={id}>
                                {getEmployeeName(id)}
                              </option>
                            ))}
                          </select>
                        )}
                        {projectTickets.length > 0 && (
                          <select
                            value={form.linkedTicket || ""}
                            onChange={(e) =>
                              updateTaskForm(
                                project.id,
                                "linkedTicket",
                                e.target.value
                              )
                            }
                            className="border p-2 rounded-lg"
                          >
                            <option value="">Link to Ticket (optional)</option>
                            {projectTickets.map((ticket) => (
                              <option
                                key={ticket.id}
                                value={ticket.projectTicketId}
                              >
                                {ticket.projectTicketId} - {ticket.title}
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          onClick={() => handleAssignTask(project.id, team.id)}
                          disabled={assigningProjectId === project.id}
                          className={`col-span-full py-2 px-4 rounded-md transition text-white ${
                            assigningProjectId === project.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {assigningProjectId === project.id
                            ? "Assigning..."
                            : "➕ Assign Task"}
                        </button>
                      </div>

                      {/* Task Table */}
                      {tasks.length > 0 && (
                        <div className="overflow-x-auto mt-6">
                          <table className="w-full border text-sm text-left rounded-lg overflow-hidden shadow-sm">
                            <thead className="bg-gray-100 text-gray-700 uppercase">
                              <tr>
                                <th className="p-3 border">Linked Ticket</th>

                                <th className="p-3 border">Task ID</th>
                                <th className="p-3 border">Title</th>
                                <th className="p-3 border">Assigned To</th>
                                <th className="p-3 border">Due Date</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Progress</th>
                                <th className="p-3 border text-center">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {tasks.map((task, idx) => {
                                const isOverdue =
                                  new Date(task.due_date) < new Date();
                                const isEditing = editingTaskId === task.id;
                                const rowBg =
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50";

                                return (
                                  <tr key={task.id} className={rowBg}>
                                    <td className="p-2 border text-blue-600 font-medium text-xs">
                                      {task.linked_ticket || "-"}
                                    </td>

                                    <td className="p-2 border">
                                      {task.task_id}
                                    </td>
                                    <td className="p-2 border">
                                      {isEditing ? (
                                        <input
                                          className="border p-1 rounded w-full"
                                          value={editedTask.title || ""}
                                          onChange={(e) =>
                                            setEditedTask((prev) => ({
                                              ...prev,
                                              title: e.target.value,
                                            }))
                                          }
                                        />
                                      ) : (
                                        task.title
                                      )}
                                    </td>
                                    <td className="p-2 border">
                                      {getEmployeeName(task.assigned_to)}
                                    </td>
                                    <td
                                      className={`p-2 border ${
                                        isOverdue
                                          ? "text-red-600 font-semibold"
                                          : ""
                                      }`}
                                    >
                                      {isEditing ? (
                                        <div className="flex flex-col">
                                          <label className="text-xs text-gray-500 mb-0.5">
                                            Due Date & Time
                                          </label>
                                          <input
                                            type="datetime-local"
                                            className="border p-1 rounded"
                                            value={editedTask.due_date || ""}
                                            onChange={(e) =>
                                              setEditedTask((prev) => ({
                                                ...prev,
                                                due_date: e.target.value,
                                              }))
                                            }
                                          />
                                        </div>
                                      ) : (
                                        task.due_date
                                      )}
                                    </td>
                                    <td className="p-2 border">
                                      <select
                                        value={task.status}
                                        onChange={(e) =>
                                          updateStatus.mutate({
                                            id: task.id,
                                            status: e.target.value,
                                          })
                                        }
                                        className="border rounded px-2 py-1"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">
                                          In Progress
                                        </option>
                                        <option value="completed">
                                          Completed
                                        </option>
                                      </select>
                                    </td>
                                    <td className="p-2 border text-gray-600 text-xs">
                                      {task.progress_status || (
                                        <span className="italic text-gray-400">
                                          Not submitted
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 border">
                                      <div className="flex items-center justify-center gap-2">
                                        {isEditing ? (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleEditSave(
                                                  task.id,
                                                  project.id
                                                )
                                              }
                                              className="text-green-600 hover:underline text-sm"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() =>
                                                setEditingTaskId(null)
                                              }
                                              className="text-gray-500 hover:underline text-sm"
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <Pencil
                                              onClick={() =>
                                                handleEditClick(task)
                                              }
                                              className="text-blue-600 cursor-pointer hover:text-blue-800"
                                              size={18}
                                            />
                                            <Trash2
                                              onClick={() =>
                                                handleDelete(
                                                  task.id,
                                                  project.id
                                                )
                                              }
                                              className="text-red-600 cursor-pointer hover:text-red-800"
                                              size={18}
                                            />
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
export default Projects;
