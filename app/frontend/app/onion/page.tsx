// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/onion/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import Link from "next/link";
import { FaHome, FaTools, FaCog, FaArrowLeft, FaEdit } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

// --- Interfaces ---
interface House {
  id?: number;
  name?: string;
  userId?: number;
  address?: string;
  purchaseDate?: string | null;
  reminderDate?: string | null;
  websiteLink?: string | null;
}

// Room interface for the main list
interface Room {
  id?: number;
  name?: string;
  description?: string; // Keep for potential use, though not displayed in list directly
}

// Appliance interface for the expanded view
interface Appliance {
  id?: number;
  name?: string;
}

// --- Component ---
export default function OnionDetails() {
  const router = useRouter();
  const [house, setHouse] = useState<House | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingHouse, setLoadingHouse] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState<string | null>(null); // General page/room list error
  const [expandedRooms, setExpandedRooms] = useState<number[]>([]);

  // State for appliances within expanded rooms
  const [expandedAppliancesData, setExpandedAppliancesData] = useState<Record<number, Appliance[]>>({});
  const [expandedAppliancesLoading, setExpandedAppliancesLoading] = useState<Record<number, boolean>>({});
  const [expandedAppliancesError, setExpandedAppliancesError] = useState<Record<number, string | null>>({});


  // --- Effects ---
  // Effect to load house details
  useEffect(() => {
    const houseDataString = sessionStorage.getItem("house");
    if (houseDataString) {
      try {
        const parsedHouse = JSON.parse(houseDataString);
        // Adjust validation if needed (e.g., require name OR address)
        if (parsedHouse && parsedHouse.id && (parsedHouse.name || parsedHouse.address)) {
          setHouse(parsedHouse);
        } else {
          throw new Error("Invalid house data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse house data:", e);
        setError("Could not load house details. Invalid data.");
      } finally {
        setLoadingHouse(false);
      }
    } else {
      setError("No house selected. Please go back and select a house.");
      setLoadingHouse(false);
    }
  }, [router]);

  // Effect to fetch rooms for the house
  useEffect(() => {
    if (!house?.id) {
      if (!loadingHouse) setLoadingRooms(false);
      return;
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      setLoadingRooms(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    const fetchRoomData = async () => {
      setLoadingRooms(true);
      try {
        const response = await fetch(`${apiUrl}/room/${house.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch rooms (Status: ${response.status})`);
        }

        const data = await response.json();
        setRooms(data || []);
        // Clear general error if room fetch succeeds after a house load error
        setError(prevError => (prevError?.includes("house details") ? null : prevError));
      } catch (err: any) {
        console.error("Error fetching room data:", err);
        setError(err.message || "An unknown error occurred while fetching rooms.");
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRoomData();
  }, [house?.id, loadingHouse, router]); // Keep dependencies

  // --- Handlers ---

  // Function to fetch appliances for a specific room (used on expand)
  const fetchAppliancesForRoom = useCallback(async (roomId: number) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setExpandedAppliancesError(prev => ({ ...prev, [roomId]: "Authentication required." }));
      return;
    }

    // Set loading state for this specific room's appliances
    setExpandedAppliancesLoading(prev => ({ ...prev, [roomId]: true }));
    setExpandedAppliancesError(prev => ({ ...prev, [roomId]: null })); // Clear previous error

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    try {
      // Fetch appliances using the /appliance/:roomId endpoint
      const response = await fetch(`${apiUrl}/appliance/${roomId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch appliances (Status: ${response.status})`);
      }

      const appliancesData = await response.json();
      // Store the fetched appliances
      setExpandedAppliancesData(prev => ({ ...prev, [roomId]: appliancesData || [] }));

    } catch (err: any) {
      console.error(`Error fetching appliances for room ${roomId}:`, err);
      setExpandedAppliancesError(prev => ({ ...prev, [roomId]: err.message || "Failed to load appliances." }));
      setExpandedAppliancesData(prev => ({ ...prev, [roomId]: [] })); // Ensure empty array on error
    } finally {
      // Clear loading state for this specific room's appliances
      setExpandedAppliancesLoading(prev => ({ ...prev, [roomId]: false }));
    }
  }, []); // Empty dependency array

  // Toggle room expansion and fetch appliances if needed
  const toggleExpandRoom = (id?: number) => {
    if (!id) return;
    const isCurrentlyExpanded = expandedRooms.includes(id);
    const newExpandedState = isCurrentlyExpanded
        ? expandedRooms.filter((h) => h !== id)
        : [...expandedRooms, id];

    setExpandedRooms(newExpandedState);

    // If expanding and appliances haven't been loaded or errored previously for this session
    if (!isCurrentlyExpanded && !expandedAppliancesData[id] && !expandedAppliancesError[id]) {
      fetchAppliancesForRoom(id);
    }
  };

  // Navigate to the specific room's detail page
  const handleRoomClick = (room: Room): void => {
    if (room?.id) {
      sessionStorage.setItem("room", JSON.stringify(room));
      router.push(`/room`);
    } else {
      console.error("Cannot navigate: Room data or ID is missing.", room);
      setError("Could not load details for the selected room.");
    }
  };

  const handleCreateRoomClick = (): void => {
    if (house?.id) {
      sessionStorage.setItem("houseID", house.id.toString());
      router.push("/createRoom");
    } else {
      setError("Cannot create room: House ID is missing.");
    }
  };

  const handleEditHouseClick = (): void => {
    if (house) {
      sessionStorage.setItem("house", JSON.stringify(house));
      router.push("/editOnion");
    } else {
      setError("Cannot edit: House data is missing.");
    }
  };

  const handleGoBackToDash = (): void => {
    router.push(`/dash`);
  };

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

  // Prioritize house loading error
  if (error && !house) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  if (!house) {
    return <p className="p-6 text-center">House details not available.</p>;
  }

  return (
      <div className="flex min-h-screen bg-green-600 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-green-900 dark:bg-gray-800 text-white p-6 flex-shrink-0">
          {/* ... Sidebar content ... */}
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
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <header className="relative bg-green-500 dark:bg-gray-800 rounded shadow p-4 mb-6 dark:bg-gray-700 dark:text-white flex items-center justify-between">
            {/* ... Header content ... */}
            <button onClick={handleGoBackToDash} className="text-white px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-600 transition flex items-center gap-2 mr-4" title="Back to Dashboard"> <FaArrowLeft /> Back </button>
            <h1 className="text-3xl font-bold flex-grow text-center"> {house.name || house.address || "House Details"} </h1>
            <button onClick={handleEditHouseClick} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2 ml-4" title="Edit this house"> <FaEdit /> Edit House </button>
          </header>

          {/* House Details Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
            {/* ... House details content ... */}
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">House Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div> <p className="font-medium text-gray-600 dark:text-gray-400">Address:</p> <p className="text-lg">{house.address || "N/A"}</p> </div>
              <div> <p className="font-medium text-gray-600 dark:text-gray-400">Purchase Date:</p> <p className="text-lg">{formatDate(house.purchaseDate)}</p> </div>
              <div> <p className="font-medium text-gray-600 dark:text-gray-400">Reminder Date:</p> <p className="text-lg">{formatDate(house.reminderDate)}</p> </div>
              <div className="md:col-span-2"> <p className="font-medium text-gray-600 dark:text-gray-400">Website Link:</p> {house.websiteLink ? ( <a href={house.websiteLink} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 dark:text-blue-400 hover:underline break-all"> {house.websiteLink} </a> ) : ( <p className="text-lg">Not set</p> )} </div>
            </div>
          </section>

          {/* Rooms Section Header */}
          <section className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Rooms</h2>
            <button onClick={handleCreateRoomClick} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"> Add Room </button>
          </section>

          {/* Display loading/error for rooms list */}
          {loadingRooms && <p className="text-center p-4">Loading rooms...</p>}
          {/* Display room fetch error *only if* house loading succeeded */}
          {!loadingHouse && error && !rooms.length && <p className="text-center p-4 text-red-500">{error}</p>}


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
                        onDoubleClick={() => handleRoomClick(room)}
                    >
                      <div
                          className="flex justify-between items-center mb-2"
                          onClick={() => toggleExpandRoom(room.id)} // Single click toggles expand
                      >
                        <h3 className="text-lg font-bold">{room.name}</h3>
                        <span className="text-gray-600 dark:text-gray-400">
                            {expandedRooms.includes(room.id!) ? (
                                <MdExpandLess size={24} aria-label="Collapse"/>
                            ) : (
                                <MdExpandMore size={24} aria-label="Expand"/>
                            )}
                        </span>
                      </div>

                      {/* --- NEW Expanded Content --- */}
                      {expandedRooms.includes(room.id!) && (
                          <div className="ml-2 mt-2 space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                            {/* Loading state for appliances */}
                            {expandedAppliancesLoading[room.id!] && <p className="text-xs text-gray-500 dark:text-gray-400">Loading appliances...</p>}

                            {/* Error state for appliances */}
                            {expandedAppliancesError[room.id!] && <p className="text-xs text-red-500">{expandedAppliancesError[room.id!]}</p>}

                            {/* Display appliances list if loaded and no error */}
                            {!expandedAppliancesLoading[room.id!] && !expandedAppliancesError[room.id!] && expandedAppliancesData[room.id!] && (
                                expandedAppliancesData[room.id!].length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                      {expandedAppliancesData[room.id!].map(appliance => (
                                          <li key={appliance.id} className="text-gray-700 dark:text-gray-300">
                                            {appliance.name}
                                          </li>
                                      ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">No appliances found in this room.</p>
                                )
                            )}

                            {/* View Details Button */}
                            <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card's onClick
                                  handleRoomClick(room);
                                }}
                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Full Details
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(Or double-click card)</p>
                          </div>
                      )}
                      {/* --- End of Expanded Content --- */}
                    </div>
                ))}
              </div>
          )}
        </main>
      </div>
  );
}