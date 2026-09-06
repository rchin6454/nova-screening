"use client";

export default function DownloadPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-[#6C3FD1] px-5 py-2.5 text-sm font-semibold text-[#6C3FD1] transition-colors hover:bg-[#6C3FD1]/10"
    >
      Download as PDF ↓
    </button>
  );
}
