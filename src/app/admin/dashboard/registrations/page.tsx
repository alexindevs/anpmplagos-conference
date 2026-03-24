"use client";

const STATS = [
  { label: "Total Registrations", value: "1,690" },
  { label: "Members", value: "1,240", valueClass: "text-primary" },
  { label: "Non-Members / Attendees", value: "450", valueClass: "text-secondary" },
  { label: "Exhibitors", value: "85", valueClass: "text-secondary" },
];

const ROWS = [
  { name: "Dr. Sarah Johnson", type: "Member", email: "sarah.j@hospital.ng", date: "2026-03-09", status: "Confirmed", statusClass: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary" },
  { name: "James Wilson", type: "Non-Member (Attendee)", email: "j.wilson@email.com", date: "2026-03-09", status: "Pending payment", statusClass: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" },
  { name: "MedTech Solutions Ltd", type: "Exhibitor", email: "jane@medtech.ng", date: "2026-03-08", status: "Confirmed", statusClass: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary" },
  { name: "Prof. Adebayo Kunle", type: "Speaker", email: "adebayo.k@uni.edu.ng", date: "2026-03-08", status: "Confirmed", statusClass: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary" },
  { name: "Hon. Chioma Okafor", type: "Special Guest", email: "chioma.okafor@lagos.gov.ng", date: "2026-03-07", status: "Confirmed", statusClass: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary" },
  { name: "HealthPlus HMO", type: "Sponsor", email: "partnerships@healthplus.ng", date: "2026-03-07", status: "Confirmed", statusClass: "bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary" },
];

export default function RegistrationsPage() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-slate-800 dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-slate-100">
              Registrations
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View and manage conference registrations
            </p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="relative min-w-[280px] flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full rounded-lg border-none bg-background-light py-2 pl-10 pr-4 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select className="cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white">
              <option value="">All types</option>
              <option>Member</option>
              <option>Non-Member / Attendee</option>
              <option>Speaker</option>
              <option>Special Guest</option>
              <option>Sponsor</option>
              <option>Exhibitor</option>
            </select>
            <select className="cursor-pointer rounded-lg border-none bg-background-light px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 dark:bg-background-dark-softer dark:text-white">
              <option value="">All statuses</option>
              <option>Confirmed</option>
              <option>Pending payment</option>
              <option>Cancelled</option>
            </select>
          </div>
          <button
            type="button"
            className="p-2 text-slate-400 dark:text-white/40 transition-colors hover:text-primary"
            title="Filters"
          >
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                {s.label}
              </p>
              <p className={`mt-1 text-2xl font-black text-[#181112] dark:text-white ${s.valueClass ?? ""}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/5 bg-white shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary/5 dark:border-border-dark dark:bg-background-dark-softer">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                    Date
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
                {ROWS.map((row) => (
                  <tr key={`${row.name}-${row.date}`} className="transition-colors hover:bg-primary/5 dark:hover:bg-background-dark-softer">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#181112] dark:text-white">{row.name}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">{row.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#181112] dark:text-white/90">{row.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-white/70">{row.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.statusClass}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center text-slate-400 dark:text-white/40 transition-colors hover:text-primary"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-background-dark-softer dark:text-white/90 dark:hover:bg-background-dark"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between bg-primary/5 px-6 py-4 dark:bg-background-dark-softer">
            <p className="text-sm text-slate-500 dark:text-white/50">
              Showing <span className="font-bold text-slate-700 dark:text-white/70">1</span> to{" "}
              <span className="font-bold text-slate-700 dark:text-white/70">5</span> of{" "}
              <span className="font-bold text-slate-700 dark:text-white/70">1,690</span> entries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded p-1 transition-colors hover:bg-white dark:hover:bg-background-dark-soft disabled:opacity-50 dark:disabled:opacity-30"
                disabled
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                className="size-8 rounded bg-primary text-xs font-bold text-white"
              >
                1
              </button>
              <button
                type="button"
                className="size-8 rounded text-xs font-medium transition-colors hover:bg-white dark:hover:bg-background-dark-soft dark:text-white/70"
              >
                2
              </button>
              <button
                type="button"
                className="rounded p-1 transition-colors hover:bg-white dark:hover:bg-background-dark-soft"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
