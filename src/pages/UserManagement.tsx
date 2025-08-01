import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ProjectTasksViewer() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [employeesMap, setEmployeesMap] = useState({});

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      const snap = await getDocs(collection(db, "projects"));
      const projectData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectData);
    };
    fetchProjects();
  }, []);

  // Fetch employees for name mapping
  useEffect(() => {
    const fetchEmployees = async () => {
      const snap = await getDocs(collection(db, "employees"));
      const empMap = {};
      snap.docs.forEach((doc) => {
        const { name } = doc.data();
        empMap[doc.id] = name;
      });
      setEmployeesMap(empMap);
    };
    fetchEmployees();
  }, []);

  // Fetch tasks when project selected
  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchTasks = async () => {
      const q = query(
        collection(db, "tasks"),
        where("project_id", "==", selectedProjectId)
      );
      const snap = await getDocs(q);
      const taskList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskList);
    };
    fetchTasks();
  }, [selectedProjectId]);

  const getStatusColor = (status, dueDate) => {
    if (status === "completed") return "text-green-600 font-semibold";
    const due = new Date(dueDate);
    const now = new Date();
    if (due < now) return "text-red-600 font-semibold";
    return "text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Select Project</h2>
      <div className="flex flex-wrap gap-3">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className={`px-4 py-2 rounded shadow ${
              selectedProjectId === project.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {project.name}
          </button>
        ))}
      </div>

      {selectedProjectId && (
        <>
          <h3 className="text-xl font-semibold mt-8">
            Tasks for:{" "}
            {projects.find((proj) => proj.id === selectedProjectId)?.name}
          </h3>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border divide-y divide-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Assigned To</th>
                  <th className="p-2 border">Created By</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Due Date</th>
                  <th className="p-2 border">Progress Status</th>
                  <th className="p-2 border">Progress Description</th>
                  <th className="p-2 border">Progress Link</th>
                  <th className="p-2 border">Progress Updated At</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={task.id} className="text-center">
                    <td className="border p-1">{idx + 1}</td>
                    <td className="border p-1">{task.title}</td>
                    <td className="border p-1">{task.description}</td>
                    <td
                      className={`border p-1 ${getStatusColor(
                        task.status,
                        task.due_date
                      )}`}
                    >
                      {task.status}
                    </td>
                    <td className="border p-1">
                      {employeesMap[task.assigned_to] || task.assigned_to}
                    </td>
                    <td className="border p-1">
                      {employeesMap[task.created_by] || task.created_by}
                    </td>
                    <td className="border p-1">
                      {new Date(
                        task.created_at?.seconds * 1000
                      ).toLocaleString()}
                    </td>
                    <td className="border p-1">{task.due_date}</td>
                    <td className="border p-1">{task.progress_status}</td>
                    <td className="border p-1">
                      {task.progress_description || "-"}
                    </td>
                    <td className="border p-1">
                      {task.progress_link ? (
                        <a
                          href={task.progress_link}
                          className="text-blue-600 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border p-1">
                      {task.progress_updated_at
                        ? new Date(
                            task.progress_updated_at?.seconds * 1000
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
