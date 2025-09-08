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
  spbu?: { code_spbu?: string };
}

interface FuelQuality {
  id: number;
  tankId: number;
  tanggal: string;
  jamSebelumPenerimaan: string;
  densityObserved: number;
  suhuObserved: number;
  densityStd: number;
  tinggiAirTangkiPendam: number;
  jamPenerimaan: string;
  noMobilTangki: string;
  noPnbp: string;
  densityStdPnbp: number;
  densityObservedPenerimaan: number;
  suhuObservedPenerimaan: number;
  densityStdPenerimaan: number;
  selisihDensity: number;
  jamPascaPenerimaan: string;
  densityObservedPascaPenerimaan: number;
  suhuObservedPascaPenerimaan: number;
  densityStdPascaPenerimaan: number;
  tank: {
    code_tank: string;
    fuel_type: string;
    spbu: { code_spbu: string };
  };
}

export default function FuelQualitiesPage() {
  const [fuelQualities, setFuelQualities] = useState<FuelQuality[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editing, setEditing] = useState<FuelQuality | null>(null);
  const [form, setForm] = useState<any>({});

  const setField = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const fetchTanks = async () => {
    try {
      const res = await API.get("/supervisor/tanks");
      setTanks(res.data.data || []);
    } catch (err: any) {
      console.error("fetch tanks error:", err.response?.data || err.message);
    }
  };

  const fetchFuelQualities = async () => {
    setLoading(true);
    try {
      const res = await API.get("/supervisor/fuel-qualities");
      setFuelQualities(res.data.data || []);
    } catch (err: any) {
      Swal.fire("Error", "Gagal memuat data fuel qualities!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTanks();
    fetchFuelQualities();
  }, []);

  const resetForm = () => setForm({});

  const openAdd = () => {
    resetForm();
    setOpenAddModal(true);
  };

  const openEdit = (f: FuelQuality) => {
    setEditing(f);
    setForm({
      ...f,
      tankId: f.tankId, // ✅ simpan tankId langsung
      tanggal: f.tanggal.slice(0, 16), // untuk datetime-local
    });
    setOpenEditModal(true);
  };

  const handleAdd = async () => {
    try {
      const payload = {
        ...form,
        tankId: Number(form.tankId), // ✅ kirim hanya tankId
        tanggal: new Date(form.tanggal).toISOString(),
      };
      delete payload.tank; // ✅ hapus object tank kalau ada
      await API.post("/supervisor/fuel-qualities", payload);
      Swal.fire("Berhasil", "Fuel Quality berhasil ditambahkan!", "success");
      setOpenAddModal(false);
      fetchFuelQualities();
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
    try {
      const payload = {
        ...form,
        tankId: Number(form.tankId), // ✅ kirim hanya tankId
        tanggal: new Date(form.tanggal).toISOString(),
      };
      delete payload.tank; // ✅ hapus object tank kalau ada
      await API.put(`/supervisor/fuel-qualities/${editing.id}`, payload);
      Swal.fire("Berhasil", "Fuel Quality berhasil diupdate!", "success");
      setOpenEditModal(false);
      setEditing(null);
      fetchFuelQualities();
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
      await API.delete(`/supervisor/fuel-qualities/${id}`);
      Swal.fire("Berhasil", "Data berhasil dihapus!", "success");
      fetchFuelQualities();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal hapus data!",
        "error"
      );
    }
  };

  const renderFormFields = () => (
    <>
      <div>
        <label>Tank</label>
        <Select
          value={form.tankId ? String(form.tankId) : ""}
          onValueChange={(v) => setField("tankId", Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Tank" />
          </SelectTrigger>
          <SelectContent>
            {tanks.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.code_tank} ({t.fuel_type}) - {t.spbu?.code_spbu}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label>Tanggal</label>
        <Input
          type="datetime-local"
          value={form.tanggal || ""}
          onChange={(e) => setField("tanggal", e.target.value)}
        />
      </div>
      <div>
        <label>Jam Sebelum Penerimaan</label>
        <Input
          value={form.jamSebelumPenerimaan || ""}
          onChange={(e) => setField("jamSebelumPenerimaan", e.target.value)}
        />
      </div>
      <div>
        <label>Density Observed</label>
        <Input
          type="number"
          value={form.densityObserved || ""}
          onChange={(e) => setField("densityObserved", e.target.value)}
        />
      </div>
      <div>
        <label>Suhu Observed</label>
        <Input
          type="number"
          value={form.suhuObserved || ""}
          onChange={(e) => setField("suhuObserved", e.target.value)}
        />
      </div>
      <div>
        <label>Density Std</label>
        <Input
          type="number"
          value={form.densityStd || ""}
          onChange={(e) => setField("densityStd", e.target.value)}
        />
      </div>
      <div>
        <label>Tinggi Air Tangki</label>
        <Input
          type="number"
          value={form.tinggiAirTangkiPendam || ""}
          onChange={(e) => setField("tinggiAirTangkiPendam", e.target.value)}
        />
      </div>
      <div>
        <label>Jam Penerimaan</label>
        <Input
          value={form.jamPenerimaan || ""}
          onChange={(e) => setField("jamPenerimaan", e.target.value)}
        />
      </div>
      <div>
        <label>No Mobil Tangki</label>
        <Input
          value={form.noMobilTangki || ""}
          onChange={(e) => setField("noMobilTangki", e.target.value)}
        />
      </div>
      <div>
        <label>No PNBP</label>
        <Input
          value={form.noPnbp || ""}
          onChange={(e) => setField("noPnbp", e.target.value)}
        />
      </div>
      <div>
        <label>Density Std PNBP</label>
        <Input
          type="number"
          value={form.densityStdPnbp || ""}
          onChange={(e) => setField("densityStdPnbp", e.target.value)}
        />
      </div>
      <div>
        <label>Density Observed Penerimaan</label>
        <Input
          type="number"
          value={form.densityObservedPenerimaan || ""}
          onChange={(e) =>
            setField("densityObservedPenerimaan", e.target.value)
          }
        />
      </div>
      <div>
        <label>suhu Observed Penerimaan</label>
        <Input
          type="number"
          value={form.suhuObservedPenerimaan || ""}
          onChange={(e) => setField("suhuObservedPenerimaan", e.target.value)}
        />
      </div>
      <div>
        <label>density Std Penerimaan</label>
        <Input
          type="number"
          value={form.densityStdPenerimaan || ""}
          onChange={(e) => setField("densityStdPenerimaan", e.target.value)}
        />
      </div>
      <div>
        <label>Selisih Density</label>
        <Input
          type="number"
          value={form.selisihDensity || ""}
          onChange={(e) => setField("selisihDensity", e.target.value)}
        />
      </div>
      <div>
        <label>Jam Pasca Penerimaan</label>
        <Input
          value={form.jamPascaPenerimaan || ""}
          onChange={(e) => setField("jamPascaPenerimaan", e.target.value)}
        />
      </div>
      <div>
        <label>Density Observed Pasca Penerimaan</label>
        <Input
          type="number"
          value={form.densityObservedPascaPenerimaan || ""}
          onChange={(e) =>
            setField("densityObservedPascaPenerimaan", e.target.value)
          }
        />
      </div>
      <div>
        <label>Suhu Observed Pasca Penerimaan</label>
        <Input
          type="number"
          value={form.suhuObservedPascaPenerimaan || ""}
          onChange={(e) =>
            setField("suhuObservedPascaPenerimaan", e.target.value)
          }
        />
      </div>
      <div>
        <label>Density Std Pasca Penerimaan</label>
        <Input
          type="number"
          value={form.densityStdPascaPenerimaan || ""}
          onChange={(e) =>
            setField("densityStdPascaPenerimaan", e.target.value)
          }
        />
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fuel Qualities</h1>
        <Button onClick={openAdd}>+ Tambah Data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Fuel Qualities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : fuelQualities.length === 0 ? (
            <p>Belum ada data fuel qualities.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tank</TableHead>
                  <TableHead>SPBU</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Density Obs</TableHead>
                  <TableHead>Selisih Density</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelQualities.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.id}</TableCell>
                    <TableCell>
                      {f.tank.code_tank} ({f.tank.fuel_type})
                    </TableCell>
                    <TableCell>{f.tank.spbu.code_spbu}</TableCell>
                    <TableCell>
                      {new Date(f.tanggal).toLocaleString()}
                    </TableCell>
                    <TableCell>{f.densityObserved}</TableCell>
                    <TableCell>{f.selisihDensity}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(f)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(f.id)}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Tambah Fuel Quality</h2>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {renderFormFields()}
            </div>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl">
            <h2 className="text-xl font-semibold mb-4">Edit Fuel Quality</h2>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {renderFormFields()}
            </div>
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
