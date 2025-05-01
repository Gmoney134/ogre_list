// C:/Users/paulr/WebstormProjects/ogre_list/app/frontend/app/editRoom/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"; // Keep for potential future use

// Define the Room interface (should match the one in room/page.tsx)
interface Room {
  id?: number;
  name?: string;
  houseId?: number;
  description?: string;
  squareFootage?: number | string; // Allow string for input
  reminderDate?: string | null;
  websiteLink?: string | null;
}

// Rename component for clarity
export default function EditRoom() {
  const router = useRouter();
  // State to hold the room data being edited
  const [roomData, setRoomData] = useState<Room>({
    // Initialize with empty values or defaults
    id: undefined,
    name: "",
    houseId: undefined, // Will be set from loaded data, not needed in form
    description: "",
    squareFootage: "",
    reminderDate: null,
    websiteLink: null,
  });
  const [originalRoom, setOriginalRoom] = useState<Room | null>(null); // Store original
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing room data from sessionStorage
  useEffect(() => {
    setIsLoading(true);
    const roomDataString = sessionStorage.getItem("room"); // Get the 'room' object

    if (roomDataString) {
      try {
        const parsedRoom: Room = JSON.parse(roomDataString);

        // Basic validation
        if (parsedRoom && parsedRoom.id && parsedRoom.name) {
          // Format date for datetime-local input if it exists
          const formattedReminderDate = parsedRoom.reminderDate
              ? new Date(parsedRoom.reminderDate).toISOString().slice(0, 16) // Format YYYY-MM-DDTHH:mm
              : "";

          setRoomData({
            ...parsedRoom,
            // Ensure squareFootage is a string for the input
            squareFootage: parsedRoom.squareFootage?.toString() || "",
            reminderDate: formattedReminderDate, // Use formatted date for input value
          });
          setOriginalRoom(parsedRoom); // Store the original data
          setError(""); // Clear any previous errors
        } else {
          throw new Error("Invalid room data found in storage.");
        }
      } catch (e) {
        console.error("Failed to parse room data:", e);
        setError("Could not load room details. Invalid data. Redirecting...");
        setTimeout(() => router.push("/dash"), 3000); // Redirect if data is bad
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No room data found. Please select a room to edit. Redirecting...");
      setIsLoading(false);
      setTimeout(() => router.push("/dash"), 3000); // Redirect if no data
    }
  }, [router]);

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
    const { id, name, description, squareFootage } = roomData;
    if (!name || !description || !squareFootage) {
      setError("Name, Description, and Square Footage are required.");
      return;
    }

    if (!id) {
      setError("Room ID is missing. Cannot update.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    // Prepare data for sending (convert dates back, ensure nulls, omit ID/houseId)
    // Convert squareFootage back to number if possible
    const sqFtNumber = Number(roomData.squareFootage);
    const dataToSend: Omit<Room, 'id' | 'houseId'> = {
      name: roomData.name,
      description: roomData.description,
      squareFootage: isNaN(sqFtNumber) ? undefined : sqFtNumber, // Send number or undefined
      reminderDate: roomData.reminderDate ? new Date(roomData.reminderDate).toISOString() : null,
      websiteLink: roomData.websiteLink || null,
    };

    try {
      const response = await fetch(`${apiUrl}/room/${id}`, { // Use PUT with room ID
        method: "PUT", // Or PATCH
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update room (Status: ${response.status})`);
      }

      const updatedRoom = await response.json();

      // Update sessionStorage with the *updated* room data
      sessionStorage.setItem("room", JSON.stringify(updatedRoom));

      setSuccess("Room updated successfully!");

      // Redirect back to the room details page
      setTimeout(() => {
        router.push(`/room`); // Go back to the room detail view
      }, 1500);

    } catch (err: any) {
      console.error("Error updating room:", err);
      setError(err.message || "An unknown error occurred while updating the room.");
      setSuccess("");
    }
  };

  // Handler for cancel button
  const handleCancel = () => {
    // Navigate back to the room detail page without saving
    router.push('/room');
  };

  // Handler for delete button
  const handleDelete = async () => {
    // Optional: Add a confirmation dialog
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");

    if (!roomData.id) {
      setError("Room ID is missing. Cannot delete.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';

    try {
      const response = await fetch(`${apiUrl}/room/${roomData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete room (Status: ${response.status})`);
      }

      setSuccess("Room deleted successfully!");

      // Redirect back to the PARENT (onion/house) page after deletion
      setTimeout(() => {
        router.push(`/onion`); // Go back to the onion detail view
      }, 1500);

    } catch (err: any) {
      console.error("Error deleting room:", err);
      setError(err.message || "An unknown error occurred while deleting the room.");
      setSuccess("");
    }
  };


  if (isLoading) {
    return <p className="p-6 text-center">Loading room data...</p>;
  }

  // Show error if loading failed before rendering form
  if (error && !originalRoom) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
        {/* Corrected typo: rounded-lg */}
        <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md">
          {/* Changed title */}
          <h2 className="text-center text-2xl font-semibold mb-6 text-white dark:text-gray-100">Edit Room</h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Room Name */}
            <input
                type="text"
                name="name"
                placeholder="Room Name"
                value={roomData.name || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                required
            />
            {/* Description */}
            <input
                type="text"
                name="description"
                placeholder="Description"
                value={roomData.description || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                required
            />
            {/* Square Footage */}
            <input
                type="number"
                name="squareFootage"
                placeholder="Square Footage"
                value={roomData.squareFootage || ""}
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
                required
            />
            {/* Reminder Date */}
            <input
                type="datetime-local"
                name="reminderDate"
                placeholder="Reminder Date (Optional)"
                value={roomData.reminderDate || ""} // Use formatted date
                onChange={handleInputChange}
                className="p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
            {/* Website Link */}
            <input
                type="url"
                name="websiteLink"
                placeholder="Website Link (Optional)"
                value={roomData.websiteLink || ""}
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
                Update Room
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