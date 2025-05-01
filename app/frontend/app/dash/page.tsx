"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaCouch, FaTools, FaSignOutAlt, FaCog } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

import DarkModeToggle from "@/components/DarkModeToggle";

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
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

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

  const handleHouseClick = (house: House): void => {
    if (house) {
      sessionStorage.setItem("house", JSON.stringify(house));
      router.push(`/onion`);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-green-600 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="relative bg-green-500 dark:bg-gray-800 rounded shadow p-4 mb-6 dark:bg-gray-700 dark:text-white flex items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome to Your Swamp</h1>
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
              >
                Profile
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded shadow z-10">
                  <ul className="text-sm text-gray-700 dark:text-gray-100">
                    <li className="hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 cursor-pointer">Profile</li>
                    <li
                      onClick={handleLogout}
                      className="hover:bg-red-100 dark:hover:bg-red-700 px-4 py-2 text-red-600 dark:text-red-300 cursor-pointer"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <div>
              <DarkModeToggle />
            </div>
          </div>
        </header>

        <section className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Onions</h2>
          <button
            onClick={() => router.push("/createOnion")}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Add Onion
          </button>
        </section>

        <section>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {houses.map((house) => (
                <div
                  key={house.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-200 dark:hover:ring-green-400 cursor-pointer transition"
                >
                  <div
                    className="flex justify-between items-center mb-2"
                    onClick={() => toggleExpandHouse(house.id)}
                    onDoubleClick={() => handleHouseClick(house)}
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
