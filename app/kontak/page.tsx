"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
// Update the import path below if your Card components are located elsewhere, e.g.:
// If your Card components are located at "@/components/ui/card", use this import:
import { Card, CardContent } from "@/components/ui/card";
// Or create the file at "@/components/ui/card.tsx" if it doesn't exist.
import { Button } from "@/components/ui/button";
import { Mail, Phone, ArrowLeft } from "lucide-react";

export default function ContactSupportPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <Card className="w-full max-w-lg p-6 shadow-xl">
        <CardContent className="flex flex-col items-center text-center">
          {/* Logo Pertamina */}
          <div className="mb-4">
            <Image
              src="/pertamina-logo.png"
              alt="Logo Pertamina"
              width={80}
              height={80}
            />
          </div>

          <h1 className="text-xl font-semibold mb-2 text-black">
            Hubungi Dukungan
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Kami siap membantu Anda jika mengalami kendala.
          </p>

          <div className="w-full space-y-6">
            {/* Bagian Email */}
            <div className="flex items-start text-left">
              <Mail size={24} className="text-gray-600 mr-4 mt-1" />
              <div>
                <h2 className="text-base font-medium text-black">Email</h2>
                <p className="text-sm text-gray-700">
                  Hubungi kami melalui email untuk pertanyaan umum atau dukungan
                  teknis.
                </p>
                <a
                  href="mailto:support@spbu-manager.com"
                  className="text-sm text-blue-600 hover:underline"
                >
                  support@spbu-manager.com
                </a>
              </div>
            </div>

            {/* Bagian Telepon */}
            <div className="flex items-start text-left">
              <Phone size={24} className="text-gray-600 mr-4 mt-1" />
              <div>
                <h2 className="text-base font-medium text-black">Telepon</h2>
                <p className="text-sm text-gray-700">
                  Hubungi hotline kami untuk bantuan segera selama jam kerja
                  (08:00 - 17:00 WIB).
                </p>
                <p className="text-sm text-blue-600">+62 8XX-XXXX-XXXX</p>
              </div>
            </div>
          </div>

          {/* Tombol Kembali di bagian bawah */}
          <Button
            onClick={handleGoBack}
            className="mt-8 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft size={16} className="mr-2" />
            Kembali
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
