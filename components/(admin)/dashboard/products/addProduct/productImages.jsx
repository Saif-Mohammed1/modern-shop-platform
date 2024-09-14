// import { useDropzone } from "react-dropzone";
// import { useState } from "react";

// export default function ProductImages({ nextStep, prevStep, setImageDetails }) {
//   const [images, setImages] = useState(
//     localStorage.getItem("images")
//       ? JSON.parse(localStorage.getItem("images"))
//       : []
//   );

//   const onDrop = (acceptedFiles) => {
//     acceptedFiles.forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = () => setImages((prev) => [...prev, reader.result]);
//       reader.readAsDataURL(file);
//     });
//   };

//   const { getRootProps, getInputProps } = useDropzone({ onDrop });

//   const handleNext = () => {
//     setImageDetails({ images });
//     nextStep();
//     localStorage.setItem("images", JSON.stringify(images));
//   };

//   return (
//     <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-semibold mb-4">Upload Images</h2>
//       <div
//         {...getRootProps()}
//         className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-center"
//       >
//         <input {...getInputProps()} />
//         <p>Drag & drop files here, or click to select files</p>
//       </div>

//       <div className="flex flex-wrap mt-4 space-x-2 gap-1">
//         {images.map((image, index) => (
//           <img
//             key={index}
//             src={image}
//             alt="Product"
//             className="w-24 h-24 object-cover rounded-md"
//           />
//         ))}
//       </div>

//       <div className="flex justify-between mt-6">
//         <button
//           onClick={prevStep}
//           className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg mr-2 hover:bg-gray-300 transition duration-300"
//         >
//           Previous
//         </button>
//         <button
//           onClick={handleNext}
//           className="w-1/2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { HiTrash } from "react-icons/hi"; // Import trash icon from Heroicons (optional)
import ButtonSteps from "./ButtonSteps";
import Image from "next/image";

export default function ProductImages({ nextStep, prevStep, setImageDetails }) {
  const [images, setImages] = useState(
    localStorage.getItem("images")
      ? JSON.parse(localStorage.getItem("images"))
      : []
  );

  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Function to remove an image by its index
  const removeImage = (index) => {
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
      <h2 className="text-2xl font-semibold mb-4">Upload Images</h2>
      <div
        {...getRootProps()}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-center"
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
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
