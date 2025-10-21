"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  titleColor: string;
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
    1: {
      name: "P (Personen)",
      icon: () => null,
      color: "bg-gray-600",
      titleColor: "#30807D", // Brown spectrum - saddle brown
    },
    2: {
      name: "G (Gepäck)",
      icon: () => null,
      color: "bg-gray-700",
      titleColor: "#C2A579", // Green spectrum - sea green
    },
    3: {
      name: "F (Fahrrad)",
      icon: () => null,
      color: "bg-gray-800",
      titleColor: "#E7333E", // Blue spectrum - steel blue
    },
    4: {
      name: "R (Roller)",
      icon: () => null,
      color: "bg-gray-500",
      titleColor: "#A4814B", // Red spectrum - dark red
    },
    5: {
      name: "KW (Kinderwagen)",
      icon: () => null,
      color: "bg-gray-900",
      titleColor: "#C03844", // Yellow spectrum - dark goldenrod
    },
    6: {
      name: "K (Kinder)",
      icon: () => null,
      color: "bg-gray-400",
      titleColor: "#142E97", // Purple spectrum - purple
    },
    7: {
      name: "TS (Türsteher)",
      icon: () => null,
      color: "bg-gray-600",
      titleColor: "#60462B", // Orange spectrum - tomato
    },
    8: {
      name: "KA (getragenes Kind)",
      icon: () => null,
      color: "bg-gray-700",
      titleColor: "#6D1626", // Cyan spectrum - light sea green
    },
    9: {
      name: "EA (Wiedereinsteiger)",
      icon: () => null,
      color: "bg-gray-800",
      titleColor: "#5F715B", // Brown spectrum - sienna
    },
    10: {
      name: "RF (Rollstuhlfahrer)",
      icon: () => null,
      color: "bg-gray-500",
      titleColor: "#57291A", // Green spectrum - lime green
    },
    11: {
      name: "RO (Rollator)",
      icon: () => null,
      color: "bg-gray-900",
      titleColor: "#981233", // Blue spectrum - royal blue
    },
    12: {
      name: "KG(+Anzahl K) Kindergruppe",
      icon: () => null,
      color: "bg-gray-400",
      titleColor: "#00CED1", // Red spectrum - crimson
    },
    13: {
      name: "SG (Schülergruppe)",
      icon: () => null,
      color: "bg-gray-600",
      titleColor: "#AE7B0E", // Yellow spectrum - gold
    },
    14: {
      name: "PE (Personengruppe)",
      icon: () => null,
      color: "bg-gray-700",
      titleColor: "#3D602A", // Purple spectrum - medium purple
    },
    15: {
      name: "GE (Gedränge)",
      icon: () => null,
      color: "bg-gray-800",
      titleColor: "#96766B", // Orange spectrum - dark orange
    },
    16: {
      name: "H (Hund)",
      icon: () => null,
      color: "bg-gray-500",
      titleColor: "#D65124", // Cyan spectrum - dark turquoise
    },
  };

  // Function to load data from cookies (client-side only)
  const loadCountsFromCookies = (): CountsState => {
    // Check if we're in a browser environment and document is available
    if (typeof window === "undefined" || typeof document === "undefined") {
      return getDefaultCounts();
    }

    try {
      const savedCounts = document.cookie
        .split("; ")
        .find((row) => row.startsWith("trainCounts="))
        ?.split("=")[1];

      if (savedCounts) {
        const parsed = JSON.parse(decodeURIComponent(savedCounts));

        // Ensure the parsed data has the complete structure
        const defaultCounts = getDefaultCounts();
        const validatedCounts: CountsState = { ...defaultCounts };

        // Only use parsed data if it has the correct structure
        if (parsed && typeof parsed === "object") {
          Object.keys(defaultCounts).forEach((key) => {
            const categoryId = parseInt(key) as CategoryId;
            if (
              parsed[categoryId] &&
              typeof parsed[categoryId] === "object" &&
              typeof parsed[categoryId].einfahrend === "number" &&
              typeof parsed[categoryId].ausfahrend === "number"
            ) {
              validatedCounts[categoryId] = parsed[categoryId];
            }
          });
        }

        return validatedCounts;
      }
    } catch (error) {
      console.warn("Fehler beim Laden der gespeicherten Daten:", error);
    }

    return getDefaultCounts();
  };

  // Function to save data to cookies
  const saveCountsToCookies = (counts: CountsState) => {
    if (!mounted) return; // Don't save during SSR

    // Check if we're in a browser environment and document is available
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    try {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 Jahr gültig

      document.cookie = `trainCounts=${encodeURIComponent(
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
    // Ensure counts[category] exists and has the correct structure
    const currentCategoryCounts = counts[category] || {
      einfahrend: 0,
      ausfahrend: 0,
    };

    const newCounts = {
      ...counts,
      [category]: {
        ...currentCategoryCounts,
        [direction]: (currentCategoryCounts[direction] || 0) + 1,
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
      if (
        count &&
        typeof count === "object" &&
        typeof count.einfahrend === "number" &&
        typeof count.ausfahrend === "number"
      ) {
        totalEin += count.einfahrend;
        totalAus += count.ausfahrend;
      }
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
          "s",
          "d",
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
          s: 13,
          d: 14,
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
          "s",
          "d",
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
          s: 13,
          d: 14,
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
                Zugzähler
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

        <div className="flex flex-col justify-center min-h-[90vh] p-3 mb-3">
          <div className="text-center mb-3">
            <h1 className="text-3xl font-bold text-gray-300 mb-4">
              Zug Zähler
            </h1>

            {lastAction && (
              <div className="bg-black  rounded-lg p-2 mb-2">
                <p className="text-white/50 font-medium text-sm">
                  Letzte Aktion: {lastAction}
                </p>
              </div>
            )}
          </div>

          {/* Gesamtzähler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <div className="bg-white/10 border border-gray-600 rounded-lg p-2 text-center">
              <h3 className="text-base font-semibold text-gray-300">
                Einfahrend Gesamt
              </h3>
              <p className="text-xl font-bold text-gray-200">
                {totals.einfahrend}
              </p>
            </div>
            <div className="bg-white/20 border border-gray-500 rounded-lg p-2 text-center">
              <h3 className="text-base font-semibold text-gray-300">
                Ausfahrend Gesamt
              </h3>
              <p className="text-xl font-bold text-gray-200">
                {totals.ausfahrend}
              </p>
            </div>
            <div className="bg-black border border-gray-600 rounded-lg p-2 text-center">
              <h3 className="text-base font-semibold text-gray-300">Gesamt</h3>
              <p className="text-xl font-bold text-gray-200">
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
                    className="bg-black rounded-lg p-2 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3
                          className="font-semibold text-sm"
                          style={{ color: category.titleColor }}
                        >
                          {category.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Taste:{" "}
                          {key <= 9
                            ? key
                            : key === 10
                            ? "0"
                            : key === 11
                            ? "Q"
                            : key === 12
                            ? "W"
                            : key === 13
                            ? "S"
                            : key === 14
                            ? "D"
                            : key === 15
                            ? "T"
                            : "Z"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-100">
                          {(counts[key]?.einfahrend || 0) +
                            (counts[key]?.ausfahrend || 0)}
                        </p>
                        <p className="text-xs text-gray-400">Gesamt</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Einfahrend */}
                      <div className="text-center">
                        <button
                          onClick={() => updateCount(key, "einfahrend")}
                          className="w-full bg-white/10 hover:bg-white/40 text-gray-300 rounded-lg p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
                        >
                          <div className="text-lg font-bold">
                            {counts[key]?.einfahrend || 0}
                          </div>
                          <div className="text-xs">Einfahrend</div>
                          <div className="text-xs mt-0.5 opacity-75">
                            E +{" "}
                            {key <= 9
                              ? key
                              : key === 10
                              ? "0"
                              : key === 11
                              ? "Q"
                              : key === 12
                              ? "W"
                              : key === 13
                              ? "S"
                              : key === 14
                              ? "D"
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
                          className="w-full bg-white/20 hover:bg-white/40 text-gray-300 rounded-lg p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
                        >
                          <div className="text-lg font-bold">
                            {counts[key]?.ausfahrend || 0}
                          </div>
                          <div className="text-xs">Ausfahrend</div>
                          <div className="text-xs mt-0.5 opacity-75">
                            A +{" "}
                            {key <= 9
                              ? key
                              : key === 10
                              ? "0"
                              : key === 11
                              ? "Q"
                              : key === 12
                              ? "W"
                              : key === 13
                              ? "S"
                              : key === 14
                              ? "D"
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
              className="bg-black hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm border border-gray-600"
            >
              Alle Zähler zurücksetzen (R)
            </button>
          </div>

          {/* Aktive Tasten Anzeige */}
          {activeKeys.size > 0 && (
            <div className="mt-4 text-center">
              <div className="bg-white/10 border border-gray-600 rounded-lg p-1 inline-block">
                <span className="text-gray-300 text-xs">
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
