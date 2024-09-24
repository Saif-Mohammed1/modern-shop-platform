import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { HiTrash } from "react-icons/hi"; // Import trash icon from Heroicons (optional)
import ButtonSteps from "./ButtonSteps";
import Image from "next/image";
import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { lang } from "@/components/util/lang";
type ProductImagesProps = {
  nextStep: () => void;
  prevStep: () => void;
  setImageDetails: (details: { images: string[] }) => void;
};
export default function ProductImages({
  nextStep,
  prevStep,
  setImageDetails,
}: ProductImagesProps) {
  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    const storedImages = localStorage.getItem("images");
    const localImages = storedImages ? JSON.parse(storedImages) : [];
    setImages(localImages);
  }, []);
  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Ensure that only strings are pushed to the state
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Function to remove an image by its index
  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    localStorage.setItem("images", JSON.stringify(updatedImages)); // Update localStorage after deletion
  };

  const handleNext = () => {
    setImageDetails({ images });
    nextStep();
    localStorage.setItem("images", JSON.stringify(images));
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {productsTranslate.products[lang].addProduct.form.productImages.title}
      </h2>
      <div
        {...getRootProps()}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-center"
      >
        <input {...getInputProps()} />
        <p>
          {
            productsTranslate.products[lang].addProduct.form.productImages
              .description
          }
        </p>
      </div>

      <div className="flex flex-wrap mt-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative w-24 h-24">
            <Image
              width={100}
              height={100}
              src={image}
              alt="Product"
              className="w-full h-full object-cover rounded-md"
            />
            {/* Delete Button */}
            <button
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-300"
              onClick={() => removeImage(index)}
            >
              <HiTrash className="w-5 h-5" /> {/* Trash Icon */}
            </button>
          </div>
        ))}
      </div>

      <ButtonSteps
        prevStep={prevStep}
        handleNext={handleNext}
        parentStyle={"mt-6"}
      />
    </div>
  );
}
