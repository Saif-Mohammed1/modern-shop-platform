"use client";
// const AdminOrderManagement = ({ orders }) => {
//   const handleStatusChange = (orderId, newStatus) => {
//     // Implement the function to update order status in the database
//     //console.log(`Changing order ${orderId} to ${newStatus}`);
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Order Management</h1>
//       <table className="min-w-full bg-white border">
//         <thead>
//           <tr>
//             <th className="py-2">Order ID</th>
//             <th className="py-2">Customer</th>
//             <th className="py-2">Status</th>
//             <th className="py-2">Total Price</th>
//             <th className="py-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((order) => (
//             <tr key={order._id} className="border-t">
//               <td className="py-2">{order._id}</td>
//               <td className="py-2">{order.user.name}</td>
//               <td className="py-2">{order.status}</td>
//               <td className="py-2">${order.totalPrice}</td>
//               <td className="py-2">
//                 <select
//                   value={order.status}
//                   onChange={(e) =>
//                     handleStatusChange(order._id, e.target.value)
//                   }
//                   className="border p-1 rounded"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="processing">Processing</option>
//                   <option value="completed">Completed</option>
//                   <option value="refunded">Refunded</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//                 <button className="ml-2 bg-red-500 text-white px-4 py-1 rounded">
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };
import { useState, useEffect } from "react";

const AdminOrderManagement = ({ orders }) => {
  const [orderList, setOrderList] = useState(orders || []);
  const [loading, setLoading] = useState(false);

  //   useEffect(() => {
  //     fetchAllOrders().then((data) => {
  //       setOrders(data);
  //       setLoading(false);
  //     });
  //   }, []);

  const handleStatusChange = (orderId, newStatus) => {
    // updateOrderStatus(orderId, newStatus)
    //   .then((response) => {
    //     alert(response.message);
    //     // Re-fetch the orders or update local state
    //     fetchAllOrders().then((data) => setOrders(data));
    //   })
    //   .catch((error) => alert(error.message));
  };

  if (loading) {
    return <p className="text-center mt-6">Loading orders...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold mb-6">Admin Order Management</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Total Price</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{order._id}</td>
                <td className="border px-4 py-2">{order.user.name}</td>
                <td className="border px-4 py-2">${order.totalPrice}</td>
                <td className="border px-4 py-2 capitalize">{order.status}</td>
                <td className="border px-4 py-2">
                  <select
                    className="p-2 border rounded"
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    defaultValue={order.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderManagement;
