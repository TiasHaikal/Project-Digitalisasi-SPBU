"use client";

import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie"; // ⬅️ import js-cookie

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      console.log("Login response:", res.data);

      const token =
        res.data.token || res.data.access_token || res.data.data?.token;
      const userId =
        res.data.user?.id ||
        res.data.data?.user?.id ||
        res.data.userId ||
        res.data.id;
      const userName =
        res.data.user?.name ||
        res.data.data?.user?.name ||
        res.data.userName ||
        res.data.name;
      const userRole =
        res.data.user?.role ||
        res.data.data?.user?.role ||
        res.data.userRole ||
        res.data.role;
      const codeSpbu =
        res.data.user?.spbu?.code_spbu ||
        res.data.data?.user?.spbu?.code_spbu ||
        res.data.spbu?.code_spbu;

      if (!token) {
        alert("Login berhasil, tapi token tidak ditemukan di response API!");
        return;
      }

      // ✅ Simpan token di cookies (biar bisa dicegat middleware)
      Cookies.set("token", token, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });

      // Simpan data lain di localStorage
      if (userId) localStorage.setItem("userId", userId);
      if (userName) localStorage.setItem("userName", userName);
      if (userRole) localStorage.setItem("userRole", userRole);
      if (codeSpbu) localStorage.setItem("codeSpbu", codeSpbu);

      const normalizedRole = (userRole || "").toUpperCase();

      const roleRoutes: Record<string, string> = {
        ADMIN_PUSAT: "/admin/dashboard",
        SUPERVISOR: "/supervisor/dashboard",
        OPERATOR: "/operator/dashboard",
        OB: "/ob/dashboard",
        SATPAM: "/satpam/dashboard",
      };

      const targetRoute = roleRoutes[normalizedRole];
      if (targetRoute) {
        router.push(targetRoute);
      } else {
        alert("Role tidak dikenali, silakan hubungi admin!");
        router.push("/login");
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Login gagal!");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px] shadow-xl">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <div className="mb-4">
            <div className="flex justify-center mb-4">
              <img
                src="/pertamina-logo.png"
                alt="Logo Pertamina"
                className="h-20"
              />
            </div>
          </div>

          <div className="w-full">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <Input
              id="email"
              placeholder="email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full mt-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            Login
          </Button>

          <div className="text-sm mt-2 text-black">
            Butuh bantuan?{" "}
            <a href="./kontak" className="text-blue-600 hover:underline">
              Hubungi Dukungan
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
