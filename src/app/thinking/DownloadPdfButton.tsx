"use client";

import { useState } from "react";

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 64;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export default function DownloadPdfButton() {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });

      let y = MARGIN;

      const ensureSpace = (needed: number) => {
        if (y + needed > PAGE_HEIGHT - MARGIN) {
          doc.addPage();
          y = MARGIN;
        }
      };

      const writeParagraph = (text: string) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines: string[] = doc.splitTextToSize(text, CONTENT_WIDTH);
        for (const line of lines) {
          ensureSpace(16);
          doc.text(line, MARGIN, y);
          y += 16;
        }
        y += 6;
      };

      const title = document.querySelector("h1")?.textContent ?? "Thinking and Understanding";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH);
      doc.text(titleLines, MARGIN, y);
      y += titleLines.length * 26 + 20;

      const content = document.getElementById("thinking-content");
      const nodes = content ? Array.from(content.children) : [];

      for (const node of nodes) {
        if (node.tagName === "TABLE" || node.querySelector?.("table")) continue;

        const text = node.textContent?.trim() ?? "";
        if (!text) continue;

        if (node.tagName === "H2") {
          ensureSpace(30);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          y += 14;
          doc.text(text.toUpperCase(), MARGIN, y);
          y += 16;
        } else if (node.tagName === "P") {
          writeParagraph(text);
        }
      }

      const table = content?.querySelector("table");
      if (table) {
        const headerCells = Array.from(table.querySelectorAll("thead th")).map(
          (el) => el.textContent?.trim() ?? ""
        );
        const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
          Array.from(tr.querySelectorAll("td")).map((el) => el.textContent?.trim() ?? "")
        );

        for (const row of rows) {
          ensureSpace(24);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(`Item ${row[0]}`, MARGIN, y);
          y += 16;

          for (let i = 1; i < row.length; i++) {
            const label = headerCells[i] ?? `Field ${i}`;
            const value = row[i];
            if (!value) continue;
            writeParagraph(`${label}: ${value}`);
          }
          y += 8;
        }
      }

      doc.save("nova-screening-thinking.pdf");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="rounded-full border border-[#6C3FD1] px-5 py-2.5 text-sm font-semibold text-[#6C3FD1] transition-colors hover:bg-[#6C3FD1]/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {generating ? "Preparing…" : "Download as PDF ↓"}
    </button>
  );
}
