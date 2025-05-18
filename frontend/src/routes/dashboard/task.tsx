import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../../components/DashboardLayout";
import axios from "axios";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getUserData } from "../../utils/userData.util";
import { TaskPriority, TaskStatus } from "../../utils/tasks.enum";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAccessToken } from "../../utils/token.util";

export const Route = createFileRoute("/dashboard/task")({
  component: RouteComponent,
});

const getTeamData = async (organizationId: string) => {
  const response = await axios.get(`/api/v1/auth/teams/${organizationId}`);
  return response.data;
};

const getTasks = async ({
  organizationId,
  filterStatus,
  filterPriority,
  filterAssignee,
  filterDueDate,
}: {
  organizationId: string;
  filterStatus: string;
  filterPriority: string;
  filterAssignee: string;
  filterDueDate: string;
}) => {
  const response = await axios.get(
    `/api/v1/tasks?organizationId=${organizationId}&status=${filterStatus}&priority=${filterPriority}&assignee=${filterAssignee}&dueDate=${filterDueDate}`,
  );

  return response.data;
};

function formatTitle(str: string) {
  return str.replace(/([A-Z])/g, " $1").toLowerCase();
}

type AddNewTaskFormData = {
  task: string;
  assignee: string;
  priority: string;
  status: string;
  organizationId: string;
  dueDate: string;
};

const addNewTaskAxios = async (data: AddNewTaskFormData) => {
  const response = await axios.post("/api/v1/tasks", data);
  return response.data;
};

const deleteTaskAxios = async (taskId: string) => {
  const response = await axios.delete(`/api/v1/tasks/${taskId}`);
  return response.data;
};

const updateTaskAxios = async ({
  taskId,
  data,
}: {
  taskId: string;
  data: Omit<AddNewTaskFormData, "organizationId">;
}) => {
  const response = await axios.patch(`/api/v1/tasks/${taskId}`, data);
  return response.data;
};

