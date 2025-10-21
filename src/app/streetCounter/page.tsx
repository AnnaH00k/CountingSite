"use client";

import React, { useState, useEffect } from "react";
import { Car, Truck, Bus, Bike, Zap, Boxes, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    1: { name: "Fahrräder", icon: Bike, color: "bg-green-900" },
    2: { name: "Motor. Zweiräder", icon: Zap, color: "bg-yellow-900" },
    3: { name: "PKW / Lieferwägen", icon: Car, color: "bg-gray-900" },
    4: { name: "Kraftomnibusse", icon: Bus, color: "bg-blue-900" },
    5: { name: "LKW ohne Anhänger", icon: Truck, color: "bg-red-900" },
    6: { name: "LKW mit Anhänger", icon: Boxes, color: "bg-purple-900" },
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
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Hauptseite
            </Link>
          </div>

          <div className="border border-gray-500 shadow-white/50 rounded-lg p-6 mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-300 mb-2">
                Verkehrszähler
              </h1>
              <p className="text-gray-500">Lade gespeicherte Daten...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer top-4 left-4 absolute hover:scale-105"
          >
            <ArrowLeft className="w-10 h-10" />
          </Link>
        </div>

        <div className=" flex flex-col justify-center min-h-[90vh] p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-300 mb-4">
              Verkehrs Zähler
            </h1>

          
          </div>

          {/* Gesamtzähler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 border border-gray-600 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-300">
                Einfahrend Gesamt
              </h3>
              <p className="text-3xl font-bold text-gray-200">
                {totals.einfahrend}
              </p>
            </div>
            <div className="bg-white/20 border border-gray-500 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-300">
                Ausfahrend Gesamt
              </h3>
              <p className="text-3xl font-bold text-gray-200">
                {totals.ausfahrend}
              </p>
            </div>
            <div className="bg-black border border-gray-600 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-300">Gesamt</h3>
              <p className="text-3xl font-bold text-gray-200">
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
                    className="bg-black rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${category.color} rounded-full p-2`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-100">
                            {category.name}
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
                          className="w-full bg-white/10 hover:bg-white/40 text-gray-300 rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
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
                          className="w-full bg-white/20 hover:bg-white/40 text-gray-300 rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
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
            {lastAction && (
              <div className="  rounded-lg p-3 mb-4">
                <p className="text-white/50 font-medium">
                  Letzte Aktion: {lastAction}
                </p>
              </div>
            )}
            <button
              onClick={resetCounts}
              className="bg-black hover:bg-white/20 text-gray-300 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
            >
              Alle Zähler zurücksetzen (R)
            </button>
          </div>

         
        </div>
      </div>
    </div>
  );
}
