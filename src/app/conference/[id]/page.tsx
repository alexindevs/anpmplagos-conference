"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getConferencePassData, ApiError } from "@/lib/api";

interface ConferenceData {
  avatar: string;
  name: string;
  ticketType: "member" | "attendee" | "company";
  bio: string;
  qrCodeUrl: string;
  viewCount: number;
}

export default function ConferencePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ConferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewLimitReached, setViewLimitReached] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getConferencePassData(id);
        setData(result);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setViewLimitReached(true);
          setError("View limit reached for this conference pass");
        } else {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
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
      <div className="min-h-screen bg-gradient-to-br from-deep-forest via-medical-green to-fresh-green flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-16 animate-spin rounded-full border-4 border-white/30 border-t-white mb-4" />
          <p className="text-white text-lg font-mono">Loading conference details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-forest via-medical-green to-fresh-green flex items-center justify-center p-6">
        <div className=" w-full max-w-[80%] md:max-w-[50%] bg-white/10 backdrop-blur-lg border border-white/20 p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-white/60 mb-4">
            {viewLimitReached ? "visibility_off" : "error"}
          </span>
          <h1 className="text-2xl font-black text-white mb-2">
            {viewLimitReached ? "View Limit Reached" : "Not Found"}
          </h1>
          <p className="text-white/80">
            {error || "Conference attendee information could not be found."}
          </p>
          {viewLimitReached && (
            <p className="text-white/60 text-sm mt-4">
              Company conference passes have a maximum of 5 public views.
            </p>
          )}
        </div>
      </div>
    );
  }

  const ticketTypeLabel = data.ticketType === "member" ? "ANPMP Member" : data.ticketType === "attendee" ? "Non-Member" : "Company/Sponsor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-forest via-medical-green to-fresh-green relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-[200px] text-white font-serif font-bold">
          ANPMP Lagos
        </div>
        <div className="absolute bottom-20 right-10 text-[150px] text-white font-serif font-bold">
          2026
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Conference Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
              <span className="text-white text-sm font-mono font-bold tracking-widest uppercase">
                Official Conference Badge
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-4">
              ANPMP Lagos Annual General Meeting/Scientific Conference
            </h1>
            <p className="text-xl md:text-2xl font-serif italic text-white/90">
              Medical Negligence Laws: Separating Facts from Fiction
            </p>
          </div>

          {/* Attendee Card */}
          <div className="bg-white shadow-2xl overflow-hidden animate-scale-in delay-200">
            <div className="bg-gradient-to-r from-fresh-green to-medical-green p-8 text-center">
              <div className="inline-block relative mb-6">
                <div className="size-32 md:size-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={data.avatar || "/anpmp-logo.jpeg"}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <span className="material-symbols-outlined text-3xl text-fresh-green">
                    verified
                  </span>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                {data.name}
              </h2>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 border border-white/30">
                <span className="material-symbols-outlined text-white">badge</span>
                <span className="text-white font-bold tracking-wide">{ticketTypeLabel}</span>
              </div>
            </div>

            <div className="p-8 md:p-12">
              {/* Bio Section */}
              {data.bio && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-2xl text-medical-green">
                      person
                    </span>
                    <h3 className="text-xl font-black text-charcoal">About</h3>
                  </div>
                  <p className="text-warm-gray leading-relaxed text-lg pl-11">
                    {data.bio}
                  </p>
                </div>
              )}

              {/* QR Code Section */}
              <div className="border-t border-slate-200 pt-8">
                <div className="flex flex-col items-center">
                  <h3 className="text-xl font-black text-charcoal mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-fresh-green">qr_code_2</span>
                    Scan for Entry
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-fresh-green">
                    <img
                      src={data.qrCodeUrl}
                      alt="Conference QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <a
                    href={data.qrCodeUrl}
                    download={`conference-pass-${data.name}.png`}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-fresh-green text-white font-bold shadow-lg hover:bg-medical-green transition-all hover:-translate-y-0.5"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download QR Code
                  </a>
                </div>
              </div>

              {/* Event Details */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-fresh-green mt-1">
                      calendar_month
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-warm-gray mb-1">
                        Event Dates
                      </p>
                      <p className="text-charcoal font-bold">September 16–17, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-fresh-green mt-1">
                      location_on
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-warm-gray mb-1">
                        Venue
                      </p>
                      <p className="text-charcoal font-bold">Welcome Centre Hotels, Ikeja</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-mint-whisper p-6 text-center border-t border-fresh-green/20">
              <p className="text-sm text-warm-gray">
                This is an official conference badge. Please present at registration.
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
    </div>
  );
}
