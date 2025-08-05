import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Ticket,
  Filter,
  Search,
  Edit3,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  Download,
  Eye,
  X,
  Save,
  Star
} from "lucide-react";
import toast from "react-hot-toast";

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [projectsMap, setProjectsMap] = useState<any>({});
  const [teamLeadMap, setTeamLeadMap] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [editValues, setEditValues] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const ticketSnapshot = await getDocs(collection(db, "raiseTickets"));
        const fetchedTickets: any[] = [];
        const projectIds = new Set<string>();
        const teamLeadIds = new Set<string>();

        ticketSnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTickets.push({ id: doc.id, ...data });
          if (data.projectId) projectIds.add(data.projectId);
          if (data.teamLeadId) teamLeadIds.add(data.teamLeadId);
        });

        const projectMap: any = {};
        await Promise.all(
          Array.from(projectIds).map(async (id) => {
            const projRef = doc(db, "projects", id);
            const projSnap = await getDoc(projRef);
            projectMap[id] = projSnap.exists()
              ? projSnap.data().name || id
              : "Unknown Project";
          })
        );

        const leadMap: any = {};
        await Promise.all(
          Array.from(teamLeadIds).map(async (id) => {
            const leadRef = doc(db, "employees", id);
            const leadSnap = await getDoc(leadRef);
            const data = leadSnap.data();
            leadMap[id] = leadSnap.exists() ? data?.name || id : "Unknown";
          })
        );

        setProjectsMap(projectMap);
        setTeamLeadMap(leadMap);
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
    const matchesProject = projectFilter
      ? projectsMap[ticket.projectId] === projectFilter
      : true;
    const matchesSearch = searchTerm
      ? ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.projectTicketId?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesStatus && matchesProject && matchesSearch;
  });

  const uniqueProjectNames = Array.from(new Set(Object.values(projectsMap)));
  const uniqueStatuses = Array.from(new Set(tickets.map((t) => t.status)));

  const getReviewColor = (review: string) => {
    switch (review?.toLowerCase()) {
      case "done":
        return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30";
      case "pending":
        return "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30";
      case "in progress":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
      default:
        return "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "progress":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const isPastDue = (dueDate: string) => {
    try {
      return new Date(dueDate) < new Date();
    } catch {
      return false;
    }
  };

  const handleReviewChange = async (ticketId: string, newReview: string) => {
    try {
      await updateDoc(doc(db, "raiseTickets", ticketId), { review: newReview });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, review: newReview } : ticket
        )
      );
      toast.success("Review status updated");
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Failed to update review");
    }
  };

  const handleEditClick = (ticket: any) => {
    setEditingTicket(ticket);
    setEditValues({
      title: ticket.title || "",
      description: ticket.description || "",
      dueDate: ticket.dueDate || "",
    });
  };

  const handleEditSave = async () => {
    try {
      await updateDoc(doc(db, "raiseTickets", editingTicket.id), {
        ...editValues,
      });
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === editingTicket.id ? { ...ticket, ...editValues } : ticket
        )
      );
      setEditingTicket(null);
      toast.success("Ticket updated successfully");
    } catch (error) {
      console.error("Failed to save edits:", error);
      toast.error("Failed to update ticket");
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    
    try {
      await deleteDoc(doc(db, "raiseTickets", ticketId));
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      toast.success("Ticket deleted successfully");
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      toast.error("Failed to delete ticket");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading tickets...</p>
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
              Support Tickets
            </h1>
            <span className="px-3 py-1 text-xs rounded-full font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              Live Monitoring
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const exportData = {
                  tickets: filteredTickets,
                  totalCount: filteredTickets.length,
                  exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tickets-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success("Tickets data exported! 📊");
              }}
              className="px-4 py-2 text-sm bg-white dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-500/30 rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-b-2 border-purple-500 pb-2">
              <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-base font-medium text-purple-600 dark:text-purple-400">Ticket Overview</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-purple-300" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 placeholder:dark:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm dark:shadow-purple-500/20 backdrop-blur-sm w-full sm:w-48"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Total: {filteredTickets.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass-card mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30">
              <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Tickets
              </h3>
              <p className="text-sm text-gray-500 dark:text-purple-300/70">
                Narrow down your search results
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-purple-200 mb-2">
                Filter by Project
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="">All Projects</option>
                {uniqueProjectNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-purple-200 mb-2">
                Filter by Status
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 dark:border-purple-500/30 rounded-lg bg-white dark:bg-[rgba(15,17,41,0.6)] text-gray-900 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tickets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Tickets
              </h3>
              <p className="text-sm text-gray-500 dark:text-purple-300/70">
                {filteredTickets.length} tickets found
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((ticket, index) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {ticket.projectTicketId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {ticket.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.priority === "High" ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400" :
                        ticket.priority === "Medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400" :
                        "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400"
                      }`}>
                        {ticket.priority === "High" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {ticket.priority === "Medium" && <Clock className="w-3 h-3 mr-1" />}
                        {ticket.priority === "Low" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${isPastDue(ticket.dueDate) ? "text-red-600 font-semibold" : ""}`}>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {ticket.dueDate || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {projectsMap[ticket.projectId] || ticket.projectId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {ticket.createdByName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`border px-2 py-1 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${getReviewColor(ticket.review)}`}
                        value={ticket.review || ""}
                        onChange={(e) => handleReviewChange(ticket.id, e.target.value)}
                      >
                        <option value="">Select Review</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(ticket)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No tickets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search and filter criteria.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Ticket
                  </h2>
                </div>
                <button
                  onClick={() => setEditingTicket(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editValues.title}
                  onChange={(e) =>
                    setEditValues((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  value={editValues.description}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={editValues.dueDate}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setEditingTicket(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  onClick={handleEditSave}
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketsPage;
