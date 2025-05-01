"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaHome, FaTools, FaCog } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

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

export default function RoomDetails() {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppliances, setExpandedAppliances] = useState<number[]>([]);

  useEffect(() => {
    // Safely access sessionStorage on the client side
    const roomData = sessionStorage.getItem("room");
    if (roomData) {
      const parsedRoom = JSON.parse(roomData);
      setRoom(parsedRoom);
    } else {
      router.push("/dash"); // Redirect to dashboard if no house data is found
    }
  }, [router]);

  useEffect(() => {
    if (!room || !room.id) return;

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchApplianceData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/appliance/${room.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appliance data");
        }

        const data = await response.json();
        setAppliances(data || []);
      } catch (error) {
        console.error("Error fetching appliance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplianceData();
  }, [room, router]);

  const toggleExpandAppliance = (id?: number) => {
    if (!id) return;
    setExpandedAppliances((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleApplianceClick = (appliance: Appliance): void => {
    if (appliance) {
      sessionStorage.setItem("appliance", JSON.stringify(appliance));
      router.push(`/appliance`);
    }
  };

  const handleCreateApplianceClick = (): void => {
    if (room && room.id) {
      sessionStorage.setItem("roomID", room.id.toString());
      router.push("/createAppliance");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!room) {
    return <p>Room not found. Redirecting...</p>;
  }

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
          <h1 className="text-3xl font-bold">Room Name: {room.name}</h1>
        </header>
        <section className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Appliances</h2>
          <button
            onClick={handleCreateApplianceClick}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Add Appliance
          </button>
        </section>

        <section>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {appliances.map((appliance) => (
                <div
                  key={appliance.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-200 dark:hover:ring-green-400 cursor-pointer transition"
                >
                  <div
                    className="flex justify-between items-center mb-2"
                    onClick={() => toggleExpandAppliance(appliance.id)}
                    onDoubleClick={() => handleApplianceClick(appliance)}
                  >
                    <h3 className="text-lg font-bold">{appliance.name}</h3>
                    {expandedAppliances.includes(appliance.id!) ? (
                      <MdExpandLess />
                    ) : (
                      <MdExpandMore />
                    )}
                  </div>

                  {expandedAppliances.includes(appliance.id!) && (
                    <div className="ml-2 space-y-2">
                      {(appliance.parts || []).map((part) => (
                        <div key={part.id}>
                          <p className="font-semibold">🛏 Part: {part.name}</p>
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