"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatePart() {
  const router = useRouter();
  const [partData, setPartData] = useState({
    name: "",
    applianceId: "",
    reminderDate: "",
    websiteLink: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Safely access sessionStorage in useEffect
  useEffect(() => {
    const applianceID = sessionStorage.getItem("applianceID");
    console.log("Appliance ID:", applianceID);
    if (applianceID) {
      setPartData((prevData) => ({
        ...prevData,
        applianceId: applianceID,
      }));
    } else {
      setError("No appliance ID found. Redirecting...");
      setTimeout(() => {
        router.push("/dash"); // Redirect to dashboard if no appliance ID is found
      }, 2000);
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const { name, applianceId } = partData;
    if (!name || !applianceId) {
      setError("Name and Appliance ID are required.");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("You must be logged in to create a part.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/part", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(partData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create part");
      }

      setSuccess("Part created successfully!");
      setError("");

      // Redirect to the appliance details page after a short delay
      setTimeout(() => {
        router.push(`/appliance`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 bg-green-900 dark:bg-gray-800">
      <div className="bg-green-600 dark:bg-gray-900 shadow-lg rounded-2x1 p-8 w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-6">Create a New Part</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Part Name"
            value={partData.name}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
            required
          />
          <input
            type="datetime-local"
            name="reminderDate"
            placeholder="Reminder Date (Optional)"
            value={partData.reminderDate}
            onChange={handleInputChange}
            className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="url"
            name="websiteLink"
            placeholder="Website Link (Optional)"
            value={partData.websiteLink}
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