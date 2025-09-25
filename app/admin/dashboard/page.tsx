"use client";

import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import API from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  HardHat,
  Settings,
  MapPin,
  Users,
  Fuel,
  Briefcase,
  Truck,
  Wrench,
  Download,
} from "lucide-react";

// ====================================================================
//                          TYPESCRIPT TYPES
// ====================================================================
type Tab = "ringkasan" | "laporan" | "checklist" | "operasional";

interface User {
  id: number;
  name: string;
  role: string;
}
interface Tank {
  id: number;
  fuel_type: string;
  capacity: string;
  current_volume: string;
}
interface FuelSale {
  id: number;
  tanggal: string;
  shift: string;
  jumlahLiter: number;
  totalHarga: string;
}
interface ChecklistItem {
  id: number;
  tanggal: string;
  userId: number;
  user?: User;
  [key: string]: any;
}
interface SPBU {
  id: number;
  code_spbu: string;
  address: string;
  users?: User[];
  tanks?: Tank[];
  fuelSale?: FuelSale[];
  checklistMushola?: ChecklistItem[];
  checklistAwalShift?: ChecklistItem[];
  checklistToilet?: ChecklistItem[];
  checklistOffice?: ChecklistItem[];
  checklistGarden?: ChecklistItem[];
  checklistDriveway?: ChecklistItem[];
  equipmentDamageReport?: any[];
  issueReport?: any[];
  pumpUnit?: any[];
  stockDelivery?: any[];
}

// ====================================================================
//                          HELPER FUNCTIONS
// ====================================================================
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
const getChecklistDescription = (item: any): string => {
  return (
    item.aktifitasMushola ||
    item.keterangan ||
    item.aktifitasToilet ||
    item.aktifitasOffice ||
    item.aktifitasGarden ||
    item.aktifitasDriveway ||
    "Tidak ada keterangan"
  );
};
const getChecklistStatus = (item: any): string => {
  return item.checklistStatus?.replace(/_/g, " ") || "Tidak ada keterangan";
};

// ====================================================================
//                         PDF EXPORT HELPERS
// ====================================================================
const addTableToPdf = (
  doc: jsPDF,
  title: string,
  head: any[],
  body: any[],
  startY: number,
  options = {}
) => {
  if (!body || body.length === 0) {
    doc.setFontSize(10);
    doc.text(`(Tidak ada data untuk "${title}")`, 14, startY + 10);
    return startY + 20;
  }
  let currentY = startY;
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 20;
  }
  doc.setFontSize(14);
  doc.text(title, 14, currentY);
  autoTable(doc, {
    head,
    body,
    startY: currentY + 7,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], halign: "center" },
    ...options,
  });
  return (doc as any).lastAutoTable.finalY + 15;
};

