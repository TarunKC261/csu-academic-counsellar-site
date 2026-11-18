/**
 * outreachLedger: what happened to each student in THIS browser session.
 *
 * planOutreach writes the draft, contactStudent marks it queued with a
 * reference, addToCalendar marks the proposed time. The caseload card and the
 * student card read it back, so "back to the list" shows what is already in
 * hand. Nothing here leaves the browser: this static site has no server, and
 * no message reaches a student from it.
 */

export interface DraftRecord {
    channel: 'text' | 'email';
    subject: string;
    body: string;
}

export interface LedgerEntry {
    draft?: DraftRecord;
    /** Reference of the queued message, e.g. CSUAC-4K7Q2M. */
    queuedRef?: string;
    /** Slot id (`YYYY-MM-DDTHH:MM`) Jordan proposed to the student. */
    proposedSlot?: string;
}

const ledger = new Map<string, LedgerEntry>();
const OUTBOX_KEY = 'csuac.outbox';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function ledgerFor(id: string): LedgerEntry {
    return ledger.get(id) ?? {};
}

function patch(id: string, next: Partial<LedgerEntry>): LedgerEntry {
    const merged = { ...ledgerFor(id), ...next };
    ledger.set(id, merged);
    return merged;
}

export function saveDraft(id: string, draft: DraftRecord): void {
    // A new draft replaces an older queued one only if the wording changed.
    const prev = ledgerFor(id);
    const changed = !prev.draft || prev.draft.body !== draft.body || prev.draft.subject !== draft.subject;
    patch(id, { draft, ...(changed ? { queuedRef: undefined } : {}) });
}

function reference(): string {
    const bytes = new Uint8Array(6);
    try {
        crypto.getRandomValues(bytes);
    } catch {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    let out = '';
    bytes.forEach((b) => {
        out += ALPHABET[b % ALPHABET.length];
    });
    return `CSUAC-${out}`;
}

/** Queue the current draft. Returns the reference (the same one if already queued). */
export function queueDraft(id: string, name: string): string {
    const prev = ledgerFor(id);
    if (prev.queuedRef) return prev.queuedRef;
    const ref = reference();
    patch(id, { queuedRef: ref });
    try {
        const box = JSON.parse(sessionStorage.getItem(OUTBOX_KEY) || '[]') as unknown[];
        box.push({ reference: ref, student: name, ...prev.draft, queuedAt: new Date().toISOString(), deliveredToStudent: false });
        sessionStorage.setItem(OUTBOX_KEY, JSON.stringify(box.slice(-20)));
    } catch {
        /* storage blocked: the reference on the card is the record */
    }
    return ref;
}

export function proposeSlot(id: string, slotId: string): void {
    patch(id, { proposedSlot: slotId });
}
