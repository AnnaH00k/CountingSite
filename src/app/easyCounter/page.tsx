"use client";

import React, { useState, useEffect } from "react";

// Type definitions
type Direction = "einfahrend" | "ausfahrend";

interface CountData {
  einfahrend: number;
  ausfahrend: number;
}

export default function EasyCounter() {
  const [counts, setCounts] = useState<CountData>({
    einfahrend: 0,
    ausfahrend: 0,
  });
  const [lastAction, setLastAction] = useState<string>("");

  const updateCount = (direction: Direction) => {
    const newCounts = {
      ...counts,
      [direction]: counts[direction] + 1,
    };
    setCounts(newCounts);
    setLastAction(
      `${direction === "einfahrend" ? "Einfahrend" : "Ausfahrend"}`
    );
  };

  const resetCounts = () => {
    setCounts({ einfahrend: 0, ausfahrend: 0 });
    setLastAction("Alle Zähler zurückgesetzt");
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "e") {
        updateCount("einfahrend");
      } else if (key === "a") {
        updateCount("ausfahrend");
      } else if (key === "r") {
        resetCounts();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [counts]);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Easy Counter
            </h1>
            <p className="text-gray-300 mb-4">
              Drücke{" "}
              <span className="font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded">
                E
              </span>{" "}
              für Einfahrend,
              <span className="font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded ml-2">
                A
              </span>{" "}
              für Ausfahrend und{" "}
              <span className="font-mono bg-gray-700 text-gray-200 px-2 py-1 rounded ml-2">
                R
              </span>{" "}
              zum Zurücksetzen
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-100">
              {counts.einfahrend + counts.ausfahrend}
            </p>
            <p className="text-sm text-gray-400">Gesamt</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <button
              onClick={() => updateCount("einfahrend")}
              className="bg-green-600 hover:bg-green-500 text-white rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <div className="text-2xl font-bold">{counts.einfahrend}</div>
              <div className="text-sm">Einfahrend</div>
              <div className="text-xs mt-1 opacity-75">E</div>
            </button>

            <button
              onClick={() => updateCount("ausfahrend")}
              className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <div className="text-2xl font-bold">{counts.ausfahrend}</div>
              <div className="text-sm">Ausfahrend</div>
              <div className="text-xs mt-1 opacity-75">A</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
