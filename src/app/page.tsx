"use client";

import React from "react";
import Link from "next/link";
import { Car, Users, Train } from "lucide-react";
import FloatingNumbersBackground from "../components/FloatingNumbersBackground";

export default function NavigationPage() {
  const navigationItems = [
    {
      title: "Verkehrs Zähler",
      href: "/streetCounter",
      icon: Car,
      color: "bg-blue-600 hover:bg-blue-500",
    },
    {
      title: "Einfacher Zähler",
      href: "/easyCounter",
      icon: Users,
      color: "bg-green-600 hover:bg-green-500",
    },
    {
      title: "Zug Zähler",
      href: "/trainCounter",
      icon: Train,
      color: "bg-purple-600 hover:bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <FloatingNumbersBackground />
      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 cursor-default relative">
          {/* Black sphere background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-black rounded-full opacity-100 blur-2xl"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-gray-300 mb-4">
              CountingSite
            </h1>
            <p className="text-xl text-gray-500">Wählen Sie einen Zähler</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link key={index} href={item.href} className="block group z-20">
                <div className="border border-gray-500 bg-black shadow-white/50 rounded-md p-8 h-64 flex flex-col items-center justify-center   transition-all duration-300 hover:shadow-lg hover:scale-105 ">
                  <div
                    className={`rounded-full p-6 mb-6 transition-colors duration-300`}
                  >
                    <IconComponent className="w-12 h-12 text-gray-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-300 transition-colors duration-300 text-center">
                    {item.title}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
