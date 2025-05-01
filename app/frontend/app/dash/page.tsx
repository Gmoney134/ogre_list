"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaTools, FaCog } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

import DarkModeToggle from "@/components/DarkModeToggle";

// --- Type Definitions ---
// Consider moving these to a shared types file if used elsewhere
interface Part {
    id?: number;
    name?: string;
}

interface Appliance {
    id?: number;
    name?: string;
    parts: Part[]; // Assuming parts might be needed later
}

interface Room {
    id?: number;
    name?: string;
    appliances: Appliance[]; // Assuming appliances might be needed later
}

interface House {
    id?: number;
    name?: string;
    rooms: Room[];
}

// --- Component ---
export default function Dashboard() {
    const router = useRouter();
    const [houses, setHouses] = useState<House[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Add error state
    const [expandedHouses, setExpandedHouses] = useState<number[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // --- Effects ---
    useEffect(() => {
        const token = sessionStorage.getItem("authToken");
        if (!token) {
            router.push("/"); // Redirect to login if no token
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null); // Clear previous errors

            // IMPORTANT: Use the proxy path defined in environment variables
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

            try {
                // --- Corrected Fetch Path ---
                const response = await fetch(`${apiUrl}/dashboard`, { // <-- Use /dashboard
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    // Try to get more specific error from backend
                    let errorMsg = "Failed to fetch dashboard data";
                    try {
                        // Check content type before parsing as JSON
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            const errorData = await response.json();
                            errorMsg = errorData.message || `Failed with status: ${response.status}`;
                        } else {
                            // If not JSON, use status text or a generic message
                            errorMsg = `Failed with status: ${response.status} ${response.statusText}`;
                        }
                    } catch (parseError) {
                        // If JSON parsing fails even after check, use status
                        errorMsg = `Failed with status: ${response.status} ${response.statusText}`;
                    }
                    throw new Error(errorMsg);
                }

                // --- Corrected Data Handling ---
                // Backend returns { houses: [...] }, so access the 'houses' property
                const data = await response.json();
                setHouses(data.houses || []); // <-- Access data.houses

            } catch (error: any) {
                console.error("Error fetching dashboard data:", error);
                setError(error.message || "An unexpected error occurred.");
                // Handle specific auth errors if needed
                if (error.message?.includes("Authentication failed") || error.message?.includes("Unauthorized")) {
                    // Optionally redirect to login after a delay
                    setTimeout(() => router.push("/"), 3000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]); // Add router to dependency array as it's used in the effect

    // --- Handlers ---
    const toggleExpandHouse = (id?: number) => {
        if (!id) return;
        setExpandedHouses((prev) =>
            prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
        );
    };

    const handleHouseClick = (house: House): void => {
        // Ensure house and house.id exist
        if (house?.id) {
            // 1. Store the clicked house data in sessionStorage
            sessionStorage.setItem('house', JSON.stringify(house));
            // 2. Navigate to the onion detail page
            router.push(`/onion`);
        } else {
            console.error("Cannot navigate: House data or ID is missing.", house);
            // Optionally set an error state to inform the user
            // setError("Could not load details for the selected house.");
        }
    };

    const handleLogout = () => {
        sessionStorage.clear(); // Clear all session data
        router.push("/"); // Redirect to login
    };

    const handleProfileClick = () => {
        router.push("/profile");
        setShowDropdown(false); // Close dropdown after navigation
    };

    // --- Render ---
    return (
        <div className="relative min-h-screen text-gray-900 dark:text-gray-100">
            {/* Background Image */}
            <img
                src="/images/swamp.jpg" // Ensure this path is correct in your public folder
                alt="" // Decorative image, empty alt is acceptable
                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
                aria-hidden="true"
            />

            {/* Layout Wrapper */}
            <div className="relative z-10 flex min-h-screen"> {/* Added relative z-10 */}
                {/* Sidebar */}
                <aside className="w-64 bg-green-900 dark:bg-gray-800 text-white p-6 flex flex-col"> {/* Added flex flex-col */}
                    <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                    <nav className="flex-grow"> {/* Added flex-grow */}
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/dash"
                                    className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded transition-colors"
                                >
                                    <FaHome /> Home
                                </Link>
                            </li>
                            {/* Add other sidebar links if needed */}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 bg-green-600/80 dark:bg-gray-900/80"> {/* Added transparency */}
                    <header className="relative bg-green-500 dark:bg-gray-700 rounded shadow p-4 mb-6 text-white flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Welcome to Your Swamp</h1>
                        <div className="flex items-center gap-4">
                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded transition-colors"
                                    aria-haspopup="true"
                                    aria-expanded={showDropdown}
                                >
                                    Profile
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg z-20"> {/* Increased z-index */}
                                        <ul className="text-sm text-gray-700 dark:text-gray-200" role="menu">
                                            <li role="menuitem">
                                                <button
                                                    onClick={handleProfileClick}
                                                    className="w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 cursor-pointer transition-colors"
                                                >
                                                    Edit Profile
                                                </button>
                                            </li>
                                            <li role="menuitem">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left hover:bg-red-100 dark:hover:bg-red-700 px-4 py-2 text-red-600 dark:text-red-300 cursor-pointer transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Dark Mode Toggle */}
                            <div>
                                <DarkModeToggle />
                            </div>
                        </div>
                    </header>

                    <section className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-white">Your Onions</h2>
                        <button
                            onClick={() => router.push("/createOnion")} // Ensure this route exists
                            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
                        >
                            Add Onion
                        </button>
                    </section>

                    {/* Display Area */}
                    <section>
                        {loading && <p className="text-center text-white">Loading your onions...</p>}
                        {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded">{error}</p>}
                        {!loading && !error && houses.length === 0 && (
                            <p className="text-center text-gray-300">No onions found. Try adding one!</p>
                        )}
                        {!loading && !error && houses.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {houses.map((house) => (
                                    <div
                                        key={house.id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded shadow transition duration-150 ease-in-out hover:ring-2 hover:ring-green-300 dark:hover:ring-green-500"
                                    >
                                        <div
                                            className="flex justify-between items-center mb-2 cursor-pointer"
                                            onClick={() => toggleExpandHouse(house.id)}
                                            onDoubleClick={() => handleHouseClick(house)}
                                            title="Click to expand, double-click to view details" // Tooltip for usability
                                        >
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{house.name}</h3>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {expandedHouses.includes(house.id!) ? (
                                                    <MdExpandLess size={24} aria-label="Collapse"/>
                                                ) : (
                                                    <MdExpandMore size={24} aria-label="Expand"/>
                                                )}
                                            </span>
                                        </div>

                                        {/* Expanded Content */}
                                        {expandedHouses.includes(house.id!) && (
                                            <div className="ml-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                                {house.rooms.length > 0 ? (
                                                    house.rooms.map((room) => (
                                                        <div key={room.id}>
                                                            <p className="font-semibold text-gray-700 dark:text-gray-300">
                                                                <span className="mr-1" aria-hidden="true">🛏</span> {/* Emoji for visual cue */}
                                                                {room.name}
                                                            </p>
                                                            {/* You could list appliances/parts here if needed */}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">No rooms added yet.</p>
                                                )}
                                                {/* Add View Details Button */}
                                                <button
                                                    onClick={() => handleHouseClick(house)}
                                                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}