"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditHouse() {
  const router = useRouter();
  const [houseData, setHouseData] = useState({
    id: "", // Add the id property
    name: "",
    yearBuilt: "",
    address: "",
    reminderDate: "",
    websiteLink: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Safely access sessionStorage to get house ID and pre-fill data
  useEffect(() => {
    const house = sessionStorage.getItem("house");
    if (house) {
      const parsedHouse = JSON.parse(house);
      setHouseData(parsedHouse);
    } else {
      setError("No house data found. Redirecting...");
      setTimeout(() => {
        router.push("/dash"); // Redirect to dashboard if no house data is found
      }, 2000);
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

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to edit a house.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/house/${houseData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(houseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update house");
      }

      setSuccess("House updated successfully!");
      setError("");

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push("/dash");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleDelete = async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to delete a house.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/house/${houseData.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete house");
      }

      setSuccess("House deleted successfully!");
      setError("");

      // Redirect to the dashboard after a short delay
      setTimeout(() => {
        router.push("/dash");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
      <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-2x1 p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Edit House</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="House Name"
            value={houseData.name}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="number"
            name="yearBuilt"
            placeholder="Year Built"
            value={houseData.yearBuilt}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={houseData.address}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="datetime-local"
            name="reminderDate"
            placeholder="Reminder Date"
            value={houseData.reminderDate}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="url"
            name="websiteLink"
            placeholder="Website Link"
            value={houseData.websiteLink}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-green-700 text-white rounded-md py-2 px-4 hover:bg-green-800 transition"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-700 text-white rounded-md py-2 px-4 hover:bg-red-800 transition"
            >
              Delete
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4">{success}</p>}
      </div>
    </div>
  );
}