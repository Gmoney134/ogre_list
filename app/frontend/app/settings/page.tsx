"use client";

import { useState } from "react";
import Link from "next/link";

import DarkModeToggle from "@/components/DarkModeToggle";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-green-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="absolute top-4 right-4">
        <DarkModeToggle />
      </div>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {/* Back to Dashboard */}
        <Link
          href="/dash"
          className="text-green-700 dark:text-green-300 hover:underline mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <label className="text-lg font-medium">Email Notifications</label>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={() => console.log("Settings saved (simulated)")}
            className="mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
