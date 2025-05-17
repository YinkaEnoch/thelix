import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../../components/DashboardLayout";
import axios from "axios";
import { useQueries } from "@tanstack/react-query";
import { getUserData } from "../../utils/userData.util";
import { SmallCard } from "../../components/SmallCard";
import { TaskStatus } from "../../utils/tasks.enum";
import { useEffect } from "react";
import { getAccessToken } from "../../utils/token.util";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

type TaskDataType = {
  id: number;
  taskId: string;
  task: string;
  assignee: string;
  organizationId: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: Date;
  updatedAt: Date;
};

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

function RouteComponent() {
  const navigate = useNavigate();
  const userData = getUserData();

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!accessToken || !userData) {
      navigate({ to: "/login" });
    }

    return () => {};
  }, [navigate, userData]);

  const result = useQueries({
    queries: [
      {
        queryKey: ["team"],
        queryFn: () => getTeamData(userData.organizationId),
      },
      { queryKey: ["tasks"], queryFn: () => getTasks(userData.organizationId) },
    ],
  });

  const [teamQuery, tasksQuery] = result;

  if (teamQuery.isLoading || tasksQuery.isLoading) return <p>Loading...</p>;

  if (teamQuery.isLoading || tasksQuery.isError)
    return <p>Error loading data</p>;

  // === TEAM ===
  const team = teamQuery.data;

  // === TASKS ===
  const tasks = tasksQuery.data;

  const assignedtasks = tasks.filter(
    (item: Record<string, any>) => item.assignee !== "",
  ).length;

  const completedTasks = tasks.filter(
    (item: Record<string, any>) => item.status === TaskStatus.DONE,
  ).length;

  const overdueTasks = tasks.filter(
    (item: Record<string, any>) => Date.now() > Date.parse(item.dueDate),
  ).length;

  return (
    <DashboardLayout title={"Overview"}>
      <>
        {/* Card Components */}
        <section className="flex gap-4 flex-wrap">
          <SmallCard title="Total Tasks" content={tasks.length} />
          <SmallCard title="Assigned Tasks" content={assignedtasks} />
          <SmallCard title="Completed Tasks" content={completedTasks} />
          <SmallCard title="Overdue Tasks" content={overdueTasks} />
        </section>

        {/* Team */}
        <section className="mt-12">
          <div className="block w-full py-2 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <h4 className="font-bold mb-6">Team ({team.length})</h4>

            <section className="flex items-center gap-8 flex-wrap">
              {team.map((member) => {
                return (
                  <div className="text-center" key={member.userId}>
                    <p
                      className={`flex items-center justify-center w-[3rem] h-[3rem] border-2 m-auto mb-2 rounded-4xl ${member.role === "admin" ? "border-sky-500" : "border-black"}`}
                    >
                      <span className="font-bold">
                        {member.firstName.charAt(0)}
                      </span>
                    </p>
                    <p>{`${member.firstName} ${member.lastName}`}</p>
                    <p className="text-gray-600">{member.emailAddress}</p>
                  </div>
                );
              })}
            </section>
          </div>
        </section>
      </>
    </DashboardLayout>
  );
}
