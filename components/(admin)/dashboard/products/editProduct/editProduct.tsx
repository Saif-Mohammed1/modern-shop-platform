"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import EditProductDetails from "./editProductDetails";
import EditProductPrice from "./editProductPrice";
import EditProductInventory from "./editProductInventory";
import EditProductImages from "./editProductImages";
import EditProductSubmit from "./editProductSubmit";
import api from "@/components/util/api";
import toast from "react-hot-toast";
import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { FaTimesCircle } from "react-icons/fa";
import { lang } from "@/components/util/lang";
import { ProductType, Event } from "@/app/types/products.types";
// import dynamic from "next/dynamic";
// const EditProductDetails = dynamic(() => import("./editProductDetails"));
// const EditProductPrice = dynamic(() => import("./editProductPrice"));
// const EditProductInventory = dynamic(() => import("./editProductInventory"));
// const EditProductImages = dynamic(() => import("./editProductImages"));
// const EditProductSubmit = dynamic(() => import("./editProductSubmit"));

type EditProductProps = {
  product: ProductType;
};

const EditProduct = ({ product }: EditProductProps) => {
  const {
    name,
    category,
    description,
    price,
    discount,
    discountExpire,
    stock,
  } = product;

  const [currentStep, setCurrentStep] = useState(1); // For navigation between sections

  const [productData, setProductData] = useState<Partial<ProductType>>({
    name,
    category,
    description,
    price,
    discount,
    discountExpire,
    stock,
  });
  const router = useRouter();

  const [oldImages, setOldImages] = useState(product.images || []);
  const [newImages, setNewImages] = useState<string[]>([]); // Ensure this is typed as string[]
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);
  type ProductKeys = keyof ProductType;

  // const onInputChange = (e: Event) => {
  //   setProductData({ ...productData, [e.target.name]: e.target.value });
  // };
  const onInputChange = (e: Event) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name as ProductKeys]: value }));
  };
  const onTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  // Handler for form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Send updated data to backend
    let toastLoading;
    type UpdateData = {
      name?: string;
      category?: string;
      description?: string;
      price?: number;
      discount?: number;
      discountExpire?: string;
      stock?: number;
      images?: string[];
      _id?: string;
    };
    let updatedData: UpdateData = {};
    // let updatedData: Partial<ProductType> = {}; // Use Partial to allow optional updates
    for (let key in productData) {
      const value = productData[key as ProductKeys];

      // Ensure the value is not undefined before assigning it to updatedData
      if (value !== undefined && value !== product[key as ProductKeys]) {
        updatedData[key as keyof UpdateData] = value as any;
      }
    }
    // for (let key in productData) {
    //   if (productData[key as ProductKeys] !== product[key as ProductKeys]) {
    //     updatedData[key as ProductKeys] = productData[key as ProductKeys];
    //   }
    // }
    if (newImages.length > 0) {
      updatedData.images = newImages; // newImages.map((img) => ({
      //   public_id: "",
      //   link: img,
      // })); // Create a structure similar to OldImage
    }
    if (Object.keys(updatedData).length === 0) {
      return toast.error(productsTranslate.products[lang].error.noChanges);
    }
    try {
      toastLoading = toast.loading(
        productsTranslate.products[lang].editProduct.form.productSubmit.loading
      );
      await api.put(`/admin/dashboard/products/${product._id}`, updatedData);
      toast.success(
        productsTranslate.products[lang].editProduct.form.productSubmit.success
      );
      router.push("/dashboard/products?name=" + productData.name);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message || productsTranslate.products[lang].error.general
        );
      } else {
        toast.error(productsTranslate.products[lang].error.general);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const removeOldImages = async (public_id: string) => {
    // let confirm = window.confirm("Are you sure you want to delete this image?");
    let toastLoading;
    try {
      toastLoading = toast.loading(
        productsTranslate.products[lang].editProduct.removeImage.loading
      );

      await api.post(
        "/admin/dashboard/products/" + product._id + "/removeImage",
        { public_id }
      );
      setOldImages(oldImages.filter((img) => img.public_id !== public_id));
      toast.success(
        productsTranslate.products[lang].editProduct.removeImage.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message || productsTranslate.products[lang].error.general
        );
      } else {
        toast.error(productsTranslate.products[lang].error.general);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  switch (currentStep) {
    case 1:
      return (
        <EditProductDetails
          productData={productData}
          onChange={onInputChange}
          onTextAreaChange={onTextAreaChange}
          handleNext={nextStep}
        />
      );
    case 2:
      return (
        <EditProductPrice
          productData={productData}
          onChange={onInputChange}
          handleNext={nextStep}
          prevStep={prevStep}
        />
      );
    case 3:
      return (
        <EditProductInventory
          handleNext={nextStep}
          prevStep={prevStep}
          productData={productData}
          onChange={onInputChange}
        />
      );
    case 4:
      return (
        <EditProductImages
          oldImages={oldImages}
          newImages={newImages}
          setNewImages={setNewImages}
          removeOldImages={removeOldImages}
          handleNext={nextStep}
          prevStep={prevStep}
        />
      );
    case 5:
      return (
        <EditProductSubmit
          productData={productData}
          prevStep={prevStep}
          onSubmit={handleSubmit}
        />
      );
    default:
      return (
        <div className="m-auto text-red-500">
          <FaTimesCircle className="text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {productsTranslate.products[lang].error.unknownStep}
          </h2>
          <p className="text-gray-600 mb-6">
            {productsTranslate.products[lang].error.message}
          </p>
        </div>
      );
  }
};

export default EditProduct;
