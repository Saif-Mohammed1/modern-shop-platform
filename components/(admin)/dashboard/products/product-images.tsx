// product-images.tsx
import { gql, useMutation } from "@apollo/client";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { FaImage, FaTrash } from "react-icons/fa";

import type { OldImage } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";

import type { PreviewFile } from "./addProduct";

// GraphQL Mutation
const REMOVE_PRODUCT_IMAGE = gql`
  mutation RemoveProductImage($slug: String!, $public_id: String!) {
    removeProductImage(slug: $slug, public_id: $public_id) {
      message
    }
  }
`;

// GraphQL response type
interface RemoveImageResponse {
  removeProductImage: {
    message: string;
  };
}

// type OldImage = {
//   link: string;
//   public_id: string;
// };
export default function ProductImages({
  editMode = false,
}: {
  editMode?: boolean;
}) {
  const { setValue, watch } = useFormContext();
  const images: OldImage[] | PreviewFile[] = watch("images") || [];
  const slug = watch("slug");

  // GraphQL Mutation
  const [removeProductImage] = useMutation<RemoveImageResponse>(
    REMOVE_PRODUCT_IMAGE,
    {
      onCompleted: (data) => {
        if (data?.removeProductImage?.message) {
          toast.success(
            productsTranslate.products[lang].editProduct.removeImage.success
          );
        }
      },
      onError: (error) => {
        toast.error(
          error.message || productsTranslate.products[lang].error.general
        );
      },
    }
  );

  // Modified type guard
  const isOldImages = (image: OldImage | PreviewFile): image is OldImage => {
    return typeof image === "object" && "public_id" in image;
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const readFilesAsBase64 = acceptedFiles.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
        });
      });

      void Promise.all(readFilesAsBase64).then((base64Images) => {
        setValue("images", [...images, ...base64Images]);
      });
    },
  });

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    let newImages;

    if (isOldImages(imageToRemove)) {
      try {
        toast.loading(
          productsTranslate.products[lang].editProduct.removeImage.loading
        );

        // Execute GraphQL mutation
        await removeProductImage({
          variables: {
            slug: slug,
            public_id: imageToRemove.public_id,
          },
        });

        newImages = images.filter((_, i) => i !== index);
      } catch (_error: unknown) {
        // Error handling is done in onError callback
        newImages = images;
      }
    } else {
      // For new images (PreviewFile), just remove from array
      newImages = images.filter((_, i) => i !== index);
    }

    setValue("images", newImages);
  };

  return (
    <div className="space-y-6">
      {editMode ? (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          {productsTranslate.products[lang].editMode}
        </div>
      ) : null}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input {...getInputProps()} />
        <FaImage className="mx-auto text-3xl text-gray-400 mb-2" />
        <p className="text-gray-600">
          {
            productsTranslate.products[lang].addProduct.form.productImages
              .description
          }
        </p>
        <p className="text-sm text-gray-400 mt-1">
          ({productsTranslate.products[lang].addProduct.form.productImages.max})
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((file, index) => (
          <div key={index} className="relative group">
            <Image
              src={isOldImages(file) ? file.link : file}
              alt={`Preview ${index + 1}`}
              width={200}
              height={200}
              className="rounded-lg object-cover aspect-square"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash className="w-4 h-4" />
            </button>
            {isOldImages(file) && (
              <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {
                  productsTranslate.products[lang].addProduct.form.productImages
                    .existingImage
                }
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