// ⭐ FUNGSI DIPERBARUI: Data penjualan sekarang diurutkan
const generateRingkasanKeuanganSection = (
  doc: jsPDF,
  spbu: SPBU,
  sales: FuelSale[],
  startY: number
) => {
  let currentY = startY;
  const sortedSales = sales.sort(
    (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
  );
  currentY = addTableToPdf(
    doc,
    "Laporan Keuangan",
    [["Tanggal", "Shift", "Liter", "Total Harga"]],
    sortedSales.map((s) => [
      formatDate(s.tanggal),
      s.shift,
      `${s.jumlahLiter} L`,
      formatCurrency(parseFloat(s.totalHarga)),
    ]),
    currentY
  );
  if (spbu.tanks?.length) {
    currentY = addTableToPdf(
      doc,
      "Status Tangki BBM",
      [["Jenis BBM", "Kapasitas (L)", "Volume (L)", "Persentase (%)"]],
      spbu.tanks.map((tank) => {
        const percentage = (
          (parseFloat(tank.current_volume) / parseFloat(tank.capacity)) *
          100
        ).toFixed(1);
        return [
          tank.fuel_type,
          tank.capacity,
          tank.current_volume,
          `${percentage} %`,
        ];
      }),
      currentY
    );
  }
  return currentY;
};

// ⭐ FUNGSI DIPERBARUI: Laporan kerusakan dan masalah sekarang diurutkan
const generateLaporanSection = (doc: jsPDF, spbu: SPBU, startY: number) => {
  let currentY = startY;
  if (spbu.equipmentDamageReport?.length) {
    const sortedReports = spbu.equipmentDamageReport.sort(
      (a, b) =>
        new Date(b.tanggalKerusakan).getTime() -
        new Date(a.tanggalKerusakan).getTime()
    );
    currentY = addTableToPdf(
      doc,
      "Laporan Kerusakan Peralatan",
      [["Tanggal", "Unit", "Deskripsi Kerusakan"]],
      sortedReports.map((r) => [
        formatDate(r.tanggalKerusakan),
        r.namaUnit,
        r.deskripsiKerusakan,
      ]),
      currentY
    );
  }
  if (spbu.issueReport?.length) {
    const sortedIssues = spbu.issueReport.sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
    currentY = addTableToPdf(
      doc,
      "Laporan Masalah Umum (Issue)",
      [["Tanggal", "Judul Laporan", "Deskripsi"]],
      sortedIssues.map((r) => [
        formatDate(r.tanggal),
        r.judulLaporan,
        r.deskripsiLaporan,
      ]),
      currentY
    );
  }
  return currentY;
};

const generateChecklistSection = (
  doc: jsPDF,
  checklists: any[],
  startY: number
) => {
  // Data checklist sudah diurutkan sebelum dipanggil, jadi tidak perlu sort di sini
  const head = [
    ["Tanggal", "Tipe", "Aktivitas", "Nama Pelapor", "Jabatan", "Status"],
  ];
  const body = checklists.map((item) => [
    formatDate(item.tanggal),
    item.type,
    getChecklistDescription(item),
    item.user?.name || "N/A",
    item.user?.role || "N/A",
    getChecklistStatus(item),
  ]);
  const tableOptions = {
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 40 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
    },
    didParseCell: (data: any) => {
      if (data.column.index === 2) {
        data.cell.styles.valign = "top";
        data.cell.styles.halign = "left";
      }
    },
  };
  return addTableToPdf(
    doc,
    "Log Aktivitas Checklist",
    head,
    body,
    startY,
    tableOptions
  );
};

// ⭐ FUNGSI DIPERBARUI: Riwayat pengiriman stok sekarang diurutkan
const generateOperasionalSection = (doc: jsPDF, spbu: SPBU, startY: number) => {
  let currentY = startY;
  if (spbu.users?.length) {
    currentY = addTableToPdf(
      doc,
      "Data Karyawan",
      [["Nama", "Jabatan (Role)"]],
      spbu.users.map((user) => [user.name, user.role]),
      currentY
    );
  }
  if (spbu.pumpUnit?.length) {
    currentY = addTableToPdf(
      doc,
      "Unit Pompa",
      [["Kode Pompa"]],
      spbu.pumpUnit.map((p) => [p.kodePompa]),
      currentY
    );
  }
  if (spbu.stockDelivery?.length) {
    const sortedDeliveries = spbu.stockDelivery.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    currentY = addTableToPdf(
      doc,
      "Riwayat Pengiriman Stok",
      [["Tanggal Kirim", "Produk & Volume (L)"]],
      sortedDeliveries.map((d) => [
        formatDate(d.createdAt),
        Object.entries(d)
          .filter(
            ([k, v]) => k.startsWith("volume") && parseFloat(v as string) > 0
          )
          .map(([k, v]) => `${k.replace("volume", "")}: ${v} L`)
          .join(", "),
      ]),
      currentY
    );
  }
  return currentY;
};

// ====================================================================
//                      KOMPONEN FILTER HISTORIS
// ====================================================================
interface HistoryFilterProps {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}
const HistoryFilter: React.FC<HistoryFilterProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const years = Array.from({ length: 8 }, (_, i) => 2023 + i);
  return (
    <div className="flex items-center space-x-3 mb-6 bg-slate-50 p-3 rounded-lg border">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        className="p-2 border rounded-md bg-white font-semibold text-sm w-full"
      >
        {months.map((month, index) => (
          <option key={month} value={index}>
            {month}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="p-2 border rounded-md bg-white font-semibold text-sm w-full"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            Tahun {year}
          </option>
        ))}
      </select>
    </div>
  );
};

