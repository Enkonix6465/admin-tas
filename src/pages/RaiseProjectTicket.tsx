import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { 
  Ticket, 
  Plus, 
  Calendar, 
  User as UserIcon, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Briefcase, 
  FileText,
  Send,
  Star,
  Activity
} from "lucide-react";

export default function RaiseProjectTicket() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [projects, setProjects] = useState<Array<any>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectDetails, setProjectDetails] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, [auth]);

  // Fetch all projects
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "projects"));
        setProjects(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      } catch (e) {
        console.error(e);
        toast.error("Failed to load projects");
      }
    })();
  }, []);

  // Fetch selected project details
  useEffect(() => {
    if (!selectedProjectId) {
      setProjectDetails(null);
      return;
    }
    (async () => {
      try {
        const ref = doc(db, "projects", selectedProjectId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProjectDetails({ id: snap.id, ...snap.data() });
        } else {
          toast.error("Project not found");
        }
      } catch (e) {
        console.error(e);
        toast.error("Error loading project details");
      }
    })();
  }, [selectedProjectId]);

  // Submit ticket
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("You must be signed in to raise a ticket.");
      return;
    }
    if (!title || !description || !dueDate || !selectedProjectId) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Extract initials from project name (e.g., "Exam Portal" -> "EP")
      const initials =
        projectDetails?.name
          ?.split(" ")
          .map((word) => word[0]?.toUpperCase())
          .join("") || "XX";

      // Fetch existing tickets with the same projectTicketId prefix
      const ticketSnap = await getDocs(collection(db, "raiseTickets"));
      const matchingTickets = ticketSnap.docs.filter((doc) =>
        doc.data().projectTicketId?.startsWith(initials + "-")
      );

      // Determine next sequence number
      const sequenceNumber = matchingTickets.length + 1;
      const projectTicketId = `${initials}-${sequenceNumber}`;

      // Create the ticket
      const docRef = await addDoc(collection(db, "raiseTickets"), {
        title,
        description,
        priority,
        status: "Pending",
        dueDate,
        createdAt: serverTimestamp(),
        createdById: currentUser.uid,
        createdByName:
          currentUser.displayName || currentUser.email || "Unknown",
        projectId: selectedProjectId,
        teamLeadId: projectDetails?.created_by || null,
        comments: [],
        review: "",
        projectTicketId, // ✅ include the custom ticket id
      });

      // Now update the ticket with its auto-generated ID
      await updateDoc(doc(db, "raiseTickets", docRef.id), {
        ticketId: docRef.id,
      });

      toast.success(`Ticket ${projectTicketId} raised successfully! 🎯`);

      // reset form
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      setSelectedProjectId("");
      setProjectDetails(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to raise ticket.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30";
      case "Low":
        return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30";
      default:
        return "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Creating ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-transparent flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="liquid-glass border-b border-gray-200 dark:border-purple-500/30 px-6 py-4 shadow-sm dark:shadow-purple-500/20 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-purple-100">
              Raise Project Ticket
            </h1>
            <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Support System
            </span>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-b-2 border-purple-500 pb-2">
              <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-base font-medium text-purple-600 dark:text-purple-400">Ticket Management</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm">
            <Activity className="w-4 h-4" />
            <span className="font-medium">Create Support Request</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Project Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="liquid-glass-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Project
                </h3>
                <p className="text-sm text-gray-500 dark:text-purple-300/70">
                  Choose the project this ticket relates to
                </p>
              </div>
            </div>

            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">-- Select a project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Project Details Preview */}
          {projectDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="liquid-glass-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {projectDetails.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-purple-300/70">
                    Project selected
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-purple-500/10 rounded-lg p-4 border border-gray-200 dark:border-purple-500/20">
                <p className="text-gray-700 dark:text-purple-200 mb-3">{projectDetails.description}</p>
                {projectDetails.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-purple-300/80">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {projectDetails.deadline}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Ticket Form */}
          {selectedProjectId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="liquid-glass-card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30">
                  <Plus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ticket Details
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-purple-300/70">
                    Provide detailed information about your request
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-purple-200 mb-2">
                    Ticket Title
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300/70" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief description of the issue or request"
                      className="pl-9 pr-4 py-3 w-full border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-purple-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about your request, including steps to reproduce if it's a bug report"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-purple-200 mb-2">
                      Priority Level
                    </label>
                    <div className="relative">
                      <AlertTriangle className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300/70" />
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="pl-9 pr-4 py-3 w-full border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="Low">Low - General inquiry</option>
                        <option value="Medium">Medium - Standard request</option>
                        <option value="High">High - Urgent issue</option>
                      </select>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {priority} Priority
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-purple-200 mb-2">
                      Expected Resolution Date
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300/70" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="pl-9 pr-4 py-3 w-full border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-purple-500/30">
                  <button
                    type="submit"
                    disabled={loading || !title || !description || !dueDate}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {loading ? "Creating Ticket..." : "Raise Ticket"}
                  </button>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-purple-300/70">
                    <UserIcon className="w-4 h-4" />
                    <span>Submitting as: {currentUser?.email}</span>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* Empty State */}
          {!selectedProjectId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Ready to Get Support?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select a project above to start creating your support ticket
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Quick Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Expert Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Tracking</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
