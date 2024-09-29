import { FC } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - halfMaxPagesToShow);
      let endPage = Math.min(totalPages, currentPage + halfMaxPagesToShow);

      if (currentPage <= halfMaxPagesToShow) {
        endPage = maxPagesToShow;
      } else if (currentPage + halfMaxPagesToShow >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (startPage > 1) {
        pages.unshift("...");
        pages.unshift(1);
      }

      if (endPage < totalPages) {
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex mt-2 space-x-2 justify-center ">
      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => page !== "..." && onPageChange(Number(page))}
          className={`px-4 py-2 border rounded ${
            page === currentPage
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500"
          } ${page === "..." ? "cursor-default" : ""}`}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
