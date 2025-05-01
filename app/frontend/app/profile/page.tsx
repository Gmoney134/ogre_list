"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // <-- Add loading state

  useEffect(() => {
    // Check for token first - redirect if missing (more robust)
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found, redirecting to login.");
      router.push("/");
      return;
    }

    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUsername(parsed.username || "");
        setEmail(parsed.email || "");
      } catch (err: any) { // Catch specific error
        console.error("Invalid user data in sessionStorage:", err.message);
        setError("Failed to load profile data from session.");
        // Optionally clear invalid data: sessionStorage.removeItem("user");
      }
    } else {
      // Consider fetching profile data if not in session storage
      console.warn("User data not found in sessionStorage. Displaying empty fields.");
      // fetchProfileData(token); // You might want to implement this
    }
    // Add router to dependency array if used inside effect (though not strictly needed here as it runs once)
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setError("");
    setIsLoading(true); // <-- Set loading true

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || "/api/proxy";
    const token = sessionStorage.getItem("authToken");

    // Check for token existence before making the request
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setIsLoading(false);
      setTimeout(() => router.push("/"), 3000); // Redirect after showing message
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json", // Explicitly accept JSON
        },
        body: JSON.stringify({ username, email }),
      });

      // --- Robust Response Handling ---
      const contentType = response.headers.get("content-type");
      let responseData;

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json(); // Only parse if JSON
      } else {
        // Handle non-JSON response (likely HTML error page)
        const responseText = await response.text();
        console.error("Received non-JSON response:", responseText);
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Server returned an unexpected response (Status: ${response.status}).`);
      }
      // --- End Robust Response Handling ---

      if (!response.ok) {
        // Use message from parsed JSON error response if available
        throw new Error(responseData.message || `Update failed with status: ${response.status}`);
      }

      // --- Update sessionStorage with data FROM backend response ---
      sessionStorage.setItem("user", JSON.stringify({
        username: responseData.username, // Use data from response
        email: responseData.email        // Use data from response
      }));

      // Update local state as well to reflect backend's version
      setUsername(responseData.username);
      setEmail(responseData.email);

      setStatus("Profile updated successfully!");

    } catch (err: any) {
      console.error("Profile update error:", err);
      // Handle specific errors like auth failure
      if (err.message?.includes("Authentication failed")) {
        setError(err.message);
        setTimeout(() => router.push("/"), 3000); // Redirect after showing message
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false); // <-- Set loading false in finally block
    }
  };

  return (
      // Added basic layout structure for consistency
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900 text-white">
        {/* Consider adding DarkModeToggle if used elsewhere */}
        {/* <div className="absolute top-4 right-4"><DarkModeToggle /></div> */}

        <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
          <h1 className="text-center text-3xl font-bold mb-6">Edit Profile</h1>

          <form className="space-y-4" onSubmit={handleUpdate}>
            {/* Username Input with Label */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                  id="username" // Match label's htmlFor
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                  aria-describedby="username-desc" // Optional for screen readers
              />
            </div>

            {/* Email Input with Label */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                  id="email" // Match label's htmlFor
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                  aria-describedby="email-desc" // Optional
              />
            </div>

            {/* Submit Button with Loading State */}
            <button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 px-4 py-2 rounded text-white transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading} // <-- Disable button when loading
            >
              {isLoading ? "Saving..." : "Save Changes"} {/* <-- Change text */}
            </button>
          </form>

          {/* Status and Error Messages */}
          {status && <p className="text-green-400 text-center mt-4">{status}</p>}
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}

          {/* Back to Dashboard Link */}
          <div className="text-center mt-6">
            <Link href="/dash" className="inline-block text-sm text-blue-400 hover:text-blue-300 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
  );
}