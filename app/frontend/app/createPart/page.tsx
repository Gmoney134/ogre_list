// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/createPart/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link for the cancel button

// Define an interface for the part data
interface PartData {
  name: string;
  applianceId: string; // Keep as string initially from sessionStorage
  reminderDate: string | null; // Allow null for optional date
  websiteLink: string | null; // Allow null for optional link
}

export default function CreatePart() {
  const router = useRouter();
  const [partData, setPartData] = useState<PartData>({
    name: "",
    applianceId: "",
    reminderDate: null, // Initialize as null
    websiteLink: null, // Initialize as null
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initial ID check

  // Safely access sessionStorage in useEffect
  useEffect(() => {
    const applianceID = sessionStorage.getItem("applianceID");
    console.log("Appliance ID:", applianceID);
    if (applianceID) {
      setPartData((prevData) => ({
        ...prevData,
        applianceId: applianceID,
      }));
      setIsLoading(false); // ID found, stop loading
    } else {
      setError("No appliance ID found. Redirecting...");
      // Redirect immediately if no ID
      router.push("/dash"); // Redirect to dashboard if no appliance ID is found
      // No need for setTimeout if redirecting immediately
    }
    // Only run once on mount, router dependency isn't strictly needed here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartData((prevData) => ({
      ...prevData,
      // Handle empty string for optional fields, set to null if needed before sending
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    const { name, applianceId } = partData;
    if (!name) { // Only name is strictly required by the form
      setError("Part Name is required.");
      return;
    }
    if (!applianceId) {
      setError("Appliance ID is missing. Cannot create part.");
      return; // Should be caught by useEffect, but good safety check
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create a part.");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    // Prepare data for sending: convert date, ensure nulls for optional fields
    const dataToSend = {
      name: partData.name,
      applianceId: parseInt(partData.applianceId, 10), // Convert ID to number
      reminderDate: partData.reminderDate ? new Date(partData.reminderDate).toISOString() : null,
      websiteLink: partData.websiteLink || null, // Ensure null if empty string
    };

    // Validate applianceId conversion
    if (isNaN(dataToSend.applianceId)) {
      setError("Invalid Appliance ID.");
      return;
    }


    try {
      const response = await fetch(`${apiUrl}/part`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend), // Send prepared data
      });

      if (!response.ok) {
        // Try to parse error message from backend
        const errorData = await response.json().catch(() => ({ message: "Failed to create part" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess("Part created successfully! Redirecting...");
      setError("");

      // Redirect to the appliance details page after a short delay
      // The appliance page's useEffect should fetch the updated list
      setTimeout(() => {
        router.push(`/appliance`);
      }, 1500); // Reduced delay slightly

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      setSuccess("");
    }
  };

  // Handler for the cancel button
  const handleCancel = () => {
    // Navigate back to the appliance page without saving
    router.push('/appliance');
  };

  // Don't render the form until the appliance ID check is complete
  if (isLoading) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        {/* Fixed typo: rounded-lg */}
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Create a New Part</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Part Name"
                value={partData.name}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required
            />
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                // Use partData.reminderDate directly, handle null/empty string
                value={partData.reminderDate || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                // Use partData.websiteLink directly, handle null/empty string
                value={partData.websiteLink || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            {/* Buttons container */}
            <div className="flex gap-4 mt-2">
              <button
                  type="button" // Important: type="button" to prevent form submission
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white rounded-md py-2 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="flex-1 bg-green-700 text-white rounded-md py-2 hover:bg-green-800 transition"
              >
                Create Part
              </button>
            </div>
          </form>
          {/* Feedback messages */}
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          {success && <p className="text-green-400 text-center mt-4">{success}</p>}
        </div>
      </div>
  );
}