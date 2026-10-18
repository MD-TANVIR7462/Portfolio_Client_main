import React from "react";

export const PaginationLoader = () => {
  return (
    <div className="w-full h-1 bg-indigo-100 overflow-hidden relative">
      <div className="h-full bg-indigo-600 animate-pulse w-1/3 absolute left-0" />
    </div>
  );
};

export default PaginationLoader;
