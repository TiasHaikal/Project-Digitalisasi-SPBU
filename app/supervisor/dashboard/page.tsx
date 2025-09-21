"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api"; 
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

interface FuelSale {
  id: number;
  jumlahLiter: string;
  totalHarga: string;
  nozzle: {
    tank: {
      fuel_type: string;
    };
  };
  createdAt?: string;
}

interface TankDelivery {
  id: number;
  tank: {
    fuel_type: string;
  };
  deliveryDate: string;
  noMobilTangki: string;
  volumePenerimaanAktual: string;
}

interface FuelQuality {
  id: number;
  tank: {
    fuel_type: string;
  };
  tanggal: string;
  densityStd: string;
  selisihDensity: string;
}

interface StockDelivery {
  [key: string]: string | number | object | undefined;
  createdAt?: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [fuelSales, setFuelSales] = useState<FuelSale[]>([]);
  const [tankDeliveries, setTankDeliveries] = useState<TankDelivery[]>([]);
  const [fuelQualities, setFuelQualities] = useState<FuelQuality[]>([]);
  const [stockDeliveries, setStockDeliveries] = useState<StockDelivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoints = [
          '/supervisor/fuel-sales',
          '/supervisor/tank-deliveries',
          '/supervisor/fuel-qualities',
          '/supervisor/stock-deliveries',
        ];
        const responses = await Promise.all(endpoints.map(url => api.get(url)));
        const data = responses.map(res => res.data);
        setFuelSales(data[0].data);
        setTankDeliveries(data[1].data);
        setFuelQualities(data[2].data);
        setStockDeliveries(data[3].data);
      } catch (err: any) {
        setError(err.message || 'Gagal mengambil data dari server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isDateMatch = (dateStr: string) => {
    const d = new Date(dateStr);
    if (selectedYear && d.getFullYear().toString() !== selectedYear) return false;
    if (selectedMonth && (d.getMonth() + 1).toString() !== selectedMonth) return false;
    return true;
  };

  const filteredFuelSales = useMemo(
    () => fuelSales.filter(s => s.createdAt && isDateMatch(s.createdAt)),
    [fuelSales, selectedYear, selectedMonth]
  );

  const filteredTankDeliveries = useMemo(
    () => tankDeliveries.filter(td => isDateMatch(td.deliveryDate)),
    [tankDeliveries, selectedYear, selectedMonth]
  );

  const filteredFuelQualities = useMemo(
    () => fuelQualities.filter(fq => isDateMatch(fq.tanggal)),
    [fuelQualities, selectedYear, selectedMonth]
  );

  const filteredStockDeliveries = useMemo(
    () => stockDeliveries.filter(sd => sd.createdAt && isDateMatch(sd.createdAt)),
    [stockDeliveries, selectedYear, selectedMonth]
  );

  const kpiData = useMemo(() => {
    const totalRevenue = filteredFuelSales.reduce((acc, sale) => acc + parseFloat(sale.totalHarga), 0);
    const totalLitersSold = filteredFuelSales.reduce((acc, sale) => acc + parseFloat(sale.jumlahLiter), 0);
    const totalDeliveries = filteredTankDeliveries.length;
    const totalQualityChecks = filteredFuelQualities.length;
    return { totalRevenue, totalLitersSold, totalDeliveries, totalQualityChecks };
  }, [filteredFuelSales, filteredTankDeliveries, filteredFuelQualities]);

  const salesByFuelType = useMemo(() => {
    const aggregation: { [key: string]: number } = {};
    filteredFuelSales.forEach(sale => {
      const fuelType = sale.nozzle.tank.fuel_type;
      const liters = parseFloat(sale.jumlahLiter);
      if (!aggregation[fuelType]) aggregation[fuelType] = 0;
      aggregation[fuelType] += liters;
    });
    return Object.entries(aggregation).map(([name, liter]) => ({ name, liter }));
  }, [filteredFuelSales]);

  const stockComposition = useMemo(() => {
    if (filteredStockDeliveries.length === 0) return [];
    const stock = filteredStockDeliveries[0];
    return Object.entries(stock)
      .filter(([key, value]) => key.startsWith('volume') && parseFloat(value as string) > 0)
      .map(([key, value]) => ({
        name: key.replace('volume', ''),
        value: parseFloat(value as string),
      }));
  }, [filteredStockDeliveries]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-100"><p>Memuat data...</p></div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-gray-100"><p>{error}</p></div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header + Filter */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Selamat Datang, {userName || "Supervisor"} 👋
            </h1>
            <p className="text-gray-600 mt-1">Berikut adalah ringkasan performa SPBU hari ini.</p>
          </div>
          <div className="flex gap-2">
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Semua Tahun</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID',{month:'long'})}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Total Pendapatan" value={`Rp ${kpiData.totalRevenue.toLocaleString('id-ID')}`} />
          <KpiCard title="Total Liter Terjual" value={`${kpiData.totalLitersSold.toLocaleString('id-ID')} L`} />
          <KpiCard title="Total Pengiriman" value={kpiData.totalDeliveries.toString()} />
          <KpiCard title="Pemeriksaan Kualitas" value={kpiData.totalQualityChecks.toString()} />
        </div>

        {/* Grafik */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Penjualan per Jenis BBM (Liter)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByFuelType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('id-ID')} L`} />
                <Legend />
                <Bar dataKey="liter" fill="#3b82f6" name="Total Liter" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Komposisi Stok BBM</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stockComposition} dataKey="value" nameKey="name" outerRadius={100} label>
                  {stockComposition.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString('id-ID')} L`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataTable title="Pengecekan Kualitas Terbaru" data={filteredFuelQualities.slice(0, 3)} headers={['Jenis BBM', 'Tanggal', 'Density Std', 'Selisih']} renderRow={(item: FuelQuality) => (
            <>
              <td>{item.tank.fuel_type}</td>
              <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
              <td>{item.densityStd}</td>
              <td>{item.selisihDensity}</td>
            </>
          )} />
          <DataTable title="Pengiriman Tangki Terbaru" data={filteredTankDeliveries.slice(0, 3)} headers={['Jenis BBM', 'Tanggal', 'No. Mobil', 'Volume Aktual']} renderRow={(item: TankDelivery) => (
            <>
              <td>{item.tank.fuel_type}</td>
              <td>{new Date(item.deliveryDate).toLocaleDateString('id-ID')}</td>
              <td>{item.noMobilTangki}</td>
              <td>{parseFloat(item.volumePenerimaanAktual).toLocaleString('id-ID')} L</td>
            </>
          )} />
        </div>
      </div>
    </div>
  );
}

const KpiCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);

const DataTable = ({ title, data, headers, renderRow }: { title: string; data: any[]; headers: string[]; renderRow: (item: any) => React.ReactNode }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>{headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={headers.length} className="text-center py-4 text-gray-400">Tidak ada data</td></tr>
          ) : data.map((item, i) => (
            <tr key={i} className="bg-white border-b">{renderRow(item)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);