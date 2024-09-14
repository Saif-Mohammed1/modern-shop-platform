export const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-500"; // Green for completed
    case "processing":
      return "bg-blue-500"; // Blue for processing
    case "pending":
      return "bg-yellow-500"; // Yellow for pending
    case "failed":
      return "bg-red-500"; // Red for failed
    case "received":
      return "bg-gray-400"; // Gray for received
    case "read":
      return "bg-blue-500"; // Blue for read
    case "responded":
      return "bg-green-500"; // Green for responded
    default:
      return "bg-gray-400"; // Gray for undefined statuses
  }
};
export const generateRandomData = (numEntries) => {
  const statuses = ["pending", "completed", "failed", "processing"];
  const data = [];

  for (let i = 0; i < numEntries; i++) {
    const invoiceId = Math.floor(Math.random() * 100000); // Random invoiceId
    const status = statuses[Math.floor(Math.random() * statuses.length)]; // Random status from the list

    data.push({
      invoiceId: invoiceId,
      status: status,
    });
  }

  return data;
};
