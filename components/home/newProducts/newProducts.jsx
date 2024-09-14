"use client";
const NewProducts = ({ products }) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        New Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <img
              className="w-full h-56 object-cover object-center"
              src={product.images}
              alt={product.title}
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {product.title}
              </h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">
                  ${product.price}
                </span>
                <button className="px-3 py-1 bg-gray-800 text-white text-xs font-bold uppercase rounded">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewProducts;
