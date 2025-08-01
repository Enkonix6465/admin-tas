import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Wrapper component to handle ReactQuill with ref forwarding
const QuillEditor = React.forwardRef((props, ref) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server side to avoid hydration issues
  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded border">
        <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
      </div>
    );
  }

  return <ReactQuill ref={ref} {...props} />;
});
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import PageHeader from "../components/PageHeader";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit3,
  Eye,
  Save,
  Copy,
  Download,
  Trash2,
  Calendar,
  User,
  Lock,
  Search,
  Filter,
} from "lucide-react";

const ProjectDocCreator = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [content, setContent] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [docTypeFilter, setDocTypeFilter] = useState("all");

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user?.email) setUserEmail(user.email);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        alert("Printing is disabled for security reasons.");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchProjects = async () => {
    try {
      const snapshot = await getDocs(collection(db, "projects"));
      const projectList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectList);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchDocuments = async (projectId) => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "projectDocs"));
      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((d) => d.projectId === projectId);
      setDocuments(filtered);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedDoc(null);
    setContent("");
    setDocTitle("");
    setPreviewMode(false);
    fetchDocuments(project.id);
  };

  const handleNewDocument = () => {
    setSelectedDoc(null);
    setContent("");
    setDocTitle("");
    setPreviewMode(false);
  };

  const handleDocumentSelect = (doc) => {
    setSelectedDoc(doc);
    setContent(doc.htmlContent || "");
    setDocTitle(doc.title || "");
    setPreviewMode(true);
  };

  const saveDocument = async () => {
    if (!selectedProject || !content.trim() || !docTitle.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const docId = selectedDoc?.id || `${selectedProject.id}_${uuidv4()}`;
      const docRef = doc(db, "projectDocs", docId);
      const docData = {
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        title: docTitle,
        htmlContent: content,
        createdBy: userEmail,
        updatedAt: new Date().toISOString(),
        createdAt: selectedDoc?.createdAt || new Date().toISOString(),
      };

      await setDoc(docRef, docData, { merge: true });
      alert("Document saved successfully");
      setSelectedDoc({ id: docId, ...docData });
      fetchDocuments(selectedProject.id);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document");
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    searchTerm
      ? doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.htmlContent?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const filterContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Document Type
        </label>
        <select
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={docTypeFilter}
          onChange={(e) => setDocTypeFilter(e.target.value)}
        >
          <option value="all">All Documents</option>
          <option value="specs">Specifications</option>
          <option value="reports">Reports</option>
          <option value="meeting">Meeting Notes</option>
        </select>
      </div>
    </div>
  );

  const tabs = [
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      active: true,
    },
    {
      id: "templates",
      label: "Templates",
      icon: Copy,
      active: false,
    },
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader
        title="Document Creator"
        subtitle={selectedProject ? `• ${selectedProject.name}` : ""}
        status="Secure"
        statusColor="bg-green-100 text-green-700"
        tabs={tabs}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search documents..."
        showFilters={true}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen(!filterOpen)}
        filterContent={filterContent}
        customActions={
          <button
            onClick={handleNewDocument}
            disabled={!selectedProject}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Document
          </button>
        }
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Project & Document Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* Project Selection */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Select Project
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {projects.map((project) => (
                <motion.button
                  key={project.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleProjectSelect(project)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedProject?.id === project.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Documents List */}
          {selectedProject && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Documents
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredDocuments.length} docs
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No documents yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create your first document to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <motion.div
                      key={doc.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleDocumentSelect(doc)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedDoc?.id === doc.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                            {doc.title || "Untitled Document"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <User className="w-3 h-3" />
                            {doc.createdBy}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedProject ? (
            <>
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Document title..."
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="text-xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none w-full placeholder-gray-400"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {previewMode ? (
                        <>
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Preview
                        </>
                      )}
                    </button>
                    <button
                      onClick={saveDocument}
                      disabled={loading || !content.trim() || !docTitle.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Lock className="w-4 h-4" />
                  <span>Secure document - Copy and print protection enabled</span>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-hidden">
                {previewMode ? (
                  <div
                    className="h-full overflow-y-auto p-6 bg-white dark:bg-gray-800 relative"
                    onContextMenu={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ userSelect: "none" }}
                  >
                    {/* Watermark */}
                    <div
                      className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-6xl font-bold text-gray-500 transform rotate-45"
                      style={{ zIndex: 1 }}
                    >
                      CONFIDENTIAL - {userEmail}
                    </div>
                    
                    {/* Document Header */}
                    <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {docTitle || "Untitled Document"}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Project: {selectedProject.name}</span>
                        <span>•</span>
                        <span>Author: {userEmail}</span>
                        <span>•</span>
                        <span>Last updated: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div
                      className="prose prose-lg max-w-none dark:prose-invert relative"
                      style={{ zIndex: 2 }}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                ) : (
                  <div className="h-full p-6 bg-white dark:bg-gray-800">
                    <QuillEditor
                      value={content}
                      onChange={setContent}
                      className="h-full"
                      placeholder="Start writing your document..."
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, 4, 5, 6, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ color: [] }, { background: [] }],
                          [{ list: "ordered" }, { list: "bullet" }],
                          [{ indent: "-1" }, { indent: "+1" }],
                          [{ align: [] }],
                          ["blockquote", "code-block"],
                          ["link", "image"],
                          ["clean"],
                        ],
                      }}
                      formats={[
                        "header",
                        "bold",
                        "italic",
                        "underline",
                        "strike",
                        "color",
                        "background",
                        "list",
                        "bullet",
                        "indent",
                        "align",
                        "blockquote",
                        "code-block",
                        "link",
                        "image",
                      ]}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Project
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a project from the sidebar to start creating documents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocCreator;
