"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/components/util/axios.api";
import toast from "react-hot-toast";

const AddUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "user",
    active: true,
    password: "",
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser({
      ...user,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let toastLoading;
    if (!user.name || !user.email || !user.password || !user.role) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      toastLoading = toast.loading("Adding user...");
      await api.post("/admin/dashboard/users", user);
      toast.success("User added");
      router.push("/dashboard/users?email=" + user.email);
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            className="w-full p-2 border"
            required
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
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            className="w-full p-2 border"
            required
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
            <option value="seller">Seller</option>
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
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Add User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
