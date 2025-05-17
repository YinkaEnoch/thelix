import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../../components/DashboardLayout";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserData } from "../../utils/userData.util";
import { SmallCard } from "../../components/SmallCard";
import { TaskStatus } from "../../utils/tasks.enum";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAccessToken } from "../../utils/token.util";

export const Route = createFileRoute("/dashboard/team")({
  component: RouteComponent,
});

const getTeamData = async (organizationId: string) => {
  const response = await axios.get(`/api/v1/auth/teams/${organizationId}`);
  return response.data;
};

const getTasks = async (organizationId: string) => {
  const response = await axios.get(
    `/api/v1/tasks?organizationId=${organizationId}`,
  );

  return response.data;
};

function formatTitle(str: string) {
  return str.replace(/([A-Z])/g, " $1").toLowerCase();
}

type AddNewMemberFormData = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  role: string;
  organizationId: string;
};

const addNewMember = async (data: AddNewMemberFormData) => {
  const response = await axios.post("/api/v1/auth/team/add", data);
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

    // Return to Overview page for non-admin users
    if (userData.role !== "admin") {
      navigate({ to: "/dashboard" });
    }

    return () => {};
  }, [navigate, userData]);

  const [viewModal, setViewModal] = useState({
    show: false,
    modalType: "",
    data: {},
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    password: "",
    role: "",
  });

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: addNewMember,
    onSuccess: () => {
      // Invalidate query to refetch
      queryClient.invalidateQueries({ queryKey: ["team"] });

      // Close view modal
      setViewModal({
        show: false,
        modalType: "",
        data: {},
      });

      // Clear form data
      setFormData({
        firstName: "",
        lastName: "",
        emailAddress: "",
        password: "",
        role: "",
      });
    },
  });

  const teamQuery = useQuery({
    queryKey: ["team"],
    queryFn: () => getTeamData(userData.organizationId),
  });

  if (teamQuery.isLoading) return <p>Loading...</p>;
  if (teamQuery.isLoading) return <p>Error loading data</p>;

  const team = teamQuery.data;

  const handleInputChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const key = ev.target.id;
    const value = ev.target.value;
    setFormData((values) => ({
      ...values,
      [key]: value,
    }));
  };

  // Handler for form onSubmit event
  const formHandler = (ev: React.FormEvent) => {
    ev.preventDefault();

    mutate({ ...formData, organizationId: userData.organizationId });
  };

  return (
    <DashboardLayout title={`Team (${team.length})`}>
      <>
        {/* Add New member button Components */}
        <section className="sm:text-right">
          <button
            type="button"
            className="text-white bg-sky-600 hover:bg-sky-800 focus:ring-4 focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-sky-600 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-sky-800 cursor-pointer"
            onClick={() =>
              setViewModal({
                show: true,
                modalType: "add",
                data: {},
              })
            }
          >
            + New
          </button>
        </section>

        {/* Team Table */}
        <section className="mt-6">
          <div className="relative bg-blue-60 overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-2 py-3">
                    S/N
                  </th>
                  {Object.keys(team[0])
                    .filter((item) => item !== "userId")
                    .filter((item) => item !== "organizationId")
                    .filter((item) => item !== "createdAt")
                    .filter((item) => item !== "updatedAt")
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
                {team.map((item, index: number) => {
                  return (
                    <tr
                      className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                      key={index}
                    >
                      <td className="px-2 py-3">{index + 1}</td>
                      <td className="px-2 py-3 capitalize">{item.firstName}</td>
                      <td className="px-2 py-3 capitalize">{item.lastName}</td>
                      <td className="px-2 py-3">{item.emailAddress}</td>
                      <td
                        className={`px-2 py-3 capitalize ${item.role === "admin" ? "text-sky-500" : ""}`}
                      >
                        {item.role}
                      </td>

                      {/* Action */}
                      <td className="px-2 py-3">
                        {/* Edit */}
                        <button
                          type="button"
                          className="cursor-pointer  px-2"
                          // onClick={() =>
                          //   setViewModal({
                          //     show: true,
                          //     modalType: "edit",
                          //     data: item,
                          //   })
                          // }
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
                          // onClick={() =>
                          //   setViewModal({
                          //     show: true,
                          //     modalType: "view",
                          //     data: item,
                          //   })
                          // }
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
                        {item.userId !== userData.userId && (
                          <button type="button" className="cursor-pointer px-2">
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

        {/* View Modal */}
        {viewModal.show && (
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
                    {viewModal.modalType === "add" && "Add New Member"}
                    {viewModal.modalType === "view" && "View Member"}
                    {viewModal.modalType === "edit" && "Edit Member"}
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
                  <form className="space-y-4" onSubmit={formHandler}>
                    {/* First Name */}
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="John"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Doe"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label
                        htmlFor="emailAddress"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="emailAddress"
                        id="emailAddress"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="name@company.com"
                        required
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="********"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label
                        htmlFor="role"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Role
                      </label>

                      <select
                        id="role"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>
                          Select role...
                        </option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center mt-8">
                      <button
                        type="submit"
                        className="w-50 text-white bg-sky-600 hover:bg-sky-800 focus:ring-4 focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-sky-600 dark:hover:bg-sky-700 focus:outline-none dark:focus:ring-sky-800 cursor-pointer"
                      >
                        {isPending ? "Creating member..." : "Submit"}
                      </button>
                    </div>
                  </form>

                  {isError && toast.error("Failed to create team member")}
                </div>
              </div>
            </div>
          </section>
        )}
      </>
    </DashboardLayout>
  );
}
