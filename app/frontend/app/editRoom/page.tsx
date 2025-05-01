"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateRoom() {
  const router = useRouter();
  const [roomData, setRoomData] = useState({
    name: "",
    houseId: "",
    description: "",
    squareFootage: "",
    reminderDate: "",
    websiteLink: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Safely access sessionStorage in useEffect
  useEffect(() => {
    const houseID = sessionStorage.getItem("houseID");
    console.log("House ID:", houseID);
    if (houseID) {
      setRoomData((prevData) => ({
        ...prevData,
        houseId: houseID,
      }));
    } else {
      setError("No house ID found. Redirecting...");
      setTimeout(() => {
        router.push("/dash"); // Redirect to dashboard if no house ID is found
      }, 2000);
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

    // Validate required fields
    if (!roomData.name || !roomData.description || !roomData.squareFootage) {
      setError("Name, description, and square footage are required.");
      return;
    }

    console.log("Room Data:", roomData);

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create a room.");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    try {
      const response = await fetch(`${apiUrl}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create room");
      }

      setSuccess("Room created successfully!");
      setError("");

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push("/onion");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
      <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-2x1 p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Edit your Room</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Room Name"
            value={roomData.name}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required // Marked as required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={roomData.description}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required // Marked as required
          />
          <input
            type="number"
            name="squareFootage"
            placeholder="Square Footage"
            value={roomData.squareFootage}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required // Marked as required
          />
          <input
            type="url"
            name="websiteLink"
            placeholder="Website Link"
            value={roomData.websiteLink}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="bg-green-700 text-white rounded-md py-2 hover:bg-green-800 transition"
          >
            Submit
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4">{success}</p>}
      </div>
    </div>
  );
}