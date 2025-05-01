"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateHouse() {
  const router = useRouter();
  const [houseData, setHouseData] = useState({
    name: "",
    yearBuilt: "",
    address: "",
    reminderDate: "",
    websiteLink: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("You must be logged in to create a house.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/house`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(houseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create house");
      }

      setSuccess("House created successfully!");
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
        <h2 className="text-center text-2xl font-semibold mb-6">Create a New Onion</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Onion Name"
            value={houseData.name}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="number"
            name="yearBuilt"
            placeholder="Year Established"
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
            type="url"
            name="websiteLink"
            placeholder="Website Link"
            value={houseData.websiteLink}
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