// components/ProductTicket.js

"use client";
import AdminTable from "./AdminTable";
import AdminActions from "./AdminActions";
import { useCartItems } from "@/components/context/cart.context";

const ProductTicket = (
  {
    // products
  }
) => {
  const { cartItems } = useCartItems();
  const columns = ["Name", "Category", "Price", "Stock"];
  const handleEdit = (product) => {
    // Handle product edit logic
    console.log("Edit product", product);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      toast.success("Product deleted successfully!");
      //   setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  };
  const actions = (product) => (
    <AdminActions
      onEdit={() => handleEdit(product)}
      onDelete={() => handleDelete(product._id)}
    />
  );

  return <AdminTable columns={columns} data={cartItems} actions={actions} />;
};

export default ProductTicket;
