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
  Clock,
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Activity,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Eye,
  MoreHorizontal,
  Building2,
  Layers3,
} from "lucide-react";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const { currentUser } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      const projSnap = await getDocs(query(collection(db, "projects")));
      const teamSnap = await getDocs(query(collection(db, "teams")));
      const empSnap = await getDocs(query(collection(db, "employees")));

      setProjects(projSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setTeams(teamSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setEmployees(empSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const getEmployeeName = (id) =>
    employees.find((emp) => emp.id === id)?.name || "Unknown";

  const getTeamName = (id) =>
    teams.find((team) => team.id === id)?.teamName || "Unknown";

  const handleTeamClick = (teamId) => {
    setSelectedTeam(selectedTeam === teamId ? null : teamId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="border border-gray-300 rounded-xl p-4 shadow-md"
          >
            <h2 className="text-lg font-semibold mb-1">
              {index + 1}. {project.name}
            </h2>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Description:</span>{" "}
              {project.description}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Start Date:</span>{" "}
              {project.startDate}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Deadline:</span> {project.deadline}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Created By:</span>{" "}
              {getEmployeeName(project.created_by)}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Team:</span>{" "}
              <button
                onClick={() => handleTeamClick(project.teamId)}
                className="text-blue-600 underline"
              >
                {getTeamName(project.teamId)}
              </button>
            </p>

            {/* Team Members */}
            {selectedTeam === project.teamId && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <p className="font-medium mb-1">Team Members:</p>
                <ul className="list-disc ml-5 text-sm">
                  {teams
                    .find((t) => t.id === selectedTeam)
                    ?.members.map((memberId) => (
                      <li key={memberId}>{getEmployeeName(memberId)}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
