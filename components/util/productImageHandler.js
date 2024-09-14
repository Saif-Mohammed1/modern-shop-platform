const imageSrc = (item) =>
  item && Array.isArray(item?.images) && item.images.length > 0
    ? item.images[0].link
    : "/products/product.png";
export default imageSrc;
