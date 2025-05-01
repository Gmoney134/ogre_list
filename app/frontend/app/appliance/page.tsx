// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/appliance/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
// Added FaArrowLeft, FaEdit
import { FaHome, FaTools, FaCog, FaArrowLeft, FaEdit } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

// Expanded Appliance interface
interface Appliance {
  id?: number;
  name?: string;
  roomId?: number; // Keep for context if needed
  model?: string;
  brand?: string;
  purchaseDate?: string | null;
  reminderDate?: string | null;
  websiteLink?: string | null;
  // parts array is fetched separately, so not strictly needed here
}

// Part interface for the list
interface Part {
  id?: number;
  name?: string;
  // Include other fields if needed for the preview/list, but keep it minimal
  reminderDate?: string | null;
  websiteLink?: string | null;
}

// Renamed component
export default function ApplianceDetails() {
  const router = useRouter();
  const [appliance, setAppliance] = useState<Appliance | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [loadingAppliance, setLoadingAppliance] = useState(true); // Separate loading states
  const [loadingParts, setLoadingParts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedParts, setExpandedParts] = useState<number[]>([]);

  useEffect(() => {
    // Safely access sessionStorage on the client side
    const applianceDataString = sessionStorage.getItem("appliance");
    if (applianceDataString) {
      try {
        const parsedAppliance = JSON.parse(applianceDataString);
        // Basic validation
        if (parsedAppliance && parsedAppliance.id && parsedAppliance.name) {
          setAppliance(parsedAppliance);
        } else {
          throw new Error("Invalid appliance data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse appliance data:", e);
        setError("Could not load appliance details. Invalid data.");
        // Optional: Redirect
      } finally {
        setLoadingAppliance(false);
      }
    } else {
      setError("No appliance selected. Please go back and select an appliance.");
      setLoadingAppliance(false);
      // Optional: Redirect
      // router.push("/dash");
    }
  }, [router]); // Removed appliance from dependency array here

  // Fetch parts associated with the appliance
  useEffect(() => {
    // Only fetch parts if we have a valid appliance ID
    if (!appliance?.id) {
      // If appliance loading finished but no ID, don't fetch parts
      if (!loadingAppliance) setLoadingParts(false);
      return;
    };

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      setLoadingParts(false);
      // router.push("/"); // Optional: redirect to login
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    const fetchPartData = async () => {
      setLoadingParts(true); // Start loading parts
      try {
        // Use the correct backend route for getting parts by appliance ID
        const response = await fetch(`${apiUrl}/part/${appliance.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to get error details
          throw new Error(errorData.message || `Failed to fetch parts (Status: ${response.status})`);
        }

        const data = await response.json();
        setParts(data || []);
        setError(null); // Clear previous errors on success
      } catch (err: any) {
        console.error("Error fetching part data:", err);
        setError(err.message || "An unknown error occurred while fetching parts.");
        setParts([]); // Clear parts on error
      } finally {
        setLoadingParts(false); // Finish loading parts
      }
    };

    fetchPartData();
    // Depend on appliance.id to refetch if the appliance changes
  }, [appliance?.id, loadingAppliance, router]);

  // --- Handlers ---

  const toggleExpandPart = (id?: number) => {
    if (!id) return;
    setExpandedParts((prev) =>
        prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  // Navigate to the specific part's detail page
  const handlePartClick = (part: Part): void => {
    if (part?.id) {
      // Store the full part data if available, or at least ID/Name
      sessionStorage.setItem("part", JSON.stringify(part));
      router.push(`/part`); // Navigate to the part detail page
    } else {
      console.error("Cannot navigate: Part data or ID is missing.", part);
      setError("Could not load details for the selected part.");
    }
  };

  // Navigate to the page for creating a new part for this appliance
  const handleCreatePartClick = (): void => {
    if (appliance?.id) {
      sessionStorage.setItem("applianceID", appliance.id.toString());
      router.push("/createPart");
    } else {
      setError("Cannot create part: Appliance ID is missing.");
    }
  };

  // Navigate to the page for editing this appliance
  const handleEditApplianceClick = (): void => {
    if (appliance) {
      // Ensure the full appliance data is stored before navigating
      sessionStorage.setItem("appliance", JSON.stringify(appliance));
      router.push("/editAppliance");
    } else {
      setError("Cannot edit: Appliance data is missing.");
    }
  };

  // Navigate back to the parent room page
  const handleGoBackToRoom = (): void => {
    // Assumes 'room' data is still in sessionStorage for room/page.tsx
    router.push(`/room`);
  };

  // Helper to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    try {
      // Use toLocaleDateString for just the date part
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // --- Render Logic ---

  if (loadingAppliance) {
    return <p className="p-6 text-center">Loading appliance details...</p>;
  }

  if (error && !appliance) {
    // Show error prominently if appliance couldn't load
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  if (!appliance) {
    // Should ideally be caught by error state, but as a fallback
    return <p className="p-6 text-center">Appliance details not available.</p>;
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
                onClick={handleGoBackToRoom}
                className="text-white px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-600 transition flex items-center gap-2 mr-4"
                title="Back to Room"
            >
              <FaArrowLeft /> Back
            </button>

            {/* Appliance Name Title */}
            <h1 className="text-3xl font-bold flex-grow text-center">
              {appliance.name || "Appliance Details"}
            </h1>

            {/* Edit Appliance Button */}
            <button
                onClick={handleEditApplianceClick}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2 ml-4"
                title="Edit this appliance"
            >
              <FaEdit /> Edit Appliance
            </button>
          </header>

          {/* Appliance Details Section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Appliance Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Model:</p>
                <p className="text-lg">{appliance.model || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Brand:</p>
                <p className="text-lg">{appliance.brand || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Purchase Date:</p>
                <p className="text-lg">{formatDate(appliance.purchaseDate)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Reminder Date:</p>
                <p className="text-lg">{formatDate(appliance.reminderDate)}</p> {/* Assuming reminderDate is also just a date */}
              </div>
              <div className="md:col-span-2"> {/* Allow website link to span full width on medium screens */}
                <p className="font-medium text-gray-600 dark:text-gray-400">Website Link:</p>
                {appliance.websiteLink ? (
                    <a
                        href={appliance.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {appliance.websiteLink}
                    </a>
                ) : (
                    <p className="text-lg">Not set</p>
                )}
              </div>
            </div>
          </section>

          {/* Parts Section Header */}
          <section className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Parts</h2>
            <button
                onClick={handleCreatePartClick}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
            >
              Add Part
            </button>
          </section>

          {/* Display loading/error specifically for parts */}
          {loadingParts && <p className="text-center p-4">Loading parts...</p>}
          {error && !loadingParts && <p className="text-center p-4 text-red-500">{error}</p>}

          {/* Parts List */}
          {!loadingParts && parts.length === 0 && !error && (
              <p className="text-center p-4 bg-white dark:bg-gray-800 rounded shadow">No parts found for this appliance.</p>
          )}
          {!loadingParts && parts.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {parts.map((part) => (
                    <div
                        key={part.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-200 dark:hover:ring-green-400 cursor-pointer transition"
                        onDoubleClick={() => handlePartClick(part)} // Navigate on double click
                    >
                      <div
                          className="flex justify-between items-center mb-2"
                          onClick={() => toggleExpandPart(part.id)} // Single click toggles expand
                      >
                        <h3 className="text-lg font-bold">{part.name}</h3>
                        {/* Expand/collapse icon */}
                        {expandedParts.includes(part.id!) ? (
                            <MdExpandLess size={24} aria-label="Collapse"/>
                        ) : (
                            <MdExpandMore size={24} aria-label="Expand"/>
                        )}
                      </div>

                      {/* --- UPDATED Expanded Content --- */}
                      {expandedParts.includes(part.id!) && (
                          <div className="ml-2 mt-2 space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                            {/* Display Reminder Date */}
                            <p className="text-gray-700 dark:text-gray-300">
                              <strong>Reminder:</strong> {formatDate(part.reminderDate)}
                            </p>
                            {/* Display Website Link */}
                            {part.websiteLink ? (
                                <p className="text-gray-700 dark:text-gray-300">
                                  <strong>Link:</strong>{' '}
                                  <a
                                      href={part.websiteLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline break-all"
                                      // Prevent click on link from toggling expand state again
                                      onClick={(e) => e.stopPropagation()}
                                  >
                                    Visit Link
                                  </a>
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No website link.</p>
                            )}
                            {/* Add other part details here if needed and available in the 'part' object */}
                            {/* e.g., <p><strong>Some Detail:</strong> {part.someDetail || 'N/A'}</p> */}

                            {/* Add View Details Button (like dash page) */}
                            <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card's onClick from firing
                                  handlePartClick(part); // Use existing handler for navigation
                                }}
                                className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Full Details
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">(Or double-click card)</p>
                          </div>
                      )}
                      {/* --- End of Updated Expanded Content --- */}
                    </div>
                ))}
              </div>
          )}
        </main>
      </div>
  );
}