"use client";

export default function MediaPage() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-background-light/95 px-4 py-5 backdrop-blur dark:border-border-dark dark:bg-background-dark/95 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#181112] dark:text-slate-100">
              Media Library
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage gallery content shown on the public site.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-background-light px-4 pb-10 dark:bg-background-dark sm:px-6 lg:px-8 lg:pb-12">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gallery videos
            </p>
            <p className="mt-1 text-2xl font-black text-[#181112] dark:text-slate-100">
              2
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Day 1 and Day 2 highlight recordings.
            </p>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gallery images
            </p>
            <p className="mt-1 text-2xl font-black text-[#181112] dark:text-slate-100">
              —
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Image counts will appear here when gallery uploads are available.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-primary/5 bg-white p-6 shadow-sm dark:border-border-dark dark:bg-background-dark-soft">
            <h3 className="text-lg font-bold text-[#181112] dark:text-slate-100 mb-4">
              Last Year&apos;s Videos
            </h3>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex flex-col gap-1">
                <span className="font-semibold">
                  Day 1 – Social Night &amp; Opening
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 break-all">
                  https://youtube.com/live/bpJMqIvRIa8?feature=share
                </span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="font-semibold">
                  Day 2 – Scientific Sessions &amp; AGM
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 break-all">
                  https://youtube.com/live/m5M1OByylCY?feature=share
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Soon you&apos;ll be able to edit these links here so the public gallery always shows the latest media.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-6 shadow-sm dark:border-primary/30 dark:bg-primary/5">
            <h3 className="text-lg font-bold text-[#181112] dark:text-slate-100 mb-2">
              Gallery Images
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-4">
              Upload and organise gallery images for the public site. This area will be enabled when uploads are ready.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/10 dark:bg-background-dark-soft dark:text-primary dark:hover:bg-background-dark"
              >
                Upload images
              </button>
              <button
                type="button"
                className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary/80 hover:bg-primary/10"
              >
                Manage albums
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

