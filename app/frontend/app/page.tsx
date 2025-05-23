"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

import DarkModeToggle from "@/components/DarkModeToggle";

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Use the variable you already defined and checked
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
            console.log("Attempting login with API URL:", apiUrl); // Good for debugging

            // Check if apiUrl is defined before using it
            if (!apiUrl) {
                // Log the error and inform the user
                console.error("API URL is not defined. Check build configuration.");
                setError("Configuration error: Cannot connect to the server.");
                return; // Stop execution if URL is missing
            }

            // Use the apiUrl variable here
            const response = await fetch(`${apiUrl}/auth/login`, { // <-- Use the variable
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error response:", errorText);
                // Consider parsing errorText if it's JSON from the backend
                throw new Error(`Login failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const { token } = data;

            sessionStorage.setItem("authToken", token);
            setError("");
            router.push("/dash");
        } catch (err) {
            // Keep your existing error handling
            if (err instanceof Error) {
                console.error("Login error:", err);
                setError(err.message);
            } else {
                console.error("Unknown error:", err);
                setError("An unknown error occurred");
            }
        }
    };



    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
            <img
                src="/images/ogre.png"
                alt="Ogre background"
                className="pointer-events-none absolute w-[875px] h-[875px] z-0"
                style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -70%)",
                }}
            />
            <div className="absolute top-4 right-4 z-10">
                <DarkModeToggle />
            </div>
            <div className="relative z-10 bg-green-600 dark:bg-gray-900 shadow-lg rounded-2x1 p-8 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <h2 className="text-center text-4xl font-semibold mb-4 dark:text-white">Ogre List</h2>
                </div>
                <h2 className="text-center text-xl font-semibold mb-4 dark:text-white">Login</h2>
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
                        required
                    />
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
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
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                <p className="text-center text-sm text-gray-800 dark:text-gray-400 mt-4">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-blue-700 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}