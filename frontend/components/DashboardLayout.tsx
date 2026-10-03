"use client";

import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

type ActiveMenu =
  | "home"
  | "suggestion"
  | "analysis"
  | "submissions"
  | "categories";

type DashboardLayoutProps = {
  children: ReactNode;
  role: "student" | "teacher";
  active: ActiveMenu;
};

export default function DashboardLayout({
  children,
  role,
  active,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eef5fb]">
      {/* Header */}
      <Header role={role} />

      {/* Main area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          role={role}
          active={active}
        />

        {/* Content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1450px] px-4 py-5 md:px-6 md:py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}