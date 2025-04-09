"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaCouch, FaTools, FaSignOutAlt, FaCog } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

interface Part {
  id?: number;
  name?: string;
}

interface Appliance {
  id?: number;
  name?: string;
  parts: Part[];
}

interface Room {
  id?: number;
  name?: string;
  appliances: Appliance[];
}

interface House {
  id?: number;
  name?: string;
  rooms: Room[];
}

export default function Dashboard() {
  const router = useRouter();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHouses, setExpandedHouses] = useState<number[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        setHouses(data.houses || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleExpandHouse = (id?: number) => {
    if (!id) return;
    setExpandedHouses((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-green-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 dark:bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                href="/dash"
                className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded"
              >
                <FaHome /> Home
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded"
              >
                <FaTools /> Projects
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded"
              >
                <FaCog /> Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left py-2 px-4 hover:bg-red-700 rounded"
              >
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-6">
          <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        </header>

        <section>
          <h2 className="text-xl font-semibold mb-4">Your Houses</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {houses.map((house) => (
                <div
                  key={house.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-400 cursor-pointer transition"
                >
                  <div
                    className="flex justify-between items-center mb-2"
                    onClick={() => toggleExpandHouse(house.id)}
                  >
                    <h3 className="text-lg font-bold">{house.name}</h3>
                    {expandedHouses.includes(house.id!) ? (
                      <MdExpandLess />
                    ) : (
                      <MdExpandMore />
                    )}
                  </div>

                  {expandedHouses.includes(house.id!) && (
                    <div className="ml-2 space-y-2">
                      {house.rooms.map((room) => (
                        <div key={room.id}>
                          <p className="font-semibold">🛏 Room: {room.name}</p>
                          <ul className="ml-4 list-disc">
                            {room.appliances.map((appliance) => (
                              <li key={appliance.id}>
                                {appliance.name}
                                <ul className="ml-4 list-square">
                                  {appliance.parts.map((part) => (
                                    <li key={part.id}>🔧 {part.name}</li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
