"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";

type NeoCssVars = React.CSSProperties & {
  "--neo-r": number;
  "--neo-g": number;
  "--neo-b": number;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
};

const neoVars = (hex: string): NeoCssVars => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return { "--neo-r": 255, "--neo-g": 255, "--neo-b": 255 } as NeoCssVars;
  }
  return {
    "--neo-r": rgb.r,
    "--neo-g": rgb.g,
    "--neo-b": rgb.b,
  } as NeoCssVars;
};

const NEO_BTN =
  "neo-btn rounded-xl transition-[box-shadow,transform,filter] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20";

const NEO_NEUTRAL = "#71717A";

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

const CATEGORY_PALETTE: Record<CategoryId, string> = {
  1: "#94A3B8",
  2: "#CBB08A",
  3: "#EF7D6B",
  4: "#E89450",
  5: "#D9AE4B",
  6: "#5C9FE8",
  7: "#9D8FE0",
  8: "#D67AA8",
  9: "#5DB88A",
  10: "#4DA89E",
  11: "#52ADC4",
  12: "#7CB66E",
  13: "#A8BF5C",
  14: "#B078C4",
  15: "#C48686",
  16: "#D4B84A",
};

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

/** Kürzel pro Kategorie; P (Personen) wird nicht exportiert */
const CATEGORY_ABBREV: Partial<Record<CategoryId, string>> = {
  2: "G",
  3: "F",
  4: "R",
  5: "KW",
  6: "K",
  7: "TS",
  8: "KA",
  9: "EA",
  10: "RF",
  11: "RO",
  12: "KG",
  13: "SG",
  14: "PE",
  15: "GE",
  16: "H",
};

const CATEGORY_IDS_FOR_EXPORT = (Object.keys(CATEGORY_ABBREV) as string[]).map(
  (id) => parseInt(id, 10) as CategoryId,
);

