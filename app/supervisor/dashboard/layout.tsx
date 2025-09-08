// app/dashboard/layout.tsx
"use client";
import SidebarSupervisor from "@/components/sidebarSupervisor";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SidebarSupervisor />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
