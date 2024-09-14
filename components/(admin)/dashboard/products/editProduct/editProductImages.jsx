import { useDropzone } from "react-dropzone";
import { HiTrash } from "react-icons/hi"; // Import trash icon from Heroicons (optional)
import Image from "next/image";
import ButtonSteps from "../addProduct/ButtonSteps";

// const EditProductImages = ({ oldImages, newImages, setNewImages }) => {
//   // / **
//   //  * images: [{
//   //  *  link: 'https://res.cloudinary.com/dv0qpha02/image/upload/v1725776922/shop/products/njzfaobweakcfzdi0bl8.jpg',
//   //  * public_id: 'shop/products/njzfaobweakcfzdi0bl8'
//   //  * }]
//   //  */
//   const onDrop = (acceptedFiles) => {
//     acceptedFiles.forEach((file) => {
//       const reader = new FileReader();
//       reader.onload = () => setNewImages((prev) => [...prev, reader.result]);
//       reader.readAsDataURL(file);
//     });
//   };

//   const { getRootProps, getInputProps } = useDropzone({ onDrop });

//   // Function to remove an image by its index
//   const removeImage = (index) => {
//     const updatedImages = images.filter((_, i) => i !== index);
//     setNewImages(updatedImages);
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

//       <div className="flex flex-wrap mt-4 gap-4">
//         {newImages.map((image, index) => (
//           <div key={index} className="relative w-24 h-24">
//             <Image
//               width={100}
//               height={100}
//               src={image}
//               alt="Product"
//               className="w-full h-full object-cover rounded-md"
//             />
//             {/* Delete Button */}
//             <button
//               className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-300"
//               onClick={() => removeImage(index)}
//             >
//               <HiTrash className="w-5 h-5" /> {/* Trash Icon */}
//             </button>
//           </div>
//         ))}
//       </div>

//       <ButtonSteps
//         prevStep={prevStep}
//         handleNext={handleNext}
//         parentStyle={"mt-6"}
//       />
//     </div>
//   );
// };

const EditProductImages = ({
  oldImages = [],
  newImages,
  setNewImages,
  removeOldImages,
  prevStep,
  handleNext,
}) => {
  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setNewImages((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Function to remove a new image by its index
  const removeNewImage = (index) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Upload Images</h2>

      {/* Section for uploading new images */}
      <div
        {...getRootProps()}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-center"
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
      </div>

      {/* Display new images */}
      <div className="flex flex-wrap mt-4 gap-4">
        {newImages.map((image, index) => (
          <div key={index} className="relative w-24 h-24">
            <Image
              width={100}
              height={100}
              src={image}
              alt="New Product"
              className="w-full h-full object-cover rounded-md"
            />
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
          <h3 className="text-xl font-semibold mt-8 mb-4">Existing Images</h3>
          <div className="flex flex-wrap mt-4 gap-4">
            {oldImages.map((image, index) => (
              <div key={image.public_id} className="relative w-24 h-24">
                <Image
                  width={100}
                  height={100}
                  src={image.link}
                  alt="Old Product"
                  className="w-full h-full object-cover rounded-md"
                />
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
