// import { toast } from "react-toastify";
import Swal from "sweetalert2";
import fetchApi from "../axios.api";
import { toast } from "react-toastify";

export const DeleteEvent = async (endPoint, message) => {
  try {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      const { data, error } = await fetchApi(endPoint, {
        method: "DELETE",
      });
      if (error) {
        throw error;
      }
      toast.success(message || "Process has been successfully");
      return { message: "success" };
    } else {
      toast.error("Process has been canceled");
    }
  } catch (error) {
    throw error;
  }
};

export const updateStatusEvent = async (endPoint, message) => {
  let title = "";
  let options = [];

  // Determine title and options based on endpoint
  // switch (endPoint) {
  //   case "/dashboard/orders":
  //     title = "Edit Order Status";
  //     options = ["pending", "completed", "failed", "processing"];
  //     break;
  //   case "/dashboard/refunds":
  //     title = "Edit Refund Status";
  //     options = ["pending", "processing", "accepted", "refused"];
  //     break;
  //   case "/dashboard/reports":
  //     title = "Edit Report Status";
  //     options = ["pending", "reviewing", "completed"];
  //     break;
  //   default:
  //     // Handle other endpoints
  //     break;
  // }

  // Determine title and options based on endpoint
  if (endPoint.includes("/dashboard/orders")) {
    title = "Edit Order Status";
    options = ["pending", "completed", "failed", "processing"];
  } else if (endPoint.includes("/dashboard/refunds")) {
    title = "Edit Refund Status";
    options = ["pending", "processing", "accepted", "refused"];
  } else if (endPoint.includes("/dashboard/reports")) {
    title = "Edit Report Status";
    options = ["pending", "reviewing", "completed"];
  } else if (endPoint.includes("/dashboard/contact-us")) {
    title = "Edit Contact-us Status";
    options = ["received", "read", "responded"];
  }
  try {
    const result = await Swal.fire({
      title: title,
      html: `
        <select id="swal-input-status" class="swal2-input" required>
          <option value="">Select status</option>
          ${options
            .map(
              (option) =>
                `<option value="${option}">${
                  option.charAt(0).toUpperCase() + option.slice(1)
                }</option>`
            )
            .join("")}
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const status = document.getElementById("swal-input-status").value;
        if (!status) {
          Swal.showValidationMessage("Please select a status.");
          return false;
        }
        return { status };
      },
    });
    if (result.isConfirmed && result.value) {
      const { data, error } = await fetchApi(endPoint, {
        method: "PUT",
        body: JSON.stringify(result.value),
      });
      if (error) {
        throw error;
      }
      toast.success(message || "Process has been successfully");
      return result.value; // Return the selected status
    } else {
      toast.error("Process has been canceled");
      return { status: null };
    }
  } catch (error) {
    throw error;
  }
};

export const handleUserClick = (user) => {
  Swal.fire({
    title: `${user.name}'s Details`,
    html:
      `<strong>Email:</strong> ${user.email}<br>` +
      `<strong>ID:</strong> ${user._id}<br>` +
      `<strong>Role:</strong> ${user.role}<br>` +
      `<strong>Account Active:</strong> ${user.active ? "Yes" : "No"}<br>` +
      `<strong>Email Verified:</strong> ${
        user.emailVerify ? "Yes" : "No"
      }<br>` +
      `<strong>Created At:</strong> ${new Date(
        user.createdAt
      ).toLocaleDateString()}<br>`,
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: "Close",
    confirmButtonAriaLabel: "Close this dialog",
  });
};

export const showDescription = (title, description) => {
  Swal.fire({
    title,
    text: description,
    icon: "info",
    confirmButtonText: "Close",
  });
};

// export const updateProduct = async (product) => {
//   try {
//     const result = await Swal.fire({
//       title: "Update Product Details",
//       html:
//         `<label for="swal-name">Name</label>` +
//         `<input id="swal-name" class="swal2-input" value="${product.name}">` +
//         `<label for="swal-category">Category</label>` +
//         `<input id="swal-category" class="swal2-input" value="${product.category}">` +
//         `<label for="swal-price">Price</label>` +
//         `<input id="swal-price" class="swal2-input" value="${product.price}">` +
//         `<label for="swal-discount">Discount</label>` +
//         `<input id="swal-discount" class="swal2-input" value="${product.discount}">` +
//         `<label for="swal-description">Description</label>` +
//         `<textarea id="swal-description" class="swal2-input">${product.description}</textarea>`,
//       showCancelButton: true,
//       confirmButtonText: "Update",
//       cancelButtonText: "Cancel",
//       showLoaderOnConfirm: true,
//       preConfirm: () => {
//         const newName = document.getElementById("swal-name").value;
//         const newCategory = document.getElementById("swal-category").value;
//         const newPrice = document.getElementById("swal-price").value;
//         const newDiscount = document.getElementById("swal-discount").value;
//         const newDescription =
//           document.getElementById("swal-description").value;

//         const updatedDetails = {
//           name: newName.trim() === "" ? undefined : newName.trim(),
//           category: newCategory.trim() === "" ? undefined : newCategory.trim(),
//           price: newPrice.trim() === "" ? undefined : Number(newPrice),
//           discount: newDiscount.trim() === "" ? undefined : Number(newDiscount),
//           description:
//             newDescription.trim() === "" ? undefined : newDescription.trim(),
//         };
//         // For now, we'll just return a Promise.resolve() to simulate a successful update
//         return updatedDetails;
//       },
//     });
//     if (result.isConfirmed) {
//       const { data, error } = await fetchApi("/product/" + product._id, {
//         method: "PUT",
//         body: JSON.stringify(result.value),
//       });
//       if (error) throw error
//       Swal.fire(
//         "Updated!",
//         "Product details have been updated successfully.",
//         "success"
//       );
//     }
//   } catch (error) {
//     throw error
//   }
// };

export const updateProduct = async (product) => {
  try {
    const action = await Swal.fire({
      title: "What would you like to update?",
      showCancelButton: true,
      confirmButtonText: "Update Details",
      cancelButtonText: "Update Images",
      focusConfirm: false,
      buttonsStyling: true,
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-info",
      },
    });

    if (action.isConfirmed) {
      const result = await Swal.fire({
        title: "Update Product Details",
        html:
          `<label for="swal-name">Name</label>` +
          `<input id="swal-name" class="swal2-input" value="${product.name}">` +
          `<label for="swal-category">Category</label>` +
          `<input id="swal-category" class="swal2-input" value="${product.category}">` +
          `<label for="swal-price">Price</label>` +
          `<input id="swal-price" class="swal2-input" value="${product.price}">` +
          `<label for="swal-discount">Discount</label>` +
          `<input id="swal-discount" class="swal2-input" value="${product.discount}">` +
          `<label for="swal-description">Description</label>` +
          `<textarea id="swal-description" class="swal2-input">${product.description}</textarea>`,
        showCancelButton: true,
        confirmButtonText: "Update",
        cancelButtonText: "Cancel",
        showLoaderOnConfirm: true,
        preConfirm: () => {
          const newName = document.getElementById("swal-name").value;
          const newCategory = document.getElementById("swal-category").value;
          const newPrice = document.getElementById("swal-price").value;
          const newDiscount = document.getElementById("swal-discount").value;
          const newDescription =
            document.getElementById("swal-description").value;

          const updatedDetails = {
            name: newName.trim() === "" ? undefined : newName.trim(),
            category:
              newCategory.trim() === "" ? undefined : newCategory.trim(),
            price: newPrice.trim() === "" ? undefined : Number(newPrice),
            discount:
              newDiscount.trim() === "" ? undefined : Number(newDiscount),
            description:
              newDescription.trim() === "" ? undefined : newDescription.trim(),
          };
          return updatedDetails;
        },
      });

      if (result.isConfirmed) {
        const { data, error } = await fetchApi("/product/" + product._id, {
          method: "PUT",
          body: JSON.stringify(result.value),
        });
        if (error) throw error;
        Swal.fire(
          "Updated!",
          "Product details have been updated successfully.",
          "success"
        );
      }
    } else if (action.dismiss === Swal.DismissReason.cancel) {
      window.open(`/product/${product._id}/update-image`, "_blank"); // Open image update page in a new tab
    }
  } catch (error) {
    throw error;
  }
};
