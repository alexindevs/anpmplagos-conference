"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getHotelPassData, HotelPassData } from "@/lib/api";

export default function HotelPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<HotelPassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getHotelPassData(id);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-red-700 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-16 animate-spin rounded-full border-4 border-white/30 border-t-white mb-4" />
          <p className="text-white text-lg font-mono">Loading hotel reservations...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-red-700 to-red-900 flex items-center justify-center p-6">
        <div className="max-w-[50%] w-full bg-white/10 backdrop-blur-lg border border-white/20 p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-white/60 mb-4">error</span>
          <h1 className="text-2xl font-black text-white mb-2">Not Found</h1>
          <p className="text-white/80">
            {error || "Hotel reservation information could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-red-700 to-red-900 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10">
          <span className="material-symbols-outlined text-[300px] text-white">hotel</span>
        </div>
        <div className="absolute bottom-10 left-10">
          <span className="material-symbols-outlined text-[250px] text-white">bed</span>
        </div>
      </div>

      {/* Animated Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 4 + 2 + "px",
                height: Math.random() * 4 + 2 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                animationDelay: Math.random() * 5 + "s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 py-16">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <span className="text-white text-sm font-mono font-bold tracking-widest uppercase">
                Hotel Reservations
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-4">
              ANPMP Lagos Conference 2026
            </h1>
            <p className="text-xl text-white/90 font-mono">
              Accommodation Details
            </p>
          </div>

          {/* Guest Card */}
          <div className="bg-white shadow-2xl overflow-hidden animate-scale-in delay-200">
            {/* Guest Header */}
            <div className="bg-gradient-to-r from-charcoal to-warm-gray p-8 text-center">
              <div className="inline-block relative mb-6">
                <div className="size-28 md:size-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={data.avatar || "/anpmp-logo.jpg"}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <span className="material-symbols-outlined text-2xl text-primary">
                    hotel
                  </span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                {data.name}
              </h2>
              <p className="text-white/80 font-mono text-sm">Guest</p>
            </div>

            {/* Hotel Bookings */}
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-3xl text-primary">
                  bedroom_parent
                </span>
                <h3 className="text-2xl font-black text-charcoal">Your Reservations</h3>
              </div>

              {data.hotels.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">
                    hotel_class
                  </span>
                  <p className="text-warm-gray text-lg">No hotel reservations found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {data.hotels.map((hotel, hotelIndex) => (
                    <div
                      key={hotelIndex}
                      className="group relative bg-gradient-to-r from-mint-whisper to-white border-l-4 border-fresh-green p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="size-14 bg-fresh-green/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-fresh-green">
                              hotel
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h4 className="text-xl font-black text-charcoal leading-tight">
                              {hotel.hotelName}
                            </h4>
                            <div className="flex-shrink-0 bg-fresh-green/20 px-3 py-1 border border-fresh-green/30">
                              <span className="text-xs font-mono font-bold text-fresh-green uppercase tracking-wider">
                                Confirmed
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {hotel.rooms.map((room, roomIndex) => (
                              <div key={roomIndex} className="flex items-center gap-2 text-warm-gray">
                                <span className="material-symbols-outlined text-lg">bed</span>
                                <span className="font-semibold">{room.roomType}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                        <span className="material-symbols-outlined text-6xl text-fresh-green">
                          verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* QR Code Section */}
              <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex flex-col items-center mb-8">
                  <h3 className="text-xl font-black text-charcoal mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-primary">qr_code_2</span>
                    Hotel Reservation QR Code
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary">
                    <img
                      src={data.qrCodeUrl}
                      alt="Hotel Reservation QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <a
                    href={data.qrCodeUrl}
                    download={`hotel-pass-${data.name}.png`}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold shadow-lg hover:bg-red-700 transition-all hover:-translate-y-0.5"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download QR Code
                  </a>
                </div>
              </div>

              {/* Event Info */}
              <div className="pt-8 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-primary mt-1">
                      calendar_month
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-warm-gray mb-1">
                        Check-in Period
                      </p>
                      <p className="text-charcoal font-bold">September 15–16, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-primary mt-1">
                      location_on
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-warm-gray mb-1">
                        Location
                      </p>
                      <p className="text-charcoal font-bold">Ikeja, Lagos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-6 text-center border-t border-slate-200">
              <p className="text-sm text-warm-gray mb-2">
                Please present this confirmation at hotel check-in.
              </p>
              <p className="text-xs text-slate-500">
                For assistance, contact the conference support team.
              </p>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center mt-8 animate-fade-in delay-400">
            <p className="text-white/60 text-sm font-mono">
              Powered by ANPMP Lagos Conference System
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
      `}</style>
    </div>
  );
}
