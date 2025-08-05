import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Upload, 
  Edit3, 
  Trash2, 
  Search, 
  Download,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  MapPin,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  photo: string;
  title: string;
  department: string;
  type: string;
  joiningDate: string;
  manager: string;
  location: string;
  status: string;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<Employee>({
    id: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    photo: "",
    title: "",
    department: "",
    type: "Full-time",
    joiningDate: "",
    manager: "",
    location: "",
    status: "Active",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchEmployees = async () => {
      const snapshot = await getDocs(collection(db, "employees"));
      const data = snapshot.docs.map((doc) => doc.data() as Employee);
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createAuthUser = async (emp: Employee) => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        emp.email,
        "123456"
      );
      emp.id = userCred.user.uid;
      return emp;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        return emp;
      } else {
        throw error;
      }
    }
  };

  const saveToDatabase = async (emp: Employee) => {
    await setDoc(doc(db, "employees", emp.id), emp);
  };

  const handleAddOrUpdate = async () => {
    if (!form.name || !form.email) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      const updatedForm = await createAuthUser(form);
      await saveToDatabase(updatedForm);

      if (editIndex !== null) {
        const updated = [...employees];
        updated[editIndex] = updatedForm;
        setEmployees(updated);
        setEditIndex(null);
        toast.success("Employee updated successfully! 🎉");
      } else {
        setEmployees([...employees, updatedForm]);
        toast.success("Employee added successfully! 🎉");
      }

      setForm({
        id: "",
        name: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        photo: "",
        title: "",
        department: "",
        type: "Full-time",
        joiningDate: "",
        manager: "",
        location: "",
        status: "Active",
      });

      setMessage("Employee added successfully!");
    } catch (err: any) {
      toast.error("Failed to add employee: " + err.message);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = (index: number) => {
    setForm(employees[index]);
    setEditIndex(index);
  };

  const handleDelete = async (index: number) => {
    const emp = employees[index];
    await deleteDoc(doc(db, "employees", emp.id));
    const updated = [...employees];
    updated.splice(index, 1);
    setEmployees(updated);
    toast.success("Employee deleted successfully");
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Employee>(sheet);

    setLoading(true);
    const uploaded: Employee[] = [];

    for (const emp of json) {
      try {
        const updated = await createAuthUser(emp);
        await saveToDatabase(updated);
        uploaded.push(updated);
      } catch (err) {
        console.error(err);
      }
    }

    setEmployees([...employees, ...uploaded]);
    setLoading(false);
    toast.success("Bulk upload successful! 📊");
    setTimeout(() => setMessage(""), 3000);
  };

  const filteredEmployees = employees.filter(emp => 
    searchTerm ? 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    : true
  );

  const tabs = [
    {
      id: "management",
      label: "Employee Management",
      icon: Users,
      active: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading employee data...</p>
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
              Employee Management
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
                  employees: employees,
                  totalCount: employees.length,
                  exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `employees-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success("Employee data exported! 📊");
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
              <Users className="w-5 h-5 text-blue-600 dark:text-slate-400" />
              <span className="text-base font-medium text-blue-600 dark:text-slate-400">Team Management</span>
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
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-slate-300 border border-blue-200 dark:border-slate-600 rounded-lg text-sm">
              <Activity className="w-4 h-4" />
              <span className="font-medium">Total: {employees.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Add/Edit Employee Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass-card dark:bg-slate-800/50 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-slate-700 border border-blue-200 dark:border-slate-600">
              <UserPlus className="w-6 h-6 text-blue-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {editIndex !== null ? "Edit Employee" : "Add New Employee"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {editIndex !== null ? "Update employee information" : "Create a new employee record"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {[
              { name: "name", placeholder: "Full Name", icon: User },
              { name: "email", placeholder: "Email Address", icon: Mail },
              { name: "phone", placeholder: "Phone Number", icon: Phone },
              { name: "photo", placeholder: "Photo URL", icon: User },
              { name: "title", placeholder: "Job Title", icon: Building },
              { name: "department", placeholder: "Department", icon: Building },
              { name: "manager", placeholder: "Manager", icon: User },
              { name: "location", placeholder: "Location", icon: MapPin },
            ].map(({ name, placeholder, icon: Icon }) => (
              <div key={`input-${name}`} className="relative">
                <Icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" />
                <input
                  name={name}
                  value={form[name as keyof Employee]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="pl-9 pr-4 py-2.5 w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/90 text-gray-900 dark:text-slate-200 placeholder:dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            ))}
            
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/90 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Intern">Intern</option>
              <option value="Contract">Contract</option>
            </select>
            
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/90 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Terminated">Terminated</option>
            </select>
            
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="pl-9 pr-4 py-2.5 w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/90 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400" />
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                className="pl-9 pr-4 py-2.5 w-full border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800/90 text-gray-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddOrUpdate}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? "Processing..." : editIndex !== null ? "Update Employee" : "Add Employee"}
            </button>

            {/* Bulk Upload */}
            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleBulkUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <button
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
            </div>
          </div>
        </motion.div>

        {/* Employee List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="liquid-glass-card dark:bg-slate-800/50 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <Users className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                All Employees
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {filteredEmployees.length} employees found
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800/60 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredEmployees.map((emp, idx) => (
                  <motion.tr
                    key={`employee-${emp.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {emp.photo ? (
                            <img
                              src={emp.photo}
                              alt={emp.name}
                              className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-slate-100">
                            {emp.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {emp.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-slate-200">
                        {emp.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">
                        {emp.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {emp.department}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          emp.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : emp.status === "Inactive"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {emp.status === "Active" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {emp.status !== "Active" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(idx)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        </motion.div>
      </div>
    </div>
  );
}
