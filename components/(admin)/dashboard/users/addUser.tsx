"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/components/util/axios.api";
import toast from "react-hot-toast";
import { Event } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { usersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/usersTranslate";
import { lang } from "@/components/util/lang";

const AddUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "user",
    active: true,
    password: "",
  });

  const router = useRouter();

  const handleInputChange = (e: Event) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setUser({
      ...user,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let toastLoading;
    if (!user.name || !user.email || !user.password || !user.role) {
      toast.error(usersTranslate.users[lang].error.emptyFields);
      return;
    }
    try {
      toastLoading = toast.loading(
        usersTranslate.users[lang].addUsers.function.handleSubmit.loading
      );
      await api.post("/admin/dashboard/users", user);
      toast.success(
        usersTranslate.users[lang].addUsers.function.handleSubmit.success
      );
      router.push("/dashboard/users?email=" + user.email);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error?.message || usersTranslate.users[lang].error.global);
      } else {
        toast.error(usersTranslate.users[lang].error.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {usersTranslate.users[lang].addUsers.title}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].addUsers.form.name.label}
          </label>
          <input
            type="text"
            name="name"
            value={user.name}
            placeholder={
              usersTranslate.users[lang].addUsers.form.name.placeholder
            }
            onChange={handleInputChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].addUsers.form.email.label}
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            placeholder={
              usersTranslate.users[lang].addUsers.form.email.placeholder
            }
            onChange={handleInputChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].addUsers.form.password.label}
          </label>
          <input
            type="password"
            name="password"
            placeholder={
              usersTranslate.users[lang].addUsers.form.password.placeholder
            }
            value={user.password}
            onChange={handleInputChange}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].addUsers.form.role.label}
          </label>
          <select
            name="role"
            value={user.role}
            onChange={handleInputChange}
            className="w-full p-2 border"
          >
            <option value="user">
              {usersTranslate.users[lang].addUsers.form.role.options.user}
            </option>
            {/* <option value="seller">
              {usersTranslate.users[lang].addUsers.form.role.options.seller}
            </option> */}
            <option value="admin">
              {usersTranslate.users[lang].addUsers.form.role.options.admin}
            </option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].addUsers.form.active.label}
          </label>
          <input
            type="checkbox"
            name="active"
            checked={user.active}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          {usersTranslate.users[lang].button.addUser}
        </button>
      </form>
    </div>
  );
};

export default AddUser;
