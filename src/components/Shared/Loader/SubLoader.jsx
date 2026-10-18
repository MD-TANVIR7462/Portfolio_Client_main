import React from "react";
import { Skeleton } from "@/components/common/Skeleton";

export const SubLoader = ({ rows = 8, columns = 5 }) => {
  return (
    <div className="w-full h-full p-4 flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 w-full">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton key={cIdx} className="h-7 flex-1 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SubLoader;
