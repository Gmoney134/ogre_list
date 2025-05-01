// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/createAppliance/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // Keep for potential future use

// Define an interface for the appliance data
interface ApplianceData {
  name: string;
  roomId: string; // Keep as string initially from sessionStorage
  model: string;
  brand: string;
  purchaseDate: string | null; // Allow null for optional date
  reminderDate: string | null; // Allow null for optional date
  websiteLink: string | null; // Allow null for optional link
}

export default function CreateAppliance() {
  const router = useRouter();
  const [applianceData, setApplianceData] = useState<ApplianceData>({
    name: "",
    roomId: "",
    model: "",
    brand: "",
    purchaseDate: null, // Initialize as null
    reminderDate: null, // Initialize as null
    websiteLink: null, // Initialize as null
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initial ID check

  // Safely access sessionStorage in useEffect
  useEffect(() => {
    const roomID = sessionStorage.getItem("roomID");
    console.log("Room ID:", roomID);
    if (roomID) {
      setApplianceData((prevData) => ({
        ...prevData,
        roomId: roomID,
      }));
      setIsLoading(false); // ID found, stop loading
    } else {
      setError("No room ID found. Redirecting...");
      // Redirect immediately if no ID
      router.push("/dash"); // Redirect to dashboard if no room ID is found
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApplianceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    const { name, roomId, model, brand, purchaseDate } = applianceData;
    // Keep validation as per your requirements
    if (!name || !model || !brand || !purchaseDate) {
      setError("Name, Model, Brand, and Purchase Date are required.");
      return;
    }
    if (!roomId) {
      setError("Room ID is missing. Cannot create appliance.");
      return; // Should be caught by useEffect, but good safety check
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create an appliance.");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    // Prepare data for sending: convert ID/dates, ensure nulls
    const dataToSend = {
      name: applianceData.name,
      roomId: parseInt(applianceData.roomId, 10), // Convert ID to number
      model: applianceData.model,
      brand: applianceData.brand,
      purchaseDate: applianceData.purchaseDate ? new Date(applianceData.purchaseDate).toISOString() : null,
      reminderDate: applianceData.reminderDate ? new Date(applianceData.reminderDate).toISOString() : null,
      websiteLink: applianceData.websiteLink || null, // Ensure null if empty string
    };

    // Validate roomId conversion
    if (isNaN(dataToSend.roomId)) {
      setError("Invalid Room ID.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/appliance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend), // Send prepared data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to create appliance" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess("Appliance created successfully! Redirecting...");
      setError("");

      // Redirect to the room details page after a short delay
      // The room page's useEffect should fetch the updated list
      setTimeout(() => {
        router.push(`/room`);
      }, 1500); // Reduced delay slightly
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      setSuccess("");
    }
  };

  // Handler for the cancel button
  const handleCancel = () => {
    // Navigate back to the room page without saving
    router.push('/room');
  };

  // Don't render the form until the room ID check is complete
  if (isLoading) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        {/* Fixed typo: rounded-lg */}
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Create a New Appliance</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Appliance Name"
                value={applianceData.name}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required
            />
            <input
                type="text"
                name="model"
                placeholder="Model"
                value={applianceData.model}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required
            />
            <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={applianceData.brand}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required
            />
            <input
                type="date"
                name="purchaseDate"
                placeholder="Purchase Date"
                value={applianceData.purchaseDate || ""} // Handle null
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required
            />
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                value={applianceData.reminderDate || ""} // Handle null
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                value={applianceData.websiteLink || ""} // Handle null
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            {/* Buttons container */}
            <div className="flex gap-4 mt-2">
              <button
                  type="button" // Important: type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white rounded-md py-2 hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  className="flex-1 bg-green-700 text-white rounded-md py-2 hover:bg-green-800 transition"
              >
                Create Appliance
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