function RouteComponent() {
  const userData = getUserData();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!accessToken || !userData) {
      navigate({ to: "/login" });
    }

    return () => {};
  }, [navigate, userData]);

  const [addNewTaskModal, setAddNewTaskModal] = useState(false);
  const [viewModal, setViewModal] = useState({
    show: false,
    modalType: "",
    data: {},
  });

  // Filter form data
  // HACK!!!
  const filterForm = useState({
    filterStatus: "",
    filterPriority: "",
    filterAssignee: "",
    filterDueDate: "",
  });
  let [filterFormData] = filterForm;
  const [, setFilterFormData] = filterForm;

  // Create New Task
  const [formData, setFormData] = useState({
    task: "",
    assignee: "",
    priority: TaskPriority.LOW,
    status: TaskStatus.TO_DO,
    dueDate: "",
  });

  const addNewTask = useMutation({
    mutationFn: addNewTaskAxios,
    onSuccess: () => {
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Close view modal
      setAddNewTaskModal((prev) => !prev);

      // Clear form data
      setFormData({
        task: "",
        assignee: "",
        priority: TaskPriority.LOW,
        status: TaskStatus.TO_DO,
        dueDate: "",
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: updateTaskAxios,
    onSuccess: () => {
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Close view modal
      setViewModal({
        show: false,
        modalType: "",
        data: {},
      });

      // Clear form data
      setFormData({
        task: "",
        assignee: "",
        priority: TaskPriority.LOW,
        status: TaskStatus.TO_DO,
        dueDate: "",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: deleteTaskAxios,
    onSuccess: () => {
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Close view modal
      setViewModal({
        show: false,
        modalType: "",
        data: {},
      });
    },
  });

  // Dashboard data fetch
  const result = useQueries({
    queries: [
      {
        queryKey: ["team"],
        queryFn: () => getTeamData(userData.organizationId),
      },
      {
        queryKey: ["tasks"],
        queryFn: () =>
          getTasks({
            organizationId: userData.organizationId,
            ...filterFormData,
          }),
      },
    ],
  });

  const [teamQuery, tasksQuery] = result;

  if (teamQuery.isLoading || tasksQuery.isLoading) return <p>Loading...</p>;

  if (teamQuery.isLoading || tasksQuery.isError)
    return <p>Error loading data</p>;

  // === TEAM ===
  const team = teamQuery.data;

  // === TASKS ===
  // const sortedTasks = (
  //   data,
  //   {
  //     sortProperty,
  //     sortDirection,
  //   }: { sortProperty: string; sortDirection: "asc" | "desc" },
  // ) => {
  // };
  const tasks = tasksQuery.data;

  const handleInputChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    deleteTask.reset();
    addNewTask.reset();
    updateTask.reset();

    const key = ev.target.id;
    const value = ev.target.value;
    setFormData((values) => ({
      ...values,
      [key]: value,
    }));
  };

  const handleInputUpdate = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    deleteTask.reset();
    addNewTask.reset();
    updateTask.reset();

    const key = ev.target.id;
    const value = ev.target.value;
    setViewModal((values) => ({
      ...values,
      data: { ...values.data, [key]: value },
    }));
  };

  // Handler for update filter form data
  const handleFilterFormDataInput = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    deleteTask.reset();
    addNewTask.reset();
    updateTask.reset();

    const key = ev.target.id;
    const value = ev.target.value;

    // Make change
    // HACK!!!
    setFilterFormData((prev) => {
      const newData = { ...prev, [key]: value };

      filterFormData = newData;

      // Fetch data: Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      return newData;
    });
  };

  // Handler for form onSubmit event
  const addNewTaskHandler = (ev: React.FormEvent) => {
    ev.preventDefault();

    addNewTask.mutate({ ...formData, organizationId: userData.organizationId });
  };

  // Handler for updating onSubmit event
  const updateTaskHandler = (ev: React.FormEvent) => {
    ev.preventDefault();

    updateTask.mutate({ taskId: viewModal.data?.taskId, data: viewModal.data });
  };

  // Handler for deleting a task  onSubmit event
  const deleteTaskHandler = (ev: React.FormEvent) => {
    ev.preventDefault();

    deleteTask.mutate(viewModal.data?.taskId);
  };

  return (
    <DashboardLayout title={`Tasks (${tasks.length})`}>
      <>
        {/* Add New Task button Components */}
        <section className="sm:text-right">
          <button
            type="button"
            className="text-white bg-sky-600 hover:bg-sky-800 focus:ring-4 focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-sky-600 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-sky-800 cursor-pointer"
            onClick={() => setAddNewTaskModal((prev) => !prev)}
          >
            + New
          </button>
        </section>

        {/* Filter Panel */}
        <section className="mt-6 mb-4 flex flex-wrap gap-4">
          <select
            name="filterStatus"
            id="filterStatus"
            value={filterFormData.filterStatus}
            onChange={handleFilterFormDataInput}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="Done">Done</option>
            <option value="In Progress">In Progress</option>
            <option value="To Do">To Do</option>
          </select>

          {/* Priority */}
          <select
            name="filterPriority"
            id="filterPriority"
            value={filterFormData.filterPriority}
            onChange={handleFilterFormDataInput}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee */}
          <select
            name="filterAssignee"
            id="filterAssignee"
            value={filterFormData.filterAssignee}
            onChange={handleFilterFormDataInput}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          >
            <option value="">All Assignee</option>
            {team.map((item) => {
              return (
                <option value={item.userId} key={item.userId}>
                  {item.firstName}
                </option>
              );
            })}
          </select>

          {/* Due Date */}
          <input
            type="date"
            name="filterDueDate"
            id="filterDueDate"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            value={filterFormData.filterDueDate}
            onChange={handleFilterFormDataInput}
          />

          {/* Reset */}
          <button
            type="button"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 p-2.5 px-4 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white cursor-pointer"
            onClick={() => {
              setFilterFormData(() => {
                const newData = {
                  filterStatus: "",
                  filterPriority: "",
                  filterAssignee: "",
                  filterDueDate: "",
                };

                filterFormData = newData;

                // Fetch data: Invalidate query to refetch
                queryClient.invalidateQueries({ queryKey: ["tasks"] });

                return newData;
              });
            }}
          >
            Reset
          </button>
        </section>

        {tasks.length < 1 && <p>You currently have no tasks!</p>}

        {/* Task Table */}
        {tasks.length > 0 && (
          <section className="mt-6">
            <div className="relative bg-blue-60 overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-2 py-3">
                      S/N
                    </th>
                    {Object.keys(tasks[0])
                      .filter((item) => item !== "taskId")
                      .filter((item) => item !== "organizationId")
                      .filter((item) => item !== "firstName")
                      .filter((item) => item !== "lastName")
                      .filter((item) => item !== "emailAddress")
                      .filter((item) => item !== "role")
                      .map(formatTitle)
                      .map((item, index) => {
                        return (
                          <th scope="col" className="px-2 py-3" key={index}>
                            {item}
                          </th>
                        );
                      })}

                    {/* Action Column */}
                    <th scope="col" className="px-2 py-3">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((item, index: number) => {
                    return (
                      <tr
                        className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                        key={index}
                      >
                        <td className="px-2 py-3">{index + 1}</td>
                        <td className="px-2 py-3 capitalize">{item.task}</td>
                        <td className="px-2 py-3 capitalize">
                          {item.firstName}
                        </td>
                        <td
                          className={`px-2 py-3 capitalize ${item.priority === "high" ? "text-red-500" : ""} ${item.priority === "medium" ? "text-sky-500" : ""}`}
                        >
                          {item.priority}
                        </td>
                        <td
                          className={`px-2 py-3 capitalize ${item.status === TaskStatus.DONE ? "text-green-500" : ""} ${item.status === TaskStatus.IN_PROGRESS ? "text-sky-500" : ""}`}
                        >
                          {item.status}
                        </td>

                        <td className="px-2 py-3 capitalize">{item.dueDate}</td>

                        {/* Action */}
                        <td className="px-2 py-3">
                          {/* Edit */}
                          <button
                            type="button"
                            className="cursor-pointer  px-2"
                            onClick={() =>
                              setViewModal({
                                show: true,
                                modalType: "edit",
                                data: item,
                              })
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-5"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                            </svg>
                          </button>

                          {/* View */}
                          <button
                            type="button"
                            className="cursor-pointer  px-2"
                            onClick={() =>
                              setViewModal({
                                show: true,
                                modalType: "view",
                                data: item,
                              })
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-5"
                            >
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                          {/* Delete */}
                          {userData.role === "admin" && (
                            <button
                              type="button"
                              className="cursor-pointer px-2"
                              onClick={() =>
                                setViewModal({
                                  show: true,
                                  modalType: "delete",
                                  data: item,
                                })
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-5"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Add New Task Modal */}
        {addNewTaskModal && (
          <section
            tabIndex={-1}
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-[calc(100%-1rem)] max-h-full"
          >
            {/* Overlay */}
            <div className="fixed p-4 w-full max-h-full mx-auto inset-0 bg-black opacity-20"></div>

            <div className="relative p-4 w-full max-w-2xl max-h-full mx-auto">
              {/* <!-- Modal content --> */}
              <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                {/* <!-- Modal header --> */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New Task
                    {viewModal.modalType === "view" && "View Task"}
                    {viewModal.modalType === "edit" && "Edit Task"}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setAddNewTaskModal((prev) => !prev)}
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>

                {/* <!-- Modal body --> */}
                <div className="p-4 md:p-5">
                  <form className="space-y-4" onSubmit={addNewTaskHandler}>
                    {/* Task */}
                    <div>
                      <label
                        htmlFor="task"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Task
                      </label>
                      <input
                        type="text"
                        name="task"
                        id="task"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder=""
                        required
                        value={formData.task}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Assignee */}
                    <div>
                      <label
                        htmlFor="assignee"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Assignee
                      </label>

                      <select
                        id="assignee"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={formData.assignee}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        {team.map((item) => {
                          return (
                            <option
                              key={item.userId}
                              value={item.userId}
                              className="capitalize"
                            >
                              {item.firstName}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label
                        htmlFor="priority"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Priority
                      </label>

                      <select
                        id="priority"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label
                        htmlFor="dueDate"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Doe"
                        required
                        value={formData.dueDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="text-center mt-8">
                      <button
                        type="submit"
                        className="w-50 text-white bg-sky-600 hover:bg-sky-800 focus:ring-4 focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-sky-600 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-sky-800 cursor-pointer"
                      >
                        {addNewTask.isPending ? "Creating task..." : "Submit"}
                      </button>
                    </div>
                  </form>

                  {addNewTask.isError && toast.error("Failed to create task")}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* View Task Modal */}
        {viewModal.show && viewModal.modalType === "view" && (
          <section
            tabIndex={-1}
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-[calc(100%-1rem)] max-h-full"
          >
            {/* Overlay */}
            <div className="fixed p-4 w-full max-h-full mx-auto inset-0 bg-black opacity-20"></div>

            <div className="relative p-4 w-full max-w-2xl max-h-full mx-auto">
              {/* <!-- Modal content --> */}
              <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                {/* <!-- Modal header --> */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    View Task
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() =>
                      setViewModal({
                        show: false,
                        modalType: "",
                        data: {},
                      })
                    }
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>

                {/* <!-- Modal body --> */}
                <div className="p-4 md:p-5">
                  <form className="space-y-4">
                    {/* Task */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Task
                      </label>
                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        value={viewModal.data?.task}
                        disabled
                      />
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Assignee
                      </label>

                      <input
                        type="text"
                        disabled
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white capitalize"
                        value={`${viewModal.data?.firstName || ""} ${viewModal.data?.lastName ?? ""}`}
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Priority
                      </label>

                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white capitalize"
                        value={viewModal.data?.priority}
                        disabled
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Status
                      </label>

                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white capitalize"
                        value={viewModal.data?.status}
                        disabled
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Due Date
                      </label>

                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white capitalize"
                        value={viewModal.data?.dueDate}
                        disabled
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Edit Task Modal */}
        {viewModal.show && viewModal.modalType === "edit" && (
          <section
            tabIndex={-1}
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-[calc(100%-1rem)] max-h-full"
          >
            {/* Overlay */}
            <div className="fixed p-4 w-full max-h-full mx-auto inset-0 bg-black opacity-20"></div>

            <div className="relative p-4 w-full max-w-2xl max-h-full mx-auto">
              {/* <!-- Modal content --> */}
              <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                {/* <!-- Modal header --> */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Task
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() =>
                      setViewModal({
                        show: false,
                        modalType: "",
                        data: {},
                      })
                    }
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>

                {/* <!-- Modal body --> */}
                <div className="p-4 md:p-5">
                  <form className="space-y-4" onSubmit={updateTaskHandler}>
                    {/* Task */}
                    <div>
                      <label
                        htmlFor="task"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Task
                      </label>
                      <input
                        type="text"
                        name="task"
                        id="task"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder=""
                        required
                        value={viewModal.data?.task}
                        onChange={handleInputUpdate}
                      />
                    </div>

                    {/* Assignee */}
                    <div>
                      <label
                        htmlFor="assignee"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Assignee
                      </label>

                      <select
                        id="assignee"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={viewModal.data.assignee}
                        onChange={handleInputUpdate}
                      >
                        <option value="">Select...</option>
                        {team.map((item) => {
                          return (
                            <option
                              key={item.userId}
                              value={item.userId}
                              className="capitalize"
                            >
                              {item.firstName}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label
                        htmlFor="priority"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Priority
                      </label>

                      <select
                        id="priority"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={viewModal.data.priority}
                        onChange={handleInputUpdate}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label
                        htmlFor="status"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Status
                      </label>

                      <select
                        id="status"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={viewModal.data.status}
                        onChange={handleInputUpdate}
                      >
                        <option value="Done">Done</option>
                        <option value="In Progress">In Progress</option>
                        <option value="To Do">To Do</option>
                      </select>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label
                        htmlFor="dueDate"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Doe"
                        required
                        value={viewModal.data.dueDate}
                        onChange={handleInputUpdate}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="text-center mt-8">
                      <button
                        type="submit"
                        className="w-50 text-white bg-sky-600 hover:bg-sky-800 focus:ring-4 focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-sky-600 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-sky-800 cursor-pointer"
                      >
                        {updateTask.isPending ? "Updating task..." : "Submit"}
                      </button>
                    </div>
                  </form>

                  {updateTask.isError && toast.error("Failed to update task")}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Delete Task Modal */}
        {viewModal.show && viewModal.modalType === "delete" && (
          <section
            tabIndex={-1}
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-[calc(100%-1rem)] max-h-full"
          >
            {/* Overlay */}
            <div className="fixed p-4 w-full max-h-full mx-auto inset-0 bg-black opacity-20"></div>

            <div className="relative p-4 w-full max-w-2xl max-h-full mx-auto">
              <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                <button
                  type="button"
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() =>
                    setViewModal({
                      show: false,
                      modalType: "",
                      data: {},
                    })
                  }
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>

                <div className="p-4 md:p-5 text-center">
                  <svg
                    className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>

                  <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete this task?
                  </h3>
                  <form onSubmit={deleteTaskHandler}>
                    <button
                      type="submit"
                      className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                    >
                      Yes, I'm sure
                    </button>
                    <button
                      type="button"
                      className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                      onClick={() =>
                        setViewModal({
                          show: false,
                          modalType: "",
                          data: {},
                        })
                      }
                    >
                      No, cancel
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
      </>
    </DashboardLayout>
  );
}
