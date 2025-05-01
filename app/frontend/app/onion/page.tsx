// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/onion/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
// Added FaArrowLeft, FaEdit
import { FaHome, FaTools, FaCog, FaArrowLeft, FaEdit } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

// Expanded House interface (adjust fields as needed based on your backend model)
interface House {
  id?: number;
  name?: string; // Or maybe address?
  userId?: number; // Keep for context if needed
  address?: string;
  purchaseDate?: string | null;
  reminderDate?: string | null;
  websiteLink?: string | null;
  // rooms array is fetched separately
}

// Room interface for the list
interface Room {
  id?: number;
  name?: string;
  description?: string; // Optional: show in expanded view
  // appliances array is not needed for this view level
}

// Renamed component
export default function OnionDetails() {
  const router = useRouter();
  const [house, setHouse] = useState<House | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingHouse, setLoadingHouse] = useState(true); // Separate loading states
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<number[]>([]);

  useEffect(() => {
    // Safely access sessionStorage on the client side
    const houseDataString = sessionStorage.getItem("house"); // Assuming 'house' is the key used
    if (houseDataString) {
      try {
        const parsedHouse = JSON.parse(houseDataString);
        // Basic validation
        if (parsedHouse && parsedHouse.id && parsedHouse.name) { // Adjust validation if needed
          setHouse(parsedHouse);
        } else {
          throw new Error("Invalid house data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse house data:", e);
        setError("Could not load house details. Invalid data.");
        // Optional: Redirect
      } finally {
        setLoadingHouse(false);
      }
    } else {
      setError("No house selected. Please go back and select a house.");
      setLoadingHouse(false);
      // Optional: Redirect
      // router.push("/dash");
    }
  }, [router]); // Removed house from dependency array here

  // Fetch rooms associated with the house
  useEffect(() => {
    // Only fetch if we have a valid house ID
    if (!house?.id) {
      if (!loadingHouse) setLoadingRooms(false);
      return;
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      setLoadingRooms(false);
      // router.push("/"); // Optional: redirect to login
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    const fetchRoomData = async () => {
      setLoadingRooms(true); // Start loading rooms
      try {
        // Use the correct backend route for getting rooms by house ID
        const response = await fetch(`${apiUrl}/room/${house.id}`, { // Assuming this endpoint exists
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch rooms (Status: ${response.status})`);
        }

        const data = await response.json();
        setRooms(data || []);
        setError(null); // Clear previous errors on success
      } catch (err: any) {
        console.error("Error fetching room data:", err);
        setError(err.message || "An unknown error occurred while fetching rooms.");
        setRooms([]); // Clear rooms on error
      } finally {
        setLoadingRooms(false); // Finish loading rooms
      }
    };

    fetchRoomData();
    // Depend on house.id to refetch if the house changes
  }, [house?.id, loadingHouse, router]);

  // --- Handlers ---

  const toggleExpandRoom = (id?: number) => {
    if (!id) return;
    setExpandedRooms((prev) =>
        prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  // Navigate to the specific room's detail page
  const handleRoomClick = (room: Room): void => {
    if (room?.id) {
      // Store the full room data before navigating
      sessionStorage.setItem("room", JSON.stringify(room));
      router.push(`/room`); // Navigate to the room detail page
    } else {
      console.error("Cannot navigate: Room data or ID is missing.", room);
      setError("Could not load details for the selected room.");
    }
  };

  // Navigate to the page for creating a new room in this house
  const handleCreateRoomClick = (): void => {
    if (house?.id) {
      sessionStorage.setItem("houseID", house.id.toString()); // Used by createRoom page
      router.push("/createRoom");
    } else {
      setError("Cannot create room: House ID is missing.");
    }
  };

  // Navigate to the page for editing this house
  const handleEditHouseClick = (): void => {
    if (house) {
      // Ensure the full house data is stored before navigating
      sessionStorage.setItem("house", JSON.stringify(house));
      router.push("/editOnion"); // Or "/editHouse" - match your edit page route
    } else {
      setError("Cannot edit: House data is missing.");
    }
  };

  // Navigate back to the dashboard page
  const handleGoBackToDash = (): void => {
    router.push(`/dash`);
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

  if (loadingHouse) {
    return <p className="p-6 text-center">Loading house details...</p>;
  }

  if (error && !house) {
    // Show error prominently if house couldn't load
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  if (!house) {
    // Fallback if house is null after loading
    return <p className="p-6 text-center">House details not available.</p>;
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
              {/* Add other relevant links */}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Header with Back Button, Title, and Edit Button */}
          <header className="relative bg-green-500 dark:bg-gray-800 rounded shadow p-4 mb-6 dark:bg-gray-700 dark:text-white flex items-center justify-between">
            {/* Back Button */}
            <button
                onClick={handleGoBackToDash}
                className="text-white px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-600 transition flex items-center gap-2 mr-4"
                title="Back to Dashboard"
            >
              <FaArrowLeft /> Back
            </button>

            {/* House Name/Title */}
            <h1 className="text-3xl font-bold flex-grow text-center">
              {house.name || "House Details"} {/* Use house.name or house.address */}
            </h1>

            {/* Edit House Button */}
            <button
                onClick={handleEditHouseClick}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2 ml-4"
                title="Edit this house"
            >
              <FaEdit /> Edit House
            </button>
          </header>

          {/* House Details Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">House Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Address:</p>
                <p className="text-lg">{house.address || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Purchase Date:</p>
                <p className="text-lg">{formatDate(house.purchaseDate)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Reminder Date:</p>
                <p className="text-lg">{formatDate(house.reminderDate)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium text-gray-600 dark:text-gray-400">Website Link:</p>
                {house.websiteLink ? (
                    <a
                        href={house.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {house.websiteLink}
                    </a>
                ) : (
                    <p className="text-lg">Not set</p>
                )}
              </div>
              {/* Add any other relevant house details here */}
            </div>
          </section>

          {/* Rooms Section Header */}
          <section className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Rooms</h2>
            <button
                onClick={handleCreateRoomClick}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
            >
              Add Room
            </button>
          </section>

          {/* Display loading/error specifically for rooms */}
          {loadingRooms && <p className="text-center p-4">Loading rooms...</p>}
          {error && !loadingRooms && <p className="text-center p-4 text-red-500">{error}</p>}

          {/* Rooms List */}
          {!loadingRooms && rooms.length === 0 && !error && (
              <p className="text-center p-4 bg-white dark:bg-gray-800 rounded shadow">No rooms found in this house.</p>
          )}
          {!loadingRooms && rooms.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-200 dark:hover:ring-green-400 cursor-pointer transition"
                        onDoubleClick={() => handleRoomClick(room)} // Navigate on double click
                    >
                      <div
                          className="flex justify-between items-center mb-2"
                          onClick={() => toggleExpandRoom(room.id)} // Optional: single click expand
                      >
                        <h3 className="text-lg font-bold">{room.name}</h3>
                        {/* Optional: expand icon */}
                        {expandedRooms.includes(room.id!) ? (
                            <MdExpandLess />
                        ) : (
                            <MdExpandMore />
                        )}
                      </div>

                      {/* Optional: Show minimal details on expand */}
                      {expandedRooms.includes(room.id!) && (
                          <div className="ml-2 mt-2 space-y-1 text-sm border-t pt-2">
                            <p><strong>Description:</strong> {room.description || "N/A"}</p>
                            {/* You could potentially show # of appliances here if fetched */}
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