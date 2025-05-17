import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

type SignUpFormData = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  role: string;
};

const signUp = async (data: SignUpFormData) => {
  const response = await axios.post("/api/v1/auth/signup", data);
  return response.data;
};

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    emailAddress: "",
    password: "",
    role: "admin", // Default role
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

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      navigate({ to: "/login" });
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
          {/* FIRST NAME */}
          <div className="mb-5">
            <label
              htmlFor="firstName"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="John"
              required
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>

          {/* LAST NAME */}
          <div className="mb-5">
            <label
              htmlFor="lastName"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Doe"
              required
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          {/* EMAIL */}
          <div className="mb-5">
            <label
              htmlFor="emailAddress"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Email Address
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

          {/* PASSWORD */}
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
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

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-50 sm:block sm:mx-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isPending ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="mt-6 text-stone-700">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500">
              Login
            </Link>
          </p>
        </form>
      </section>

      {isError && toast.error(`${error?.message ?? "Failed to Sign Up"}`)}
      {isSuccess && toast.success("Sign Up Successful")}
    </>
  );
}
