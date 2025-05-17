import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../../components/DashboardLayout";
import axios from "axios";
import { useQueries } from "@tanstack/react-query";
import { getUserData } from "../../utils/userData.util";
import { SmallCard } from "../../components/SmallCard";
import { TaskStatus } from "../../utils/tasks.enum";

export const Route = createFileRoute("/dashboard/team copy")({
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

function RouteComponent() {
  const userData = getUserData();

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
  console.log({ team });

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
    <DashboardLayout title={"Tasks"}>
      <>
        <h1>Tasks</h1>
      </>
    </DashboardLayout>
  );
}
