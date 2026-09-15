/* ==========================================================================
   hk-pdf.js — branded PDF transcript for the Digital Twin
   Loaded on demand (only when the visitor presses Save), so it costs
   nothing on first paint. Layout lives in one place so the design can be
   revised without touching the chat code.

   Design v1: A4 portrait, white ground for printing, navy logo top-left,
   one vermilion rule, the site's accent used for the twin's name only.
   ========================================================================== */

'use strict';

/** Brand + palette. These mirror hk.css so the PDF looks like the site. */
const BRAND = {
    name: 'HK Borah',
    role: 'Business Architect',
    site: 'hkborah.com',
    email: 'email@hkborah.com',
    promise: 'Advice is free. Execution is not.',
    logoPath: 'assets/logos/hk-borah-logo-navy.png',
};

const INK = [22, 22, 24];        // body text
const MUTED = [122, 122, 128];   // captions, footers
const ACCENT = [220, 72, 62];    // oklch(60.1% .201 21.5) = #dc483e

const PAGE = { w: 595.28, h: 841.89 };  // A4 in points
const MARGIN = 56;
const CONTENT_W = PAGE.w - MARGIN * 2;

/** Loads the navy logo for light backgrounds and returns a data URL. */
async function loadLogo() {
    try {
        const response = await fetch(BRAND.logoPath);
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null; // the PDF still renders without the mark
    }
}

/**
 * Reduces markdown to clean plain text for print.
 * The twin replies in markdown; printing raw asterisks and hashes looks sloppy.
 */
function toPlainText(markdown) {
    return String(markdown)
        .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-z]*\n?/gi, '').trim())
        .replace(/`([^`]+)`/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '\u2022 ')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        .replace(/\s+$/, '');
}

/**
 * Builds and downloads the transcript PDF.
 * @param {Array<{role: string, content: string}>} history Full conversation.
 * @param {Object} [options]
 * @param {string} [options.dateLabel] Human date for the header.
 */
export async function generateChatPdf(history, options = {}) {
    // jsPDF is a UMD bundle: importing it installs window.jspdf.
    await import('./vendor/jspdf.umd.min.js');
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const dateLabel = options.dateLabel || new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    doc.setProperties({
        title: `Conversation with the ${BRAND.name} Digital Twin`,
        author: BRAND.name,
        subject: 'Digital Twin transcript',
        creator: BRAND.site,
    });

    const logo = await loadLogo();

    let y = MARGIN;

    /* ---- Masthead ---------------------------------------------------- */
    if (logo) {
        // Navy logo is 1000x400; render at 132pt wide to keep the header light.
        doc.addImage(logo, 'PNG', MARGIN, y, 132, 52.8);
    } else {
        doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(...INK);
        doc.text(BRAND.name, MARGIN, y + 20);
    }

    // Right-aligned document label
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...MUTED);
    doc.text('CONVERSATION TRANSCRIPT', PAGE.w - MARGIN, y + 12, { align: 'right' });
    doc.text(dateLabel.toUpperCase(), PAGE.w - MARGIN, y + 24, { align: 'right' });

    y += 66;

    // Signature vermilion rule
    doc.setDrawColor(...ACCENT).setLineWidth(1.4);
    doc.line(MARGIN, y, PAGE.w - MARGIN, y);
    y += 26;

    /* ---- Title block -------------------------------------------------- */
    doc.setFont('helvetica', 'bold').setFontSize(17).setTextColor(...INK);
    doc.text('Conversation with the Digital Twin', MARGIN, y);
    y += 20;

    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...MUTED);
    doc.text(`A digital version of how ${BRAND.name} thinks. Trained on his published frameworks.`, MARGIN, y);
    y += 28;

    /* ---- Transcript ---------------------------------------------------- */
    const lineHeight = 13.2;

    const ensureSpace = (needed) => {
        if (y + needed > PAGE.h - MARGIN - 34) {
            doc.addPage();
            y = MARGIN;
        }
    };

    history.forEach((message, index) => {
        const isUser = message.role === 'user';
        const label = isUser ? 'YOU' : BRAND.name.toUpperCase();
        const body = toPlainText(message.content).trim();
        if (!body) return;

        const lines = doc.splitTextToSize(body, CONTENT_W - 12);

        // Keep a speaker's label with at least its first two lines
        ensureSpace(lineHeight * 3 + 10);

        if (index > 0) y += 6;

        doc.setFont('helvetica', 'bold').setFontSize(7.5);
        doc.setTextColor(...(isUser ? MUTED : ACCENT));
        doc.text(label, MARGIN, y);
        y += lineHeight;

        doc.setFont('helvetica', 'normal').setFontSize(10);
        doc.setTextColor(...INK);

        for (const line of lines) {
            ensureSpace(lineHeight);
            doc.text(line, MARGIN + 12, y);
            y += lineHeight;
        }
    });

    /* ---- Closing note -------------------------------------------------- */
    ensureSpace(70);
    y += 18;
    doc.setDrawColor(216, 216, 220).setLineWidth(0.7);
    doc.line(MARGIN, y, PAGE.w - MARGIN, y);
    y += 16;

    doc.setFont('helvetica', 'italic').setFontSize(8).setTextColor(...MUTED);
    const note = doc.splitTextToSize(
        'Generated on the visitor\u2019s own device from this conversation. General business advice ' +
        'based on published frameworks, not professional or legal advice. ' +
        `Questions: ${BRAND.email}.`,
        CONTENT_W,
    );
    doc.text(note, MARGIN, y);

    /* ---- Running footer on every page --------------------------------- */
    const pageCount = doc.internal.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...MUTED);
        doc.text(BRAND.promise, MARGIN, PAGE.h - 30);
        doc.text(
            `${BRAND.site}  |  ${BRAND.role}  |  Page ${page} of ${pageCount}`,
            PAGE.w - MARGIN, PAGE.h - 30, { align: 'right' },
        );
    }

    const stamp = new Date().toISOString().slice(0, 10);
    doc.save(`HK-Borah-Digital-Twin-${stamp}.pdf`);
}
