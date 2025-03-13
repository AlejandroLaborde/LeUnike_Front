import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardsProps {
  count: number;
}

export function SkeletonCards({ count }: SkeletonCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="aspect-square w-full">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="pt-2">
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}