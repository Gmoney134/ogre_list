"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");
        if (!isLoggedIn) {
            router.push("/");
        }
    }, []);

    return (
        <div className="flex h-screen bg-green-100 dark:bg-gray-900">
            {/*Sidebar */}
            <aside className="w-64 bg-green-900 dark: bg-gray-800 text-white p-6">
                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                <nav>
                    <ul className="space-y-4">
                        <li><a href="#" className="block py-2 px-4 hover:bg-green-700 rounded">Home</a></li>
                        <li><a href="#" className="block py-2 px-4 hover:bg-green-700 rounded">Projects</a></li>
                        <li><a href="#" className="block py-2 px-4 hover:bg-green-700 rounded">Settings</a></li>
                        <li>
                            <button onClick={() => {
                                sessionStorage.removeItem("isLoggedIn");
                                router.push("/");
                            }}
                                className="block w-full text-left py-2 px-4 hover:bg-red-700 rounded"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Top Navbar */}
                <header className="flex justify-between items-center bg-white p-4 rounded shadow mb-6">
                    <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
                </header>
            </div>
        </div>
    );
}