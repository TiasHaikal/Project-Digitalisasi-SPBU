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
  fuel_type: string;
  code_tank?: string;
}

interface Pump {
  id: number;
  kodePompa: string;
}

interface Nozzle {
  id: number;
  kodeNozzle: string;
  pump: { kodePompa: string };
  tank: { fuel_type: string };
  createdAt: string;
  updatedAt: string;
}

export default function NozzlesPage() {
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // add states
  const [a_tankId, setA_TankId] = useState<number | "">("");
  const [a_pumpId, setA_PumpId] = useState<number | "">("");
  const [a_kodeNozzle, setA_KodeNozzle] = useState<string>("");

  // edit states
  const [editing, setEditing] = useState<Nozzle | null>(null);
  const [e_tankId, setE_TankId] = useState<number | "">("");
  const [e_pumpId, setE_PumpId] = useState<number | "">("");
  const [e_kodeNozzle, setE_KodeNozzle] = useState<string>("");

  // fetchers
  const fetchNozzles = async () => {
    setLoading(true);
    try {
      const res = await API.get("/supervisor/nozzles");
      setNozzles(res.data.data || res.data || []);
    } catch (err: any) {
      console.error("fetch nozzles error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal memuat data nozzles!", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTanks = async () => {
    try {
      const res = await API.get("/supervisor/tanks");
      setTanks(res.data.data || res.data || []);
    } catch (err: any) {
      console.error("fetch tanks error:", err.response?.data || err.message);
    }
  };

  const fetchPumps = async () => {
    try {
      const res = await API.get("/supervisor/pump-units");
      setPumps(res.data.data || res.data || []);
    } catch (err: any) {
      console.error("fetch pumps error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchNozzles();
    fetchTanks();
    fetchPumps();
  }, []);

  const resetAddForm = () => {
    setA_TankId("");
    setA_PumpId("");
    setA_KodeNozzle("");
  };

  const handleAdd = async () => {
    if (!a_tankId || !a_pumpId || !a_kodeNozzle) {
      Swal.fire("Oops!", "Semua field wajib diisi!", "warning");
      return;
    }

    try {
      const payload = {
        tankId: Number(a_tankId),
        pumpId: Number(a_pumpId),
        kodeNozzle: a_kodeNozzle,
      };
      await API.post("/supervisor/nozzles", payload);
      Swal.fire("Berhasil", "Nozzle berhasil ditambahkan!", "success");
      resetAddForm();
      setOpenAdd(false);
      fetchNozzles();
    } catch (err: any) {
      console.error("add nozzle error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal menambah nozzle!",
        "error"
      );
    }
  };

  const openEditModal = (n: Nozzle) => {
    setEditing(n);
    setE_KodeNozzle(n.kodeNozzle);

    // cari pumpId dari daftar pumps (cocokkan kodePompa)
    const foundPump = pumps.find((p) => p.kodePompa === n.pump.kodePompa);
    setE_PumpId(foundPump ? foundPump.id : "");

    // cari tankId dari daftar tanks (cocokkan fuel_type)
    const foundTank = tanks.find((t) => t.fuel_type === n.tank.fuel_type);
    setE_TankId(foundTank ? foundTank.id : "");

    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!e_tankId || !e_pumpId || !e_kodeNozzle) {
      Swal.fire("Oops!", "Semua field wajib diisi!", "warning");
      return;
    }

    try {
      const payload = {
        tankId: Number(e_tankId),
        pumpId: Number(e_pumpId),
        kodeNozzle: e_kodeNozzle,
      };
      await API.put(`/supervisor/nozzles/${editing.id}`, payload);
      Swal.fire("Berhasil", "Nozzle berhasil diupdate!", "success");
      setOpenEdit(false);
      setEditing(null);
      fetchNozzles();
    } catch (err: any) {
      console.error("update nozzle error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal update nozzle!",
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Yakin hapus?",
      text: "Data nozzle akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      await API.delete(`/supervisor/nozzles/${id}`);
      Swal.fire("Berhasil", "Nozzle berhasil dihapus!", "success");
      fetchNozzles();
    } catch (err: any) {
      console.error("delete nozzle error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal hapus nozzle!",
        "error"
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Nozzles</h1>
        <Button onClick={() => setOpenAdd(true)}>+ Tambah Nozzle</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Nozzles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : nozzles.length === 0 ? (
            <p>Tidak ada data nozzle.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Kode Nozzle</TableHead>
                  <TableHead>Pompa</TableHead>
                  <TableHead>Tank</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nozzles.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.id}</TableCell>
                    <TableCell>{n.kodeNozzle}</TableCell>
                    <TableCell>{n.pump.kodePompa}</TableCell>
                    <TableCell>{n.tank.fuel_type}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(n)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(n.id)}
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
      {openAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-6">Tambah Nozzle</h2>

            <div className="space-y-4">
              {/* Tank */}
              <div>
                <label className="text-sm font-medium">Tank</label>
                <Select
                  value={a_tankId ? String(a_tankId) : ""}
                  onValueChange={(v) => setA_TankId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tank" />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.code_tank || `Tank-${t.id}`} ({t.fuel_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pump */}
              <div>
                <label className="text-sm font-medium">Pump</label>
                <Select
                  value={a_pumpId ? String(a_pumpId) : ""}
                  onValueChange={(v) => setA_PumpId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pump" />
                  </SelectTrigger>
                  <SelectContent>
                    {pumps.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.kodePompa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kode Nozzle */}
              <div>
                <label className="text-sm font-medium">Kode Nozzle</label>
                <Input
                  value={a_kodeNozzle}
                  onChange={(e) => setA_KodeNozzle(e.target.value)}
                  placeholder="Masukkan kode nozzle"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setOpenAdd(false)}>
                Batal
              </Button>
              <Button onClick={handleAdd}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {openEdit && editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-6">Edit Nozzle</h2>

            <div className="space-y-4">
              {/* Tank */}
              <div>
                <label className="text-sm font-medium">Tank</label>
                <Select
                  value={e_tankId ? String(e_tankId) : ""}
                  onValueChange={(v) => setE_TankId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tank" />
                  </SelectTrigger>
                  <SelectContent>
                    {tanks.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.code_tank || `Tank-${t.id}`} ({t.fuel_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pump */}
              <div>
                <label className="text-sm font-medium">Pump</label>
                <Select
                  value={e_pumpId ? String(e_pumpId) : ""}
                  onValueChange={(v) => setE_PumpId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pump" />
                  </SelectTrigger>
                  <SelectContent>
                    {pumps.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.kodePompa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kode Nozzle */}
              <div>
                <label className="text-sm font-medium">Kode Nozzle</label>
                <Input
                  value={e_kodeNozzle}
                  onChange={(e) => setE_KodeNozzle(e.target.value)}
                  placeholder="Masukkan kode nozzle"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setOpenEdit(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
