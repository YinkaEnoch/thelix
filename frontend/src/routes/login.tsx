import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { saveAccessToken } from "../utils/token.util";
import { saveUserData } from "../utils/userData.util";

export const Route = createFileRoute("/login")({
  component: Login,
});

type LoginFormData = {
  emailAddress: string;
  password: string;
};

const loginUser = async (data: LoginFormData) => {
  const response = await axios.post("/api/v1/auth/login", data);
  return response.data;
};

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailAddress: "",
    password: "",
  });

  // Handler for input fields onChange event
  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const key = ev.target.id;
    const value = ev.target.value;
    setFormData((values) => ({
      ...values,
      [key]: value,
    }));
  };

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log({ data });

      saveAccessToken(data?.access_token);
      saveUserData(data?.user);

      return navigate({ to: "/dashboard" });
    },
  });

  // Handler for form onSubmit event
  const formHandler = (ev: React.FormEvent) => {
    ev.preventDefault();

    mutate(formData);
  };

  return (
    <>
      <section className="h-svh bg-stone-100 px-4 grid items-center md:justify-center">
        <form className="md:w-md" onSubmit={formHandler}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <input
              type="email"
              id="emailAddress"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@flowbite.com"
              required
              value={formData.emailAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your password
            </label>
            <input
              type="password"
              id="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex items-start mb-5">
            <div className="flex items-center h-5">
              <input
                id="remember"
                type="checkbox"
                value=""
                className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
              />
            </div>
            <label
              htmlFor="remember"
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-50 sm:block sm:mx-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>

          <p className="mt-6 text-stone-700">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500">
              Sign Up
            </Link>
          </p>
        </form>
      </section>

      {isError && toast.error(`${error?.message ?? "Failed to Login"}`)}
    </>
  );
}
