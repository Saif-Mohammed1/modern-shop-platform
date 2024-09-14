"use server";

import { headers } from "next/headers";
import fetchApi from "./axios.api";
const calculateGrowth = (orders, dateField) => {
  //chatGpt
  /*
  const today = new Date();
  const currentWeekStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay()
  );
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(currentWeekStart);

  const currentWeekCount = orders.filter((order) => {
    const orderDate = new Date(order[dateField]);
    return orderDate >= currentWeekStart;
  }).length;

  const previousWeekCount = orders.filter((order) => {
    const orderDate = new Date(order[dateField]);
    return orderDate >= previousWeekStart && orderDate < previousWeekEnd;
  }).length;

  let growth = 0;
  if (previousWeekCount > 0) {
    growth = ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100;
  }*/
  // Edge

  // Calculate the current week's start and end dates
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay()); // Set to Monday
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // Set to Sunday

  // Calculate the previous week's start and end dates
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(previousWeekStart);
  previousWeekEnd.setDate(previousWeekStart.getDate() + 6);

  // Filter data for the current week and previous week
  const currentWeekData = orders.filter((entry) => {
    const entryDate = new Date(entry[dateField]);
    return entryDate >= currentWeekStart && entryDate <= currentWeekEnd;
  });

  const previousWeekData = orders.filter((entry) => {
    const entryDate = new Date(entry[dateField]);
    return entryDate >= previousWeekStart && entryDate <= previousWeekEnd;
  });

  // Calculate the total values for each week
  const currentWeekTotal = currentWeekData.reduce(
    (sum, entry) => sum + (entry.price ? entry.price : 0),
    0
  );
  const previousWeekTotal = previousWeekData.reduce(
    (sum, entry) => sum + (entry.price ? entry.price : 0),
    0
  );

  // Calculate the growth percentage
  const growthPercentage =
    previousWeekTotal !== 0
      ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100
      : 0;
  const currentWeekCount = currentWeekData.length;
  const previousWeekCount = previousWeekData.length;
  let growth;
  if (previousWeekCount > 0) {
    growth = ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100;
  } else {
    // If there were no items last week, we can't calculate a growth percentage
    growth = 0; // Not applicable
  }

  return {
    currentWeekCount,
    currentWeekTotal: currentWeekTotal.toFixed(2),
    previousWeekCount,
    previousWeekTotal: previousWeekTotal.toFixed(2),
    growth: growth.toFixed(2),
    growthPercentage: growthPercentage.toFixed(2),
  }; // Keeping two decimals for growth
};

export const GrowthAnalysis = async (endpoint, dateField) => {
  try {
    if (!endpoint) {
      throw new Error("Endpoint must be required");
    }
    const { data, error } = await fetchApi(endpoint, { headers: headers() });
    if (error) {
      throw error;
    }
    const {
      currentWeekCount,
      currentWeekTotal,
      previousWeekCount,
      previousWeekTotal,
      growth,
      growthPercentage,
    } = calculateGrowth(data?.allData, dateField);

    return {
      data: data?.allData.length,
      stats: {
        currentWeekCount,
        currentWeekTotal,
        previousWeekCount,
        previousWeekTotal,
        growth,
        growthPercentage,
      },
    };
  } catch (error) {
    //console.log("+++++++++++++++++++++++error++++++++++++++++++", error);
    return {
      error: {
        message:
          error?.message || "an expected error happened please try again later", // error,
        status: error?.status,
      },
    };
    // throw error;
  }
};

export default GrowthAnalysis;
