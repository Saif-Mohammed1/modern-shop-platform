"use client";
import { useState } from "react";
import ProductDetails from "./productDetails";
import ProductPricing from "./productPrice";
import ProductInventory from "./productInventory";
import ProductImages from "./productImages";
import ProductSubmit from "./productSubmit";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { FaTimesCircle } from "react-icons/fa";
// import dynamic from "next/dynamic";
// const ProductDetails = dynamic(() => import("./productDetails"));
// const ProductPricing = dynamic(() => import("./productPrice"));
// const ProductInventory = dynamic(() => import("./productInventory"));
// const ProductImages = dynamic(() => import("./productImages"));
// const ProductSubmit = dynamic(() => import("./productSubmit"));

export default function AddProduct() {
  const [step, setStep] = useState<number>(
    Number(localStorage.getItem("step")) || 1
  );
  const [productDetails, setProductDetails] = useState({
    name: "",
    category: "",
    description: "",
  });
  const [pricingDetails, setPricingDetails] = useState({
    price: 0,
    discount: 0,
    discountExpire: "",
  });
  const [inventoryDetails, setInventoryDetails] = useState({
    stock: 0,
  });
  const [imageDetails, setImageDetails] = useState<{ images: string[] }>({
    images: [],
  });

  const nextStep = () => {
    const newStep = step + 1;

    localStorage.setItem("step", newStep.toString());
    return setStep(step + 1);
  };
  const prevStep = () => {
    const newStep = step - 1;

    localStorage.setItem("step", newStep.toString());
    return setStep(step - 1);
  };

  switch (step) {
    case 1:
      return (
        <ProductDetails
          nextStep={nextStep}
          setProductDetails={setProductDetails}
        />
      );
    case 2:
      return (
        <ProductPricing
          nextStep={nextStep}
          prevStep={prevStep}
          setPricingDetails={setPricingDetails}
        />
      );
    case 3:
      return (
        <ProductInventory
          nextStep={nextStep}
          prevStep={prevStep}
          setInventoryDetails={setInventoryDetails}
        />
      );
    case 4:
      return (
        <ProductImages
          nextStep={nextStep}
          prevStep={prevStep}
          setImageDetails={setImageDetails}
        />
      );
    case 5:
      return (
        <ProductSubmit
          prevStep={prevStep}
          productDetails={productDetails}
          pricingDetails={pricingDetails}
          inventoryDetails={inventoryDetails}
          imageDetails={imageDetails}
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
}
