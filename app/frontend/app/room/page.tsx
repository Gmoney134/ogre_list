// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/room/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react"; // Added useCallback
import Link from "next/link";
import { FaHome, FaTools, FaCog, FaArrowLeft, FaEdit } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

// --- Interfaces ---
interface Room {
  id?: number;
  name?: string;
  houseId?: number;
  description?: string;
  squareFootage?: number | string;
  reminderDate?: string | null;
  websiteLink?: string | null;
}

// Appliance interface for the main list (simple)
interface Appliance {
  id?: number;
  name?: string;
}

// Part interface for the expanded view
interface Part {
  id?: number;
  name?: string;
}

// --- Component ---
export default function RoomDetails() {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [loadingAppliances, setLoadingAppliances] = useState(true);
  const [error, setError] = useState<string | null>(null); // General page/appliance list error
  const [expandedAppliances, setExpandedAppliances] = useState<number[]>([]);

  // State for parts within expanded appliances
  const [expandedPartsData, setExpandedPartsData] = useState<Record<number, Part[]>>({});
  const [expandedPartsLoading, setExpandedPartsLoading] = useState<Record<number, boolean>>({});
  const [expandedPartsError, setExpandedPartsError] = useState<Record<number, string | null>>({});

  // --- Effects ---
  // Effect to load room details
  useEffect(() => {
    const roomDataString = sessionStorage.getItem("room");
    if (roomDataString) {
      try {
        const parsedRoom = JSON.parse(roomDataString);
        if (parsedRoom && parsedRoom.id && parsedRoom.name) {
          setRoom(parsedRoom);
        } else {
          throw new Error("Invalid room data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse room data:", e);
        setError("Could not load room details. Invalid data.");
      } finally {
        setLoadingRoom(false);
      }
    } else {
      setError("No room selected. Please go back and select a room.");
      setLoadingRoom(false);
    }
  }, [router]);

  // Effect to fetch appliances for the room
  useEffect(() => {
    if (!room?.id) {
      if (!loadingRoom) setLoadingAppliances(false);
      return;
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      setLoadingAppliances(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    const fetchApplianceData = async () => {
      setLoadingAppliances(true);
      try {
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
        // Clear general error if appliance fetch succeeds after a room load error
        setError(prevError => (prevError?.includes("room details") ? null : prevError));
      } catch (err: any) {
        console.error("Error fetching appliance data:", err);
        setError(err.message || "An unknown error occurred while fetching appliances.");
        setAppliances([]);
      } finally {
        setLoadingAppliances(false);
      }
    };
    fetchApplianceData();
  }, [room?.id, loadingRoom, router]); // Keep dependencies

  // --- Handlers ---

  // Function to fetch parts for a specific appliance (used on expand)
  const fetchPartsForAppliance = useCallback(async (applianceId: number) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setExpandedPartsError(prev => ({ ...prev, [applianceId]: "Authentication required." }));
      return;
    }

    // Set loading state for this specific appliance's parts
    setExpandedPartsLoading(prev => ({ ...prev, [applianceId]: true }));
    setExpandedPartsError(prev => ({ ...prev, [applianceId]: null })); // Clear previous error

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    try {
      // Fetch parts using the /part/:applianceId endpoint
      const response = await fetch(`${apiUrl}/part/${applianceId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch parts (Status: ${response.status})`);
      }

      const partsData = await response.json();
      // Store the fetched parts
      setExpandedPartsData(prev => ({ ...prev, [applianceId]: partsData || [] }));

    } catch (err: any) {
      console.error(`Error fetching parts for appliance ${applianceId}:`, err);
      setExpandedPartsError(prev => ({ ...prev, [applianceId]: err.message || "Failed to load parts." }));
      setExpandedPartsData(prev => ({ ...prev, [applianceId]: [] })); // Ensure empty array on error
    } finally {
      // Clear loading state for this specific appliance's parts
      setExpandedPartsLoading(prev => ({ ...prev, [applianceId]: false }));
    }
  }, []); // Empty dependency array as it uses sessionStorage and env vars

  // Toggle appliance expansion and fetch parts if needed
  const toggleExpandAppliance = (id?: number) => {
    if (!id) return;
    const isCurrentlyExpanded = expandedAppliances.includes(id);
    const newExpandedState = isCurrentlyExpanded
        ? expandedAppliances.filter((h) => h !== id)
        : [...expandedAppliances, id];

    setExpandedAppliances(newExpandedState);

    // If expanding and parts haven't been loaded or errored previously for this session
    if (!isCurrentlyExpanded && !expandedPartsData[id] && !expandedPartsError[id]) {
      fetchPartsForAppliance(id);
    }
  };

  // Navigate to the specific appliance's detail page
  const handleApplianceClick = (appliance: Appliance): void => {
    if (appliance?.id) {
      // Fetching full details might be better on the appliance page itself,
      // but we pass what we have for now.
      sessionStorage.setItem("appliance", JSON.stringify(appliance));
      router.push(`/appliance`);
    } else {
      console.error("Cannot navigate: Appliance data or ID is missing.", appliance);
      setError("Could not load details for the selected appliance.");
    }
  };

  const handleCreateApplianceClick = (): void => {
    if (room?.id) {
      sessionStorage.setItem("roomID", room.id.toString());
      router.push("/createAppliance");
    } else {
      setError("Cannot create appliance: Room ID is missing.");
    }
  };

  const handleEditRoomClick = (): void => {
    if (room) {
      sessionStorage.setItem("room", JSON.stringify(room));
      router.push("/editRoom");
    } else {
      setError("Cannot edit: Room data is missing.");
    }
  };

  const handleGoBackToOnion = (): void => {
    router.push(`/onion`);
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
  if (loadingRoom) {
    return <p className="p-6 text-center">Loading room details...</p>;
  }

  // Prioritize room loading error
  if (error && !room) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  if (!room) {
    return <p className="p-6 text-center">Room details not available.</p>;
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
            <button onClick={handleGoBackToOnion} className="text-white px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-600 transition flex items-center gap-2 mr-4" title="Back to Onion (House)"> <FaArrowLeft /> Back </button>
            <h1 className="text-3xl font-bold flex-grow text-center"> {room.name || "Room Details"} </h1>
            <button onClick={handleEditRoomClick} className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2 ml-4" title="Edit this room"> <FaEdit /> Edit Room </button>
          </header>

          {/* Room Details Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
            {/* ... Room details content ... */}
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Room Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div> <p className="font-medium text-gray-600 dark:text-gray-400">Description:</p> <p className="text-lg">{room.description || "N/A"}</p> </div>
              <div> <p className="font-medium text-gray-600 dark:text-gray-400">Square Footage:</p> <p className="text-lg">{room.squareFootage ? `${room.squareFootage} sq ft` : "N/A"}</p> </div>
              <div> <p className="font-medium text-gray-600 dark:text-gray-400">Reminder Date:</p> <p className="text-lg">{formatDate(room.reminderDate)}</p> </div>
              <div className="md:col-span-2"> <p className="font-medium text-gray-600 dark:text-gray-400">Website Link:</p> {room.websiteLink ? ( <a href={room.websiteLink} target="_blank" rel="noopener noreferrer" className="text-lg text-blue-600 dark:text-blue-400 hover:underline break-all"> {room.websiteLink} </a> ) : ( <p className="text-lg">Not set</p> )} </div>
            </div>
          </section>

          {/* Appliances Section Header */}
          <section className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Appliances</h2>
            <button onClick={handleCreateApplianceClick} className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"> Add Appliance </button>
          </section>

          {/* Display loading/error for appliances list */}
          {loadingAppliances && <p className="text-center p-4">Loading appliances...</p>}
          {/* Display appliance fetch error *only if* room loading succeeded */}
          {!loadingRoom && error && !appliances.length && <p className="text-center p-4 text-red-500">{error}</p>}

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
                        onDoubleClick={() => handleApplianceClick(appliance)}
                    >
                      <div
                          className="flex justify-between items-center mb-2"
                          onClick={() => toggleExpandAppliance(appliance.id)} // Single click toggles expand
                      >
                        <h3 className="text-lg font-bold">{appliance.name}</h3>
                        <span className="text-gray-600 dark:text-gray-400">
                                        {expandedAppliances.includes(appliance.id!) ? (
                                            <MdExpandLess size={24} aria-label="Collapse"/>
                                        ) : (
                                            <MdExpandMore size={24} aria-label="Expand"/>
                                        )}
                                    </span>
                      </div>

                      {/* --- NEW Expanded Content --- */}
                      {expandedAppliances.includes(appliance.id!) && (
                          <div className="ml-2 mt-2 space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                            {/* Loading state for parts */}
                            {expandedPartsLoading[appliance.id!] && <p className="text-xs text-gray-500 dark:text-gray-400">Loading parts...</p>}

                            {/* Error state for parts */}
                            {expandedPartsError[appliance.id!] && <p className="text-xs text-red-500">{expandedPartsError[appliance.id!]}</p>}

                            {/* Display parts list if loaded and no error */}
                            {!expandedPartsLoading[appliance.id!] && !expandedPartsError[appliance.id!] && expandedPartsData[appliance.id!] && (
                                expandedPartsData[appliance.id!].length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">
                                      {expandedPartsData[appliance.id!].map(part => (
                                          <li key={part.id} className="text-gray-700 dark:text-gray-300">
                                            {part.name}
                                          </li>
                                      ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">No parts found for this appliance.</p>
                                )
                            )}

                            {/* View Details Button */}
                            <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card's onClick
                                  handleApplianceClick(appliance);
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