"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/components/util/axios.api";
import toast from "react-hot-toast";
import { Event } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { usersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/usersTranslate";
import { lang } from "@/components/util/lang";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

type Props = {
  currentUser: User;
};

const EditUser = ({ currentUser }: Props) => {
  const router = useRouter();
  const [user, setUser] = useState(currentUser);

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
    if (!user.name || !user.email || !user.role) {
      toast.error(usersTranslate.users[lang].error.emptyFields);
      return;
    }
    let toastLoading;
    try {
      toastLoading = toast.loading(
        usersTranslate.users[lang].editUsers.function.handleSubmit.loading
      );
      await api.put(`/admin//dashboard/users/${user._id}`, user);
      toast.success(
        usersTranslate.users[lang].editUsers.function.handleSubmit.success
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
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {usersTranslate.users[lang].editUsers.title}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].editUsers.form.name.label}
          </label>
          <input
            type="text"
            name="name"
            placeholder={
              usersTranslate.users[lang].editUsers.form.name.placeholder
            }
            value={user.name}
            onChange={handleInputChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].editUsers.form.email.label}
          </label>
          <input
            type="email"
            name="email"
            placeholder={
              usersTranslate.users[lang].editUsers.form.email.placeholder
            }
            value={user.email}
            onChange={handleInputChange}
            className="w-full p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].editUsers.form.role.label}
          </label>
          <select
            name="role"
            value={user.role}
            onChange={handleInputChange}
            className="w-full p-2 border"
          >
            <option value="user">
              {usersTranslate.users[lang].editUsers.form.role.options.user}
            </option>
            {/* <option value="seller">Seller</option> */}
            <option value="admin">
              {usersTranslate.users[lang].editUsers.form.role.options.admin}
            </option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">
            {usersTranslate.users[lang].editUsers.form.active.label}
          </label>
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
          {usersTranslate.users[lang].button.updateUser}{" "}
        </button>
      </form>
    </div>
  );
};
export default EditUser;
