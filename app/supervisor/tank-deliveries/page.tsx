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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tank {
  id: number;
  code_tank: string;
  fuel_type: string;
  capacity?: number;
  current_volume?: number;
  spbu?: { code_spbu?: string };
}

interface TankDelivery {
  id: number;
  tankId: number;
  deliveryDate: string;
  shift: string;
  stockAwalShift: number;
  noMobilTangki: string;
  noPnbp?: string;
  volumePnbp?: number;
  jamPenerimaan?: string;
  volumeSebelumPenerimaan?: number;
  volumePenerimaanAktual?: number;
  lebihKurangPenerimaan?: number;
  pengeluaranTotalisatorNozzle?: number;
  stockAkhirPembukuan?: number;
  stockAkhirAktual?: number;
  lebihKurangOperasional?: number;
  tank: {
    id: number;
    code_tank: string;
    fuel_type: string;
    spbu: { code_spbu: string };
  };
}

const shifts = ["PAGI", "SIANG", "MALAM"];

export default function TankDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<TankDelivery[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // add form states
  const [a_tankId, setA_TankId] = useState<number | "">("");
  const [a_deliveryDate, setA_DeliveryDate] = useState<string>("");
  const [a_shift, setA_Shift] = useState<string>("");
  const [a_stockAwalShift, setA_StockAwalShift] = useState<number | "">("");
  const [a_noMobilTangki, setA_NoMobilTangki] = useState<string>("");
  const [a_noPnbp, setA_NoPnbp] = useState<string>("");
  const [a_volumePnbp, setA_VolumePnbp] = useState<number | "">("");
  const [a_jamPenerimaan, setA_JamPenerimaan] = useState<string>("");
  const [a_volumeSebelumPenerimaan, setA_VolumeSebelumPenerimaan] = useState<
    number | ""
  >("");
  const [a_volumePenerimaanAktual, setA_VolumePenerimaanAktual] = useState<
    number | ""
  >("");
  const [a_pengeluaranTotalisatorNozzle, setA_PengeluaranTotalisatorNozzle] =
    useState<number | "">("");
  const [a_stockAkhirPembukuan, setA_StockAkhirPembukuan] = useState<
    number | ""
  >("");
  const [a_stockAkhirAktual, setA_StockAkhirAktual] = useState<number | "">("");

  // edit form states
  const [editing, setEditing] = useState<TankDelivery | null>(null);
  const [e_tankId, setE_TankId] = useState<number | "">("");
  const [e_deliveryDate, setE_DeliveryDate] = useState<string>("");
  const [e_shift, setE_Shift] = useState<string>("");
  const [e_stockAwalShift, setE_StockAwalShift] = useState<number | "">("");
  const [e_noMobilTangki, setE_NoMobilTangki] = useState<string>("");
  const [e_noPnbp, setE_NoPnbp] = useState<string>("");
  const [e_volumePnbp, setE_VolumePnbp] = useState<number | "">("");
  const [e_jamPenerimaan, setE_JamPenerimaan] = useState<string>("");
  const [e_volumeSebelumPenerimaan, setE_VolumeSebelumPenerimaan] = useState<
    number | ""
  >("");
  const [e_volumePenerimaanAktual, setE_VolumePenerimaanAktual] = useState<
    number | ""
  >("");
  const [e_pengeluaranTotalisatorNozzle, setE_PengeluaranTotalisatorNozzle] =
    useState<number | "">("");
  const [e_stockAkhirPembukuan, setE_StockAkhirPembukuan] = useState<
    number | ""
  >("");
  const [e_stockAkhirAktual, setE_StockAkhirAktual] = useState<number | "">("");

  // helper -> convert ISO to input[type=datetime-local] local value
  const isoToLocalInput = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return local;
  };

  // derived values (add)
  const add_lebihKurangPenerimaan =
    Number(a_volumePenerimaanAktual || 0) - Number(a_volumePnbp || 0);
  const add_lebihKurangOperasional =
    Number(a_stockAkhirAktual || 0) - Number(a_stockAkhirPembukuan || 0);

  // derived values (edit)
  const edit_lebihKurangPenerimaan =
    Number(e_volumePenerimaanAktual || 0) - Number(e_volumePnbp || 0);
  const edit_lebihKurangOperasional =
    Number(e_stockAkhirAktual || 0) - Number(e_stockAkhirPembukuan || 0);

  const fetchTanks = async () => {
    try {
      const res = await API.get("/supervisor/tanks");
      setTanks(res.data.data || res.data || []);
    } catch (err: any) {
      console.error("fetch tanks error:", err.response?.data || err.message);
    }
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await API.get("/supervisor/tank-deliveries");
      setDeliveries(res.data.data || res.data || []);
    } catch (err: any) {
      console.error(
        "fetch deliveries error:",
        err.response?.data || err.message
      );
      Swal.fire("Error", "Gagal memuat data tank-deliveries!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTanks();
    fetchDeliveries();
  }, []);

  const resetAddForm = () => {
    setA_TankId("");
    setA_DeliveryDate("");
    setA_Shift("");
    setA_StockAwalShift("");
    setA_NoMobilTangki("");
    setA_NoPnbp("");
    setA_VolumePnbp("");
    setA_JamPenerimaan("");
    setA_VolumeSebelumPenerimaan("");
    setA_VolumePenerimaanAktual("");
    setA_PengeluaranTotalisatorNozzle("");
    setA_StockAkhirPembukuan("");
    setA_StockAkhirAktual("");
  };

  const openEdit = (d: TankDelivery) => {
    setEditing(d);
    setOpenEditModal(true);
    // populate edit fields
    setE_TankId(d.tankId);
    setE_DeliveryDate(isoToLocalInput(d.deliveryDate));
    setE_Shift(d.shift || "");
    setE_StockAwalShift(d.stockAwalShift ?? "");
    setE_NoMobilTangki(d.noMobilTangki || "");
    setE_NoPnbp(d.noPnbp || "");
    setE_VolumePnbp(d.volumePnbp ?? "");
    setE_JamPenerimaan(d.jamPenerimaan || "");
    setE_VolumeSebelumPenerimaan(d.volumeSebelumPenerimaan ?? "");
    setE_VolumePenerimaanAktual(d.volumePenerimaanAktual ?? "");
    setE_PengeluaranTotalisatorNozzle(d.pengeluaranTotalisatorNozzle ?? "");
    setE_StockAkhirPembukuan(d.stockAkhirPembukuan ?? "");
    setE_StockAkhirAktual(d.stockAkhirAktual ?? "");
  };

  const handleAddDelivery = async () => {
    if (
      !a_tankId ||
      !a_deliveryDate ||
      !a_shift ||
      !a_noMobilTangki ||
      a_stockAwalShift === ""
    ) {
      Swal.fire(
        "Oops!",
        "Field Tank, Tanggal, Shift, Stock Awal Shift, dan No Mobil Tangki wajib diisi!",
        "warning"
      );
      return;
    }

    try {
      const payload = {
        tankId: Number(a_tankId),
        deliveryDate: new Date(a_deliveryDate).toISOString(),
        shift: a_shift,
        stockAwalShift: Number(a_stockAwalShift),
        noMobilTangki: a_noMobilTangki,
        noPnbp: a_noPnbp || undefined,
        volumePnbp: a_volumePnbp ? Number(a_volumePnbp) : undefined,
        jamPenerimaan: a_jamPenerimaan || undefined,
        volumeSebelumPenerimaan: a_volumeSebelumPenerimaan
          ? Number(a_volumeSebelumPenerimaan)
          : undefined,
        volumePenerimaanAktual: a_volumePenerimaanAktual
          ? Number(a_volumePenerimaanAktual)
          : undefined,
        lebihKurangPenerimaan:
          Number(a_volumePenerimaanAktual || 0) - Number(a_volumePnbp || 0),
        pengeluaranTotalisatorNozzle: a_pengeluaranTotalisatorNozzle
          ? Number(a_pengeluaranTotalisatorNozzle)
          : undefined,
        stockAkhirPembukuan: a_stockAkhirPembukuan
          ? Number(a_stockAkhirPembukuan)
          : undefined,
        stockAkhirAktual: a_stockAkhirAktual
          ? Number(a_stockAkhirAktual)
          : undefined,
        lebihKurangOperasional:
          Number(a_stockAkhirAktual || 0) - Number(a_stockAkhirPembukuan || 0),
      };

      await API.post("/supervisor/tank-deliveries", payload);
      Swal.fire("Berhasil", "Tank Delivery berhasil ditambahkan!", "success");
      resetAddForm();
      setOpenAddModal(false);
      fetchDeliveries();
    } catch (err: any) {
      console.error("add delivery error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal menambahkan tank-delivery!",
        "error"
      );
    }
  };

  const handleUpdateDelivery = async () => {
    if (!editing) return;

    try {
      const payload = {
        tankId: Number(e_tankId),
        deliveryDate: e_deliveryDate
          ? new Date(e_deliveryDate).toISOString()
          : editing.deliveryDate,
        shift: e_shift,
        stockAwalShift: Number(e_stockAwalShift),
        noMobilTangki: e_noMobilTangki,
        noPnbp: e_noPnbp || undefined,
        volumePnbp: e_volumePnbp ? Number(e_volumePnbp) : undefined,
        jamPenerimaan: e_jamPenerimaan || undefined,
        volumeSebelumPenerimaan: e_volumeSebelumPenerimaan
          ? Number(e_volumeSebelumPenerimaan)
          : undefined,
        volumePenerimaanAktual: e_volumePenerimaanAktual
          ? Number(e_volumePenerimaanAktual)
          : undefined,
        lebihKurangPenerimaan:
          Number(e_volumePenerimaanAktual || 0) - Number(e_volumePnbp || 0),
        pengeluaranTotalisatorNozzle: e_pengeluaranTotalisatorNozzle
          ? Number(e_pengeluaranTotalisatorNozzle)
          : undefined,
        stockAkhirPembukuan: e_stockAkhirPembukuan
          ? Number(e_stockAkhirPembukuan)
          : undefined,
        stockAkhirAktual: e_stockAkhirAktual
          ? Number(e_stockAkhirAktual)
          : undefined,
        lebihKurangOperasional:
          Number(e_stockAkhirAktual || 0) - Number(e_stockAkhirPembukuan || 0),
      };

      await API.put(`/supervisor/tank-deliveries/${editing.id}`, payload);
      Swal.fire("Berhasil", "Tank Delivery berhasil diupdate!", "success");
      setOpenEditModal(false);
      setEditing(null);
      fetchDeliveries();
    } catch (err: any) {
      console.error(
        "update delivery error:",
        err.response?.data || err.message
      );
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal update tank-delivery!",
        "error"
      );
    }
  };

  const handleDeleteDelivery = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Tank Delivery ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!confirmDelete.isConfirmed) return;

    try {
      await API.delete(`/supervisor/tank-deliveries/${id}`);
      Swal.fire("Berhasil", "Tank Delivery berhasil dihapus!", "success");
      fetchDeliveries();
    } catch (err: any) {
      console.error(
        "delete delivery error:",
        err.response?.data || err.message
      );
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal menghapus tank-delivery!",
        "error"
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Tank Deliveries</h1>
        <Button onClick={() => setOpenAddModal(true)}>+ Tambah Delivery</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Tank Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : deliveries.length === 0 ? (
            <p>Tidak ada data tank-delivery.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tank</TableHead>
                  <TableHead>SPBU</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>No Mobil Tangki</TableHead>
                  <TableHead>Volume PNBP</TableHead>
                  <TableHead>Volume Penerimaan</TableHead>
                  <TableHead>Stock Akhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>
                      {d.tank.code_tank} ({d.tank.fuel_type})
                    </TableCell>
                    <TableCell>{d.tank.spbu.code_spbu}</TableCell>
                    <TableCell>
                      {new Date(d.deliveryDate).toLocaleString()}
                    </TableCell>
                    <TableCell>{d.shift}</TableCell>
                    <TableCell>{d.noMobilTangki}</TableCell>
                    <TableCell>{d.volumePnbp ?? "-"}</TableCell>
                    <TableCell>{d.volumePenerimaanAktual ?? "-"}</TableCell>
                    <TableCell>{d.stockAkhirAktual ?? "-"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(d)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDelivery(d.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah */}
      {openAddModal && (
        <div className="fixed inset-0 flex items-start sm:items-center justify-center pt-10 sm:pt-0 overflow-y-auto backdrop-blur-sm bg-white/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-5xl">
            <h2 className="text-xl font-semibold mb-6">Tambah Tank Delivery</h2>

            <div className="space-y-4">
              {/* Tank */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">Tank</label>
                <Select
                  value={a_tankId ? String(a_tankId) : ""}
                  onValueChange={(v) => setA_TankId(v ? Number(v) : "")}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih Tank" />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.code_tank} ({t.fuel_type}){" "}
                        {t.spbu?.code_spbu ? `- SPBU ${t.spbu.code_spbu}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Delivery */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Tanggal Delivery
                </label>
                <Input
                  type="datetime-local"
                  value={a_deliveryDate}
                  onChange={(e) => setA_DeliveryDate(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Shift */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">Shift</label>
                <Select value={a_shift} onValueChange={(v) => setA_Shift(v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Awal Shift */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Stock Awal Shift
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={a_stockAwalShift}
                  onChange={(e) =>
                    setA_StockAwalShift(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* No Mobil Tangki */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  No Mobil Tangki
                </label>
                <Input
                  value={a_noMobilTangki}
                  onChange={(e) => setA_NoMobilTangki(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* No PNBP */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">No PNBP</label>
                <Input
                  value={a_noPnbp}
                  onChange={(e) => setA_NoPnbp(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Volume PNBP */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">Volume PNBP</label>
                <Input
                  type="number"
                  step="0.01"
                  value={a_volumePnbp}
                  onChange={(e) =>
                    setA_VolumePnbp(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Jam Penerimaan */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Jam Penerimaan
                </label>
                <Input
                  type="time"
                  value={a_jamPenerimaan}
                  onChange={(e) => setA_JamPenerimaan(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Volume Sebelum Penerimaan */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Volume Sebelum Penerimaan
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={a_volumeSebelumPenerimaan}
                  onChange={(e) =>
                    setA_VolumeSebelumPenerimaan(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Volume Penerimaan Aktual */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Volume Penerimaan Aktual
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={a_volumePenerimaanAktual}
                  onChange={(e) =>
                    setA_VolumePenerimaanAktual(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-600">
                Lebih/Kurang Penerimaan:{" "}
                <b>
                  {Number(a_volumePenerimaanAktual || 0) -
                    Number(a_volumePnbp || 0)}
                </b>
              </p>

              {/* Pengeluaran Totalisator Nozzle */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Pengeluaran Totalisator Nozzle
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={a_pengeluaranTotalisatorNozzle}
                  onChange={(e) =>
                    setA_PengeluaranTotalisatorNozzle(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Stock Akhir Pembukuan */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Stock Akhir Pembukuan
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={a_stockAkhirPembukuan}
                  onChange={(e) =>
                    setA_StockAkhirPembukuan(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Stock Akhir Aktual */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Stock Akhir Aktual
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={a_stockAkhirAktual}
                  onChange={(e) =>
                    setA_StockAkhirAktual(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-600">
                Lebih/Kurang Operasional:{" "}
                <b>
                  {Number(a_stockAkhirAktual || 0) -
                    Number(a_stockAkhirPembukuan || 0)}
                </b>
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  resetAddForm();
                  setOpenAddModal(false);
                }}
              >
                Batal
              </Button>
              <Button onClick={handleAddDelivery}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {openEditModal && editing && (
        <div className="fixed inset-0 flex items-start sm:items-center justify-center pt-10 sm:pt-0 overflow-y-auto backdrop-blur-sm bg-white/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-5xl">
            <h2 className="text-xl font-semibold mb-6">Edit Tank Delivery</h2>

            <div className="space-y-4">
              {/* Tank */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">Tank</label>
                <Select
                  value={e_tankId ? String(e_tankId) : ""}
                  onValueChange={(v) => setE_TankId(v ? Number(v) : "")}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih Tank" />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.code_tank} ({t.fuel_type}){" "}
                        {t.spbu?.code_spbu ? `- SPBU ${t.spbu.code_spbu}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Delivery */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Tanggal Delivery
                </label>
                <Input
                  type="datetime-local"
                  value={e_deliveryDate}
                  onChange={(e) => setE_DeliveryDate(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Shift */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">Shift</label>
                <Select value={e_shift} onValueChange={(v) => setE_Shift(v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Awal Shift */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Stock Awal Shift
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={e_stockAwalShift}
                  onChange={(e) =>
                    setE_StockAwalShift(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* No Mobil Tangki */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  No Mobil Tangki
                </label>
                <Input
                  value={e_noMobilTangki}
                  onChange={(e) => setE_NoMobilTangki(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* No PNBP */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">No PNBP</label>
                <Input
                  value={e_noPnbp}
                  onChange={(e) => setE_NoPnbp(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Volume PNBP */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">Volume PNBP</label>
                <Input
                  type="number"
                  step="0.01"
                  value={e_volumePnbp}
                  onChange={(e) =>
                    setE_VolumePnbp(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Jam Penerimaan */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Jam Penerimaan
                </label>
                <Input
                  type="time"
                  value={e_jamPenerimaan}
                  onChange={(e) => setE_JamPenerimaan(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Volume Sebelum Penerimaan */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Volume Sebelum Penerimaan
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={e_volumeSebelumPenerimaan}
                  onChange={(e) =>
                    setE_VolumeSebelumPenerimaan(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Volume Penerimaan Aktual */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Volume Penerimaan Aktual
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={e_volumePenerimaanAktual}
                  onChange={(e) =>
                    setE_VolumePenerimaanAktual(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-600">
                Lebih/Kurang Penerimaan:{" "}
                <b>
                  {Number(e_volumePenerimaanAktual || 0) -
                    Number(e_volumePnbp || 0)}
                </b>
              </p>

              {/* Pengeluaran Totalisator Nozzle */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Pengeluaran Totalisator Nozzle
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={e_pengeluaranTotalisatorNozzle}
                  onChange={(e) =>
                    setE_PengeluaranTotalisatorNozzle(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Stock Akhir Pembukuan */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Stock Akhir Pembukuan
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={e_stockAkhirPembukuan}
                  onChange={(e) =>
                    setE_StockAkhirPembukuan(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>

              {/* Stock Akhir Aktual */}
              <div className="flex items-center gap-4">
                <label className="w-48 text-sm font-medium">
                  Stock Akhir Aktual
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={e_stockAkhirAktual}
                  onChange={(e) =>
                    setE_StockAkhirAktual(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-600">
                Lebih/Kurang Operasional:{" "}
                <b>
                  {Number(e_stockAkhirAktual || 0) -
                    Number(e_stockAkhirPembukuan || 0)}
                </b>
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenEditModal(false);
                  setEditing(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={handleUpdateDelivery}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
