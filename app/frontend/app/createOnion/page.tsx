// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/createOnion/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link"; // Keep for potential future use

// Define an interface for the house data
interface HouseData {
  name: string;
  yearBuilt: string; // Keep as string for input
  address: string;
  purchaseDate: string | null; // Added purchaseDate
  reminderDate: string | null; // Added reminderDate
  websiteLink: string | null; // Allow null for optional link
}

export default function CreateHouse() {
  const router = useRouter();
  const [houseData, setHouseData] = useState<HouseData>({
    name: "",
    yearBuilt: "",
    address: "",
    purchaseDate: null, // Initialize as null
    reminderDate: null, // Initialize as null
    websiteLink: null, // Initialize as null
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // isLoading state might not be needed here unless checking something async initially

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHouseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation (adjust as needed)
    if (!houseData.name && !houseData.address) {
      setError("House Name or Address is required.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create a house.");
      return;
    }

    // Use the consistent API base path variable
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    console.log("Attempting to create house with API URL:", apiUrl); // Debugging

    // Prepare data for sending: convert numbers/dates, ensure nulls
    const yearBuiltNumber = Number(houseData.yearBuilt);
    const dataToSend = {
      name: houseData.name || null, // Send null if empty
      address: houseData.address || null, // Send null if empty
      yearBuilt: isNaN(yearBuiltNumber) || !houseData.yearBuilt ? null : yearBuiltNumber, // Convert to number or null
      purchaseDate: houseData.purchaseDate ? new Date(houseData.purchaseDate).toISOString() : null,
      reminderDate: houseData.reminderDate ? new Date(houseData.reminderDate).toISOString() : null,
      websiteLink: houseData.websiteLink || null, // Ensure null if empty string
    };

    try {
      const response = await fetch(`${apiUrl}/house`, { // Endpoint should be /house
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend), // Send prepared data
      });

      if (!response.ok) {
        // Try to parse error message from backend
        const errorData = await response.json().catch(() => ({ message: "Failed to create house" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess("House created successfully! Redirecting...");
      setError("");

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push("/dash");
      }, 1500); // Reduced delay slightly
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      setSuccess("");
    }
  };

  // Handler for the cancel button
  const handleCancel = () => {
    // Navigate back to the dashboard page without saving
    router.push('/dash');
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        {/* Fixed typo: rounded-lg */}
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Create a New Onion</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Onion Name (Optional)"
                value={houseData.name}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                // required // Make optional if address is provided
            />
            <input
                type="text"
                name="address"
                placeholder="Address (Optional)"
                value={houseData.address}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            <input
                type="number"
                name="yearBuilt"
                placeholder="Year Established (Optional)"
                value={houseData.yearBuilt}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            {/* Added Purchase Date Input */}
            <input
                type="date"
                name="purchaseDate"
                placeholder="Purchase Date (Optional)"
                value={houseData.purchaseDate || ""} // Handle null
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            {/* Added Reminder Date Input */}
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                value={houseData.reminderDate || ""} // Handle null
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                value={houseData.websiteLink || ""} // Handle null
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
                Create Onion
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