"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"

//import loginUser from ""

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const savedEmail = sessionStorage.getItem("userEmail");
    const savedPassword = sessionStorage.getItem("userPassword");

    if (email === savedEmail && password === savedPassword) {
      sessionStorage.setItem("isLoggedIn", "true");
      setError("");
      router.push("/dash");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
      <div className="bg-green-100 dark:bg-gray-900 shadow-lg rounded-2x1 p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <h2 className="text-center text-4xl font-semibold mb-4">Ogre List</h2>
        </div>
        <h2 className="text-center text-xl font-semibold mb-4">Login</h2>
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <AiFillEyeInvisible size={24} /> : <AiFillEye size={24} />}
            </button>
          </div>
          <button
            type="submit"
            className="bg-green-700 text-white rounded-mb py-2 hover:bg-green-800 transition"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}