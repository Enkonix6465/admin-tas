import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "framer-motion";
import {
  Users,
  Crown,
  Search,
  Download,
  UserCheck,
  Shield,
  Star,
  Activity,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: string;
  type: string;
  department?: string;
  title?: string;
  createdAt?: any;
}

export default function TeamLeadAssignmentPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teamLeads, setTeamLeads] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empSnap = await getDocs(collection(db, "employees"));
        const allEmployees = empSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Employee[];

        const leadsSnap = await getDocs(collection(db, "teamLeaders"));
        const allLeads = leadsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Employee[];

        setEmployees(allEmployees);
        setTeamLeads(allLeads);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const assignTeamLeads = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    try {
      setLoading(true);
      await Promise.all(
        selectedIds.map(async (empId) => {
          const emp = employees.find((e) => e.id === empId);
          if (emp) {
            await setDoc(doc(db, "teamLeaders", emp.id), {
              id: emp.id,
              name: emp.name,
              email: emp.email,
              phone: emp.phone,
              location: emp.location,
              status: emp.status,
              type: emp.type,
              department: emp.department,
              title: emp.title,
              createdAt: serverTimestamp(),
            });
          }
        })
      );

      toast.success(`${selectedIds.length} employees assigned as team leads! 🎉`);
      setSelectedIds([]);
      
      // Refresh team leads
      const updatedLeads = await getDocs(collection(db, "teamLeaders"));
      setTeamLeads(
        updatedLeads.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Employee[]
      );
    } catch (err) {
      console.error("Error assigning team leads:", err);
      toast.error("Failed to assign team leads");
    } finally {
      setLoading(false);
    }
  };

  const removeTeamLead = async (leadId: string) => {
    try {
      await deleteDoc(doc(db, "teamLeaders", leadId));
      setTeamLeads(teamLeads.filter(lead => lead.id !== leadId));
      toast.success("Team lead removed successfully");
    } catch (err) {
      console.error("Error removing team lead:", err);
      toast.error("Failed to remove team lead");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const lowerSearch = searchTerm.toLowerCase();
    const isNotAlreadyLead = !teamLeads.some(lead => lead.id === emp.id);
    const matchesSearch = 
      emp.name?.toLowerCase().includes(lowerSearch) ||
      emp.email?.toLowerCase().includes(lowerSearch) ||
      emp.department?.toLowerCase().includes(lowerSearch) ||
      emp.phone?.toString().toLowerCase().includes(lowerSearch);
    
    return isNotAlreadyLead && (searchTerm ? matchesSearch : true);
  });

  const tabs = [
    {
      id: "leadership",
      label: "Team Leadership",
      icon: Crown,
      active: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="liquid-glass border-b border-gray-200 dark:border-slate-700/50 px-6 py-4 shadow-sm dark:shadow-slate-900/40 relative z-10 dark:bg-slate-900/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              Team Leadership Management
            </h1>
            <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-slate-300 border border-blue-200 dark:border-slate-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 dark:bg-slate-400 rounded-full animate-pulse"></div>
              Live Management
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const exportData = {
                  teamLeads: teamLeads,
                  totalLeads: teamLeads.length,
                  availableEmployees: filteredEmployees.length,
                  exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `team-leads-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success("Team leads data exported! 📊");
              }}
              className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-blue-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-b-2 border-slate-500 dark:border-slate-400 pb-2">
              <Crown className="w-5 h-5 text-blue-600 dark:text-slate-400" />
              <span className="text-base font-medium text-blue-600 dark:text-slate-400">Leadership Assignment</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/90 text-gray-900 dark:text-slate-200 placeholder:dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm dark:shadow-slate-900/40 backdrop-blur-sm w-full sm:w-48"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-slate-700 text-yellow-700 dark:text-slate-300 border border-yellow-200 dark:border-slate-600 rounded-lg text-sm">
              <Star className="w-4 h-4" />
              <span className="font-medium">Team Leads: {teamLeads.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Employee Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass-card dark:bg-slate-800/50 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-slate-700 border border-blue-200 dark:border-slate-600">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Select Employees for Leadership
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {filteredEmployees.length} employees available for team lead assignment
                </p>
              </div>
            </div>
            
            <button
              onClick={assignTeamLeads}
              disabled={selectedIds.length === 0 || loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <Crown className="w-4 h-4" />
              Assign as Team Lead ({selectedIds.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                      checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredEmployees.map(emp => emp.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800/60 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredEmployees.map((emp, idx) => (
                  <motion.tr
                    key={`employee-select-${emp.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                      selectedIds.includes(emp.id) ? "bg-blue-50 dark:bg-slate-700/60" : ""
                    }`}
                    onClick={() => toggleSelection(emp.id)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => toggleSelection(emp.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-slate-100">
                            {emp.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {emp.title || emp.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-200">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                        {emp.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <Phone className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                        {emp.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-200">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-400" />
                        {emp.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          emp.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {emp.status === "Active" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {emp.status !== "Active" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {emp.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Current Team Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass-card dark:bg-slate-800/50 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-slate-700 border border-yellow-200 dark:border-slate-600">
              <Shield className="w-6 h-6 text-yellow-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Current Team Leads
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {teamLeads.length} team leads assigned
              </p>
            </div>
          </div>

          {teamLeads.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                No Team Leads Assigned
              </h3>
              <p className="text-gray-600 dark:text-slate-400">
                Select employees from the table above to assign them as team leads.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamLeads.map((lead, idx) => (
                <motion.div
                  key={`team-lead-${lead.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700/50 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-slate-100">
                          {lead.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          Team Lead
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTeamLead(lead.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                      <Phone className="w-4 h-4" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                      <MapPin className="w-4 h-4" />
                      {lead.location}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <Activity className="w-3 h-3 mr-1" />
                      {lead.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
