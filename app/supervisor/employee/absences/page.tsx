"use client";

import { useEffect, useState } from "react";
import API, { getPhotoUrl } from "@/lib/api";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

interface Absence {
  id: number;
  user: {
    name: string;
    role: string;
  };
  spbu: {
    code_spbu: string;
  };
  jenisPengajuan: string;
  tanggalAwal: string;
  tanggalAkhir: string;
  alasan: string;
  lampiran?: string;
  createdAt: string;
}

export default function AbsencePage() {
  const [records, setRecords] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employee/absences");
      setRecords(res.data.data || []);
    } catch (err: any) {
      console.error("fetch absences error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal memuat data izin/absensi!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, []);
  // Fungsi untuk mengubah gambar menjadi Base64 ---
  const toBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Gagal mengubah gambar ke Base64 dari URL: ${url}`, error);
      return null;
    }
  };
  // Fungsi Ekspor PDF ---
  const handleExportPDF = async () => {
    if (records.length === 0) {
      Swal.fire("Info", "Tidak ada data untuk diekspor!", "info");
      return;
    }

    Swal.fire({
      title: "Mempersiapkan PDF...",
      text: "Mohon tunggu, sedang memproses lampiran.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const doc = new jsPDF({ orientation: "landscape" });
    const spbu = records[0]?.spbu?.code_spbu || "N/A";

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Rekap Izin / Absensi", doc.internal.pageSize.getWidth() / 2, 15, {
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

    const head = [
      ["Nama", "Role", "Jenis", "Tanggal Izin", "Alasan", "Lampiran"],
    ];

    const bodyData = await Promise.all(
      records.map(async (item) => ({
        name: item.user?.name || "-",
        role: item.user?.role || "-",
        jenis: item.jenisPengajuan,
        tanggal: `${new Date(item.tanggalAwal).toLocaleDateString(
          "id-ID"
        )} s/d ${new Date(item.tanggalAkhir).toLocaleDateString("id-ID")}`,
        alasan: item.alasan,
        lampiran: item.lampiran
          ? await toBase64(getPhotoUrl(item.lampiran))
          : null,
      }))
    );

    const bodyForDisplay = bodyData.map((item) => [
      item.name,
      item.role,
      item.jenis,
      item.tanggal,
      item.alasan,
      "",
    ]);

    autoTable(doc, {
      head: head,
      body: bodyForDisplay,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8, valign: "middle" },
      headStyles: {
        fontStyle: "bold",
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Nama
        1: { cellWidth: 25 }, // Role
        2: { cellWidth: 20 }, // Jenis
        3: { cellWidth: 35 }, // Tanggal
        4: { cellWidth: "auto" }, // Alasan
        5: { cellWidth: 30, minCellHeight: 25 }, // Lampiran
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          const itemWithLampiran = bodyData[data.row.index];
          if (itemWithLampiran && itemWithLampiran.lampiran) {
            try {
              const imgProps = doc.getImageProperties(
                itemWithLampiran.lampiran
              );
              const imgWidth = 20;
              const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
              const x = data.cell.x + (data.cell.width - imgWidth) / 2;
              const y = data.cell.y + (data.cell.height - imgHeight) / 2;
              doc.addImage(
                itemWithLampiran.lampiran,
                x,
                y,
                imgWidth,
                imgHeight
              );
            } catch (e) {
              console.error(
                `Gagal menambahkan lampiran untuk baris ${data.row.index}:`,
                e
              );
            }
          }
        }
      },
    });

    Swal.close();
    doc.save(`Rekap_Izin_Absensi_${spbu}.pdf`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            📌 Rekap Izin / Absensi
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
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Alasan</th>
                <th className="px-4 py-3 text-center">Lampiran</th>
                <th className="px-4 py-3 text-center">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Tidak ada data izin/absensi.
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
                    <td className="px-4 py-3">{item.jenisPengajuan}</td>
                    <td className="px-4 py-3">
                      {new Date(item.tanggalAwal).toLocaleDateString("id-ID")}{" "}
                      s/d{" "}
                      {new Date(item.tanggalAkhir).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{item.alasan}</td>
                    <td className="px-4 py-3 text-center">
                      {item.lampiran ? (
                        <img
                          src={getPhotoUrl(item.lampiran)}
                          alt="Lampiran"
                          className="w-14 h-14 object-cover rounded border mx-auto shadow-sm cursor-pointer"
                          onClick={() =>
                            Swal.fire({
                              title: "Detail Lampiran",
                              imageUrl: getPhotoUrl(item.lampiran),
                              imageAlt: "Foto Lampiran",
                              showCloseButton: true,
                              showConfirmButton: false,
                              width: "auto",
                            })
                          }
                        />
                      ) : (
                        <span className="text-gray-400 italic">No File</span>
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
