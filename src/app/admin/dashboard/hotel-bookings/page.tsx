"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  deleteAdminHotelRoom,
  formatKoboToNaira,
  getAdminHotelRooms,
  getAdminHotelRoomsStats,
  patchAdminHotelRoomReserve,
  patchAdminHotelRoomUnreserve,
  postAdminHotelRoom,
  postAdminHotelRoomsBulk,
  type HotelRoom,
} from "@/lib/api";

const PAGE_SIZE = 50;
import { AddRoomSlotsModal } from "./components/AddRoomSlotsModal";

const ADMIN_HOTEL_ROOMS_KEY = ["admin", "hotel-rooms"] as const;

function parseNairaInputToKobo(raw: string): number {
  const cleaned = raw.replace(/[,₦\s]/g, "").trim();
  const naira = parseFloat(cleaned);
  if (!Number.isFinite(naira) || naira < 0) {
    throw new Error("Enter a valid price in Naira (e.g. 120000).");
  }
  return Math.round(naira * 100);
}

function slotStatus(room: HotelRoom): { label: string; className: string } {
  if (room.isBooked) {
    return {
      label: "Booked",
      className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    };
  }
  if (room.isReserved) {
    return {
      label: "Reserved",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    };
  }
  return {
    label: "Available",
    className: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary",
  };
}

