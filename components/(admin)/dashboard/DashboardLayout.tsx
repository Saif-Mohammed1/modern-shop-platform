"use client";
// components/DashboardLayout.tsx
import { ReactNode, useState } from "react";
// import Sidebar from "./Sidebar";
import { DashboardContext } from "@/contexts/DashboardContext";
import { FiChevronRight } from "react-icons/fi";
import Sidebar from "./dashboardSideBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<"basic" | "advanced">("basic");

  return (
    <DashboardContext.Provider value={{ viewMode, setViewMode }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2 text-gray-500">
              <span>Dashboard</span>
              <FiChevronRight className="w-4 h-4" />
              <span className="font-medium">Analytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode("basic")}
                className={`px-4 py-2 rounded-lg ${viewMode === "basic" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
              >
                Basic View
              </button>
              <button
                onClick={() => setViewMode("advanced")}
                className={`px-4 py-2 rounded-lg ${viewMode === "advanced" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
              >
                Advanced View
              </button>
            </div>
          </div>
          <main className="p-8 overflow-auto h-[calc(100vh-80px)]">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
