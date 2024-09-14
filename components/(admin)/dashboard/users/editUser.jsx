"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/components/util/axios.api";
import toast from "react-hot-toast";

const EditUser = ({ currentUser }) => {
  const router = useRouter();
  const [user, setUser] = useState(currentUser);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser({
      ...user,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.name || !user.email || !user.role) {
      toast.error("Please fill all fields");
      return;
    }
    let toastLoading;
    try {
      toastLoading = toast.loading("Updating user...");
      await api.put(`/admin//dashboard/users/${user._id}`, user);
      toast.success("User updated");
      router.push("/dashboard/users?email=" + user.email);
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Role</label>
          <select
            name="role"
            value={user.role}
            onChange={handleInputChange}
            className="w-full p-2 border"
          >
            <option value="user">User</option>
            {/* <option value="seller">Seller</option> */}
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Active</label>
          <input
            type="checkbox"
            name="active"
            checked={user.active}
            onChange={handleInputChange}
          />
        </div>
        <button
          type="submit"
          className="
            bg-blue-500
            hover:bg-blue-700
            text-white
            font-bold
            py-2
            px-4
            rounded
            "
        >
          Update User
        </button>
      </form>
    </div>
  );
};
export default EditUser;
