"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUsername(parsed.username || "");
        setEmail(parsed.email || "");
      } catch (err) {
        console.error("Invalid user in sessionStorage");
      }
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || "/api/proxy";

    try {
      const token = sessionStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }

      // Update sessionStorage and show success
      sessionStorage.setItem("user", JSON.stringify({ username, email }));
      setStatus("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <form className="max-w-sm space-y-4" onSubmit={handleUpdate}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded text-white"
        >
          Save Changes
        </button>
      </form>

      {status && <p className="text-green-400 mt-4">{status}</p>}
      {error && <p className="text-red-400 mt-4">{error}</p>}

      <button
        onClick={() => router.push("/dash")}
        className="mt-8 inline-block bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
