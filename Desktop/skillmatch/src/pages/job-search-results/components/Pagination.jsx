import React from 'react';
import Button from '../../../components/ui/Button';


const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalResults,
  resultsPerPage = 20,
  isLoading = false 
}) => {
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range?.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots?.push(1, '...');
    } else {
      rangeWithDots?.push(1);
    }

    rangeWithDots?.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots?.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots?.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
      <div className="text-sm text-text-secondary">
        Showing {startResult?.toLocaleString()} to {endResult?.toLocaleString()} of {totalResults?.toLocaleString()} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          iconName="ChevronLeft"
          iconSize={16}
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-1">
          {visiblePages?.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-text-secondary">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          iconName="ChevronRight"
          iconSize={16}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;