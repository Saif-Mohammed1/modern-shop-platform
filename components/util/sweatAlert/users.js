import Message from "@/components/message/message";
import Swal from "sweetalert2";
import fetchApi from "../axios.api";
import { toast } from "react-toastify";

export const createUser = async () => {
  try {
    const result = await Swal.fire({
      title: "Create New User",
      html: `
        <input id="swal-input-name" class="swal2-input" placeholder="Name" value="" type="text">
        <input id="swal-input-email" class="swal2-input" placeholder="Email" value="" type="email">
        <input id="swal-input-password" class="swal2-input" placeholder="Password" type="password" value="">
        <input id="swal-input-confirm-password" class="swal2-input" placeholder="Confirm Password" type="password" value="">
        <select id="swal-input-role" class="swal2-input">
          <option value="">Select a role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="seller">Seller</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById("swal-input-name").value;
        const email = document.getElementById("swal-input-email").value;
        const password = document.getElementById("swal-input-password").value;
        const confirmPassword = document.getElementById(
          "swal-input-confirm-password"
        ).value;
        const role = document.getElementById("swal-input-role").value;

        if (!name || !email || !password || !confirmPassword || !role) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        if (password !== confirmPassword) {
          Swal.showValidationMessage("Passwords do not match");
          return false;
        }

        return {
          name,
          email,
          password,
          role,
          confirmPassword,
        };
      },
    });
    if (result.isConfirmed && result.value) {
      // Here you can handle the result, such as creating the user in your database
      //   //console.log(result.value);
      const { data, error } = await fetchApi("/dashboard/users", {
        method: "POST",
        body: JSON.stringify(result.value),
      });
      if (error) {
        throw error;
      }
      Swal.fire("User Created", "User created successfully", "success");
      //   Swal.fire("Updated", message, "success");
    }
  } catch (error) {
    throw error;
  }
};

export const handleEditClick = async (id) => {
  try {
    const result = await Swal.fire({
      title: "Update User Details",
      html: `
        <select id="swal-input-role" class="swal2-input">
          <option value="">Select a role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="seller">Seller</option>
        </select>
        <select id="swal-input-active" class="swal2-input">
          <option value="">Set active status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const role = document.getElementById("swal-input-role").value;
        const active = document.getElementById("swal-input-active").value;
        if (role === "" && active === "") {
          Swal.showValidationMessage("Please select at least one option."); // Show error if nothing is selected
          return false;
        }
        return {
          role: role !== "" ? role : undefined,
          active: active !== "" ? active === "true" : undefined,
        };
      },
    });
    if (result.isConfirmed && result.value) {
      // Here you can handle the result, such as updating the user's role and active status in your database
      let message = `Updates:\n${
        result.value.role ? "Role: " + result.value.role : ""
      }${
        result.value.active !== undefined
          ? "\nActive: " + (result.value.active ? "Yes" : "No")
          : ""
      }`;

      const { data, error } = await fetchApi("/dashboard/users/" + id, {
        method: "PUT",
        body: JSON.stringify({
          role: result.value.role,
          active: result.value.active,
        }),
      });
      if (error) {
        throw error;
      }
      Swal.fire("Updated", message, "success");
    }
  } catch (error) {
    throw error;
  }
};
