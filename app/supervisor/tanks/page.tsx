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
  capacity: number;
  current_volume: number;
}

const fuelTypes = [
  "PERTALITE",
  "PERTAMAX",
  "PERTAMAX_TURBO",
  "BIOSOLAR",
  "DEXLITE",
  "PERTAMINA_DEX",
];

export default function TanksPage() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [editTank, setEditTank] = useState<Tank | null>(null);

  const [codeTank, setCodeTank] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [currentVolume, setCurrentVolume] = useState<number | "">("");

  const fetchTanks = async () => {
    try {
      const res = await API.get("/supervisor/tanks");
      setTanks(res.data.data || res.data);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Swal.fire("Error", "Gagal memuat data tank!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTanks();
  }, []);

  const handleAddTank = async () => {
    if (!codeTank || !fuelType || !capacity || !currentVolume) {
      Swal.fire("Oops!", "Semua field wajib diisi!", "warning");
      return;
    }
    try {
      await API.post("/supervisor/tanks", {
        code_tank: codeTank,
        fuel_type: fuelType,
        capacity: Number(capacity),
        current_volume: Number(currentVolume),
      });
      Swal.fire("Berhasil", "Tank berhasil ditambahkan!", "success");
      resetForm();
      setOpenAddModal(false);
      fetchTanks();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Swal.fire("Error", "Gagal menambahkan tank!", "error");
    }
  };

  const handleUpdateTank = async () => {
    if (!editTank) return;

    try {
      await API.put(`/supervisor/tanks/${editTank.id}`, {
        code_tank: editTank.code_tank,
        fuel_type: editTank.fuel_type,
        capacity: Number(editTank.capacity),
        current_volume: Number(editTank.current_volume),
      });
      Swal.fire("Berhasil", "Tank berhasil diupdate!", "success");
      setEditTank(null);
      fetchTanks();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Swal.fire("Error", "Gagal update tank!", "error");
    }
  };

  const handleDeleteTank = async (id: number) => {
    const confirmDelete = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Tank ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await API.delete(`/supervisor/tanks/${id}`);
      Swal.fire("Berhasil", "Tank berhasil dihapus!", "success");
      fetchTanks();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      Swal.fire("Error", "Gagal menghapus tank!", "error");
    }
  };

  const resetForm = () => {
    setCodeTank("");
    setFuelType("");
    setCapacity("");
    setCurrentVolume("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Tanks</h1>
        <Button onClick={() => setOpenAddModal(true)}>+ Tambah Tank</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Tanks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : tanks.length === 0 ? (
            <p>Tidak ada data tank.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Code Tank</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Current Volume</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tanks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.code_tank}</TableCell>
                    <TableCell>{t.fuel_type}</TableCell>
                    <TableCell>{t.capacity}</TableCell>
                    <TableCell>{t.current_volume}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditTank(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTank(t.id)}
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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Tambah Tank</h2>
            <Input
              placeholder="Code Tank"
              value={codeTank.toUpperCase()}
              onChange={(e) => setCodeTank(e.target.value)}
            />

            <Select value={fuelType} onValueChange={(val) => setFuelType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map((ft) => (
                  <SelectItem key={ft} value={ft}>
                    {ft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Current Volume"
              value={currentVolume}
              onChange={(e) => setCurrentVolume(Number(e.target.value))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenAddModal(false)}>
                Batal
              </Button>
              <Button onClick={handleAddTank}>Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editTank && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Edit Tank</h2>
            <Input
              placeholder="Code Tank"
              value={editTank.code_tank.toLocaleUpperCase()}
              onChange={(e) =>
                setEditTank({ ...editTank, code_tank: e.target.value })
              }
            />

            <Select
              value={editTank.fuel_type}
              onValueChange={(val) =>
                setEditTank({ ...editTank, fuel_type: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map((ft) => (
                  <SelectItem key={ft} value={ft}>
                    {ft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Capacity"
              value={editTank.capacity}
              onChange={(e) =>
                setEditTank({ ...editTank, capacity: Number(e.target.value) })
              }
            />
            <Input
              type="number"
              placeholder="Current Volume"
              value={editTank.current_volume}
              onChange={(e) =>
                setEditTank({
                  ...editTank,
                  current_volume: Number(e.target.value),
                })
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditTank(null)}>
                Batal
              </Button>
              <Button onClick={handleUpdateTank}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
