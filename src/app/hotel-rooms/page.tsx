"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/use-auth-session";
import { isCompanyRegType } from "@/lib/auth-api";
import { hotelCartQueryKey, useAddHotelCartItem } from "@/hooks/use-hotel-cart";
import { ApiError, formatKoboToNaira, getAvailableHotelRooms, getMyBookedHotelRooms, type HotelRoom } from "@/lib/api";

const HOTEL_ROOMS_QUERY_KEY = ["hotel-rooms", "available"] as const;
const HOTEL_ROOMS_ME_QUERY_KEY = ["hotel-rooms", "me"] as const;

export default function HotelRoomsPage() {
  const queryClient = useQueryClient();
  const { data: user, isPending: sessionLoading } = useAuthSession();
  const [addingRoomId, setAddingRoomId] = useState<string | null>(null);

  const { data: rooms = [], isLoading, isError, error } = useQuery({
    queryKey: HOTEL_ROOMS_QUERY_KEY,
    queryFn: getAvailableHotelRooms,
    staleTime: 60 * 1000,
  });

  const isCompany = user ? isCompanyRegType(user) : false;

  const {
    data: myBookedRooms = [],
    isLoading: myBookingsLoading,
    isError: myBookingsError,
    error: myBookingsErr,
  } = useQuery({
    queryKey: HOTEL_ROOMS_ME_QUERY_KEY,
    queryFn: getMyBookedHotelRooms,
    enabled: !sessionLoading && !!user,
    staleTime: 60 * 1000,
  });

  const { totalSpentKobo, bookedCount } = useMemo(() => {
    const booked = myBookedRooms.filter((r) => r.isBooked);
    const total = booked.reduce((sum, r) => sum + (typeof r.price === "number" ? r.price : 0), 0);
    return { totalSpentKobo: total, bookedCount: booked.length };
  }, [myBookedRooms]);

  const groupedByHotel = useMemo(() => {
    const map = new Map<string, HotelRoom[]>();
    for (const r of rooms) {
      const key = r.hotelName || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rooms]);

  const addCartMutation = useAddHotelCartItem();

  const registrationOk =
    !user ||
    isCompany ||
    !user.registrationStatus ||
    user.registrationStatus.toLowerCase() === "registered";

  const handleAddToCart = (roomId: string) => {
    if (!user || !registrationOk) return;
    setAddingRoomId(roomId);
    addCartMutation.mutate(
      { type: "hotel_room", hotelRoomId: roomId },
      {
        onSettled: () => setAddingRoomId(null),
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: HOTEL_ROOMS_QUERY_KEY });
          void queryClient.invalidateQueries({ queryKey: HOTEL_ROOMS_ME_QUERY_KEY });
          void queryClient.invalidateQueries({ queryKey: hotelCartQueryKey });
        },
      }
    );
  };

  const cartErrorMessage =
    addCartMutation.error instanceof ApiError
      ? (addCartMutation.error.body?.message as string) || addCartMutation.error.message
      : addCartMutation.error instanceof Error
        ? addCartMutation.error.message
        : "Could not add to cart. Please try again.";

  return (
    <main className="flex-1 w-full min-h-0 overflow-y-auto bg-background-light">
      <section className="flex w-full max-w-[1280px] flex-col gap-6 px-4 py-10 sm:px-10 mx-auto">
        <div className="flex flex-col gap-3 border-l-4 border-primary bg-white p-6 shadow-sm rounded-r-lg sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#181112]">
              Conference hotel rooms
            </h1>
            <p className="text-lg leading-normal text-[#896165] mt-2">
              Reserve official partner hotel slots for ANPMP Lagos Conference 2026. Add rooms to your{" "}
              <strong className="text-[#181112]">hotel cart</strong>, then checkout once.
            </p>
          </div>
          {!sessionLoading && user && registrationOk && (
            <Link
              href="/hotel-rooms/cart"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-bold text-primary shadow-sm hover:bg-primary/10"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              Cart
            </Link>
          )}
        </div>

        {!sessionLoading && user && (
          <div className="rounded-xl border border-primary/15 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-primary/10 bg-primary/5 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-black text-[#181112] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">summarize</span>
                Your hotel bookings
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {myBookingsLoading && (
                <div className="flex items-center gap-3 py-4">
                  <div className="size-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                  <span className="text-sm text-slate-600">Loading your bookings…</span>
                </div>
              )}
              {myBookingsError && !myBookingsLoading && (
                <p className="text-sm text-red-700">
                  {myBookingsErr instanceof Error ? myBookingsErr.message : "Could not load your bookings."}
                </p>
              )}
              {!myBookingsLoading && !myBookingsError && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Rooms booked</p>
                      <p className="mt-1 text-3xl font-black text-[#181112]">{bookedCount}</p>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">Total spent on hotels</p>
                      <p className="mt-1 text-3xl font-black text-primary">{formatKoboToNaira(totalSpentKobo)}</p>
                    </div>
                  </div>
                  {myBookedRooms.length === 0 ? (
                    <p className="text-sm text-slate-600">
                      You don&apos;t have any completed hotel bookings yet. Add a room from the catalog below, then
                      checkout from your hotel cart when you&apos;re ready.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500">Hotel</th>
                            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500">Room type</th>
                            <th className="py-2.5 px-3 text-xs font-bold uppercase text-slate-500 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myBookedRooms.map((room) => (
                            <tr key={room.id} className="border-b border-slate-100 last:border-0">
                              <td className="py-2.5 px-3 font-semibold text-[#181112]">{room.hotelName || "—"}</td>
                              <td className="py-2.5 px-3 text-slate-600">{room.roomType}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-primary whitespace-nowrap">
                                {formatKoboToNaira(room.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {!sessionLoading && !user && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-bold">Members only.</span> Sign in with the account you used to register
            for the conference.{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Register
            </Link>{" "}
            if you don&apos;t have an account yet.
          </div>
        )}

        {addCartMutation.isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {cartErrorMessage}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3">
              <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
              <span className="text-slate-600">Loading available rooms…</span>
            </div>
          </div>
        )}

        {isError && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
            <p className="font-bold">Unable to load hotel rooms</p>
            <p className="mt-2 text-sm">
              {error instanceof Error ? error.message : "Please try again later."}
            </p>
          </div>
        )}

        {!isLoading && !isError && rooms.length === 0 && (
          <div className="rounded-xl border border-dashed border-primary/25 bg-white p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300">hotel</span>
            <p className="mt-4 text-lg font-bold text-[#181112]">No rooms available right now</p>
            <p className="mt-2 text-sm text-slate-600">
              Check back later — new inventory may be added by the organisers.
            </p>
          </div>
        )}

        {!isLoading && !isError && rooms.length > 0 && (
          <div className="flex flex-col gap-10">
            {groupedByHotel.map(([hotelName, hotelRooms]) => (
              <section key={hotelName} className="rounded-xl border border-primary/10 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-primary/10 bg-primary/5 px-4 py-4 sm:px-6">
                  <h2 className="text-xl font-black text-[#181112] flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">apartment</span>
                    {hotelName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {hotelRooms.length} slot{hotelRooms.length === 1 ? "" : "s"} available
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-primary/10 bg-slate-50/80">
                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Room type
                        </th>
                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Details
                        </th>
                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Price
                        </th>
                        <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotelRooms.map((room) => (
                        <tr
                          key={room.id}
                          className="border-b border-primary/10 last:border-b-0 hover:bg-primary/3 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm font-bold text-[#181112]">{room.roomType}</td>
                          <td className="py-4 px-4 text-sm text-slate-600 max-w-xs">
                            {room.description?.trim() ? room.description : "—"}
                          </td>
                          <td className="py-4 px-4 text-sm font-black text-primary whitespace-nowrap">
                            {formatKoboToNaira(room.price)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              disabled={!user || !registrationOk || addCartMutation.isPending}
                              onClick={() => handleAddToCart(room.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {addingRoomId === room.id && addCartMutation.isPending ? (
                                <>
                                  <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                  Adding…
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                                  Add to cart
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 max-w-3xl">
          All prices are shown in Nigerian Naira.
        </p>
      </section>
    </main>
  );
}
