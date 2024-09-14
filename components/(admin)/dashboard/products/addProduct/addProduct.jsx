"use client";
import { useState } from "react";
import ProductDetails from "./productDetails";
import ProductPricing from "./productPrice";
import ProductInventory from "./productInventory";
import ProductImages from "./productImages";
import ProductSubmit from "./productSubmit";
export default function AddProduct() {
  const [step, setStep] = useState(Number(localStorage.getItem("step")) || 1);
  const [productDetails, setProductDetails] = useState({});
  const [pricingDetails, setPricingDetails] = useState({});
  const [inventoryDetails, setInventoryDetails] = useState({});
  const [imageDetails, setImageDetails] = useState({});

  const nextStep = () => {
    localStorage.setItem("step", step + 1);
    return setStep(step + 1);
  };
  const prevStep = () => {
    localStorage.setItem("step", step - 1);
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
      return <div>Unknown Step</div>;
  }
}
