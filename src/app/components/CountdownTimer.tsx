"use client";

import { useLayoutEffect, useState } from "react";

const TARGET = new Date("2026-09-25T00:00:00").getTime();

function getRemaining(now: number) {
  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CountdownTimer() {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining> | null>(null);

  useLayoutEffect(() => {
    const updateRemaining = () => setRemaining(getRemaining(Date.now()));
    
    updateRemaining();
    const id = setInterval(updateRemaining, 1000);
    return () => clearInterval(id);
  }, []);

  if (!remaining) {
    return (
      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
            <span className="text-2xl md:text-3xl font-black text-charcoal">--</span>
          </div>
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Days</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
            <span className="text-2xl md:text-3xl font-black text-charcoal">--</span>
          </div>
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Hours</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
            <span className="text-2xl md:text-3xl font-black text-charcoal">--</span>
          </div>
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Minutes</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
            <span className="text-2xl md:text-3xl font-black text-charcoal">--</span>
          </div>
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Seconds</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-12">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
          <span className="text-2xl md:text-3xl font-black text-charcoal">
            {remaining.days}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Days
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
          <span className="text-2xl md:text-3xl font-black text-charcoal">
            {pad(remaining.hours)}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Hours
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
          <span className="text-2xl md:text-3xl font-black text-charcoal">
            {pad(remaining.minutes)}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Minutes
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-primary flex items-center justify-center bg-white shadow-sm">
          <span className="text-2xl md:text-3xl font-black text-charcoal">
            {pad(remaining.seconds)}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Seconds
        </span>
      </div>
    </div>
  );
}
