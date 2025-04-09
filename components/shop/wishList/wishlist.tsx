// pages/wishlist.js
'use client';

import {parseAsInteger, useQueryState} from 'nuqs';

import type {WishlistType} from '@/app/lib/types/wishList.types';
import {lang} from '@/app/lib/utilities/lang';
import Pagination, {type PaginationType} from '@/components/pagination/Pagination';
import {accountWishlistTranslate} from '@/public/locales/client/(auth)/account/wishlistTranslate';

import WishListCard from './wishListCard';

// pages/wishlist.js

type WishlistPageProps = {
  wishlistProduct: WishlistType[];

  pagination: PaginationType;
};
const WishlistPage = ({wishlistProduct, pagination}: WishlistPageProps) => {
  const [_currentPage, setCurrentPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({shallow: false}),
  );
  const onPaginationChange = (page: number) => {
    void setCurrentPage(page);
  };
  // const { wishlist } = useWishlist();
  // const [wishlistProduct, setWishlistProduct] = useState<WishlistType[]>([]);

  // useEffect(() => {
  //   setWishlistProduct(wishlist);
  // }, [wishlist]);
  return (
    <div className="container mx-auto mt-8 ">
      <h1 className="text-3xl font-bold mb-4 ">
        {accountWishlistTranslate[lang].wishlistPage.title}
      </h1>
      <div className="max-h-screen overflow-y-auto">
        {wishlistProduct.length === 0 ? (
          <p className="empty">{accountWishlistTranslate[lang].wishlistPage.emptyWhishlist}</p>
        ) : (
          <div className="grid col gap-4">
            {wishlistProduct.map((product) => {
              const products = product.productId;
              return <WishListCard key={product?._id} product={products} />;
            })}
          </div>
        )}
      </div>
      <Pagination meta={pagination.meta} onPageChange={onPaginationChange} />
    </div>
  );
};

export default WishlistPage;
