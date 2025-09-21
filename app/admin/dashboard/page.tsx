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

interface SPBU {
  id: number;
  code_spbu: string;
  address: string;
  users?: User[];
  tanks?: Tank[];
  fuelSale?: FuelSale[];
  checklistMushola?: any[];
  checklistAwalShift?: any[];
  checklistToilet?: any[];
  checklistOffice?: any[];
  checklistGarden?: any[];
  checklistDriveway?: any[];
  equipmentDamageReport?: any[];
  issueReport?: any[];
  pumpUnit?: any[];
  stockDelivery?: any[];
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function MonitoringPage() {
  const [spbus, setSpbus] = useState<SPBU[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpbu, setSelectedSpbu] = useState<SPBU | null>(null);

  useEffect(() => {
    const fetchAllSpbu = async () => {
      setLoading(true);
      try {
        const res = await API.get("/admin/spbus");
        setSpbus(res.data.data || []);
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

interface SPBUListProps {
  spbus: SPBU[];
  onSelectSpbu: (spbu: SPBU) => void;
}

const SPBUList: React.FC<SPBUListProps> = ({ spbus, onSelectSpbu }) => {
  const handleExportAllPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Daftar Ringkasan Semua SPBU", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);
    autoTable(doc, {
      head: [["Kode SPBU", "Alamat", "Jml Karyawan", "Jml Tangki"]],
      body: spbus.map((spbu) => [
        spbu.code_spbu,
        spbu.address,
        spbu.users?.length || 0,
        spbu.tanks?.length || 0,
      ]),
      startY: 35,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save("Laporan_Ringkasan_SPBU.pdf");
  };

  return (
    <div>
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">
          📊 Dashboard Monitoring SPBU
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
          Ringkasan data operasional dari semua SPBU. Klik sebuah kartu untuk
          melihat detail lengkap.
        </p>
        <div className="mt-6">
          <button
            onClick={handleExportAllPDF}
            className="flex items-center mx-auto space-x-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            <Download size={20} />
            <span>Ekspor Semua ke PDF</span>
          </button>
        </div>
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
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Klik untuk melihat detail
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FinancialReportCardProps {
  salesData: FuelSale[];
}

const FinancialReportCard: React.FC<FinancialReportCardProps> = ({
  salesData,
}) => {
  const [filter, setFilter] = useState<"harian" | "bulanan" | "tahunan">(
    "bulanan"
  );

  const reportData = useMemo(() => {
    const now = new Date();
    let filteredSales: FuelSale[] = [];

    if (filter === "harian") {
      filteredSales = salesData.filter((sale) => {
        const saleDate = new Date(sale.tanggal);
        return (
          saleDate.getDate() === now.getDate() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (filter === "bulanan") {
      filteredSales = salesData.filter((sale) => {
        const saleDate = new Date(sale.tanggal);
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      });
    } else {
      // tahunan
      filteredSales = salesData.filter(
        (sale) => new Date(sale.tanggal).getFullYear() === now.getFullYear()
      );
    }

    const totalPendapatan = filteredSales.reduce(
      (sum, sale) => sum + parseFloat(sale.totalHarga),
      0
    );
    return { filteredSales, totalPendapatan };
  }, [salesData, filter]);

  const FilterButton: React.FC<{
    type: "harian" | "bulanan" | "tahunan";
    children: React.ReactNode;
  }> = ({ type, children }) => (
    <button
      onClick={() => setFilter(type)}
      className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
        filter === type
          ? "bg-blue-600 text-white shadow-md"
          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
      }`}
    >
      {children}
    </button>
  );

  const filterText = filter.charAt(0).toUpperCase() + filter.slice(1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 col-span-1 md:col-span-2">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Laporan Keuangan
      </h3>
      <div className="flex space-x-2 mb-6">
        <FilterButton type="harian">Harian</FilterButton>
        <FilterButton type="bulanan">Bulanan</FilterButton>
        <FilterButton type="tahunan">Tahunan</FilterButton>
      </div>

      <div>
        <p className="text-sm text-slate-500">
          Total Pendapatan ({filterText})
        </p>
        <p className="text-3xl font-extrabold text-blue-700 my-2">
          {formatCurrency(reportData.totalPendapatan)}
        </p>
      </div>

      <hr className="my-6 border-slate-200" />

      <h4 className="font-semibold text-slate-700 mb-3">
        Rincian Transaksi ({filterText})
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
            {reportData.filteredSales.length > 0 ? (
              reportData.filteredSales.map((sale) => (
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

interface SPBUDetailProps {
  spbu: SPBU;
  onBack: () => void;
}

const SPBUDetail: React.FC<SPBUDetailProps> = ({ spbu, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>("ringkasan");

  const allChecklists = useMemo(() => {
    const combined = [
      ...(spbu.checklistMushola || []).map((c: any) => ({
        ...c,
        type: "Mushola",
      })),
      ...(spbu.checklistAwalShift || []).map((c: any) => ({
        ...c,
        type: "Awal Shift",
      })),
      ...(spbu.checklistToilet || []).map((c: any) => ({
        ...c,
        type: "Toilet",
      })),
      ...(spbu.checklistOffice || []).map((c: any) => ({
        ...c,
        type: "Office",
      })),
      ...(spbu.checklistGarden || []).map((c: any) => ({
        ...c,
        type: "Taman",
      })),
      ...(spbu.checklistDriveway || []).map((c: any) => ({
        ...c,
        type: "Driveway",
      })),
    ];
    return combined.sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );
  }, [spbu]);

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

  const handleExportDetailPDF = () => {
    const doc = new jsPDF();
    let startY = 0;

    doc.setFontSize(18);
    doc.text("Laporan Detail SPBU", 14, 22);
    doc.setFontSize(12);
    doc.text(`Kode SPBU: ${spbu.code_spbu}`, 14, 30);
    doc.text(`Alamat: ${spbu.address}`, 14, 36);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 42);

    startY = 55;

    const addTable = (title: string, head: string[][], body: any[][]) => {
      if (!body || body.length === 0) return;
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }
      doc.setFontSize(14);
      doc.text(title, 14, startY);
      autoTable(doc, {
        head,
        body,
        startY: startY + 5,
        theme: "grid",
        headStyles: { fillColor: [22, 160, 133] },
      });
      startY = (doc as any).lastAutoTable.finalY + 15;
    };

    if (spbu.fuelSale?.length)
      addTable(
        "Laporan Keuangan",
        [["Tanggal", "Shift", "Liter", "Total Harga"]],
        spbu.fuelSale.map((s) => [
          formatDate(s.tanggal),
          s.shift,
          `${s.jumlahLiter} L`,
          formatCurrency(parseFloat(s.totalHarga)),
        ])
      );
    if (spbu.tanks?.length)
      addTable(
        "Status Tangki BBM",
        [["Jenis BBM", "Kapasitas (L)", "Volume (L)", "Persen (%)"]],
        spbu.tanks.map((tank) => {
          const p = (
            (parseFloat(tank.current_volume) / parseFloat(tank.capacity)) *
            100
          ).toFixed(1);
          return [tank.fuel_type, tank.capacity, tank.current_volume, `${p} %`];
        })
      );
    if (spbu.equipmentDamageReport?.length)
      addTable(
        "Laporan Kerusakan",
        [["Tanggal", "Unit", "Deskripsi"]],
        spbu.equipmentDamageReport.map((r) => [
          formatDate(r.tanggalKerusakan),
          r.namaUnit,
          r.deskripsiKerusakan,
        ])
      );
    if (spbu.issueReport?.length)
      addTable(
        "Laporan Masalah",
        [["Tanggal", "Judul", "Deskripsi"]],
        spbu.issueReport.map((r) => [
          formatDate(r.tanggal),
          r.judulLaporan,
          r.deskripsiLaporan,
        ])
      );
    if (allChecklists.length > 0)
      addTable(
        "Log Checklist",
        [["Tanggal", "Tipe", "Aktivitas", "Status"]],
        allChecklists.map((item) => [
          formatDate(item.tanggal),
          item.type,
          getChecklistDescription(item),
          item.checklistStatus || "TERLAKSANA",
        ])
      );
    if (spbu.users?.length)
      addTable(
        "Data Karyawan",
        [["Nama", "Jabatan"]],
        spbu.users.map((user) => [user.name, user.role])
      );
    if (spbu.pumpUnit?.length)
      addTable(
        "Unit Pompa",
        [["Kode Pompa"]],
        spbu.pumpUnit.map((p) => [p.kodePompa])
      );
    if (spbu.stockDelivery?.length)
      addTable(
        "Riwayat Pengiriman Stok",
        [["Tanggal", "Produk & Volume"]],
        spbu.stockDelivery.map((d) => [
          formatDate(d.createdAt),
          Object.entries(d)
            .filter(
              ([k, v]) => k.startsWith("volume") && parseFloat(v as string) > 0
            )
            .map(([k, v]) => `${k.replace("volume", "")}: ${v} L`)
            .join(", "),
        ])
      );

    doc.save(`Laporan_SPBU_${spbu.code_spbu.replace(/\./g, "-")}.pdf`);
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
            <FinancialReportCard salesData={spbu.fuelSale || []} />
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                ⛽ Status Tangki BBM
              </h3>
              {spbu.tanks?.length ? (
                spbu.tanks.map((tank) => {
                  const percentage =
                    (parseFloat(tank.current_volume) /
                      parseFloat(tank.capacity)) *
                    100;
                  return (
                    <div key={tank.id} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">
                          {tank.fuel_type}
                        </span>
                        <span className="text-sm text-slate-500">
                          {tank.current_volume} / {tank.capacity} L
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-sm font-semibold text-blue-600 mt-1">
                        {percentage.toFixed(1)}%
                      </p>
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
                spbu.equipmentDamageReport.map((report: any) => (
                  <div
                    key={report.id}
                    className="py-3 border-b border-slate-200 last:border-b-0"
                  >
                    <p className="font-bold text-slate-700">
                      {report.namaUnit}
                    </p>
                    <p className="text-slate-600 my-1">
                      <span className="font-semibold">Kerusakan:</span>{" "}
                      {report.deskripsiKerusakan}
                    </p>
                    <small className="text-slate-400">
                      Tanggal: {formatDate(report.tanggalKerusakan)}
                    </small>
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
                spbu.issueReport.map((report: any) => (
                  <div
                    key={report.id}
                    className="py-3 border-b border-slate-200 last:border-b-0"
                  >
                    <p className="font-bold text-slate-700">
                      {report.judulLaporan}
                    </p>
                    <p className="text-slate-600 my-1">
                      {report.deskripsiLaporan}
                    </p>
                    <small className="text-slate-400">
                      Tanggal: {formatDate(report.tanggal)}
                    </small>
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
              📋 Log Aktivitas Checklist (Semua)
            </h3>
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
                      Aktivitas / Keterangan
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allChecklists.length > 0 ? (
                    allChecklists.map((item: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-full">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getChecklistDescription(item)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {item.checklistStatus ||
                            item.perawatanNozzle ||
                            "TERLAKSANA"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-10 text-slate-500"
                      >
                        Tidak ada data checklist.
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
          <span>Ekspor Detail ke PDF</span>
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
