// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/editPart/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link for cancel button

// Define the Part interface (should match the one in part/page.tsx)
interface Part {
  id?: number;
  name?: string;
  applianceId?: number;
  reminderDate?: string | null;
  websiteLink?: string | null;
}

// Rename component for clarity
export default function EditPart() {
  const router = useRouter();
  // State to hold the part data being edited
  const [partData, setPartData] = useState<Part>({
    // Initialize with empty values or defaults
    id: undefined,
    name: "",
    applianceId: undefined, // Will be set from loaded data, not needed in form
    reminderDate: null,
    websiteLink: null,
  });
  const [originalPart, setOriginalPart] = useState<Part | null>(null); // Store original for comparison or reset
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing part data from sessionStorage
  useEffect(() => {
    setIsLoading(true);
    const partDataString = sessionStorage.getItem("part"); // Get the 'part' object

    if (partDataString) {
      try {
        const parsedPart: Part = JSON.parse(partDataString);

        // Basic validation
        if (parsedPart && parsedPart.id && parsedPart.name) {
          // Format date for datetime-local input if it exists
          const formattedDate = parsedPart.reminderDate
              ? new Date(parsedPart.reminderDate).toISOString().slice(0, 16) // Format YYYY-MM-DDTHH:mm
              : "";

          setPartData({
            ...parsedPart,
            reminderDate: formattedDate, // Use formatted date for input value
          });
          setOriginalPart(parsedPart); // Store the original data
          setError(""); // Clear any previous errors
        } else {
          throw new Error("Invalid part data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse part data:", e);
        setError("Could not load part details. Invalid data. Redirecting...");
        setTimeout(() => router.push("/dash"), 3000); // Redirect if data is bad
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No part data found. Please select a part to edit. Redirecting...");
      setIsLoading(false);
      setTimeout(() => router.push("/dash"), 3000); // Redirect if no data
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess("");

    // Validate required fields
    if (!partData.name) {
      setError("Part Name is required.");
      return;
    }

    if (!partData.id) {
      setError("Part ID is missing. Cannot update.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    // Prepare data for sending (convert date back if necessary, remove ID if backend prefers)
    const dataToSend: Omit<Part, 'id' | 'applianceId'> & { reminderDate?: string | null } = {
      name: partData.name,
      reminderDate: partData.reminderDate ? new Date(partData.reminderDate).toISOString() : null, // Convert back to ISO string or null
      websiteLink: partData.websiteLink || null, // Ensure null if empty
    };


    try {
      const response = await fetch(`${apiUrl}/part/${partData.id}`, { // Use PUT request with part ID
        method: "PUT", // Or PATCH if your backend supports partial updates
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend), // Send only the updatable fields
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        throw new Error(errorData.message || `Failed to update part (Status: ${response.status})`);
      }

      const updatedPart = await response.json();

      // Update sessionStorage with the *updated* part data before redirecting
      sessionStorage.setItem("part", JSON.stringify(updatedPart));

      setSuccess("Part updated successfully!");

      // Redirect back to the part details page after a short delay
      setTimeout(() => {
        router.push(`/part`); // Go back to the part detail view
      }, 1500);

    } catch (err: any) {
      console.error("Error updating part:", err);
      setError(err.message || "An unknown error occurred while updating the part.");
      setSuccess("");
    }
  };

  // Handler for cancel button
  const handleCancel = () => {
    // Navigate back to the part detail page without saving changes
    router.push('/part');
  };


  if (isLoading) {
    return <p className="p-6 text-center">Loading part data...</p>;
  }

  // Show error if loading failed before rendering form
  if (error && !originalPart) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }


  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md"> {/* Adjusted rounded */}
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Edit Part</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Display Part ID (read-only) - useful for debugging */}
            {/* <div className="text-sm text-gray-400">Part ID: {partData.id}</div> */}

            <input
                type="text"
                name="name"
                placeholder="Part Name"
                value={partData.name || ""} // Handle potential null/undefined
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required
            />
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                value={partData.reminderDate || ""} // Use formatted date string
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                value={partData.websiteLink || ""} // Handle potential null/undefined
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            <div className="flex gap-4 mt-2"> {/* Container for buttons */}
              <button
                  type="button" // Important: type="button" to prevent form submission
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white rounded-md py-2 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="flex-1 bg-blue-700 text-white rounded-md py-2 hover:bg-blue-800 transition" // Changed color to blue for update
              >
                Update Part
              </button>
            </div>
          </form>
          {/* Display feedback messages */}
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          {success && <p className="text-green-400 text-center mt-4">{success}</p>}
        </div>
      </div>
  );
}