export default function HotelBookingsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "available" | "reserved" | "booked">("");
  const [filterRoomType, setFilterRoomType] = useState("");
  const [page, setPage] = useState(1);

  const tableQueryKey = [...ADMIN_HOTEL_ROOMS_KEY, page, search, filterRoomType, filterStatus] as const;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: tableQueryKey,
    queryFn: () => getAdminHotelRooms({
      page,
      pageSize: PAGE_SIZE,
      hotelName: search || undefined,
      roomType: filterRoomType || undefined,
      status: filterStatus || undefined,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: [...ADMIN_HOTEL_ROOMS_KEY, "stats"],
    queryFn: getAdminHotelRoomsStats,
  });

  const rooms: HotelRoom[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const roomTypeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rooms) {
      if (r.roomType?.trim()) set.add(r.roomType.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  const resetPage = () => setPage(1);

  const invalidateHotelQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_HOTEL_ROOMS_KEY });
    void queryClient.invalidateQueries({ queryKey: ["hotel-rooms", "available"] });
  };

  const paged = rooms;

  const createMutation = useMutation({
    mutationFn: async (data: {
      hotel: string;
      roomLabel: string;
      quantity: number;
      price: string;
      notes: string;
    }) => {
      const priceKobo = parseNairaInputToKobo(data.price);
      const hotelName = data.hotel.trim();
      const roomType = data.roomLabel.trim();
      const description = data.notes?.trim() || null;
      const quantity = Math.max(1, data.quantity);
      if (!hotelName || !roomType) {
        throw new Error("Hotel and room type are required.");
      }
      if (quantity === 1) {
        return postAdminHotelRoom({ hotelName, roomType, price: priceKobo, description });
      }
      return postAdminHotelRoomsBulk({
        hotelName,
        roomType,
        quantity,
        price: priceKobo,
        description,
      });
    },
    onSuccess: () => {
      invalidateHotelQueries();
      setModalOpen(false);
    },
  });

  const reserveMutation = useMutation({
    mutationFn: (id: string) => patchAdminHotelRoomReserve(id),
    onSuccess: invalidateHotelQueries,
  });

  const unreserveMutation = useMutation({
    mutationFn: (id: string) => patchAdminHotelRoomUnreserve(id),
    onSuccess: invalidateHotelQueries,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminHotelRoom(id),
    onSuccess: invalidateHotelQueries,
  });

  const handleAddSlots = (data: {
    hotel: string;
    roomLabel: string;
    quantity: number;
    price: string;
    notes: string;
  }) => {
    createMutation.mutate(data);
  };

  const listError =
    error instanceof ApiError
      ? (error.body?.message as string) || error.message
      : error instanceof Error
        ? error.message
        : null;

  const actionError =
    createMutation.error instanceof ApiError
      ? (createMutation.error.body?.message as string) || createMutation.error.message
      : createMutation.error instanceof Error
        ? createMutation.error.message
        : reserveMutation.error instanceof ApiError
          ? (reserveMutation.error.body?.message as string) || reserveMutation.error.message
          : unreserveMutation.error instanceof ApiError
            ? (unreserveMutation.error.body?.message as string) || unreserveMutation.error.message
            : deleteMutation.error instanceof ApiError
              ? (deleteMutation.error.body?.message as string) || deleteMutation.error.message
              : null;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal dark:text-white">
              Hotel Bookings
            </h2>
            <p className="text-sm text-slate-500 dark:text-white/50">
              Manage room slots, holds, and inventory. Members, attendees, and companies book and pay online from the
              hotel rooms page.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add room slots
          </button>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        {(listError || actionError) && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {listError || actionError}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 w-full flex-1 sm:min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search by hotel or room type…"
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={filterRoomType}
              onChange={(e) => { setFilterRoomType(e.target.value); resetPage(); }}
              className="w-full min-w-0 cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white sm:w-auto sm:min-w-[160px]"
            >
              <option value="">All room types</option>
              {roomTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); resetPage(); }}
              className="w-full min-w-0 cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white sm:w-auto"
            >
              <option value="">All statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="booked">Booked</option>
            </select>
            <button
              type="button"
              onClick={() => void refetch()}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark-softer sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Total slots
            </p>
            <p className="mt-1 text-2xl font-black text-charcoal dark:text-white">{stats?.total ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Available
            </p>
            <p className="mt-1 text-2xl font-black text-secondary">{stats?.available ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
              Reserved
            </p>
            <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{stats?.reserved ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Booked</p>
            <p className="mt-1 text-2xl font-black text-primary">{stats?.booked ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">Revenue</p>
            <p className="mt-1 text-2xl font-black text-secondary">
              {stats?.revenueKobo != null ? formatKoboToNaira(stats.revenueKobo) : "—"}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Hotel
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Room type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5 dark:divide-border-dark">
                {isLoading && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      Loading hotel rooms…
                    </td>
                  </tr>
                )}
                {isError && !isLoading && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-primary" colSpan={5}>
                      Could not load rooms. Check admin permissions and try again.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && paged.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-slate-500 dark:text-white/50" colSpan={5}>
                      No slots match your filters.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  paged.map((row) => {
                    const st = slotStatus(row);
                    const canDelete = !row.isBooked;
                    const canReserve = !row.isBooked && !row.isReserved;
                    const canUnreserve = row.isReserved && !row.isBooked;
                    return (
                      <tr key={row.id} className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer">
                        <td className="px-6 py-4 text-sm font-medium text-charcoal dark:text-white/90">
                          {row.hotelName}
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal dark:text-white/90">{row.roomType}</td>
                        <td className="px-6 py-4 text-sm text-charcoal dark:text-white/90 whitespace-nowrap">
                          {formatKoboToNaira(row.price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            {canReserve && (
                              <button
                                type="button"
                                disabled={reserveMutation.isPending}
                                onClick={() => reserveMutation.mutate(row.id)}
                                className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                              >
                                Reserve
                              </button>
                            )}
                            {canUnreserve && (
                              <button
                                type="button"
                                disabled={unreserveMutation.isPending}
                                onClick={() => unreserveMutation.mutate(row.id)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-border-dark dark:text-slate-200 dark:hover:bg-background-dark-softer"
                              >
                                Unreserve
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => {
                                  if (window.confirm("Delete this slot? Only unbooked slots can be removed.")) {
                                    deleteMutation.mutate(row.id);
                                  }
                                }}
                                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between bg-primary/5 px-6 py-4 dark:bg-background-dark-softer">
            <p className="text-sm text-slate-500 dark:text-white/50">
              Showing{" "}
              <span className="font-bold text-slate-700 dark:text-white/70">
                {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of <span className="font-bold text-slate-700 dark:text-white/70">{total}</span> slots
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark-softer"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500 dark:text-white/50">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-border-dark dark:text-white/70 dark:hover:bg-background-dark-softer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddRoomSlotsModal
        open={modalOpen}
        onClose={() => !createMutation.isPending && setModalOpen(false)}
        isSubmitting={createMutation.isPending}
        onSubmit={handleAddSlots}
      />
    </>
  );
}
