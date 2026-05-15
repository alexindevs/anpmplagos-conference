"use client";

import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:border-primary/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-bold text-charcoal pr-8">{question}</h3>
        <span 
          className={`material-symbols-outlined text-primary transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-6 pb-6 pt-0">
          <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
