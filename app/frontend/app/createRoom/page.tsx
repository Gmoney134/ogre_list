// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/createRoom/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // Keep for potential future use

// Define an interface for the room data
interface RoomData {
  name: string;
  houseId: string; // Keep as string initially from sessionStorage
  description: string;
  squareFootage: string; // Keep as string for input
  reminderDate: string | null; // Allow null for optional date
  websiteLink: string | null; // Allow null for optional link
}

export default function CreateRoom() {
  const router = useRouter();
  const [roomData, setRoomData] = useState<RoomData>({
    name: "",
    houseId: "",
    description: "",
    squareFootage: "",
    reminderDate: null, // Initialize as null
    websiteLink: null, // Initialize as null
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initial ID check

  // Safely access sessionStorage in useEffect
  useEffect(() => {
    const houseID = sessionStorage.getItem("houseID");
    console.log("House ID:", houseID);
    if (houseID) {
      setRoomData((prevData) => ({
        ...prevData,
        houseId: houseID,
      }));
      setIsLoading(false); // ID found, stop loading
    } else {
      setError("No house ID found. Redirecting...");
      // Redirect immediately if no ID
      router.push("/dash"); // Redirect to dashboard if no house ID is found
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoomData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    const { name, houseId, description, squareFootage } = roomData;
    if (!name || !description || !squareFootage) {
      setError("Name, Description, and Square Footage are required.");
      return;
    }
    if (!houseId) {
      setError("House ID is missing. Cannot create room.");
      return; // Should be caught by useEffect, but good safety check
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create a room.");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    // Prepare data for sending: convert IDs/numbers/dates, ensure nulls
    const sqFtNumber = Number(roomData.squareFootage);
    const dataToSend = {
      name: roomData.name,
      houseId: parseInt(roomData.houseId, 10), // Convert ID to number
      description: roomData.description,
      squareFootage: isNaN(sqFtNumber) ? null : sqFtNumber, // Convert to number or null
      reminderDate: roomData.reminderDate ? new Date(roomData.reminderDate).toISOString() : null,
      websiteLink: roomData.websiteLink || null, // Ensure null if empty string
    };

    // Validate houseId conversion
    if (isNaN(dataToSend.houseId)) {
      setError("Invalid House ID.");
      return;
    }
    // Optional: Validate squareFootage conversion if it must be a number
    // if (dataToSend.squareFootage === null) {
    //   setError("Invalid Square Footage value.");
    //   return;
    // }


    try {
      const response = await fetch(`${apiUrl}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend), // Send prepared data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to create room" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess("Room created successfully! Redirecting...");
      setError("");

      // Redirect to the onion (house) details page after a short delay
      // The onion page's useEffect should fetch the updated list
      setTimeout(() => {
        router.push("/onion");
      }, 1500); // Reduced delay slightly
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      setSuccess("");
    }
  };

  // Handler for the cancel button
  const handleCancel = () => {
    // Navigate back to the onion (house) page without saving
    router.push('/onion');
  };

  // Don't render the form until the house ID check is complete
  if (isLoading) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        {/* Fixed typo: rounded-lg */}
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Create a New Room</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Room Name"
                value={roomData.name}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required // Marked as required
            />
            <input
                type="text"
                name="description"
                placeholder="Description"
                value={roomData.description}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required // Marked as required
            />
            <input
                type="number"
                name="squareFootage"
                placeholder="Square Footage"
                value={roomData.squareFootage}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
                required // Marked as required
            />
            {/* Added Reminder Date Input */}
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                value={roomData.reminderDate || ""} // Handle null
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white" // Adjusted dark mode bg
            />
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                value={roomData.websiteLink || ""} // Handle null
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
                Create Room
              </button>
            </div>
          </form>
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          {success && <p className="text-green-400 text-center mt-4">{success}</p>}
        </div>
      </div>
  );
}