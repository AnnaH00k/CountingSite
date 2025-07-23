"use client";

import React, { useState, useEffect } from "react";
import { Car, Truck, Bus, Bike, Zap, Boxes, Link } from "lucide-react";

// Type definitions
type CategoryId = 1 | 2 | 3 | 4 | 5 | 6;
type Direction = "einfahrend" | "ausfahrend";

interface CountData {
  einfahrend: number;
  ausfahrend: number;
}

interface Category {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
}

type CountsState = Record<CategoryId, CountData>;
type CategoriesConfig = Record<CategoryId, Category>;

// Default counts - used for both server and client initial render
const getDefaultCounts = (): CountsState => ({
  1: { einfahrend: 0, ausfahrend: 0 }, // Fahrräder
  2: { einfahrend: 0, ausfahrend: 0 }, // Motorräder
  3: { einfahrend: 0, ausfahrend: 0 }, // PKW
  4: { einfahrend: 0, ausfahrend: 0 }, // Busse
  5: { einfahrend: 0, ausfahrend: 0 }, // LKW ohne Anhänger
  6: { einfahrend: 0, ausfahrend: 0 }, // LKW mit Anhänger
});

export default function TrafficCounter() {
  // State to track if component has mounted (client-side only)
  const [mounted, setMounted] = useState(false);

  // Initialize with default counts for both server and client
  const [counts, setCounts] = useState<CountsState>(getDefaultCounts);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string>("");

  const categories: CategoriesConfig = {
    1: { name: "Fahrräder", icon: Bike, color: "bg-green-500" },
    2: { name: "Motor. Zweiräder", icon: Zap, color: "bg-blue-500" },
    3: { name: "PKW / Lieferwägen", icon: Car, color: "bg-purple-500" },
    4: { name: "Kraftomnibusse", icon: Bus, color: "bg-orange-500" },
    5: { name: "LKW ohne Anhänger", icon: Truck, color: "bg-red-500" },
    6: { name: "LKW mit Anhänger", icon: Boxes, color: "bg-gray-700" },
  };

  // Function to load data from cookies (client-side only)
  const loadCountsFromCookies = (): CountsState => {
    try {
      const savedCounts = document.cookie
        .split("; ")
        .find((row) => row.startsWith("trafficCounts="))
        ?.split("=")[1];

      if (savedCounts) {
        const parsed = JSON.parse(decodeURIComponent(savedCounts));
        return parsed;
      }
    } catch (error) {
      console.warn("Fehler beim Laden der gespeicherten Daten:", error);
    }

    return getDefaultCounts();
  };

  // Function to save data to cookies
  const saveCountsToCookies = (counts: CountsState) => {
    if (!mounted) return; // Don't save during SSR

    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 Jahr gültig

      document.cookie = `trafficCounts=${encodeURIComponent(
        JSON.stringify(counts)
      )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.warn("Fehler beim Speichern der Daten:", error);
    }
  };

  // Effect to handle mounting and loading saved data
  useEffect(() => {
    setMounted(true);

    // Load saved data only after mounting (client-side)
    const savedCounts = loadCountsFromCookies();
    setCounts(savedCounts);
  }, []);

  const updateCount = (category: CategoryId, direction: Direction) => {
    const newCounts = {
      ...counts,
      [category]: {
        ...counts[category],
        [direction]: counts[category][direction] + 1,
      },
    };
    setCounts(newCounts);
    saveCountsToCookies(newCounts);
    setLastAction(
      `${direction === "einfahrend" ? "Einfahrend" : "Ausfahrend"} - ${
        categories[category].name
      }`
    );
  };

  const resetCounts = () => {
    const initialCounts = getDefaultCounts();
    setCounts(initialCounts);
    saveCountsToCookies(initialCounts);
    setLastAction("Alle Zähler zurückgesetzt");
  };

  const getTotalCounts = () => {
    let totalEin = 0,
      totalAus = 0;
    Object.values(counts).forEach((count) => {
      totalEin += count.einfahrend;
      totalAus += count.ausfahrend;
    });
    return { einfahrend: totalEin, ausfahrend: totalAus };
  };

  // Keyboard event handlers
  useEffect(() => {
    if (!mounted) return; // Don't attach listeners during SSR

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      setActiveKeys((prev) => new Set([...prev, key]));

      // Tastenkombinationen: e + 1-6 für einfahrend, a + 1-6 für ausfahrend
      if (activeKeys.has("e") && ["1", "2", "3", "4", "5", "6"].includes(key)) {
        updateCount(parseInt(key) as CategoryId, "einfahrend");
      } else if (
        activeKeys.has("a") &&
        ["1", "2", "3", "4", "5", "6"].includes(key)
      ) {
        updateCount(parseInt(key) as CategoryId, "ausfahrend");
      }

      // Reset mit 'r'
      if (key === "r") {
        resetCounts();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [mounted, activeKeys]);

  const totals = getTotalCounts();

  // Show loading state during initial mount to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <Link href="/EasyCounter">Easy Counter</Link>
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Verkehrszähler
              </h1>
              <p className="text-gray-300">Lade gespeicherte Daten...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Verkehrszähler
            </h1>
            <Link
              onClick={() => {
                window.location.href = "/CountingSite/easyCounter";
              }}
              className="text-3xl w-full font-bold text-white mb-2"
            >
              
            </Link>

            <p className="text-gray-300 mb-4">
              Tastenkombinationen:{" "}
              <span className="font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded">
                E + 1-6
              </span>{" "}
              für Einfahrend,
              <span className="font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded ml-2">
                A + 1-6
              </span>{" "}
              für Ausfahrend,
              <span className="font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded ml-2">
                R
              </span>{" "}
              zum Zurücksetzen
              <br />
              <span className="text-sm text-gray-400 mt-2 block">
                💾 Daten werden automatisch gespeichert
              </span>
            </p>
            {lastAction && (
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mb-4">
                <p className="text-blue-200 font-medium">
                  Letzte Aktion: {lastAction}
                </p>
              </div>
            )}
          </div>

          {/* Gesamtzähler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-800 border border-green-600 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold text-green-200">
                Einfahrend Gesamt
              </h3>
              <p className="text-3xl font-bold text-green-100">
                {totals.einfahrend}
              </p>
            </div>
            <div className="bg-red-800 border border-red-600 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold text-red-200">
                Ausfahrend Gesamt
              </h3>
              <p className="text-3xl font-bold text-red-100">
                {totals.ausfahrend}
              </p>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-200">Gesamt</h3>
              <p className="text-3xl font-bold text-gray-100">
                {totals.einfahrend + totals.ausfahrend}
              </p>
            </div>
          </div>

          {/* Kategorien */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(Object.entries(categories) as [string, Category][]).map(
              ([keyStr, category]) => {
                const key = parseInt(keyStr) as CategoryId;
                const IconComponent = category.icon;
                return (
                  <div
                    key={key}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${category.color} rounded-full p-2`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-100">
                            {key}. {category.name}
                          </h3>
                          <p className="text-sm text-gray-400">Taste: {key}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-100">
                          {counts[key].einfahrend + counts[key].ausfahrend}
                        </p>
                        <p className="text-sm text-gray-400">Gesamt</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Einfahrend */}
                      <div className="text-center">
                        <button
                          onClick={() => updateCount(key, "einfahrend")}
                          className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          <div className="text-2xl font-bold">
                            {counts[key].einfahrend}
                          </div>
                          <div className="text-sm">Einfahrend</div>
                          <div className="text-xs mt-1 opacity-75">
                            E + {key}
                          </div>
                        </button>
                      </div>

                      {/* Ausfahrend */}
                      <div className="text-center">
                        <button
                          onClick={() => updateCount(key, "ausfahrend")}
                          className="w-full bg-red-600 hover:bg-red-500 text-white rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          <div className="text-2xl font-bold">
                            {counts[key].ausfahrend}
                          </div>
                          <div className="text-sm">Ausfahrend</div>
                          <div className="text-xs mt-1 opacity-75">
                            A + {key}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Reset Button */}
          <div className="text-center mt-8">
            <button
              onClick={resetCounts}
              className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Alle Zähler zurücksetzen (R)
            </button>
          </div>

          {/* Aktive Tasten Anzeige */}
          {activeKeys.size > 0 && (
            <div className="mt-4 text-center">
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-2 inline-block">
                <span className="text-yellow-200 text-sm">
                  Aktive Tasten:{" "}
                  {Array.from(activeKeys)
                    .map((k: string) => k.toUpperCase())
                    .join(" + ")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
