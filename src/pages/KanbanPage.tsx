import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  ChevronDown,
  Star,
  Share2,
  Settings,
  X,
  MessageCircle,
  Paperclip,
  Eye,
} from "lucide-react";

const statusConfig = {
  pending: {
    title: "Backlog",
    count: 0,
    color: "bg-gray-100 text-gray-700",
  },
  in_progress: {
    title: "In progress",
    count: 0,
    color: "bg-blue-100 text-blue-700",
  },
  completed: {
    title: "QA",
    count: 0,
    color: "bg-green-100 text-green-700",
  },
};

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const ProjectKanbanPage = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<Record<string, any>>({});
  const [employees, setEmployees] = useState<Record<string, any>>({});
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    const comment = {
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      userId: user.uid,
    };

    try {
      setCommentLoading(true);
      const taskRef = doc(db, "tasks", selectedTask.id);
      await updateDoc(taskRef, {
        comments: arrayUnion(comment),
      });

      setSelectedTask((prev: any) => ({
        ...prev,
        comments: [...(prev?.comments || []), comment],
      }));

      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id
            ? { ...t, comments: [...(t.comments || []), comment] }
            : t
        )
      );

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const taskSnap = await getDocs(collection(db, "tasks"));
      const taskList = taskSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const projectIds = [...new Set(taskList.map((t) => t.project_id))];
      const userIds = [
        ...new Set(taskList.flatMap((t) => [t.assigned_to, t.created_by])),
      ];

      const projectsMap: Record<string, any> = {};
      const employeesMap: Record<string, any> = {};

      await Promise.all([
        ...projectIds.map(async (pid) => {
          const pDoc = await getDoc(doc(db, "projects", pid));
          if (pDoc.exists()) projectsMap[pid] = { id: pid, ...pDoc.data() };
        }),
        ...userIds.map(async (uid) => {
          const uDoc = await getDoc(doc(db, "employees", uid));
          if (uDoc.exists()) employeesMap[uid] = { id: uid, ...uDoc.data() };
        }),
      ]);

      setTasks(taskList);
      setProjects(projectsMap);
      setEmployees(employeesMap);
    };

    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on the same item, do nothing
    if (activeId === overId) return;

    // Find the task being dragged
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a status column or another task
    let newStatus = overId;

    // If dropped on another task, get that task's status
    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      newStatus = overTask.status;
    }

    // Update the task status
    const updatedTasks = tasks.map((task) =>
      task.id === activeId
        ? { ...task, status: newStatus }
        : task
    );
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter((task) => {
    const dateMatch = selectedDate ? task.due_date === selectedDate : true;
    const projectMatch = selectedProject
      ? task.project_id === selectedProject
      : true;
    const searchMatch = searchTerm
      ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return dateMatch && projectMatch && searchMatch;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const SortableTaskCard = ({ task }: { task: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const assignedUser = employees[task.assigned_to];
    const project = projects[task.project_id];

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setSelectedTask(task)}
        className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all duration-200 ${
          isDragging ? "shadow-lg opacity-50" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 pr-2">
            {task.title}
          </h4>
          <button className="p-1 rounded hover:bg-gray-100 flex-shrink-0">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          {task.priority && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${
                priorityColors[task.priority] || "bg-gray-100 text-gray-700"
              }`}
            >
              {task.priority}
            </span>
          )}
          {project && (
            <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">
              {project.name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignedUser && (
              <div className="flex items-center gap-1">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    assignedUser.name || assignedUser.email
                  )}`}
                  alt="avatar"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-gray-600">
                  {assignedUser.name?.split(" ")[0] || "User"}
                </span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {task.due_date}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageCircle className="w-3 h-3" />
                {task.comments.length}
              </div>
            )}
            {task.progress_link && (
              <Paperclip className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Project Board [2023]
            </h1>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
              On track
            </span>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Star className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Share
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-b-2 border-blue-500 pb-2">
              <span className="text-sm font-medium text-blue-600">Board</span>
            </div>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 pb-2">
              Timeline
            </button>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 pb-2">
              Calendar
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filter
                <ChevronDown className="w-4 h-4" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Projects</option>
                        {Object.values(projects).map((project: any) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={() => {
                          setSelectedDate("");
                          setSelectedProject("");
                          setFilterOpen(false);
                        }}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setFilterOpen(false)}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <div className="h-full flex gap-6 p-6 overflow-x-auto">
            {Object.entries(statusConfig).map(([statusKey, statusData]) => {
              const statusTasks = getTasksByStatus(statusKey);
              return (
                <div key={statusKey} className="flex-shrink-0 w-80">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {statusData.title}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {statusTasks.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <SortableContext
                    items={statusTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      id={statusKey}
                      className="min-h-[500px] rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4"
                    >
                      {statusTasks.map((task) => (
                        <SortableTaskCard key={task.id} task={task} />
                      ))}

                      {statusTasks.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="text-sm">No tasks</div>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedTask.title}
              </h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-900 dark:text-gray-100">
                      {selectedTask.description || "No description provided."}
                    </div>
                  </div>

                  {selectedTask.progress_description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Progress Notes
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-900 dark:text-gray-100">
                        {selectedTask.progress_description}
                      </div>
                    </div>
                  )}

                  {selectedTask.progress_link && (
                    <div>
                      <a
                        href={selectedTask.progress_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Paperclip className="w-4 h-4" />
                        View Progress Link
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Project
                      </label>
                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {projects[selectedTask.project_id]?.name || "N/A"}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assignee
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        {employees[selectedTask.assigned_to] && (
                          <>
                            <img
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                employees[selectedTask.assigned_to].name ||
                                  employees[selectedTask.assigned_to].email
                              )}`}
                              alt="avatar"
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {employees[selectedTask.assigned_to].name ||
                                employees[selectedTask.assigned_to].email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Due Date
                      </label>
                      <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {selectedTask.due_date || "No due date"}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {statusConfig[selectedTask.status]?.title ||
                            selectedTask.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Comments ({selectedTask.comments?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedTask.comments?.map((comment: any, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                employees[comment.userId]?.name ||
                                  employees[comment.userId]?.email ||
                                  comment.userId
                              )}`}
                              alt="avatar"
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {employees[comment.userId]?.name ||
                                employees[comment.userId]?.email ||
                                comment.userId}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {comment.text}
                          </p>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No comments yet.
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <textarea
                        rows={3}
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={commentLoading || !newComment.trim()}
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {commentLoading ? "Adding..." : "Add Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectKanbanPage;
