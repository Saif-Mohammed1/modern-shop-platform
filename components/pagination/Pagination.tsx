import type {FC} from 'react';

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Links = {
  first: string;
  prev: string;
};
export type PaginationType = {
  meta: Meta;
  links: Links;
};
type PaginationProps = {
  meta: Meta;
  onPageChange: (page: number) => void;
};

const Pagination: FC<PaginationProps> = ({meta, onPageChange}) => {
  const {page: currentPage, totalPages, hasNext, hasPrev} = meta;

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    const sidePages = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - sidePages);
      const endPage = Math.min(totalPages, currentPage + sidePages);

      if (currentPage - sidePages < 1) {
        startPage = 1;
      }

      for (let i = startPage; i <= endPage; i++) pages.push(i);

      if (startPage > 1) {
        pages.unshift('...');
        pages.unshift(1);
      }

      if (endPage < totalPages) {
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePrevious = () => onPageChange(currentPage - 1);
  const handleNext = () => onPageChange(currentPage + 1);

  return (
    <nav className="flex items-center justify-between gap-4 p-4" aria-label="Pagination">
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handlePrevious}
          disabled={!hasPrev}
          aria-label="Previous page"
          className={`px-4 py-2 rounded-md ${
            hasPrev
              ? 'bg-white text-blue-600 hover:bg-blue-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          Previous
        </button>

        <div className="hidden sm:flex gap-2">
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 min-w-[40px] rounded-md ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                } transition-colors`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-400">
                {page}
              </span>
            ),
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={!hasNext}
          aria-label="Next page"
          className={`px-4 py-2 rounded-md ${
            hasNext
              ? 'bg-white text-blue-600 hover:bg-blue-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
