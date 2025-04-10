"use client"

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const darkPref = localStorage.getItem("theme");
        if (
            darkPref === "dark" ||
            (!darkPref && window.matchMedia("(prefers-color-scheme: dark").matches)
        ) {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        } else {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
        }
    }, []);

    const toggleDarkMode = () => {
        const newTheme = isDark ? "light" : "dark";
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark");
        setIsDark(!isDark);
    };

    return (
        <button
        onClick={toggleDarkMode}
        className="bg-gray-100 p-2 rounded hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-700 dark-test-gray-50"
        aria-label="Toggle Dark Mode"
        >
            {isDark ? "Dark" : "Light"}
        </button>
    );
}