
import React from "react";

interface DashboardTitleProps {
  title: string;
  subtitle?: string;
}

export function DashboardTitle({ title, subtitle }: DashboardTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-black mb-1">{title}</h1>
      {subtitle && <p className="text-[#5d6d7c]">{subtitle}</p>}
    </div>
  );
}
