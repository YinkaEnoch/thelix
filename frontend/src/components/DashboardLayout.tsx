import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type PropsWithChildren } from "react";
import { clearAccessToken, getAccessToken } from "../utils/token.util";
import { getUserData } from "../utils/userData.util";

type Props = PropsWithChildren & {
  title: string;
};

export const DashboardLayout = (props: Props) => {
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);
  const userData = getUserData();

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!accessToken || !userData) {
      navigate({ to: "/login" });
    }

    return () => {};
  }, [navigate, userData]);

  const userInitials = `${userData?.firstName.charAt(0)}${userData?.lastName.charAt(0)}`;

  return (
    <main className="sm:flex min-h-screen">
      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out -translate-x-full sm:translate-x-0 sm:static ${openDrawer ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="overflow-y-auto py-5 px-3 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {/* User Profile */}
          <section className="mb-8 dark:text-white">
            <div className="flex items-center justify-center w-[3rem] h-[3rem] bg-sky-600 m-auto mb-2 rounded-4xl">
              <span className="font-bold">{userInitials}</span>
            </div>
            <p className="text-center text-xl">{`${userData?.firstName} ${userData?.lastName}`}</p>
            <p className="text-center text-sm capitalize">{userData?.role}</p>
          </section>

          {/* Sidebar Nav */}
          <ul className="space-y-4">
            {/* Overview */}
            <li>
              <a
                href="/dashboard"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <span className="">Overview</span>
              </a>
            </li>

            {/* Task */}
            <li>
              <a
                href="/dashboard/task"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <span className="">Task</span>
              </a>
            </li>

            {/* Team */}
            <li>
              <a
                href="/dashboard/team"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <span className="">Team</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay when sidebar is open (mobile only) */}
      {openDrawer && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-20 sm:hidden"
          onClick={() => setOpenDrawer((prev) => !prev)}
        ></div>
      )}

      <section className="flex-1">
        {/* Header Component */}
        <header className="flex items-center shadow-md">
          <button
            type="button"
            className="inline-flex items-center p-2 mt-2 ml-3 text-sm rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            onClick={() => setOpenDrawer((prev) => !prev)}
          >
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>
          <h2 className="text-2xl p-2 mt-2">{props.title}</h2>

          {/* Logout */}
          <button
            type="button"
            className="block p-2 mt-2 ml-auto underline text-sky-500 cursor-pointer"
            onClick={() => {
              clearAccessToken();
              navigate({ to: "/login" });
            }}
          >
            Logout
          </button>
        </header>

        <div className="p-2 mt-4">{props.children}</div>
      </section>
    </main>
  );
};
