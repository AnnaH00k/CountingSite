"use client";

import React from "react";
import Link from "next/link";
import { Car, Users, Train } from "lucide-react";

export default function NavigationPage() {
  const navigationItems = [
    {
      title: "Verkehrszähler",
      href: "/streetCounter",
      icon: Car,
      color: "bg-blue-600 hover:bg-blue-500",
    },
    {
      title: "Easy Counter",
      href: "/easyCounter",
      icon: Users,
      color: "bg-green-600 hover:bg-green-500",
    },
    {
      title: "Zugzähler",
      href: "/trainCounter",
      icon: Train,
      color: "bg-purple-600 hover:bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Zähler</h1>
          <p className="text-xl text-gray-400">Wählen Sie einen Zähler</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link key={index} href={item.href} className="block group">
                <div className="bg-gray-800 rounded-2xl p-8 h-64 flex flex-col items-center justify-center border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <div
                    className={`${item.color} rounded-full p-6 mb-6 transition-colors duration-300`}
                  >
                    <IconComponent className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 text-center">
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
