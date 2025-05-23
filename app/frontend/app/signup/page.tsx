"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DarkModeToggle from "@/components/DarkModeToggle";

export default function SignUp() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setSuccess(""); // Clear previous success messages

        // Read the API URL from the environment variable
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
        console.log("Attempting sign up with API URL:", apiUrl); // Debugging

        // Check if apiUrl is defined before using it
        //if (!apiUrl) {
        // console.error("API URL is not defined. Check build configuration.");
        //  setError("Configuration error: Cannot connect to the server.");
        // return; // Stop execution if URL is missing
        //}

        try {
            // Use the apiUrl variable here
            const response = await fetch(`${apiUrl}/auth/register`, { // <-- Use the variable
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password, email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to register");
            }

            setSuccess("Registration successful! Redirecting to login...");
            setError("");

            // Redirect to login page after successful registration
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            setSuccess("");
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
                    transform: "translate(-50%, -73%)",
                }}
            />
            <div className="absolute top-4 right-4 z-10">
                <DarkModeToggle />
            </div>

            <div className="relative z-10 bg-green-600 dark:bg-gray-900 shadow-lg rounded-2x1 p-8 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <h2 className="text-center text-4xl font-semibold mb-4 dark:text-white">Ogre List</h2>
                </div>
                <h2 className="text-center text-xl font-semibold mb-4 dark:text-white">Sign Up</h2>
                <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
                        required
                    />
                    <input
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-green-700 text-white rounded-mb py-2 hover:bg-green-800 transition"
                    >
                        Sign Up
                    </button>
                </form>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {success && <p className="text-green-500 text-center mt-4">{success}</p>}
                <p className="text-center text-sm text-gray-800 dark:text-gray-400 mt-4">
                    Already have an account?{" "}
                    <a href="/" className="text-blue-700 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}