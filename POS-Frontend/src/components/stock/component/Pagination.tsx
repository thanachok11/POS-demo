import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (v: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, setCurrentPage }) => {
    return (
        <div className="pagination">
            <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
                ◀ ก่อนหน้า
            </button>
            <span>หน้า {currentPage} จาก {totalPages}</span>
            <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>
                ถัดไป ▶
            </button>
        </div>
    );
};

export default Pagination;
