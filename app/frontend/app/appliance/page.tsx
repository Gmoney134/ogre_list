"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaHome, FaTools, FaCog } from "react-icons/fa";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

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
  const [appliance, setAppliance] = useState<Appliance | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedParts, setExpandedParts] = useState<number[]>([]);

  useEffect(() => {
    // Safely access sessionStorage on the client side
    const applianceData = sessionStorage.getItem("appliance");
    if (applianceData) {
      const parsedAppliance = JSON.parse(applianceData);
      setAppliance(parsedAppliance);
    } else {
      router.push("/dash"); // Redirect to dashboard if no house data is found
    }
  }, [router]);

  useEffect(() => {
    if (!appliance || !appliance.id) return;

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchPartData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/part/${appliance.id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch part data");
        }

        const data = await response.json();
        setParts(data || []);
      } catch (error) {
        console.error("Error fetching part data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartData();
  }, [appliance, router]);

  const toggleExpandPart = (id?: number) => {
    if (!id) return;
    setExpandedParts((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handlePartClick = (part: Part): void => {
    if (part) {
      sessionStorage.setItem("part", JSON.stringify(part));
      router.push(`/part`);
    }
  };

  const handleCreatePartClick = (): void => {
    if (appliance && appliance.id) {
      sessionStorage.setItem("applianceID", appliance.id.toString());
      router.push("/createPart");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!appliance) {
    return <p>Appliance not found. Redirecting...</p>;
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
          <h1 className="text-3xl font-bold">Appliance Name: {appliance.name}</h1>
        </header>
        <section className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Parts</h2>
          <button
            onClick={handleCreatePartClick}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition"
          >
            Add Part
          </button>
        </section>

        <section>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {parts.map((part) => (
                <div
                  key={part.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:ring-2 hover:ring-green-200 dark:hover:ring-green-400 cursor-pointer transition"
                >
                  <div
                    className="flex justify-between items-center mb-2"
                    onClick={() => toggleExpandPart(part.id)}
                    onDoubleClick={() => handlePartClick(part)}
                  >
                    <h3 className="text-lg font-bold">{part.name}</h3>
                    {expandedParts.includes(part.id!) ? (
                      <MdExpandLess />
                    ) : (
                      <MdExpandMore />
                    )}
                  </div>

                  {expandedParts.includes(part.id!) && (
                    <div className="ml-2 space-y-2">
                      {part.name && (
                        <div key={part.id}>
                          <p className="font-semibold">🛏 Part: {part.name}</p>
                        </div>
                      )}
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