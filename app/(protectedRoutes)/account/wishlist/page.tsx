import { accountWishlistTranslate } from "@/app/_translate/(protectedRoute)/account/wishlistTranslate";
import WishlistPage from "@/components/shop/wishList/wishlist";
import { lang } from "@/components/util/lang";
export const metadata = {
  title: accountWishlistTranslate[lang].metadata.title,
  description: accountWishlistTranslate[lang].metadata.description,
  keywords: accountWishlistTranslate[lang].metadata.keywords,
};
const page = () => {
  return <WishlistPage />;
};

export default page;
