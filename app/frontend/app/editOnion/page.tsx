// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/editOnion/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // Keep for potential future use

// Define the House interface (should match the one in onion/page.tsx)
interface House {
  id?: number;
  name?: string; // Or address? Adjust based on your model
  userId?: number;
  address?: string;
  purchaseDate?: string | null; // Added purchaseDate
  reminderDate?: string | null;
  websiteLink?: string | null;
  // Add other fields like yearBuilt if they exist in your model and form
  yearBuilt?: number | string | null; // Allow string for input
}

// Rename component for clarity if needed, but EditHouse is fine
export default function EditHouse() {
  const router = useRouter();
  // State to hold the house data being edited
  const [houseData, setHouseData] = useState<House>({
    // Initialize with empty values or defaults
    id: undefined,
    name: "",
    userId: undefined, // Will be set from loaded data, not needed in form
    address: "",
    purchaseDate: null,
    reminderDate: null,
    websiteLink: null,
    yearBuilt: "", // Initialize yearBuilt
  });
  const [originalHouse, setOriginalHouse] = useState<House | null>(null); // Store original
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing house data from sessionStorage
  useEffect(() => {
    setIsLoading(true);
    const houseDataString = sessionStorage.getItem("house"); // Get the 'house' object

    if (houseDataString) {
      try {
        const parsedHouse: House = JSON.parse(houseDataString);

        // Basic validation (adjust based on your required fields)
        if (parsedHouse && parsedHouse.id && (parsedHouse.name || parsedHouse.address)) {
          // Format dates for input fields if they exist
          const formattedPurchaseDate = parsedHouse.purchaseDate
              ? new Date(parsedHouse.purchaseDate).toISOString().slice(0, 10) // Format YYYY-MM-DD
              : "";
          const formattedReminderDate = parsedHouse.reminderDate
              ? new Date(parsedHouse.reminderDate).toISOString().slice(0, 16) // Format YYYY-MM-DDTHH:mm
              : "";

          setHouseData({
            ...parsedHouse,
            // Ensure yearBuilt is a string for the input
            yearBuilt: parsedHouse.yearBuilt?.toString() || "",
            purchaseDate: formattedPurchaseDate, // Use formatted date for input value
            reminderDate: formattedReminderDate, // Use formatted date for input value
          });
          setOriginalHouse(parsedHouse); // Store the original data
          setError(""); // Clear any previous errors
        } else {
          throw new Error("Invalid house data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse house data:", e);
        setError("Could not load house details. Invalid data. Redirecting...");
        setTimeout(() => router.push("/dash"), 3000); // Redirect if data is bad
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No house data found. Please select a house to edit. Redirecting...");
      setIsLoading(false);
      setTimeout(() => router.push("/dash"), 3000); // Redirect if no data
    }
  }, [router]);

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

    // Validate required fields (adjust as needed)
    const { id, name, address } = houseData;
    if (!name && !address) { // Example: require at least name or address
      setError("House Name or Address is required.");
      return;
    }

    if (!id) {
      setError("House ID is missing. Cannot update.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    // Prepare data for sending (convert dates back, ensure nulls, omit ID/userId)
    // Convert yearBuilt back to number if possible
    const yearBuiltNumber = Number(houseData.yearBuilt);
    const dataToSend: Omit<House, 'id' | 'userId'> = {
      name: houseData.name || undefined, // Ensure null if empty string
      address: houseData.address || undefined, // Ensure null if empty string
      yearBuilt: isNaN(yearBuiltNumber) || !houseData.yearBuilt ? null : yearBuiltNumber, // Send number or null
      purchaseDate: houseData.purchaseDate ? new Date(houseData.purchaseDate).toISOString() : null,
      reminderDate: houseData.reminderDate ? new Date(houseData.reminderDate).toISOString() : null,
      websiteLink: houseData.websiteLink || null,
    };

    try {
      const response = await fetch(`${apiUrl}/house/${id}`, { // Use PUT with house ID
        method: "PUT", // Or PATCH
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update house (Status: ${response.status})`);
      }

      const updatedHouse = await response.json();

      // Update sessionStorage with the *updated* house data
      sessionStorage.setItem("house", JSON.stringify(updatedHouse));

      setSuccess("House updated successfully!");

      // Redirect back to the house details page
      setTimeout(() => {
        router.push(`/onion`); // Go back to the onion detail view
      }, 1500);

    } catch (err: any) {
      console.error("Error updating house:", err);
      setError(err.message || "An unknown error occurred while updating the house.");
      setSuccess("");
    }
  };

  // Handler for cancel button
  const handleCancel = () => {
    // Navigate back to the house detail page without saving
    router.push('/onion');
  };

  // Handler for delete button
  const handleDelete = async () => {
    // Optional: Add a confirmation dialog
    if (!window.confirm("Are you sure you want to delete this house? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");

    if (!houseData.id) {
      setError("House ID is missing. Cannot delete.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    try {
      const response = await fetch(`${apiUrl}/house/${houseData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete house (Status: ${response.status})`);
      }

      setSuccess("House deleted successfully!");

      // Redirect back to the main dashboard after deletion
      setTimeout(() => {
        router.push(`/dash`); // Go back to the dashboard
      }, 1500);

    } catch (err: any) {
      console.error("Error deleting house:", err);
      setError(err.message || "An unknown error occurred while deleting the house.");
      setSuccess("");
    }
  };


  if (isLoading) {
    return <p className="p-6 text-center">Loading house data...</p>;
  }

  // Show error if loading failed before rendering form
  if (error && !originalHouse) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        {/* Corrected typo: rounded-lg */}
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Edit House</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* House Name */}
            <input
                type="text"
                name="name"
                placeholder="House Name (Optional)"
                value={houseData.name || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                // Removed required - adjust validation logic if needed
            />
            {/* Address */}
            <input
                type="text"
                name="address"
                placeholder="Address (Optional)"
                value={houseData.address || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
            {/* Year Built */}
            <input
                type="number"
                name="yearBuilt"
                placeholder="Year Built (Optional)"
                value={houseData.yearBuilt || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
            {/* Purchase Date */}
            <input
                type="date" // Use 'date' type
                name="purchaseDate"
                placeholder="Purchase Date (Optional)"
                value={houseData.purchaseDate || ""} // Use formatted date
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                // required // Make optional if needed
            />
            {/* Reminder Date */}
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                value={houseData.reminderDate || ""} // Use formatted date
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
            {/* Website Link */}
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                value={houseData.websiteLink || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
            />

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white rounded-md py-2 hover:bg-gray-600 transition order-3 sm:order-1"
              >
                Cancel
              </button>
              <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-red-700 text-white rounded-md py-2 hover:bg-red-800 transition order-2"
              >
                Delete
              </button>
              <button
                  type="submit"
                  className="flex-1 bg-blue-700 text-white rounded-md py-2 hover:bg-blue-800 transition order-1 sm:order-3"
              >
                Update House
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