// ====================================================================
//                     KOMPONEN UTAMA: MONITORING PAGE
// ====================================================================
export default function MonitoringPage() {
  const [spbus, setSpbus] = useState<SPBU[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpbu, setSelectedSpbu] = useState<SPBU | null>(null);
  useEffect(() => {
    const fetchAllSpbu = async () => {
      setLoading(true);
      try {
        const res = await API.get("/admin/spbus");
        setSpbus(
          res.data.data.map((spbu: any) => ({
            id: spbu.id,
            code_spbu: spbu.code_spbu,
            address: spbu.address,
          })) || []
        );
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Daftar SPBU",
          text: err.response?.data?.message || err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAllSpbu();
  }, []);
  const handleSelectSpbu = async (spbu: SPBU) => {
    Swal.fire({
      title: "Mengambil Data Detail...",
      text: `Mohon tunggu sebentar untuk SPBU ${spbu.code_spbu}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const res = await API.get(`/admin/spbus/${spbu.id}`);
      setSelectedSpbu(res.data.data);
      Swal.close();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: `Gagal Memuat Detail SPBU ${spbu.code_spbu}`,
        text: err.response?.data?.message || err.message,
      });
    }
  };
  if (loading) {
    return <div className="p-6 text-center">Loading data SPBU...</div>;
  }
  return (
    <main className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {selectedSpbu ? (
          <SPBUDetail
            spbu={selectedSpbu}
            onBack={() => setSelectedSpbu(null)}
          />
        ) : (
          <SPBUList spbus={spbus} onSelectSpbu={handleSelectSpbu} />
        )}
      </div>
    </main>
  );
}

// ====================================================================
//                         KOMPONEN: SPBU LIST
// ====================================================================
interface SPBUListProps {
  spbus: SPBU[];
  onSelectSpbu: (spbu: SPBU) => void;
}
const SPBUList: React.FC<SPBUListProps> = ({ spbus, onSelectSpbu }) => {
  const handleExportSingleSpbuPDF = async (
    spbu: SPBU,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    Swal.fire({
      title: `Mempersiapkan Laporan...`,
      text: `Mengambil data untuk SPBU ${spbu.code_spbu}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const res = await API.get(`/admin/spbus/${spbu.id}`);
      const detailedSpbu: SPBU = res.data.data;
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(18);
      doc.text(`Laporan Lengkap SPBU: ${detailedSpbu.code_spbu}`, 14, 22);
      doc.setFontSize(12);
      doc.text(detailedSpbu.address, 14, 30);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 36);

      let currentY = 50;

      const userMap = new Map(
        detailedSpbu.users?.map((user) => [user.id, user])
      );
      const mapChecklistWithUser = (checklistData: any[] = [], type: string) =>
        checklistData.map((c: any) => ({
          ...c,
          type,
          user: userMap.get(c.userId),
        }));

      // ⭐ PENGURUTAN DATA CHECKLIST DITAMBAHKAN DI SINI
      const allChecklists = [
        ...mapChecklistWithUser(detailedSpbu.checklistMushola, "Mushola"),
        ...mapChecklistWithUser(detailedSpbu.checklistAwalShift, "Awal Shift"),
        ...mapChecklistWithUser(detailedSpbu.checklistToilet, "Toilet"),
        ...mapChecklistWithUser(detailedSpbu.checklistOffice, "Office"),
        ...mapChecklistWithUser(detailedSpbu.checklistGarden, "Taman"),
        ...mapChecklistWithUser(detailedSpbu.checklistDriveway, "Driveway"),
      ].sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );

      // PDF generator akan mengurutkan data internalnya sendiri
      currentY = generateRingkasanKeuanganSection(
        doc,
        detailedSpbu,
        detailedSpbu.fuelSale || [],
        currentY
      );
      currentY = generateLaporanSection(doc, detailedSpbu, currentY);
      currentY = generateChecklistSection(doc, allChecklists, currentY);
      currentY = generateOperasionalSection(doc, detailedSpbu, currentY);

      doc.save(
        `Laporan_Lengkap_SPBU_${detailedSpbu.code_spbu.replace(/\./g, "-")}.pdf`
      );
      Swal.close();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal Mengekspor PDF",
        text:
          err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat mengambil data detail.",
      });
    }
  };
  return (
    <div>
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">
          📊 Dashboard Monitoring SPBU
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
          Ringkasan data operasional dari semua SPBU. Klik kartu untuk melihat
          detail atau tombol ekspor untuk mengunduh laporan.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spbus.map((spbu) => (
          <div
            key={spbu.id}
            onClick={() => onSelectSpbu(spbu)}
            className="bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer p-6 flex flex-col"
          >
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-blue-700">
                {spbu.code_spbu}
              </h2>
              <div className="flex items-start space-x-2 mt-2 text-slate-600">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <p>{spbu.address}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
              <p className="text-sm text-slate-500">Klik kartu untuk detail</p>
              <button
                onClick={(e) => handleExportSingleSpbuPDF(spbu, e)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors shadow"
                title={`Ekspor Laporan Lengkap untuk SPBU ${spbu.code_spbu}`}
              >
                <Download size={14} />
                <span>Ekspor</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================================================================
//                 KOMPONEN: FINANCIAL REPORT CARD (DETAIL)
// ====================================================================
interface FinancialReportCardProps {
  salesData: FuelSale[];
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}
const FinancialReportCard: React.FC<FinancialReportCardProps> = ({
  salesData,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) => {
  const totalPendapatan = useMemo(() => {
    return salesData.reduce(
      (sum, sale) => sum + parseFloat(sale.totalHarga),
      0
    );
  }, [salesData]);
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 col-span-1 md:col-span-2">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Laporan Keuangan
      </h3>
      <HistoryFilter
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
      <div>
        <p className="text-sm text-slate-500">
          Total Pendapatan (Filter Aktif)
        </p>
        <p className="text-3xl font-extrabold text-blue-700 my-2">
          {formatCurrency(totalPendapatan)}
        </p>
      </div>
      <hr className="my-6 border-slate-200" />
      <h4 className="font-semibold text-slate-700 mb-3">
        Rincian Transaksi (Filter Aktif)
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-100 text-slate-700 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                Tanggal
              </th>
              <th scope="col" className="px-4 py-3">
                Shift
              </th>
              <th scope="col" className="px-4 py-3">
                Liter
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Total Harga
              </th>
            </tr>
          </thead>
          <tbody>
            {salesData.length > 0 ? (
              salesData.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">{formatDate(sale.tanggal)}</td>
                  <td className="px-4 py-3">{sale.shift}</td>
                  <td className="px-4 py-3">{sale.jumlahLiter} L</td>
                  <td className="px-4 py-3 font-medium text-slate-900 text-right">
                    {formatCurrency(parseFloat(sale.totalHarga))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-500">
                  Tidak ada data penjualan untuk periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ====================================================================
//                       KOMPONEN: SPBU DETAIL
// ====================================================================
interface SPBUDetailProps {
  spbu: SPBU;
  onBack: () => void;
}
const SPBUDetail: React.FC<SPBUDetailProps> = ({ spbu, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>("ringkasan");
  const now = new Date();
  const [checklistMonth, setChecklistMonth] = useState<number>(now.getMonth());
  const [checklistYear, setChecklistYear] = useState<number>(now.getFullYear());
  const [financialMonth, setFinancialMonth] = useState<number>(now.getMonth());
  const [financialYear, setFinancialYear] = useState<number>(now.getFullYear());

  const allChecklists = useMemo(() => {
    const userMap = new Map(spbu.users?.map((user) => [user.id, user]));
    const mapChecklistWithUser = (checklistData: any[] = [], type: string) =>
      checklistData.map((c: any) => ({
        ...c,
        type,
        user: userMap.get(c.userId),
      }));
    const combined = [
      ...mapChecklistWithUser(spbu.checklistMushola, "Mushola"),
      ...mapChecklistWithUser(spbu.checklistAwalShift, "Awal Shift"),
      ...mapChecklistWithUser(spbu.checklistToilet, "Toilet"),
      ...mapChecklistWithUser(spbu.checklistOffice, "Office"),
      ...mapChecklistWithUser(spbu.checklistGarden, "Taman"),
      ...mapChecklistWithUser(spbu.checklistDriveway, "Driveway"),
    ];
    return combined.sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
  }, [spbu]);
  const filteredChecklists = useMemo(() => {
    return allChecklists.filter((item) => {
      const itemDate = new Date(item.tanggal);
      return (
        itemDate.getMonth() === checklistMonth &&
        itemDate.getFullYear() === checklistYear
      );
    });
  }, [allChecklists, checklistMonth, checklistYear]);
  const filteredFuelSales = useMemo(() => {
    return (spbu.fuelSale || []).filter((sale) => {
      const saleDate = new Date(sale.tanggal);
      return (
        saleDate.getMonth() === financialMonth &&
        saleDate.getFullYear() === financialYear
      );
    });
  }, [spbu.fuelSale, financialMonth, financialYear]);

  const handleExportDetailPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const tabTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    doc.setFontSize(18);
    doc.text(`Laporan ${tabTitle} SPBU: ${spbu.code_spbu}`, 14, 22);
    doc.setFontSize(12);
    doc.text(spbu.address, 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 36);
    let startY = 50;
    switch (activeTab) {
      case "ringkasan":
        generateRingkasanKeuanganSection(doc, spbu, filteredFuelSales, startY);
        break;
      case "laporan":
        generateLaporanSection(doc, spbu, startY);
        break;
      case "checklist":
        generateChecklistSection(doc, filteredChecklists, startY);
        break;
      case "operasional":
        generateOperasionalSection(doc, spbu, startY);
        break;
    }
    doc.save(
      `Laporan_${tabTitle}_SPBU_${spbu.code_spbu.replace(/\./g, "-")}.pdf`
    );
  };
  const TabButton: React.FC<{
    tabName: Tab;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ tabName, icon, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center space-x-2 px-4 py-3 font-semibold border-b-4 transition-colors ${
        activeTab === tabName
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-200"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
  const renderContent = () => {
    switch (activeTab) {
      case "ringkasan":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialReportCard
              salesData={filteredFuelSales}
              selectedMonth={financialMonth}
              setSelectedMonth={setFinancialMonth}
              selectedYear={financialYear}
              setSelectedYear={setFinancialYear}
            />
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                ⛽ Status Tangki BBM
              </h3>
              {spbu.tanks?.length ? (
                spbu.tanks.map((tank) => {
                  const p =
                    (parseFloat(tank.current_volume) /
                      parseFloat(tank.capacity)) *
                    100;
                  return (
                    <div key={tank.id} className="mb-4">
                      {" "}
                      <div className="flex justify-between items-center mb-1">
                        {" "}
                        <span className="font-bold text-slate-700">
                          {tank.fuel_type}
                        </span>{" "}
                        <span className="text-sm text-slate-500">
                          {tank.current_volume} / {tank.capacity} L
                        </span>{" "}
                      </div>{" "}
                      <div className="w-full bg-slate-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${p}%` }}
                        ></div>
                      </div>{" "}
                      <p className="text-right text-sm font-semibold text-blue-600 mt-1">
                        {p.toFixed(1)}%
                      </p>{" "}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Tidak ada data tangki.
                </p>
              )}
            </div>
          </div>
        );
      case "laporan":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Wrench size={20} className="mr-2 text-red-500" /> Laporan
                Kerusakan Peralatan
              </h3>
              {spbu.equipmentDamageReport?.length ? (
                spbu.equipmentDamageReport.map((r: any) => (
                  <div
                    key={r.id}
                    className="py-3 border-b border-slate-200 last:border-b-0"
                  >
                    {" "}
                    <p className="font-bold text-slate-700">
                      {r.namaUnit}
                    </p>{" "}
                    <p className="text-slate-600 my-1">
                      <span className="font-semibold">Kerusakan:</span>{" "}
                      {r.deskripsiKerusakan}
                    </p>{" "}
                    <small className="text-slate-400">
                      Tanggal: {formatDate(r.tanggalKerusakan)}
                    </small>{" "}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">
                  ✅ Tidak ada laporan kerusakan.
                </p>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <HardHat size={20} className="mr-2 text-orange-500" /> Laporan
                Masalah Umum (Issue)
              </h3>
              {spbu.issueReport?.length ? (
                spbu.issueReport.map((r: any) => (
                  <div
                    key={r.id}
                    className="py-3 border-b border-slate-200 last:border-b-0"
                  >
                    {" "}
                    <p className="font-bold text-slate-700">
                      {r.judulLaporan}
                    </p>{" "}
                    <p className="text-slate-600 my-1">{r.deskripsiLaporan}</p>{" "}
                    <small className="text-slate-400">
                      Tanggal: {formatDate(r.tanggal)}
                    </small>{" "}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">
                  ✅ Tidak ada laporan masalah.
                </p>
              )}
            </div>
          </div>
        );
      case "checklist":
        return (
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              📋 Log Aktivitas Checklist
            </h3>
            <HistoryFilter
              selectedMonth={checklistMonth}
              setSelectedMonth={setChecklistMonth}
              selectedYear={checklistYear}
              setSelectedYear={setChecklistYear}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-100 text-slate-700 uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      Waktu
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Tipe
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Aktivitas
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Nama Pelapor
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Jabatan
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecklists.length > 0 ? (
                    filteredChecklists.map((item: any, i: number) => (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-full">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getChecklistDescription(item).replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {item.user?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {item.user?.role || "N/A"}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {getChecklistStatus(item)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-slate-500"
                      >
                        Tidak ada data checklist untuk periode ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "operasional":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Users size={20} className="mr-2 text-blue-500" /> Karyawan
              </h3>
              {spbu.users?.length ? (
                <ul className="space-y-3">
                  {" "}
                  {spbu.users?.map((user: any) => (
                    <li key={user.id} className="flex items-center space-x-3">
                      {" "}
                      <Briefcase size={16} className="text-slate-400" />{" "}
                      <span className="font-semibold text-slate-700">
                        {user.name}
                      </span>{" "}
                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        {user.role}
                      </span>{" "}
                    </li>
                  ))}{" "}
                </ul>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Belum ada data karyawan.
                </p>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Fuel size={20} className="mr-2 text-purple-500" /> Unit Pompa
              </h3>
              {spbu.pumpUnit?.length ? (
                <ul className="space-y-2">
                  {" "}
                  {spbu.pumpUnit?.map((pump: any) => (
                    <li
                      key={pump.id}
                      className="font-semibold text-slate-700 bg-slate-100 p-2 rounded-md"
                    >
                      {pump.kodePompa}
                    </li>
                  ))}{" "}
                </ul>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Belum ada data unit pompa.
                </p>
              )}
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Truck size={20} className="mr-2 text-cyan-500" /> Riwayat
                Pengiriman Stok
              </h3>
              {spbu.stockDelivery?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 uppercase">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Tanggal
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Produk & Volume (L)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {spbu.stockDelivery?.map((delivery: any) => (
                        <tr
                          key={delivery.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            {formatDate(delivery.createdAt)}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {" "}
                            {Object.entries(delivery)
                              .filter(
                                ([k, v]) =>
                                  k.startsWith("volume") &&
                                  parseFloat(v as string) > 0
                              )
                              .map(
                                ([k, v]) => `${k.replace("volume", "")}: ${v} L`
                              )
                              .join(", ")}{" "}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Belum ada riwayat pengiriman stok.
                </p>
              )}
            </div>
          </div>
        );
      default:
        return <div>Pilih tab untuk melihat konten.</div>;
    }
  };
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Daftar</span>
        </button>
        <button
          onClick={handleExportDetailPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md"
        >
          <Download size={18} />
          <span>Ekspor Tab Ini ke PDF</span>
        </button>
      </div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {spbu.code_spbu}
        </h1>
        <p className="text-base text-slate-600">{spbu.address}</p>
      </header>
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          <TabButton
            tabName="ringkasan"
            icon={<FileText size={18} />}
            children="Ringkasan & Keuangan"
          />
          <TabButton
            tabName="laporan"
            icon={<HardHat size={18} />}
            children="Laporan"
          />
          <TabButton
            tabName="checklist"
            icon={<CheckCircle size={18} />}
            children="Checklist"
          />
          <TabButton
            tabName="operasional"
            icon={<Settings size={18} />}
            children="Data Operasional"
          />
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};
