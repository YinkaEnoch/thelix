import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../components/DashboardLayout";
import axios from "axios";
import { useQueries } from "@tanstack/react-query";
import { getUserData } from "../utils/userData.util";
import { SmallCard } from "../components/SmallCard";
import { TaskStatus } from "../utils/tasks.enum";

export const Route = createFileRoute("/dashboard")({
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
  const response = await axios.get(
    `/api/v1/auth/teams?organizationId=${organizationId}`,
  );
  return response.data;
};

const getTasks = async (organizationId: string) => {
  const response = await axios.get(
    `/api/v1/tasks?organizationId=${organizationId}`,
  );

  // console.log(response);

  return response.data;
};

function RouteComponent() {
  const userData = getUserData();

  const result = useQueries({
    queries: [
      // { queryKey: ["team"], queryFn: getTeamData },
      { queryKey: ["tasks"], queryFn: () => getTasks(userData.organizationId) },
    ],
  });

  // const [teamQuery, tasksQuery] = result;
  const [tasksQuery] = result;

  if (tasksQuery.isLoading) return <p>Loading...</p>;

  if (tasksQuery.isError) return <p>Error loading data</p>;

  const tasks = tasksQuery.data;
  const totalTasks = tasks.length;

  const assignedtasks = tasks.filter(
    (item: Record<string, any>) => item.assignee !== "",
  ).length;

  const completedTasks = tasks.filter(
    (item: Record<string, any>) => item.status === TaskStatus.DONE,
  ).length;

  const overdueTasks = tasks.filter(
    (item: Record<string, any>) => Date.now() > Date.parse(item.dueDate),
  ).length;

  console.log(tasksQuery);
  console.log(tasks);

  return (
    <DashboardLayout title={"Overview"}>
      <>
        {/* Card Components */}
        <section className="flex gap-4 flex-wrap">
          <SmallCard title="Total Tasks" content={totalTasks} />
          <SmallCard title="Assigned Tasks" content={assignedtasks} />
          <SmallCard title="Completed Tasks" content={completedTasks} />
          <SmallCard title="Overdue Tasks" content={overdueTasks} />
        </section>

        {/* Team */}
        <section></section>
      </>
    </DashboardLayout>
  );
}
