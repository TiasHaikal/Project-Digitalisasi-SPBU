"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FuelSale {
  id: number;
  nozzleId: number;
  tanggal: string;
  shift: string;
  standAwal: number;
  standAkhir: number;
  jumlahLiter: number;
  hargaPerLiter: number;
  totalHarga: number;
  createdAt: string;
  updatedAt: string;
}

interface Nozzle {
  id: number;
  kodeNozzle: string;
  tank?: {
    fuel_type: string;
  };
}

export default function FuelSalesPage() {
  const [fuelSales, setFuelSales] = useState<FuelSale[]>([]);
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editing, setEditing] = useState<FuelSale | null>(null);

  const [form, setForm] = useState<any>({
    nozzleId: "",
    tanggal: "",
    shift: "",
    standAwal: "",
    standAkhir: "",
    hargaPerLiter: "",
  });

  const setField = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const fetchFuelSales = async () => {
    setLoading(true);
    try {
      const res = await API.get("/supervisor/fuel-sales");
      setFuelSales(res.data.data || []);
    } catch (err: any) {
      Swal.fire("Error", "Gagal memuat data fuel sales!", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchNozzles = async () => {
    try {
      const res = await API.get("/supervisor/nozzles");
      setNozzles(res.data.data || []);
    } catch (err: any) {
      Swal.fire("Error", "Gagal memuat data nozzles!", "error");
    }
  };

  useEffect(() => {
    fetchFuelSales();
    fetchNozzles();
  }, []);

  const resetForm = () =>
    setForm({
      nozzleId: "",
      tanggal: "",
      shift: "",
      standAwal: "",
      standAkhir: "",
      hargaPerLiter: "",
    });

  const openAdd = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const openEdit = (fs: FuelSale) => {
    setEditing(fs);
    setForm({
      nozzleId: fs.nozzleId,
      tanggal: fs.tanggal.slice(0, 16), // cocok untuk datetime-local
      shift: fs.shift,
      standAwal: fs.standAwal,
      standAkhir: fs.standAkhir,
      hargaPerLiter: fs.hargaPerLiter,
    });
    setOpenEditModal(true);
  };

  const buildPayload = () => {
    const standAwal = Number(form.standAwal);
    const standAkhir = Number(form.standAkhir);
    const hargaPerLiter = Number(form.hargaPerLiter);

    if (standAkhir < standAwal) {
      Swal.fire(
        "Error",
        "Stand akhir tidak boleh lebih kecil dari stand awal!",
        "error"
      );
      return null;
    }

    const jumlahLiter = standAkhir - standAwal;
    const totalHarga = jumlahLiter * hargaPerLiter;

    return {
      nozzleId: Number(form.nozzleId),
      tanggal: new Date(form.tanggal).toISOString(),
      shift: form.shift,
      standAwal,
      standAkhir,
      jumlahLiter,
      hargaPerLiter,
      totalHarga,
    };
  };

  const handleAdd = async () => {
    const payload = buildPayload();
    if (!payload) return;
    try {
      await API.post("/supervisor/fuel-sales", payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      Swal.fire("Berhasil", "Fuel Sale berhasil ditambahkan!", "success");
      setOpenAddModal(false);
      fetchFuelSales();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal tambah data!",
        "error"
      );
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const payload = buildPayload();
    if (!payload) return;
    try {
      await API.put(`/supervisor/fuel-sales/${editing.id}`, payload, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      Swal.fire("Berhasil", "Fuel Sale berhasil diupdate!", "success");
      setOpenEditModal(false);
      setEditing(null);
      fetchFuelSales();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal update data!",
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Yakin?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;
    try {
      await API.delete(`/supervisor/fuel-sales/${id}`);
      Swal.fire("Berhasil", "Data berhasil dihapus!", "success");
      fetchFuelSales();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal hapus data!",
        "error"
      );
    }
  };

  const renderFormFields = () => (
    <div className="space-y-2">
      <label>Nozzle</label>
      <select
        value={form.nozzleId}
        onChange={(e) => setField("nozzleId", e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">-- Pilih Nozzle --</option>
        {nozzles.map((n) => (
          <option key={n.id} value={n.id}>
            {n.kodeNozzle} ({n.tank?.fuel_type || "Unknown"})
          </option>
        ))}
      </select>

      <label>Tanggal</label>
      <Input
        type="datetime-local"
        value={form.tanggal}
        onChange={(e) => setField("tanggal", e.target.value)}
      />

      <label>Shift</label>
      <select
        value={form.shift}
        onChange={(e) => setField("shift", e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">-- Pilih Shift --</option>
        <option value="pagi">Pagi</option>
        <option value="siang">Siang</option>
        <option value="malam">Malam</option>
      </select>

      <label>Stand Awal</label>
      <Input
        type="number"
        value={form.standAwal}
        onChange={(e) => setField("standAwal", e.target.value)}
      />

      <label>Stand Akhir</label>
      <Input
        type="number"
        value={form.standAkhir}
        onChange={(e) => setField("standAkhir", e.target.value)}
      />

      <label>Harga Per Liter</label>
      <Input
        type="number"
        value={form.hargaPerLiter}
        onChange={(e) => setField("hargaPerLiter", e.target.value)}
      />
    </div>
  );
  
  // helper format rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fuel Sales</h1>
        <Button onClick={openAdd}>+ Tambah Data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Fuel Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : fuelSales.length === 0 ? (
            <p>Belum ada data fuel sales.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nozzle</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Stand Awal</TableHead>
                  <TableHead>Stand Akhir</TableHead>
                  <TableHead>Liter</TableHead>
                  <TableHead>Harga/Liter</TableHead>
                  <TableHead>Total Harga</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelSales.map((fs) => {
                  const nozzle = nozzles.find((n) => n.id === fs.nozzleId);
                  return (
                    <TableRow key={fs.id}>
                      <TableCell>
                        {nozzle
                          ? `${nozzle.kodeNozzle} (${
                              nozzle.tank?.fuel_type || "Unknown"
                            })`
                          : fs.nozzleId}
                      </TableCell>
                      <TableCell>
                        {new Date(fs.tanggal).toLocaleString()}
                      </TableCell>
                      <TableCell>{fs.shift}</TableCell>
                      <TableCell>{fs.standAwal}</TableCell>
                      <TableCell>{fs.standAkhir}</TableCell>
                      <TableCell>{fs.jumlahLiter}</TableCell>
                      <TableCell>{formatRupiah(fs.hargaPerLiter)}</TableCell>
                      <TableCell>{formatRupiah(fs.totalHarga)}</TableCell>

                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(fs)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(fs.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah */}
      {openAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Tambah Fuel Sale</h2>
            {renderFormFields()}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                Batal
              </Button>
              <Button onClick={handleAdd}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {openEditModal && editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Fuel Sale</h2>
            {renderFormFields()}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenEditModal(false);
                  setEditing(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={handleUpdate}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
