"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaHome, FaTools, FaCog } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

interface House {
  id?: number;
  name?: string;
  rooms: Room[];
}

interface Room {
  id?: number;
  name?: string;
  appliances: Appliance[];
}

interface Appliance {
  id?: number;
  name?: string;
  parts: Part[];
}

interface Part {
  id?: number;
  name?: string;
}

export default function HouseDetails() {
  const router = useRouter();
  const [house, setHouse] = useState<House | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRooms, setExpandedRooms] = useState<number[]>([]);

  useEffect(() => {
    // Safely access sessionStorage on the client side
    const houseData = sessionStorage.getItem("house");
    if (houseData) {
      const parsedHouse = JSON.parse(houseData);
      setHouse(parsedHouse);
    } else {
      router.push("/dash"); // Redirect to dashboard if no house data is found
    }
  }, [router]);

  useEffect(() => {
    if (!house || !house.id) return;

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchRoomData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/room/${house.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch house data");
        }

        const data = await response.json();
        setRooms(data || []);
      } catch (error) {
        console.error("Error fetching house data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [house, router]);

  const toggleExpandRoom = (id?: number) => {
    if (!id) return;
    setExpandedRooms((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleRoomClick = (room: Room): void => {
    if (room) {
      sessionStorage.setItem("room", JSON.stringify(room));
      router.push(`/dash`);
    }
  };

  const handleCreateRoomClick = (): void => {
    if (house && house.id) {
      sessionStorage.setItem("houseID", house.id.toString());
      router.push("/createRoom");
    }
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
          <h1 className="text-3xl font-bold">Onion Name: {house.name}</h1>
        </header>
        <section className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Rooms</h2>
          <button
            onClick={handleCreateRoomClick}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Add Room
          </button>
        </section>

        <section>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-200 dark:hover:ring-green-400 cursor-pointer transition"
                >
                  <div
                    className="flex justify-between items-center mb-2"
                    onClick={() => toggleExpandRoom(room.id)}
                    onDoubleClick={() => handleRoomClick(room)}
                  >
                    <h3 className="text-lg font-bold">{room.name}</h3>
                    {expandedRooms.includes(room.id!) ? (
                      <MdExpandLess />
                    ) : (
                      <MdExpandMore />
                    )}
                  </div>

                  {expandedRooms.includes(room.id!) && (
                    <div className="ml-2 space-y-2">
                      {(room.appliances || []).map((appliance) => (
                        <div key={appliance.id}>
                          <p className="font-semibold">🛏 Appliance: {appliance.name}</p>
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