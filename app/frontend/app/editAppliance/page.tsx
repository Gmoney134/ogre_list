// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/editAppliance/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // Keep for potential future use, though cancel uses router

// Define the Appliance interface (should match the one in appliance/page.tsx)
interface Appliance {
  id?: number;
  name?: string;
  roomId?: number;
  model?: string;
  brand?: string;
  purchaseDate?: string | null;
  reminderDate?: string | null;
  websiteLink?: string | null;
}

// Rename component for clarity
export default function EditAppliance() {
  const router = useRouter();
  // State to hold the appliance data being edited
  const [applianceData, setApplianceData] = useState<Appliance>({
    // Initialize with empty values or defaults
    id: undefined,
    name: "",
    roomId: undefined, // Will be set from loaded data, not needed in form
    model: "",
    brand: "",
    purchaseDate: null,
    reminderDate: null,
    websiteLink: null,
  });
  const [originalAppliance, setOriginalAppliance] = useState<Appliance | null>(null); // Store original
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing appliance data from sessionStorage
  useEffect(() => {
    setIsLoading(true);
    const applianceDataString = sessionStorage.getItem("appliance"); // Get the 'appliance' object

    if (applianceDataString) {
      try {
        const parsedAppliance: Appliance = JSON.parse(applianceDataString);

        // Basic validation
        if (parsedAppliance && parsedAppliance.id && parsedAppliance.name) {
          // Format dates for input fields if they exist
          const formattedPurchaseDate = parsedAppliance.purchaseDate
              ? new Date(parsedAppliance.purchaseDate).toISOString().slice(0, 10) // Format YYYY-MM-DD
              : "";
          const formattedReminderDate = parsedAppliance.reminderDate
              ? new Date(parsedAppliance.reminderDate).toISOString().slice(0, 16) // Format YYYY-MM-DDTHH:mm
              : "";

          setApplianceData({
            ...parsedAppliance,
            purchaseDate: formattedPurchaseDate, // Use formatted date for input value
            reminderDate: formattedReminderDate, // Use formatted date for input value
          });
          setOriginalAppliance(parsedAppliance); // Store the original data
          setError(""); // Clear any previous errors
        } else {
          throw new Error("Invalid appliance data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse appliance data:", e);
        setError("Could not load appliance details. Invalid data. Redirecting...");
        setTimeout(() => router.push("/dash"), 3000); // Redirect if data is bad
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No appliance data found. Please select an appliance to edit. Redirecting...");
      setIsLoading(false);
      setTimeout(() => router.push("/dash"), 3000); // Redirect if no data
    }
  }, [router]);

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
    const { id, name, model, brand, purchaseDate } = applianceData;
    if (!name || !model || !brand || !purchaseDate) {
      setError("Name, Model, Brand, and Purchase Date are required.");
      return;
    }

    if (!id) {
      setError("Appliance ID is missing. Cannot update.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    // Prepare data for sending (convert dates back, ensure nulls, omit ID/roomId)
    const dataToSend: Omit<Appliance, 'id' | 'roomId'> = {
      name: applianceData.name,
      model: applianceData.model,
      brand: applianceData.brand,
      purchaseDate: applianceData.purchaseDate ? new Date(applianceData.purchaseDate).toISOString() : null,
      reminderDate: applianceData.reminderDate ? new Date(applianceData.reminderDate).toISOString() : null,
      websiteLink: applianceData.websiteLink || null,
    };

    try {
      const response = await fetch(`${apiUrl}/appliance/${id}`, { // Use PUT with appliance ID
        method: "PUT", // Or PATCH
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update appliance (Status: ${response.status})`);
      }

      const updatedAppliance = await response.json();

      // Update sessionStorage with the *updated* appliance data
      sessionStorage.setItem("appliance", JSON.stringify(updatedAppliance));

      setSuccess("Appliance updated successfully!");

      // Redirect back to the appliance details page
      setTimeout(() => {
        router.push(`/appliance`); // Go back to the appliance detail view
      }, 1500);

    } catch (err: any) {
      console.error("Error updating appliance:", err);
      setError(err.message || "An unknown error occurred while updating the appliance.");
      setSuccess("");
    }
  };

  // Handler for cancel button
  const handleCancel = () => {
    // Navigate back to the appliance detail page without saving
    router.push('/appliance');
  };

  // Handler for delete button
  const handleDelete = async () => {
    // Optional: Add a confirmation dialog
    if (!window.confirm("Are you sure you want to delete this appliance? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");

    if (!applianceData.id) {
      setError("Appliance ID is missing. Cannot delete.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    try {
      const response = await fetch(`${apiUrl}/appliance/${applianceData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete appliance (Status: ${response.status})`);
      }

      setSuccess("Appliance deleted successfully!");

      // Important: Remove the deleted item from sessionStorage if needed
      // sessionStorage.removeItem("appliance"); // Or maybe not, if redirecting away

      // Redirect back to the PARENT (room) page after deletion
      setTimeout(() => {
        router.push(`/room`); // Go back to the room detail view
      }, 1500);

    } catch (err: any) {
      console.error("Error deleting appliance:", err);
      setError(err.message || "An unknown error occurred while deleting the appliance.");
      setSuccess("");
    }
  };


  if (isLoading) {
    return <p className="p-6 text-center">Loading appliance data...</p>;
  }

  // Show error if loading failed before rendering form
  if (error && !originalAppliance) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md"> {/* Adjusted rounded */}
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Edit Appliance</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Appliance Name */}
            <input
                type="text"
                name="name"
                placeholder="Appliance Name"
                value={applianceData.name || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                required
            />
            {/* Model */}
            <input
                type="text"
                name="model"
                placeholder="Model"
                value={applianceData.model || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                required
            />
            {/* Brand */}
            <input
                type="text"
                name="brand"
                placeholder="Brand"
                value={applianceData.brand || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                required
            />
            {/* Purchase Date */}
            <input
                type="date" // Use 'date' type
                name="purchaseDate"
                placeholder="Purchase Date"
                value={applianceData.purchaseDate || ""} // Use formatted date
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                required
            />
            {/* Reminder Date */}
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                value={applianceData.reminderDate || ""} // Use formatted date
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
            {/* Website Link */}
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                value={applianceData.websiteLink || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
            />

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2"> {/* Responsive button layout */}
              <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white rounded-md py-2 hover:bg-gray-600 transition order-3 sm:order-1" // Cancel first on small screens
              >
                Cancel
              </button>
              <button
                  type="button" // Important: type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-red-700 text-white rounded-md py-2 hover:bg-red-800 transition order-2" // Delete in middle
              >
                Delete
              </button>
              <button
                  type="submit"
                  className="flex-1 bg-blue-700 text-white rounded-md py-2 hover:bg-blue-800 transition order-1 sm:order-3" // Update last on small screens
              >
                Update Appliance
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