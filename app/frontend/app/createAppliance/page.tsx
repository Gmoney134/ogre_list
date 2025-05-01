"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateAppliance() {
  const router = useRouter();
  const [applianceData, setApplianceData] = useState({
    name: "",
    roomId: "",
    model: "",
    brand: "",
    purchaseDate: "",
    reminderDate: "",
    websiteLink: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Safely access sessionStorage in useEffect
  useEffect(() => {
    const roomID = sessionStorage.getItem("roomID");
    console.log("Room ID:", roomID);
    if (roomID) {
      setApplianceData((prevData) => ({
        ...prevData,
        roomId: roomID,
      }));
    } else {
      setError("No room ID found. Redirecting...");
      setTimeout(() => {
        router.push("/dash"); // Redirect to dashboard if no room ID is found
      }, 2000);
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

    // Validate required fields
    const { name, roomId, model, brand, purchaseDate } = applianceData;
    if (!name || !roomId || !model || !brand || !purchaseDate) {
      setError("Name, Model, Brand, and Purchase Date are required.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create an appliance.");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/proxy';
    try {
      const response = await fetch(`${apiUrl}/appliance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applianceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create appliance");
      }

      setSuccess("Appliance created successfully!");
      setError("");

      // Redirect to the room details page after a short delay
      setTimeout(() => {
        router.push(`/room`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
      <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-2x1 p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Create a New Appliance</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Appliance Name"
            value={applianceData.name}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="text"
            name="model"
            placeholder="Model"
            value={applianceData.model}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="text"
            name="brand"
            placeholder="Brand"
            value={applianceData.brand}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="date"
            name="purchaseDate"
            placeholder="Purchase Date"
            value={applianceData.purchaseDate}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="datetime-local"
            name="reminderDate"
            placeholder="Reminder Date (Optional)"
            value={applianceData.reminderDate}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="url"
            name="websiteLink"
            placeholder="Website Link (Optional)"
            value={applianceData.websiteLink}
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