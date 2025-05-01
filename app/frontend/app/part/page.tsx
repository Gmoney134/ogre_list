// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/part/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
// Added FaArrowLeft for the back button
import { FaHome, FaTools, FaCog, FaEdit, FaArrowLeft } from "react-icons/fa";

// Define a more detailed Part interface matching your backend model
interface Part {
  id?: number;
  name?: string;
  applianceId?: number; // Keep if needed for context, but not strictly necessary for display
  reminderDate?: string | null; // Use string for input compatibility if needed, or Date
  websiteLink?: string | null;
}

// Rename component for clarity
export default function PartDetails() {
  const router = useRouter();
  // State to hold the single part being viewed
  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    // Safely access sessionStorage on the client side
    const partDataString = sessionStorage.getItem("part");

    if (partDataString) {
      try {
        const parsedPart = JSON.parse(partDataString);
        // Basic validation
        if (parsedPart && parsedPart.id && parsedPart.name) {
          setPart(parsedPart);
        } else {
          throw new Error("Invalid part data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse part data:", e);
        setError("Could not load part details. Invalid data.");
        // Optional: Redirect after a delay
        // setTimeout(() => router.push('/dash'), 3000);
      } finally {
        setLoading(false);
      }
    } else {
      setError("No part selected. Please go back and select a part.");
      setLoading(false);
      // Optional: Redirect immediately or after delay
      // router.push("/dash");
    }
  }, [router]); // Dependency array only needs router now

  // Handler to navigate to the edit page
  const handleEditPartClick = (): void => {
    if (part) {
      // Ensure the part data is in sessionStorage before navigating
      sessionStorage.setItem("part", JSON.stringify(part));
      router.push(`/editPart`); // Navigate to the edit page
    }
  };

  // Handler to navigate back to the appliance page
  const handleGoBackToAppliance = (): void => {
    // Assumes the 'appliance' item is still correctly set in sessionStorage
    // The appliance/page.tsx component will read this on load.
    router.push(`/appliance`);
  };


  // --- Render Logic ---

  if (loading) {
    return <p className="p-6 text-center">Loading part details...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  if (!part) {
    // This case might be redundant if error handling above catches it, but good for safety
    return <p className="p-6 text-center">Part details not available.</p>;
  }

  // Helper to format date if needed
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleString(); // Or .toLocaleDateString()
    } catch {
      return "Invalid Date";
    }
  };

  return (
      <div className="flex min-h-screen bg-green-600 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar (Keep or remove as needed) */}
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
          <header className="relative bg-green-500 dark:bg-gray-800 rounded shadow p-4 mb-6 dark:bg-gray-700 dark:text-white flex items-center justify-between">
            {/* Back Button */}
            <button
                onClick={handleGoBackToAppliance}
                className="text-white px-3 py-2 rounded hover:bg-green-700 dark:hover:bg-gray-600 transition flex items-center gap-2 mr-4" // Added mr-4 for spacing
                title="Back to Appliance"
            >
              <FaArrowLeft /> Back
            </button>

            {/* Part Name Title */}
            <h1 className="text-3xl font-bold flex-grow text-center"> {/* Added flex-grow and text-center */}
              Part: {part.name}
            </h1>

            {/* Edit Button */}
            <button
                onClick={handleEditPartClick}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition flex items-center gap-2 ml-4" // Added ml-4 for spacing
                title="Edit this part"
            >
              <FaEdit /> Edit Part
            </button>
          </header>

          {/* Section to display part details */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Part Name:</p>
                <p className="text-lg">{part.name || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Part ID:</p>
                <p className="text-lg">{part.id || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Reminder Date:</p>
                <p className="text-lg">{formatDate(part.reminderDate)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-gray-400">Website Link:</p>
                {part.websiteLink ? (
                    <a
                        href={part.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {part.websiteLink}
                    </a>
                ) : (
                    <p className="text-lg">Not set</p>
                )}
              </div>
              {/* Add other part details here if available */}
            </div>
          </section>

          {/* Remove the section that listed multiple parts */}

        </main>
      </div>
  );
}