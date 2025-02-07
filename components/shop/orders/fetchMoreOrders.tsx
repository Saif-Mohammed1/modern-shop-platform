"use client";
import { reviewsTranslate } from "@/app/_translate/reviewsTranslate";
import { lang } from "@/components/util/lang";
import { useQueryState, parseAsInteger } from "nuqs";
import { useState } from "react";
type CustomButtonProps = {
  showMore: boolean;
  //   getMoreResults: () => void;
  //   loading: boolean;
};
const FetchMoreOrders = ({ showMore }: CustomButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  const getMoreResults = () => {
    setLoading(true);
    const nextPage = page + 1;
    // updateQueryParams(
    //   { page: nextPage },
    //   searchParamsReadOnly,
    //   router,
    //   pathName
    // );

    setPage(nextPage);
    // new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };
  return showMore ? (
    <div className="flex justify-center my-2">
      <button
        onClick={getMoreResults}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700"
      >
        {loading
          ? reviewsTranslate[lang].ReviewSection.content.loading
          : reviewsTranslate[lang].ReviewSection.content.showMore}
      </button>
    </div>
  ) : null;
};

export default FetchMoreOrders;
