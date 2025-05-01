// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/room/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
// Added FaArrowLeft, FaEdit
import { FaHome, FaTools, FaCog, FaArrowLeft, FaEdit } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

// Expanded Room interface
interface Room {
  id?: number;
  name?: string;
  houseId?: number; // Keep for context if needed
  description?: string;
  squareFootage?: number | string; // Allow string for input, but number is better if possible
  reminderDate?: string | null;
  websiteLink?: string | null;
  // appliances array is fetched separately
}

// Appliance interface for the list
interface Appliance {
  id?: number;
  name?: string;
  // parts array is not needed for this view level
}

// Renamed component
export default function RoomDetails() {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loadingRoom, setLoadingRoom] = useState(true); // Separate loading states
  const [loadingAppliances, setLoadingAppliances] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAppliances, setExpandedAppliances] = useState<number[]>([]);

  useEffect(() => {
    // Safely access sessionStorage on the client side
    const roomDataString = sessionStorage.getItem("room");
    if (roomDataString) {
      try {
        const parsedRoom = JSON.parse(roomDataString);
        // Basic validation
        if (parsedRoom && parsedRoom.id && parsedRoom.name) {
          setRoom(parsedRoom);
        } else {
          throw new Error("Invalid room data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse room data:", e);
        setError("Could not load room details. Invalid data.");
        // Optional: Redirect
      } finally {
        setLoadingRoom(false);
      }
    } else {
      setError("No room selected. Please go back and select a room.");
      setLoadingRoom(false);
      // Optional: Redirect
      // router.push("/dash");
    }
  }, [router]); // Removed room from dependency array here

  // Fetch appliances associated with the room
  useEffect(() => {
    // Only fetch if we have a valid room ID
    if (!room?.id) {
      if (!loadingRoom) setLoadingAppliances(false);
      return;
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      setLoadingAppliances(false);
      // router.push("/"); // Optional: redirect to login
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    const fetchApplianceData = async () => {
      setLoadingAppliances(true); // Start loading appliances
      try {
        // Use the correct backend route for getting appliances by room ID
        const response = await fetch(`${apiUrl}/appliance/${room.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch appliances (Status: ${response.status})`);
        }

        const data = await response.json();
        setAppliances(data || []);
        setError(null); // Clear previous errors on success
      } catch (err: any) {
        console.error("Error fetching appliance data:", err);
        setError(err.message || "An unknown error occurred while fetching appliances.");
        setAppliances([]); // Clear appliances on error
      } finally {
        setLoadingAppliances(false); // Finish loading appliances
      }
    };

    fetchApplianceData();
    // Depend on room.id to refetch if the room changes
  }, [room?.id, loadingRoom, router]);

  // --- Handlers ---

  const toggleExpandAppliance = (id?: number) => {
    if (!id) return;
    setExpandedAppliances((prev) =>
        prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  // Navigate to the specific appliance's detail page
  const handleApplianceClick = (appliance: Appliance): void => {
    if (appliance?.id) {
      // Store the full appliance data before navigating
      // Note: Ensure the data fetched for the list includes all necessary fields
      // or fetch the full details on the appliance page itself.
      sessionStorage.setItem("appliance", JSON.stringify(appliance));
      router.push(`/appliance`); // Navigate to the appliance detail page
    } else {
      console.error("Cannot navigate: Appliance data or ID is missing.", appliance);
      setError("Could not load details for the selected appliance.");
    }
  };

  // Navigate to the page for creating a new appliance in this room
  const handleCreateApplianceClick = (): void => {
    if (room?.id) {
      sessionStorage.setItem("roomID", room.id.toString());
      router.push("/createAppliance");
    } else {
      setError("Cannot create appliance: Room ID is missing.");
    }
  };

  // Navigate to the page for editing this room
  const handleEditRoomClick = (): void => {
    if (room) {
      // Ensure the full room data is stored before navigating
      sessionStorage.setItem("room", JSON.stringify(room));
      router.push("/editRoom");
    } else {
      setError("Cannot edit: Room data is missing.");
    }
  };

  // Navigate back to the parent onion (house) page
  const handleGoBackToOnion = (): void => {
    // Assumes 'house' data is still in sessionStorage for onion/page.tsx
    router.push(`/onion`);
  };

  // Helper to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // --- Render Logic ---

  if (loadingRoom) {
    return <p className="p-6 text-center">Loading room details...</p>;
  }

  if (error && !room) {
    // Show error prominently if room couldn't load
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  if (!room) {
    // Fallback if room is null after loading
    return <p className="p-6 text-center">Room details not available.</p>;
  }

  return (
      <div className="flex min-h-screen bg-green-600 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-green-900 dark:bg-gray-800 text-white p-6 flex-shrink-0">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <nav>
            <ul className="space-y-4">
              <li>
                <Link
                    href="/dash"
                    className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded"
                >
                  <FaHome /> Home
                </Link>
              </li>
              {/* Remove or update Projects/Settings links if not used */}
              {/* <li>
                            <Link href="/projects" className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded">
                                <FaTools /> Projects
                            </Link>
                        </li>
                        <li>
                            <Link href="/settings" className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded">
                                <FaCog /> Settings
                            </Link>
                        </li> */}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Header with Back Button, Title, and Edit Button */}
          <header className="relative bg-green-500 dark:bg-gray-800 rounded shadow p-4 mb-6 dark:bg-gray-700 dark:text-white flex items-center justify-between">
            {/* Back Button */}
            <button
                onClick={handleGoBackToOnion}
                className="text-white px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-600 transition flex items-center gap-2 mr-4"
                title="Back to Onion (House)"
            >
              <FaArrowLeft /> Back
            </button>

            {/* Room Name Title */}
            <h1 className="text-3xl font-bold flex-grow text-center">
              {room.name || "Room Details"}
            </h1>

            {/* Edit Room Button */}
            <button
                onClick={handleEditRoomClick}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2 ml-4"
                title="Edit this room"
            >
              <FaEdit /> Edit Room
            </button>
          </header>

          {/* Room Details Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Room Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Description:</p>
                <p className="text-lg">{room.description || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Square Footage:</p>
                <p className="text-lg">{room.squareFootage ? `${room.squareFootage} sq ft` : "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Reminder Date:</p>
                <p className="text-lg">{formatDate(room.reminderDate)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-gray-600 dark:text-gray-400">Website Link:</p>
                {room.websiteLink ? (
                    <a
                        href={room.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {room.websiteLink}
                    </a>
                ) : (
                    <p className="text-lg">Not set</p>
                )}
              </div>
            </div>
          </section>

          {/* Appliances Section Header */}
          <section className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Appliances</h2>
            <button
                onClick={handleCreateApplianceClick}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
            >
              Add Appliance
            </button>
          </section>

          {/* Display loading/error specifically for appliances */}
          {loadingAppliances && <p className="text-center p-4">Loading appliances...</p>}
          {error && !loadingAppliances && <p className="text-center p-4 text-red-500">{error}</p>}

          {/* Appliances List */}
          {!loadingAppliances && appliances.length === 0 && !error && (
              <p className="text-center p-4 bg-white dark:bg-gray-800 rounded shadow">No appliances found in this room.</p>
          )}
          {!loadingAppliances && appliances.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {appliances.map((appliance) => (
                    <div
                        key={appliance.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-200 dark:hover:ring-green-400 cursor-pointer transition"
                        onDoubleClick={() => handleApplianceClick(appliance)} // Navigate on double click
                    >
                      <div
                          className="flex justify-between items-center mb-2"
                          onClick={() => toggleExpandAppliance(appliance.id)} // Optional: single click expand
                      >
                        <h3 className="text-lg font-bold">{appliance.name}</h3>
                        {/* Optional: expand icon */}
                        {expandedAppliances.includes(appliance.id!) ? (
                            <MdExpandLess />
                        ) : (
                            <MdExpandMore />
                        )}
                      </div>

                      {/* Optional: Show minimal details on expand */}
                      {expandedAppliances.includes(appliance.id!) && (
                          <div className="ml-2 mt-2 space-y-1 text-sm border-t pt-2">
                            {/* You could potentially show # of parts here if fetched */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Double-click for full details</p>
                          </div>
                      )}
                    </div>
                ))}
              </div>
          )}
        </main>
      </div>
  );
}