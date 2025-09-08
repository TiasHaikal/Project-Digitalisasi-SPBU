"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  FileText,
  DollarSign,
  ClipboardCheck,
  Wrench,
  Users,
  Settings,
  LogOut,
  Truck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Format role: ADMIN_PUSAT -> Admin Pusat
function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const spbuOptions = [
  { id: "1", code: "23.345.14" },
  { id: "2", code: "24.347.122" },
  { id: "3", code: "24.345.117" },
  { id: "4", code: "24.345.92" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [codeSpbu, setCodeSpbu] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("userName"));
      setUserRole(localStorage.getItem("userRole"));
      setCodeSpbu(localStorage.getItem("codeSpbu"));

      const stored = localStorage.getItem("sidebarOpen");
      if (stored !== null) {
        setIsOpen(stored === "true");
      }
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("sidebarOpen", String(newState));
  };

  const handleLogout = () => {
    localStorage.clear();
    // Hapus semua cookies
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Stok BBM & Tanki", path: "/admin/stok", icon: Package },
    { name: "Pengelolaan DO & Pembelanjaan", path: "/admin/do", icon: Truck },
    { name: "Laporan", path: "/admin/laporan", icon: FileText },
    { name: "Keuangan", path: "/admin/keuangan", icon: DollarSign },
    {
      name: "Laporan Checklist",
      path: "/admin/checklist",
      icon: ClipboardCheck,
    },
    { name: "Pemeliharaan", path: "/admin/pemeliharaan", icon: Wrench },
    {
      name: "Manajemen Operasional",
      path: "/admin/operasional",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Tombol toggle ☰ */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        ☰
      </Button>

      {isOpen && (
        <Card className="w-64 h-screen border-r shadow-sm rounded-none flex flex-col fixed top-0 left-0 z-40 bg-white">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 flex flex-col items-center gap-2 shrink-0">
              <Image
                src="/pertamina-logo.png"
                alt="Pertamina Logo"
                width={80}
                height={40}
                className="object-contain"
              />
              <p className="text-sm font-medium text-center">
                PT. Adi Sejahtera
              </p>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto px-4 mt-4">
              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => {
                        setIsOpen(false);
                        localStorage.setItem("sidebarOpen", "false");
                      }}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start gap-2 ${
                          pathname === item.path ? "bg-gray-300" : ""
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}

                {/* Dropdown khusus Admin Pusat */}
                {userRole === "ADMIN_PUSAT" && (
                  <div className="mt-2">
                    <Select
                      onValueChange={(val) => {
                        router.push(`/admin/users/${val}`);
                        setIsOpen(false);
                        localStorage.setItem("sidebarOpen", "false");
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <Users size={18} className="mr-2" />
                        <SelectValue placeholder="Manajemen Pengguna" />
                      </SelectTrigger>
                      <SelectContent>
                        {spbuOptions.map((spbu) => (
                          <SelectItem key={spbu.id} value={spbu.code}>
                            {spbu.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </nav>
            </div>

            {/* Footer */}
            {userName && userRole && (
              <div className="p-4 border-t flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {formatRole(userRole)}
                  </span>
                  {userRole !== "ADMIN_PUSAT" && codeSpbu && (
                    <span className="text-xs font-medium text-gray-700">
                      {codeSpbu}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{userName}</span>
                </div>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOut size={18} />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
