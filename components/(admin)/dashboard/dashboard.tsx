"use client";

import { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";

import DashboardSkeleton from "@/app/(auth)/(admin)/dashboard/loading";
import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

import AdvancedView from "./AdvancedView";
import BasicView from "./BasicView";
// import DashboardSkeleton from "./DashboardSkeleton";

const AdminDashboard = ({
  dashboardData,
}: {
  dashboardData: DashboardDataApi | null;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Persist view preference
  useEffect(() => {
    const savedView = localStorage.getItem("dashboardView");
    if (savedView) {
      setShowAdvanced(savedView === "advanced");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardView", showAdvanced ? "advanced" : "basic");
  }, [showAdvanced]);

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:block">
              {showAdvanced ? "Advanced View" : "Basic View"}
            </span>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
              aria-label={
                showAdvanced
                  ? "Switch to basic view"
                  : "Switch to advanced view"
              }
            >
              {showAdvanced ? (
                <>
                  <FiGrid className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">Basic View</span>
                  <FiChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </>
              ) : (
                <>
                  <FiBarChart2 className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:inline">Advanced View</span>
                  <FiChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {showAdvanced ? (
          <AdvancedView data={dashboardData} />
        ) : (
          <BasicView data={dashboardData} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
