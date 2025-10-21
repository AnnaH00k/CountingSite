"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
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
      setActiveKeys((prev) => new Set([...prev, key]));

      if (key === "e") {
        updateCount("einfahrend");
      } else if (key === "a") {
        updateCount("ausfahrend");
      } else if (key === "r") {
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
  }, [counts]);

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

        <div className="flex min-h-[90vh] flex-col  justify-center p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-300 mb-2">
              Einfacher Zähler
            </h1>
           
          
          </div>

          <div className="text-center ">
            <p className="text-2xl  font-bold text-gray-300">
              {counts.einfahrend + counts.ausfahrend}
            </p>
            <p className="text-sm text-gray-500">Gesamt</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <button
              onClick={() => updateCount("einfahrend")}
              className="bg-white/10 hover:bg-white/40 text-gray-300 rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
            >
              <div className="text-2xl font-bold">{counts.einfahrend}</div>
              <div className="text-sm">Einfahrend</div>
              <div className="text-xs mt-1 opacity-75">E</div>
            </button>

            <button
              onClick={() => updateCount("ausfahrend")}
              className="bg-white/20 hover:bg-white/40 text-gray-300 rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
            >
              <div className="text-2xl font-bold">{counts.ausfahrend}</div>
              <div className="text-sm">Ausfahrend</div>
              <div className="text-xs mt-1 opacity-75">A</div>
            </button>

            {/* New Reset Button */}
            <button
              onClick={resetCounts}
              className="bg-black hover:bg-white/20 text-gray-300 rounded-lg p-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-600"
            >
              <div className="text-2xl font-bold">Reset</div>
              <div className="text-sm">R</div>
            </button>
          </div>

          {/* Last Action Display */}
          {lastAction && (
            <div className="mt-4 text-center">
              <div className="rounded-lg p-3">
                <p className="text-white/50 font-medium">
                  Letzte Aktion: {lastAction}
                </p>
              </div>
            </div>
          )}

         
        </div>
      </div>
    </div>
  );
}