const formatAbbrevList = (
  counts: CountsState,
  direction: Direction,
): string => {
  const parts: string[] = [];
  for (const id of CATEGORY_IDS_FOR_EXPORT) {
    const abbrev = CATEGORY_ABBREV[id];
    if (!abbrev) continue;
    const count = counts[id]?.[direction] ?? 0;
    if (count > 0) {
      parts.push(`${count}${abbrev}`);
    }
  }
  return parts.join(", ");
};

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
      titleColor: CATEGORY_PALETTE[1],
    },
    2: {
      name: "G (Gepäck)",
      icon: () => null,
      color: "bg-gray-700",
      titleColor: CATEGORY_PALETTE[2],
    },
    3: {
      name: "F (Fahrrad)",
      icon: () => null,
      color: "bg-gray-800",
      titleColor: CATEGORY_PALETTE[3],
    },
    4: {
      name: "R (Roller)",
      icon: () => null,
      color: "bg-gray-500",
      titleColor: CATEGORY_PALETTE[4],
    },
    5: {
      name: "KW (Kinderwagen)",
      icon: () => null,
      color: "bg-gray-900",
      titleColor: CATEGORY_PALETTE[5],
    },
    6: {
      name: "K (Kinder)",
      icon: () => null,
      color: "bg-gray-400",
      titleColor: CATEGORY_PALETTE[6],
    },
    7: {
      name: "TS (Türsteher)",
      icon: () => null,
      color: "bg-gray-600",
      titleColor: CATEGORY_PALETTE[7],
    },
    8: {
      name: "KA (getragenes Kind)",
      icon: () => null,
      color: "bg-gray-700",
      titleColor: CATEGORY_PALETTE[8],
    },
    9: {
      name: "EA (Wiedereinsteiger)",
      icon: () => null,
      color: "bg-gray-800",
      titleColor: CATEGORY_PALETTE[9],
    },
    10: {
      name: "RF (Rollstuhlfahrer)",
      icon: () => null,
      color: "bg-gray-500",
      titleColor: CATEGORY_PALETTE[10],
    },
    11: {
      name: "RO (Rollator)",
      icon: () => null,
      color: "bg-gray-900",
      titleColor: CATEGORY_PALETTE[11],
    },
    12: {
      name: "KG(+Anzahl K) Kindergruppe",
      icon: () => null,
      color: "bg-gray-400",
      titleColor: CATEGORY_PALETTE[12],
    },
    13: {
      name: "SG (Schülergruppe)",
      icon: () => null,
      color: "bg-gray-600",
      titleColor: CATEGORY_PALETTE[13],
    },
    14: {
      name: "PE (Personengruppe)",
      icon: () => null,
      color: "bg-gray-700",
      titleColor: CATEGORY_PALETTE[14],
    },
    15: {
      name: "GE (Gedränge)",
      icon: () => null,
      color: "bg-gray-800",
      titleColor: CATEGORY_PALETTE[15],
    },
    16: {
      name: "H (Hund)",
      icon: () => null,
      color: "bg-gray-500",
      titleColor: CATEGORY_PALETTE[16],
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
        JSON.stringify(counts),
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
      }`,
    );
  };

  const resetCounts = () => {
    const initialCounts = getDefaultCounts();
    setCounts(initialCounts);
    saveCountsToCookies(initialCounts);
    setLastAction("Alle Zähler zurückgesetzt");
  };

  const copyAbbrevList = async (direction: Direction) => {
    const label = direction === "einfahrend" ? "Einsteiger" : "Aussteiger";
    const text = formatAbbrevList(counts, direction);

    if (!text) return;

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setLastAction("Kopieren nicht verfügbar");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setLastAction(`${label} kopiert: ${text}`);
    } catch {
      setLastAction(`${label}: Kopieren fehlgeschlagen`);
    }
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

  const einsteigerCopyText = formatAbbrevList(counts, "einfahrend");
  const aussteigerCopyText = formatAbbrevList(counts, "ausfahrend");
  const canCopyEinsteiger = einsteigerCopyText.length > 0;
  const canCopyAussteiger = aussteigerCopyText.length > 0;

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
              <p className="mb-2 text-sm font-medium text-white/50">
                Letzte Aktion: {lastAction}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              disabled={!canCopyEinsteiger}
              onClick={() => copyAbbrevList("einfahrend")}
              style={neoVars(NEO_NEUTRAL)}
              className={`${NEO_BTN} neo-btn-neutral inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 disabled:text-gray-600`}
            >
              <Copy className="w-4 h-4 shrink-0" />
              Einsteiger-Kürzel kopieren
            </button>
            <button
              type="button"
              disabled={!canCopyAussteiger}
              onClick={() => copyAbbrevList("ausfahrend")}
              style={neoVars(NEO_NEUTRAL)}
              className={`${NEO_BTN} neo-btn-neutral inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 disabled:text-gray-600`}
            >
              <Copy className="w-4 h-4 shrink-0" />
              Aussteiger-Kürzel kopieren
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {(Object.entries(categories) as [string, Category][]).map(
              ([keyStr, category]) => {
                const key = parseInt(keyStr) as CategoryId;
                return (
                  <div
                    key={key}
                    className="neo-card rounded-xl p-2"
                    style={neoVars(category.titleColor)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <h3
                          className="font-semibold text-sm"
                          style={{ color: category.titleColor }}
                        >
                          {category.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-100">
                          {(counts[key]?.einfahrend || 0) +
                            (counts[key]?.ausfahrend || 0)}
                        </p>
                        <p className="text-xs text-gray-500">Gesamt</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCount(key, "einfahrend")}
                        style={neoVars(category.titleColor)}
                        className={`${NEO_BTN} w-full p-2.5 text-gray-200`}
                      >
                        <div className="text-lg font-bold">
                          {counts[key]?.einfahrend || 0}
                        </div>
                        <div className="text-xs text-gray-400">Einfahrend</div>
                        <div className="text-[10px] mt-0.5 text-gray-500">
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
                      <button
                        type="button"
                        onClick={() => updateCount(key, "ausfahrend")}
                        style={neoVars(category.titleColor)}
                        className={`${NEO_BTN} w-full p-2.5 text-gray-200`}
                      >
                        <div className="text-lg font-bold">
                          {counts[key]?.ausfahrend || 0}
                        </div>
                        <div className="text-xs text-gray-400">Ausfahrend</div>
                        <div className="text-[10px] mt-0.5 text-gray-500">
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
                );
              },
            )}
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={resetCounts}
              style={neoVars(NEO_NEUTRAL)}
              className={`${NEO_BTN} neo-btn-neutral px-5 py-2.5 text-sm font-semibold text-gray-300`}
            >
              Alle Zähler zurücksetzen (R)
            </button>
          </div>

          {activeKeys.size > 0 && (
            <div className="mt-4 text-center">
              <div
                className="neo-panel rounded-xl px-3 py-1.5 inline-block"
                style={neoVars(NEO_NEUTRAL)}
              >
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
