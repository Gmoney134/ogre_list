"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();

        sessionStorage.setItem("userEmail", email);
        sessionStorage.setItem("userPassword", password);
        alert("Account created successfully!");

        router.push("/");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
            <div className="bg-green-100 dark:bg-gray-900 shadow-lg rounded-2xl p-8 w-full max-w-sm">
                <div className="flex justify-center mb-6">
                    <h2 className="text-center text-4xl font-semibold mb-4">Ogre List</h2>
                </div>
                <h2 className="text-center text-xl font-semibold mb-4">Sign Up</h2>
                <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Enter your password"
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

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Already have an account?{" "}
                    <a href="/" className="text-blue-600 hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    )
}