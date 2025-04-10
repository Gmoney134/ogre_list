"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaTools, FaSignOutAlt, FaCog } from "react-icons/fa"; // Added FaCog
import { MdExpandMore, MdExpandLess } from "react-icons/md";

import DarkModeToggle from "@/components/DarkModeToggle";

// Define more specific types if possible, but keep generic for now
interface Part {
  id?: number;
  name?: string;
}

interface Appliance {
  id?: number;
  name?: string;
  parts: Part[];
}

interface Room {
  id?: number;
  name?: string;
  appliances: Appliance[];
}

interface House {
  id?: number;
  name?: string;
  rooms: Room[];
}

export default function Dashboard() {
  const router = useRouter();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Added error state for fetch
  const [expandedHouses, setExpandedHouses] = useState<number[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/"); // Redirect to login if no token
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors

      // Read the API URL from the environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log("Attempting to fetch dashboard data with API URL:", apiUrl); // Debugging

      // Check if apiUrl is defined before using it
      if (!apiUrl) {
        console.error("API URL is not defined. Check build configuration.");
        setError("Configuration error: Cannot connect to the server.");
        setLoading(false);
        return; // Stop execution if URL is missing
      }

      try {
        // Use the apiUrl variable here
        const response = await fetch(`${apiUrl}/dashboard`, { // <-- Use the variable
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Dashboard fetch response status:", response.status); // Debugging

        if (!response.ok) {
          // Handle potential errors like token expiration or server issues
          if (response.status === 401 || response.status === 403) {
            // Unauthorized or Forbidden, likely bad token
            sessionStorage.removeItem("authToken");
            router.push("/"); // Redirect to login
            throw new Error("Authentication failed. Please log in again.");
          }
          // Try to parse error message from backend
          let errorData;
          try {
            errorData = await response.json();
          } catch (parseError) {
            const errorText = await response.text();
            console.error("Backend non-JSON error response:", errorText);
            throw new Error(`Failed to fetch dashboard data: ${response.status} - ${errorText}`);
          }
          console.error("Backend error response:", errorData);
          throw new Error(errorData.message || `Failed to fetch dashboard data: ${response.status}`);
        }

        const data = await response.json();
        setHouses(data.houses || []); // Set houses, default to empty array if undefined/null
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching data.");
        }
        // Don't redirect automatically on fetch error unless it's auth-related (handled above)
      } finally {
        setLoading(false); // Ensure loading is set to false even if there's an error
      }
    };

    fetchDashboardData();
  }, [router]); // Add router to dependency array as it's used in the effect

  const toggleExpandHouse = (id?: number) => {
    if (!id) return; // Guard against undefined id
    setExpandedHouses((prev) =>
        prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    router.push("/");
  };

  return (
      <div className="flex min-h-screen bg-green-600 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-green-900 dark:bg-gray-800 text-white p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <nav className="flex-grow">
            <ul className="space-y-4">
              <li>
                <Link
                    href="/dash"
                    className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded transition"
                >
                  <FaHome /> Home
                </Link>
              </li>
              {/* Add links to other sections as needed */}
              {/* Example:
            <li>
              <Link href="/projects" className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded transition">
                <FaTools /> Projects
              </Link>
            </li>
            <li>
              <Link href="/settings" className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded transition">
                <FaCog /> Settings
              </Link>
            </li>
             */}
            </ul>
          </nav>
          {/* Logout Button at the bottom of sidebar */}
          <div className="mt-auto">
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left py-2 px-4 hover:bg-red-700 rounded transition text-red-300"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto"> {/* Added overflow-y-auto */}
          <header className="relative bg-green-500 dark:bg-gray-700 rounded shadow p-4 mb-6 text-white flex items-center justify-between">
            <h1 className="text-3xl font-bold">Welcome to Your Swamp</h1>
            <div className="flex items-center gap-4">
              {/* Profile Dropdown (Optional - can be simplified if logout is in sidebar) */}
              {/* <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Profile
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded shadow z-10">
                  <ul className="text-sm text-gray-700 dark:text-gray-100">
                    <li className="hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 cursor-pointer">Profile</li>
                    <li
                      onClick={handleLogout} // Use the handler
                      className="hover:bg-red-100 dark:hover:bg-red-700 px-4 py-2 text-red-600 dark:text-red-300 cursor-pointer"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div> */}

              {/* Dark Mode Toggle */}
              <div>
                <DarkModeToggle />
              </div>
            </div>
          </header>

          {/* Display Fetch Error */}
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
          )}

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white dark:text-gray-100">Your Onions</h2>
              <button
                  onClick={() => router.push("/createOnion")}
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
              >
                Add Onion
              </button>
            </div>

            {loading ? (
                <p className="text-center text-gray-300 dark:text-gray-400">Loading your onions...</p>
            ) : houses.length === 0 && !error ? (
                <p className="text-center text-gray-300 dark:text-gray-400">No onions found. Add your first one!</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {houses.map((house) => (
                      <div
                          key={house.id}
                          className="bg-white dark:bg-gray-800 p-4 rounded shadow transition duration-200 ease-in-out hover:shadow-lg" // Added hover effect
                      >
                        <div
                            className="flex justify-between items-center mb-2 cursor-pointer" // Make header clickable
                            onClick={() => toggleExpandHouse(house.id)}
                        >
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{house.name || "Unnamed House"}</h3>
                          {/* Ensure house.id is not undefined before checking includes */}
                          {house.id && expandedHouses.includes(house.id) ? (
                              <MdExpandLess size={24} />
                          ) : (
                              <MdExpandMore size={24} />
                          )}
                        </div>

                        {/* Collapsible content */}
                        {house.id && expandedHouses.includes(house.id) && (
                            <div className="ml-2 mt-2 space-y-3 border-t pt-3 dark:border-gray-700">
                              {house.rooms && house.rooms.length > 0 ? (
                                  house.rooms.map((room) => (
                                      <div key={room.id}>
                                        <p className="font-semibold text-gray-700 dark:text-gray-300">Room: {room.name || "Unnamed Room"}</p>
                                        {room.appliances && room.appliances.length > 0 ? (
                                            <ul className="ml-4 list-disc space-y-1 text-gray-600 dark:text-gray-400">
                                              {room.appliances.map((appliance) => (
                                                  <li key={appliance.id}>
                                                    {appliance.name || "Unnamed Appliance"}
                                                    {appliance.parts && appliance.parts.length > 0 && (
                                                        <ul className="ml-4 list-square text-sm">
                                                          {appliance.parts.map((part) => (
                                                              <li key={part.id}>🔧 {part.name || "Unnamed Part"}</li>
                                                          ))}
                                                        </ul>
                                                    )}
                                                  </li>
                                              ))}
                                            </ul>
                                        ) : (
                                            <p className="ml-4 text-sm text-gray-500 dark:text-gray-500 italic">No appliances in this room.</p>
                                        )}
                                      </div>
                                  ))
                              ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-500 italic">No rooms found in this house.</p>
                              )}
                            </div>
                        )}
                      </div>
                  ))}
                </div>
            )}
          </section>
        </main>
      </div>
  );
}