import { useDropzone } from "react-dropzone";
import { HiTrash } from "react-icons/hi"; // Import trash icon from Heroicons (optional)
import Image from "next/image";
import ButtonSteps from "../addProduct/ButtonSteps";
import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { lang } from "@/components/util/lang";

// Component for editing product images
type EditProductImagesProps = {
  oldImages?: { public_id: string; link: string }[];
  newImages: string[];
  setNewImages: React.Dispatch<React.SetStateAction<string[]>>;
  removeOldImages: (public_id: string) => void;
  prevStep: () => void;
  handleNext: () => void;
};
const EditProductImages = ({
  oldImages = [],
  newImages,
  setNewImages,
  removeOldImages,
  prevStep,
  handleNext,
}: EditProductImagesProps) => {
  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setNewImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Function to remove a new image by its index
  const removeNewImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {productsTranslate.products[lang].editProduct.form.productImages.title}
      </h2>

      {/* Section for uploading new images */}
      <div
        {...getRootProps()}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-center"
      >
        <input {...getInputProps()} />
        <p>
          {
            productsTranslate.products[lang].editProduct.form.productImages
              .description
          }
        </p>
      </div>

      {/* Display new images */}
      <div className="flex flex-wrap mt-4 gap-4">
        {newImages.map((image, index) => (
          <div key={index} className="relative w-24 h-24">
            <div
              className="imgParent"
              style={{ width: "100px", height: "100px" }}
            >
              <Image
                width={100}
                height={100}
                src={image}
                alt="New Product"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            {/* Delete Button for new images */}
            <button
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-300"
              onClick={() => removeNewImage(index)}
            >
              <HiTrash className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Section for managing old images */}
      {oldImages.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-8 mb-4">
            {
              productsTranslate.products[lang].editProduct.form.productImages
                .existingImage
            }
          </h3>
          <div className="flex flex-wrap mt-4 gap-4">
            {oldImages.map((image) => (
              <div key={image.public_id} className="relative w-24 h-24">
                <div
                  className="imgParent"
                  style={{ width: "100px", height: "100px" }}
                >
                  <Image
                    width={100}
                    height={100}
                    src={image.link}
                    alt="Old Product"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                {/* Delete Button for old images */}
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-300"
                  onClick={() => removeOldImages(image.public_id)}
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Navigation buttons */}
      <ButtonSteps
        prevStep={prevStep}
        handleNext={handleNext}
        parentStyle={"mt-6"}
      />
    </div>
  );
};

export default EditProductImages;
