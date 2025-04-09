"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Part {
  id?: number;
  name?: string;
  model?: string;
  brand?: string;
  purchaseDate?: Date;
  reminderDate?: Date | null;
  websiteLink?: string | null;
}

interface Appliance {
  id?: number;
  name?: string;
  roomId?: number;
  model?: string;
  brand?: string;
  purchaseDate?: Date;
  reminderDate?: Date | null;
  websiteLink?: string | null;
  parts: Part[];
}

interface Room {
  id?: number;
  name?: string;
  houseId?: number;
  appliances: Appliance[];
}

interface House {
  id?: number;
  name?: string;
  userId?: number;
  rooms: Room[];
}

export default function Dashboard() {
  const router = useRouter();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setHouses(data.houses || []); // Ensure houses is always an array
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleHouseClick = (id: number | undefined): void => {
    if (id) {
      router.push(`/houses/${id}`);
    }
  };

  return (
    <div className="flex h-screen bg-green-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 dark:bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <a href="#" className="block py-2 px-4 hover:bg-green-700 rounded">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 hover:bg-green-700 rounded">
                Projects
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 hover:bg-green-700 rounded">
                Settings
              </a>
            </li>
            <li>
              <button
                onClick={() => {
                  sessionStorage.removeItem("authToken");
                  router.push("/");
                }}
                className="block w-full text-left py-2 px-4 hover:bg-red-700 rounded"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="flex justify-between items-center bg-white p-4 rounded shadow mb-6">
          <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
        </header>
        <h2 className="text-xl font-bold mb-4">Houses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-4">
            {houses.map((house) => (
              <li
                key={house.id}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow cursor-pointer hover:bg-green-200 dark:hover:bg-gray-700"
                onClick={() => handleHouseClick(house.id)}
              >
                <h3 className="text-lg font-bold">{house.name}</h3>
                <ul className="ml-4 mt-2">
                  {house.rooms.map((room) => (
                    <li key={room.id} className="mt-2">
                      <h4 className="font-semibold">Room: {room.name}</h4>
                      <ul className="ml-4">
                        {room.appliances.map((appliance) => (
                          <li key={appliance.id} className="mt-1">
                            <p>Appliance: {appliance.name}</p>
                            <ul className="ml-4">
                              {appliance.parts.map((part) => (
                                <li key={part.id}>
                                  <p>Part: {part.name}</p>
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}