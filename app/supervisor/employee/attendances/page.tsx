"use client";

import { useEffect, useState } from "react";
import API, { getPhotoUrl } from "@/lib/api"; // ⬅️ import getPhotoUrl
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

interface Attendance {
  id: number;
  user: {
    name: string;
    role: string;
  };
  spbu: {
    code_spbu: string;
  };
  photo?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export default function RekapPage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employee/attendances");
      setRecords(res.data.data || res.data || []);
    } catch (err: any) {
      console.error(
        "fetch attendances error:",
        err.response?.data || err.message
      );
      Swal.fire("Error", "Gagal memuat data absensi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, []);
  // Fungsi untuk mengubah gambar menjadi Base64
  const toBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Gagal mengubah gambar ke Base64:", error);
      return null;
    }
  };

  // --- FUNGSI EKSPOR PDF DENGAN PERBAIKAN FINAL ---
  const handleExportPDF = async () => {
    if (records.length === 0) {
      Swal.fire("Info", "Tidak ada data untuk diekspor!", "info");
      return;
    }

    Swal.fire({
      title: "Mempersiapkan PDF...",
      text: "Mohon tunggu, sedang memproses gambar.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const doc = new jsPDF({ orientation: "landscape" });
    const spbu = records[0]?.spbu?.code_spbu || "N/A";

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Rekap Absensi", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`SPBU: ${spbu}`, 14, 25);
    doc.text(
      `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`,
      doc.internal.pageSize.getWidth() - 14,
      25,
      { align: "right" }
    );

    const head = [["Nama", "Role", "Waktu Absen", "Lokasi", "Foto"]];

    // 1. Siapkan semua data gambar terlebih dahulu
    const bodyData = await Promise.all(
      records.map(async (item) => ({
        name: item.user?.name || "-",
        role: item.user?.role || "-",
        time: new Date(item.createdAt).toLocaleString("id-ID"),
        location:
          item.latitude && item.longitude
            ? `${item.latitude}, ${item.longitude}`
            : "No Location",
        photo: item.photo ? await toBase64(getPhotoUrl(item.photo)) : null,
      }))
    );

    // 2. Buat body untuk ditampilkan (tanpa data gambar Base64 yang panjang)
    const bodyForDisplay = bodyData.map((item) => [
      item.name,
      item.role,
      item.time,
      item.location,
      "",
    ]);

    autoTable(doc, {
      head: head,
      body: bodyForDisplay,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 9, valign: "middle" },
      headStyles: {
        fontStyle: "bold",
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Nama
        1: { cellWidth: 30 }, // Role
        2: { cellWidth: 40 }, // Waktu
        3: { cellWidth: 40 }, // Lokasi
        4: { cellWidth: 30, minCellHeight: 25 }, // Foto
      },
      // 3. Gambar setiap image yang sudah disiapkan ke dalam sel
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          const itemWithPhoto = bodyData[data.row.index];
          if (itemWithPhoto && itemWithPhoto.photo) {
            try {
              const imgProps = doc.getImageProperties(itemWithPhoto.photo);
              const imgWidth = 20;
              const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
              const x = data.cell.x + (data.cell.width - imgWidth) / 2;
              const y = data.cell.y + (data.cell.height - imgHeight) / 2;
              // Hapus format 'JPEG' agar jsPDF mendeteksi otomatis
              doc.addImage(itemWithPhoto.photo, x, y, imgWidth, imgHeight);
            } catch (e) {
              console.error(
                `Gagal menambahkan gambar untuk baris ${data.row.index}:`,
                e
              );
              // Jika ada error, tulis teks fallback
              doc.text(
                "Gagal Muat",
                data.cell.x + data.cell.width / 2,
                data.cell.y + data.cell.height / 2,
                { align: "center" }
              );
            }
          }
        }
      },
    });

    Swal.close();
    doc.save(`Rekap_Absensi_${spbu}.pdf`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            📊 Rekap Absensi
          </h1>
          <Button variant="outline" onClick={handleExportPDF}>
            Export ke PDF
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">SPBU</th>
                <th className="px-4 py-3 text-center">Foto</th>
                <th className="px-4 py-3 text-center">Waktu</th>
                <th className="px-4 py-3 text-center">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data absensi.
                  </td>
                </tr>
              ) : (
                records.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-100 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{item.user?.name}</td>
                    <td className="px-4 py-3">{item.user?.role}</td>
                    <td className="px-4 py-3">{item.spbu?.code_spbu}</td>
                    <td className="px-4 py-3 text-center">
                      {item.photo ? (
                        <img
                          src={getPhotoUrl(item.photo)}
                          alt="Foto"
                          className="w-14 h-14 object-cover rounded-full border mx-auto shadow-sm cursor-pointer"
                          onClick={() =>
                            Swal.fire({
                              title: "Detail Foto",
                              imageUrl: getPhotoUrl(item.photo),
                              imageAlt: "Foto Absensi",
                              showCloseButton: true,
                              showConfirmButton: false,
                              width: "auto",
                            })
                          }
                        />
                      ) : (
                        <span className="text-gray-100 italic">No Photo</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {new Date(item.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.latitude && item.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800 transition"
                        >
                          📍 Lihat Lokasi
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">
                          No Location
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
