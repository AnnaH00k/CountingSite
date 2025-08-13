"use client";

import React, { useState, useEffect } from "react";
import { Link } from "lucide-react";

// Type definitions
type CategoryId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;
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

const getDefaultCounts = (): CountsState => ({
  1: { einfahrend: 0, ausfahrend: 0 },
  2: { einfahrend: 0, ausfahrend: 0 },
  3: { einfahrend: 0, ausfahrend: 0 },
  4: { einfahrend: 0, ausfahrend: 0 },
  5: { einfahrend: 0, ausfahrend: 0 },
  6: { einfahrend: 0, ausfahrend: 0 },
  7: { einfahrend: 0, ausfahrend: 0 },
  8: { einfahrend: 0, ausfahrend: 0 },
  9: { einfahrend: 0, ausfahrend: 0 },
  10: { einfahrend: 0, ausfahrend: 0 },
  11: { einfahrend: 0, ausfahrend: 0 },
  12: { einfahrend: 0, ausfahrend: 0 },
  13: { einfahrend: 0, ausfahrend: 0 },
  14: { einfahrend: 0, ausfahrend: 0 },
  15: { einfahrend: 0, ausfahrend: 0 },
  16: { einfahrend: 0, ausfahrend: 0 },
});

export default function TrafficCounter() {
  // State to track if component has mounted (client-side only)
  const [mounted, setMounted] = useState(false);

  // Initialize with default counts for both server and client
  const [counts, setCounts] = useState<CountsState>(getDefaultCounts);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastAction, setLastAction] = useState<string>("");

  const categories: CategoriesConfig = {
    1: { name: "Personen", icon: () => null, color: "bg-green-500" },
    2: { name: "G (Gepäck)", icon: () => null, color: "bg-blue-500" },
    3: { name: "F (Fahrrad)", icon: () => null, color: "bg-purple-500" },
    4: { name: "R (Roller)", icon: () => null, color: "bg-orange-500" },
    5: { name: "KW (Kinderwagen)", icon: () => null, color: "bg-red-500" },
    6: { name: "K (Kinder)", icon: () => null, color: "bg-gray-700" },
    7: { name: "TS (Türsteher)", icon: () => null, color: "bg-purple-500" },
    8: {
      name: "KA (getragenes Kind)",
      icon: () => null,
      color: "bg-orange-500",
    },
    9: { name: "EA (Wiedereinsteiger)", icon: () => null, color: "bg-red-500" },
    10: {
      name: "RF (Rollstuhlfahrer)",
      icon: () => null,
      color: "bg-gray-700",
    },
    11: { name: "RO (Rollator)", icon: () => null, color: "bg-purple-500" },
    12: {
      name: "KG(+Anzahl K) Kindergruppe",
      icon: () => null,
      color: "bg-orange-500",
    },
    13: { name: "SG (Schülergruppe)", icon: () => null, color: "bg-red-500" },
    14: { name: "PE (Personengruppe)", icon: () => null, color: "bg-gray-700" },
    15: { name: "GE (Gedränge)", icon: () => null, color: "bg-purple-500" },
    16: { name: "H (Hund)", icon: () => null, color: "bg-orange-500" },
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

      // Tastenkombinationen: e + 1-16 für einfahrend, a + 1-16 für ausfahrend
      if (
        activeKeys.has("e") &&
        [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "0",
          "q",
          "w",
          "e",
          "r",
          "t",
          "z",
        ].includes(key)
      ) {
        const categoryMap: Record<string, CategoryId> = {
          "1": 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "0": 10,
          q: 11,
          w: 12,
          e: 13,
          r: 14,
          t: 15,
          z: 16,
        };
        updateCount(categoryMap[key], "einfahrend");
      } else if (
        activeKeys.has("a") &&
        [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "0",
          "q",
          "w",
          "e",
          "r",
          "t",
          "z",
        ].includes(key)
      ) {
        const categoryMap: Record<string, CategoryId> = {
          "1": 1,
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "0": 10,
          q: 11,
          w: 12,
          e: 13,
          r: 14,
          t: 15,
          z: 16,
        };
        updateCount(categoryMap[key], "ausfahrend");
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
      <div className="min-h-screen bg-gray-900 p-2">
        <Link href="/EasyCounter">Easy Counter</Link>
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-3 mb-3">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white mb-1">
                Zugzähler
              </h1>
              <p className="text-gray-300">Lade gespeicherte Daten...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-2">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-3 mb-3">
          <div className="text-center mb-3">
            <h1 className="text-3xl font-bold text-white mb-4">
              Zugzähler
            </h1>
          

            <p className="text-gray-300 mb-2 text-sm">
              Tastenkombinationen:{" "}
              <span className="font-mono bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded text-xs">
                E + 1-0,Q,W,E,R,T,Z
              </span>{" "}
              für Einfahrend,
              <span className="font-mono bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded ml-2 text-xs">
                A + 1-0,Q,W,E,R,T,Z
              </span>{" "}
              für Ausfahrend,
              <span className="font-mono bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded ml-2 text-xs">
                R
              </span>{" "}
              zum Zurücksetzen
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                💾 Daten werden automatisch gespeichert
              </span>
            </p>
            {lastAction && (
              <div className="bg-blue-900 border border-blue-700 rounded-lg p-2 mb-2">
                <p className="text-blue-200 font-medium text-sm">
                  Letzte Aktion: {lastAction}
                </p>
              </div>
            )}
          </div>

          {/* Gesamtzähler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <div className="bg-green-800 border border-green-600 rounded-lg p-2 text-center">
              <h3 className="text-base font-semibold text-green-200">
                Einfahrend Gesamt
              </h3>
              <p className="text-xl font-bold text-green-100">
                {totals.einfahrend}
              </p>
            </div>
            <div className="bg-red-800 border border-red-600 rounded-lg p-2 text-center">
              <h3 className="text-base font-semibold text-red-200">
                Ausfahrend Gesamt
              </h3>
              <p className="text-xl font-bold text-red-100">
                {totals.ausfahrend}
              </p>
            </div>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-center">
              <h3 className="text-base font-semibold text-gray-200">Gesamt</h3>
              <p className="text-xl font-bold text-gray-100">
                {totals.einfahrend + totals.ausfahrend}
              </p>
            </div>
          </div>

          {/* Kategorien */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(Object.entries(categories) as [string, Category][]).map(
              ([keyStr, category]) => {
                const key = parseInt(keyStr) as CategoryId;
                const IconComponent = category.icon;
                return (
                  <div
                    key={key}
                    className="bg-gray-700 rounded-lg p-2 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-100 text-sm">
                          {key}. {category.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Taste:{" "}
                          {key <= 10
                            ? key
                            : key === 11
                            ? "Q"
                            : key === 12
                            ? "W"
                            : key === 13
                            ? "E"
                            : key === 14
                            ? "R"
                            : key === 15
                            ? "T"
                            : "Z"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-100">
                          {counts[key].einfahrend + counts[key].ausfahrend}
                        </p>
                        <p className="text-xs text-gray-400">Gesamt</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Einfahrend */}
                      <div className="text-center">
                        <button
                          onClick={() => updateCount(key, "einfahrend")}
                          className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                        >
                          <div className="text-lg font-bold">
                            {counts[key].einfahrend}
                          </div>
                          <div className="text-xs">Einfahrend</div>
                          <div className="text-xs mt-0.5 opacity-75">
                            E +{" "}
                            {key <= 10
                              ? key
                              : key === 11
                              ? "Q"
                              : key === 12
                              ? "W"
                              : key === 13
                              ? "E"
                              : key === 14
                              ? "R"
                              : key === 15
                              ? "T"
                              : "Z"}
                          </div>
                        </button>
                      </div>

                      {/* Ausfahrend */}
                      <div className="text-center">
                        <button
                          onClick={() => updateCount(key, "ausfahrend")}
                          className="w-full bg-red-600 hover:bg-red-500 text-white rounded-lg p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                          <div className="text-lg font-bold">
                            {counts[key].ausfahrend}
                          </div>
                          <div className="text-xs">Ausfahrend</div>
                          <div className="text-xs mt-0.5 opacity-75">
                            A +{" "}
                            {key <= 10
                              ? key
                              : key === 11
                              ? "Q"
                              : key === 12
                              ? "W"
                              : key === 13
                              ? "E"
                              : key === 14
                              ? "R"
                              : key === 15
                              ? "T"
                              : "Z"}
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
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
            >
              Alle Zähler zurücksetzen (R)
            </button>
          </div>

          {/* Aktive Tasten Anzeige */}
          {activeKeys.size > 0 && (
            <div className="mt-4 text-center">
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-1 inline-block">
                <span className="text-yellow-200 text-xs">
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
