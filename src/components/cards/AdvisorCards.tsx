'use client';

import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock, Mail, MessageCircle } from '@/lib/icons';
import { useLocale } from '@/lib/i18n/useLocale';
import { dict } from '@/lib/i18n/dict';
import { formatSlot } from '@/data/advisors';
import { useVoiceSessionStore } from '@/lib/stores/voice-session-store';

/**
 * AdvisorCards: the four counselor cards (ported from Venkat's build, restyled
 * to the CSU look of the navigator's AidCard and JourneyCard).
 *
 *   caseload-list   Jordan's flagged students, worst first. Tap a row to ask why.
 *   student-brief   One student: score, the signals exactly as recorded, the next
 *                   step, and the channel the student agreed to.
 *   outreach-plan   The draft message on the allowed channel, and its status:
 *                   "Draft, not sent" or "Queued" with a reference.
 *   slot-picker     Jordan's open advising slots this week. Tap one to propose it.
 *
 * Drawn only by the counselor site functions from src/data/advisors.ts, never
 * written by the model. Nothing is truncated that a decision depends on: the
 * card scrolls instead. Every tap sends its sentence to Natalie through
 * tellAgent, so a tap is Jordan's answer exactly like speech.
 *
 * Card chrome is translated (en, es, zh, tl, vi, de). Student data (names,
 * signals, next steps, drafts) stays as recorded.
 */

/* ── Strings ──────────────────────────────────────────────────────────────── */

const T = dict({
    en: {
        band: { High: 'High', Elevated: 'Elevated', Watch: 'Watch' } as Record<string, string>,
        caseloadTitle: 'Your caseload this week',
        caseloadSummary: (flagged: number, total: number, onTrack: number) =>
            `${flagged} of ${total} advisees flagged · ${onTrack} on track`,
        textOk: 'Text OK',
        emailOnly: 'Email only',
        queued: 'Queued',
        proposed: 'Time proposed',
        tapName: 'Tap a name or just say it.',
        whyPhrase: (name: string) => `Why is ${name} flagged?`,
        risk: 'Risk',
        whyFlagged: 'Why flagged',
        personal: 'Personal',
        nextStep: 'Next step',
        contact: 'Contact',
        textOnFile: 'Text on file',
        emailOnFile: 'Email on file',
        noTexts: (first: string) => `${first} has not agreed to texts, so email only.`,
        queuedRef: (ref: string) => `Message queued · ${ref}`,
        proposedAt: (when: string) => `Time proposed: ${when}`,
        draftBtn: 'Draft a message',
        draftPhrase: (first: string) => `Draft a message to ${first}.`,
        timeBtn: 'Find a time',
        timePhrase: (first: string) => `Find a time to meet ${first}.`,
        backBtn: 'Back to the list',
        backPhrase: 'Back to the list.',
        messageTo: (name: string) => `Message to ${name}`,
        statusDraft: 'Draft · not sent',
        statusQueued: 'Queued',
        draftHelp: 'Nothing goes out until you say yes.',
        queuedHelp: (first: string) => `It has not reached ${first} yet.`,
        reference: 'Reference',
        channel: 'Channel',
        textMessage: 'Text message',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        queueBtn: 'Yes, queue it',
        queuePhrase: (first: string) => `Yes, queue it for ${first}.`,
        rewordBtn: 'Change the wording',
        rewordPhrase: (first: string) => `Change the wording for ${first}.`,
        slotsTitle: 'Your open times this week',
        slotsFor: (first: string) => `Open times for ${first}`,
        place: 'In person (Humanities 211) or Zoom',
        slotsHelp: (first?: string) =>
            first ? `Pick one to propose. Nothing is booked until ${first} says yes.` : 'Pick one to propose. Nothing is booked until the student says yes.',
        proposedTag: 'Proposed',
        proposePhrase: (when: string, first?: string) => (first ? `Propose ${when} to ${first}.` : `Propose ${when}.`),
    },
    es: {
        band: { High: 'Alto', Elevated: 'Elevado', Watch: 'Vigilar' },
        caseloadTitle: 'Tus estudiantes esta semana',
        caseloadSummary: (flagged: number, total: number, onTrack: number) =>
            `${flagged} de ${total} estudiantes marcados · ${onTrack} sin problemas`,
        textOk: 'Acepta SMS',
        emailOnly: 'Solo correo',
        queued: 'En cola',
        proposed: 'Hora propuesta',
        tapName: 'Toca un nombre o dilo.',
        whyPhrase: (name: string) => `¿Por qué está marcado ${name}?`,
        risk: 'Riesgo',
        whyFlagged: 'Por qué está marcado',
        personal: 'Personal',
        nextStep: 'Siguiente paso',
        contact: 'Contacto',
        textOnFile: 'SMS registrado',
        emailOnFile: 'Correo registrado',
        noTexts: (first: string) => `${first} no aceptó mensajes de texto, así que solo correo.`,
        queuedRef: (ref: string) => `Mensaje en cola · ${ref}`,
        proposedAt: (when: string) => `Hora propuesta: ${when}`,
        draftBtn: 'Redactar mensaje',
        draftPhrase: (first: string) => `Redacta un mensaje para ${first}.`,
        timeBtn: 'Buscar una hora',
        timePhrase: (first: string) => `Busca una hora para reunirme con ${first}.`,
        backBtn: 'Volver a la lista',
        backPhrase: 'Volver a la lista.',
        messageTo: (name: string) => `Mensaje para ${name}`,
        statusDraft: 'Borrador · no enviado',
        statusQueued: 'En cola',
        draftHelp: 'No sale nada hasta que digas que sí.',
        queuedHelp: (first: string) => `Todavía no le ha llegado a ${first}.`,
        reference: 'Referencia',
        channel: 'Canal',
        textMessage: 'Mensaje de texto',
        email: 'Correo',
        subject: 'Asunto',
        message: 'Mensaje',
        queueBtn: 'Sí, ponlo en cola',
        queuePhrase: (first: string) => `Sí, ponlo en cola para ${first}.`,
        rewordBtn: 'Cambiar el texto',
        rewordPhrase: (first: string) => `Cambia el texto para ${first}.`,
        slotsTitle: 'Tus horas libres esta semana',
        slotsFor: (first: string) => `Horas libres para ${first}`,
        place: 'En persona (Humanities 211) o por Zoom',
        slotsHelp: (first?: string) =>
            first ? `Elige una para proponerla. No hay nada reservado hasta que ${first} diga que sí.` : 'Elige una para proponerla. No hay nada reservado hasta que el estudiante diga que sí.',
        proposedTag: 'Propuesta',
        proposePhrase: (when: string, first?: string) => (first ? `Propón ${when} a ${first}.` : `Propón ${when}.`),
    },
    zh: {
        band: { High: '高', Elevated: '较高', Watch: '关注' },
        caseloadTitle: '本周你的学生',
        caseloadSummary: (flagged: number, total: number, onTrack: number) => `${total} 名学生中 ${flagged} 名被标记 · ${onTrack} 名正常`,
        textOk: '可发短信',
        emailOnly: '仅限邮件',
        queued: '已排队',
        proposed: '已提议时间',
        tapName: '点一个名字，或直接说出来。',
        whyPhrase: (name: string) => `为什么 ${name} 被标记？`,
        risk: '风险',
        whyFlagged: '标记原因',
        personal: '个人',
        nextStep: '下一步',
        contact: '联系方式',
        textOnFile: '已登记短信',
        emailOnFile: '已登记邮箱',
        noTexts: (first: string) => `${first} 未同意接收短信，只能发邮件。`,
        queuedRef: (ref: string) => `消息已排队 · ${ref}`,
        proposedAt: (when: string) => `已提议时间：${when}`,
        draftBtn: '起草消息',
        draftPhrase: (first: string) => `给 ${first} 起草一条消息。`,
        timeBtn: '找个时间',
        timePhrase: (first: string) => `帮我找个时间和 ${first} 见面。`,
        backBtn: '返回列表',
        backPhrase: '返回列表。',
        messageTo: (name: string) => `发给 ${name} 的消息`,
        statusDraft: '草稿 · 未发送',
        statusQueued: '已排队',
        draftHelp: '你说可以之前，什么都不会发出。',
        queuedHelp: (first: string) => `${first} 还没有收到。`,
        reference: '编号',
        channel: '方式',
        textMessage: '短信',
        email: '邮件',
        subject: '主题',
        message: '内容',
        queueBtn: '好，加入队列',
        queuePhrase: (first: string) => `好，把给 ${first} 的消息加入队列。`,
        rewordBtn: '修改措辞',
        rewordPhrase: (first: string) => `修改给 ${first} 的消息措辞。`,
        slotsTitle: '本周你的空闲时间',
        slotsFor: (first: string) => `可与 ${first} 见面的时间`,
        place: '面谈（Humanities 211）或 Zoom',
        slotsHelp: (first?: string) =>
            first ? `选一个时间来提议。${first} 同意之前不会预订。` : '选一个时间来提议。学生同意之前不会预订。',
        proposedTag: '已提议',
        proposePhrase: (when: string, first?: string) => (first ? `向 ${first} 提议 ${when}。` : `提议 ${when}。`),
    },
    tl: {
        band: { High: 'Mataas', Elevated: 'Medyo mataas', Watch: 'Bantayan' },
        caseloadTitle: 'Mga estudyante mo ngayong linggo',
        caseloadSummary: (flagged: number, total: number, onTrack: number) =>
            `${flagged} sa ${total} advisee ang na-flag · ${onTrack} ang maayos`,
        textOk: 'Puwedeng i-text',
        emailOnly: 'Email lang',
        queued: 'Naka-queue',
        proposed: 'May inalok na oras',
        tapName: 'I-tap ang pangalan o sabihin ito.',
        whyPhrase: (name: string) => `Bakit na-flag si ${name}?`,
        risk: 'Panganib',
        whyFlagged: 'Bakit na-flag',
        personal: 'Personal',
        nextStep: 'Susunod na hakbang',
        contact: 'Contact',
        textOnFile: 'May numero para sa text',
        emailOnFile: 'May email sa record',
        noTexts: (first: string) => `Hindi pumayag si ${first} sa text, kaya email lang.`,
        queuedRef: (ref: string) => `Naka-queue ang mensahe · ${ref}`,
        proposedAt: (when: string) => `Inalok na oras: ${when}`,
        draftBtn: 'Gumawa ng mensahe',
        draftPhrase: (first: string) => `Gumawa ng mensahe para kay ${first}.`,
        timeBtn: 'Maghanap ng oras',
        timePhrase: (first: string) => `Maghanap ng oras para makipagkita kay ${first}.`,
        backBtn: 'Bumalik sa listahan',
        backPhrase: 'Bumalik sa listahan.',
        messageTo: (name: string) => `Mensahe para kay ${name}`,
        statusDraft: 'Draft · hindi pa naipadala',
        statusQueued: 'Naka-queue',
        draftHelp: 'Walang lalabas hangga’t hindi ka pumapayag.',
        queuedHelp: (first: string) => `Hindi pa ito natatanggap ni ${first}.`,
        reference: 'Reference',
        channel: 'Paraan',
        textMessage: 'Text message',
        email: 'Email',
        subject: 'Paksa',
        message: 'Mensahe',
        queueBtn: 'Oo, i-queue',
        queuePhrase: (first: string) => `Oo, i-queue para kay ${first}.`,
        rewordBtn: 'Baguhin ang mensahe',
        rewordPhrase: (first: string) => `Baguhin ang mensahe para kay ${first}.`,
        slotsTitle: 'Mga bakante mong oras ngayong linggo',
        slotsFor: (first: string) => `Mga bakanteng oras para kay ${first}`,
        place: 'Personal (Humanities 211) o sa Zoom',
        slotsHelp: (first?: string) =>
            first ? `Pumili ng isa para ialok. Walang naka-book hangga’t hindi pumapayag si ${first}.` : 'Pumili ng isa para ialok. Walang naka-book hangga’t hindi pumapayag ang estudyante.',
        proposedTag: 'Inalok',
        proposePhrase: (when: string, first?: string) => (first ? `Ialok ang ${when} kay ${first}.` : `Ialok ang ${when}.`),
    },
    vi: {
        band: { High: 'Cao', Elevated: 'Khá cao', Watch: 'Theo dõi' },
        caseloadTitle: 'Sinh viên của bạn tuần này',
        caseloadSummary: (flagged: number, total: number, onTrack: number) =>
            `${flagged}/${total} sinh viên bị đánh dấu · ${onTrack} bình thường`,
        textOk: 'Nhắn tin được',
        emailOnly: 'Chỉ email',
        queued: 'Đã xếp hàng',
        proposed: 'Đã đề xuất giờ',
        tapName: 'Chạm vào một tên hoặc nói tên đó.',
        whyPhrase: (name: string) => `Tại sao ${name} bị đánh dấu?`,
        risk: 'Rủi ro',
        whyFlagged: 'Lý do bị đánh dấu',
        personal: 'Cá nhân',
        nextStep: 'Bước tiếp theo',
        contact: 'Liên lạc',
        textOnFile: 'Có số nhắn tin',
        emailOnFile: 'Có email trong hồ sơ',
        noTexts: (first: string) => `${first} chưa đồng ý nhận tin nhắn, nên chỉ gửi email.`,
        queuedRef: (ref: string) => `Tin nhắn đã xếp hàng · ${ref}`,
        proposedAt: (when: string) => `Giờ đã đề xuất: ${when}`,
        draftBtn: 'Soạn tin nhắn',
        draftPhrase: (first: string) => `Soạn tin nhắn cho ${first}.`,
        timeBtn: 'Tìm giờ gặp',
        timePhrase: (first: string) => `Tìm giờ để gặp ${first}.`,
        backBtn: 'Quay lại danh sách',
        backPhrase: 'Quay lại danh sách.',
        messageTo: (name: string) => `Tin nhắn cho ${name}`,
        statusDraft: 'Bản nháp · chưa gửi',
        statusQueued: 'Đã xếp hàng',
        draftHelp: 'Không có gì được gửi cho đến khi bạn đồng ý.',
        queuedHelp: (first: string) => `${first} chưa nhận được.`,
        reference: 'Mã tham chiếu',
        channel: 'Kênh',
        textMessage: 'Tin nhắn',
        email: 'Email',
        subject: 'Tiêu đề',
        message: 'Nội dung',
        queueBtn: 'Đồng ý, xếp hàng',
        queuePhrase: (first: string) => `Đồng ý, xếp hàng tin nhắn cho ${first}.`,
        rewordBtn: 'Sửa nội dung',
        rewordPhrase: (first: string) => `Sửa nội dung tin nhắn cho ${first}.`,
        slotsTitle: 'Giờ trống của bạn tuần này',
        slotsFor: (first: string) => `Giờ trống để gặp ${first}`,
        place: 'Gặp trực tiếp (Humanities 211) hoặc Zoom',
        slotsHelp: (first?: string) =>
            first ? `Chọn một giờ để đề xuất. Chưa đặt lịch cho đến khi ${first} đồng ý.` : 'Chọn một giờ để đề xuất. Chưa đặt lịch cho đến khi sinh viên đồng ý.',
        proposedTag: 'Đã đề xuất',
        proposePhrase: (when: string, first?: string) => (first ? `Đề xuất ${when} cho ${first}.` : `Đề xuất ${when}.`),
    },
    de: {
        band: { High: 'Hoch', Elevated: 'Erhöht', Watch: 'Beobachten' },
        caseloadTitle: 'Deine Studierenden diese Woche',
        caseloadSummary: (flagged: number, total: number, onTrack: number) =>
            `${flagged} von ${total} markiert · ${onTrack} ohne Auffälligkeiten`,
        textOk: 'SMS erlaubt',
        emailOnly: 'Nur E-Mail',
        queued: 'In der Warteschlange',
        proposed: 'Termin vorgeschlagen',
        tapName: 'Tippe auf einen Namen oder sag ihn.',
        whyPhrase: (name: string) => `Warum ist ${name} markiert?`,
        risk: 'Risiko',
        whyFlagged: 'Warum markiert',
        personal: 'Persönlich',
        nextStep: 'Nächster Schritt',
        contact: 'Kontakt',
        textOnFile: 'Nummer für SMS hinterlegt',
        emailOnFile: 'E-Mail hinterlegt',
        noTexts: (first: string) => `${first} hat SMS nicht zugestimmt, also nur E-Mail.`,
        queuedRef: (ref: string) => `Nachricht in der Warteschlange · ${ref}`,
        proposedAt: (when: string) => `Vorgeschlagener Termin: ${when}`,
        draftBtn: 'Nachricht entwerfen',
        draftPhrase: (first: string) => `Entwirf eine Nachricht an ${first}.`,
        timeBtn: 'Termin finden',
        timePhrase: (first: string) => `Finde einen Termin mit ${first}.`,
        backBtn: 'Zurück zur Liste',
        backPhrase: 'Zurück zur Liste.',
        messageTo: (name: string) => `Nachricht an ${name}`,
        statusDraft: 'Entwurf · nicht gesendet',
        statusQueued: 'In der Warteschlange',
        draftHelp: 'Nichts geht raus, bevor du zustimmst.',
        queuedHelp: (first: string) => `Sie ist noch nicht bei ${first} angekommen.`,
        reference: 'Referenz',
        channel: 'Kanal',
        textMessage: 'SMS',
        email: 'E-Mail',
        subject: 'Betreff',
        message: 'Nachricht',
        queueBtn: 'Ja, einreihen',
        queuePhrase: (first: string) => `Ja, reih die Nachricht an ${first} ein.`,
        rewordBtn: 'Text ändern',
        rewordPhrase: (first: string) => `Ändere den Text für ${first}.`,
        slotsTitle: 'Deine freien Termine diese Woche',
        slotsFor: (first: string) => `Freie Termine für ${first}`,
        place: 'Vor Ort (Humanities 211) oder per Zoom',
        slotsHelp: (first?: string) =>
            first ? `Wähle einen Termin zum Vorschlagen. Gebucht ist erst, wenn ${first} zusagt.` : 'Wähle einen Termin zum Vorschlagen. Gebucht ist erst, wenn die Person zusagt.',
        proposedTag: 'Vorgeschlagen',
        proposePhrase: (when: string, first?: string) => (first ? `Schlag ${first} ${when} vor.` : `Schlag ${when} vor.`),
    },
});

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const CARD =
    'flex max-h-full flex-col overflow-y-auto rounded-xl border border-[var(--csu-border)] bg-[var(--csu-card)] p-5 shadow-[var(--csu-elevation)]';
const BOX = 'rounded-lg border border-[var(--csu-border)] bg-white';
const LABEL = 'text-[11px] font-medium uppercase tracking-wide text-[var(--csu-ink-muted)]';
const BTN_PRIMARY =
    'rounded-full bg-[var(--csu-accent)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--csu-accent-hover)]';
const BTN_SECONDARY =
    'rounded-full border border-[var(--csu-border)] bg-white px-4 py-2 text-[13px] font-semibold text-[var(--csu-ink)] hover:bg-[#F7F7F7]';
const BTN_QUIET = 'rounded-full px-3 py-2 text-[13px] font-medium text-[var(--csu-ink-muted)] hover:text-[var(--csu-ink)]';

/** A tap is something Jordan said. tellAgent also interrupts Natalie. */
function tell(phrase: string): void {
    void useVoiceSessionStore.getState().tellAgent(phrase);
}

/** Undo the builders' inner() encoding. */
function dec(v: string | undefined): string {
    return String(v ?? '')
        .replace(/%5E/g, '^')
        .replace(/%3B/g, ';')
        .replace(/%25/g, '%')
        .trim();
}

function rowsOf(raw: string | undefined): string[][] {
    if (!raw) return [];
    return raw
        .split(';')
        .map((r) => r.split('^').map(dec))
        .filter((p) => p[0]);
}

const BAND_COLOR: Record<string, string> = {
    High: 'var(--csu-accent)',
    Elevated: '#B45309',
    Watch: 'var(--csu-ink-muted)',
};
const bandColor = (band?: string) => BAND_COLOR[band ?? ''] ?? 'var(--csu-ink-muted)';

function Score({ score, band, label }: { score?: string; band?: string; label: string }) {
    return (
        <span className="flex shrink-0 items-baseline gap-1.5">
            <span className="font-data text-[18px] font-bold tabular-nums" style={{ color: bandColor(band) }}>
                {score}
            </span>
            <span className="font-data text-[11px] font-semibold uppercase tracking-wide" style={{ color: bandColor(band) }}>
                {label}
            </span>
        </span>
    );
}

/* ════════════════════════════════════════════════════════════════════════════
   1. caseload-list
   ════════════════════════════════════════════════════════════════════════════ */

export interface CaseloadListProps {
    flagged?: string;
    total?: string;
    onTrack?: string;
    /** `id^name^year^score^band^headline^canText^status` rows separated by `;`. */
    rows?: string;
}

export function CaseloadListCard({ flagged, total, onTrack, rows }: CaseloadListProps) {
    const t = T[useLocale()];
    const list = rowsOf(rows);
    const num = (v?: string, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);

    return (
        <div className={CARD}>
            <header className="mb-3">
                <h3 className="font-voice text-lg font-semibold text-[var(--csu-ink)]">{t.caseloadTitle}</h3>
                <p className="mt-0.5 text-sm text-[var(--csu-ink-muted)]">
                    {t.caseloadSummary(num(flagged, list.length), num(total), num(onTrack))}
                </p>
            </header>

            <ol className="flex min-h-0 flex-1 flex-col gap-1.5">
                {list.map(([id, name, year, score, band, headline, canText, status], i) => (
                    <li key={id || i}>
                        <button
                            type="button"
                            onClick={() => tell(t.whyPhrase(name))}
                            className={`${BOX} flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:border-[var(--csu-accent)]`}
                        >
                            <span className="font-data mt-0.5 w-4 shrink-0 text-[12px] font-semibold text-[var(--csu-ink-muted)]">{i + 1}</span>
                            <span className="min-w-0 flex-1">
                                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                                    <span className="text-[15px] font-semibold text-[var(--csu-ink)]">{name}</span>
                                    <Score score={score} band={band} label={t.band[band] ?? band} />
                                </span>
                                {year && <span className="block text-[12px] text-[var(--csu-ink-muted)]">{year}</span>}
                                {headline && <span className="mt-1 block text-[13px] leading-snug text-[var(--csu-ink)]">{headline}</span>}
                                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--csu-surface-alt)] px-2 py-0.5 text-[11px] font-medium text-[var(--csu-ink-muted)] ring-1 ring-[var(--csu-border)]">
                                        {canText === '1' ? <MessageCircle className="size-3" aria-hidden /> : <Mail className="size-3" aria-hidden />}
                                        {canText === '1' ? t.textOk : t.emailOnly}
                                    </span>
                                    {(status ?? '').split(',').includes('queued') && (
                                        <span className="rounded-full bg-[var(--csu-ink)] px-2 py-0.5 text-[11px] font-semibold text-white">{t.queued}</span>
                                    )}
                                    {(status ?? '').split(',').includes('proposed') && (
                                        <span className="rounded-full bg-[var(--csu-ink)] px-2 py-0.5 text-[11px] font-semibold text-white">{t.proposed}</span>
                                    )}
                                </span>
                            </span>
                            <ArrowRight className="mt-1 size-4 shrink-0 text-[var(--csu-ink-muted)]" aria-hidden />
                        </button>
                    </li>
                ))}
            </ol>
            <p className="mt-3 text-center text-[12px] text-[var(--csu-ink-muted)]">{t.tapName}</p>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════════
   2. student-brief
   ════════════════════════════════════════════════════════════════════════════ */

export interface StudentBriefProps {
    name?: string;
    firstName?: string;
    year?: string;
    major?: string;
    campus?: string;
    score?: string;
    band?: string;
    /** `kind^text` rows separated by `;`. */
    signals?: string;
    nextStep?: string;
    canText?: string;
    languageNote?: string;
    queuedRef?: string;
    proposedSlot?: string;
}

export function StudentBriefCard(p: StudentBriefProps) {
    const locale = useLocale();
    const t = T[locale];
    const first = p.firstName || (p.name ?? '').split(' ')[0];
    const signals = rowsOf(p.signals);
    const textOk = p.canText === '1';

    return (
        <div className={CARD}>
            <header className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-voice text-xl font-semibold leading-tight text-[var(--csu-ink)]">{p.name}</h3>
                    <p className="mt-0.5 text-sm text-[var(--csu-ink-muted)]">{[p.year, p.major, p.campus].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className={LABEL}>{t.risk}</span>
                    <Score score={p.score} band={p.band} label={t.band[p.band ?? ''] ?? p.band ?? ''} />
                </div>
            </header>

            {(p.queuedRef || p.proposedSlot) && (
                <div className="mt-3 flex flex-col gap-1">
                    {p.queuedRef && (
                        <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--csu-ink)]">
                            <Clock className="size-4 shrink-0 text-[var(--csu-ink-muted)]" aria-hidden />
                            {t.queuedRef(p.queuedRef)}
                        </p>
                    )}
                    {p.proposedSlot && (
                        <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--csu-ink)]">
                            <CalendarDays className="size-4 shrink-0 text-[var(--csu-ink-muted)]" aria-hidden />
                            {t.proposedAt(formatSlot(p.proposedSlot, locale).full)}
                        </p>
                    )}
                </div>
            )}

            {signals.length > 0 && (
                <section className={`${BOX} mt-4 px-3 py-2.5`}>
                    <p className={LABEL}>{t.whyFlagged}</p>
                    <ul className="mt-2 flex flex-col gap-2">
                        {signals.map(([kind, text], i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                <span
                                    className="mt-[7px] size-2 shrink-0 rounded-full"
                                    style={{ background: kind === 'personal' ? 'var(--csu-ink-muted)' : bandColor(p.band) }}
                                    aria-hidden
                                />
                                <span className="text-[14px] leading-snug text-[var(--csu-ink)]">
                                    {kind === 'personal' && (
                                        <span className="mr-1.5 rounded bg-[var(--csu-card)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--csu-ink-muted)]">
                                            {t.personal}
                                        </span>
                                    )}
                                    {text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {p.nextStep && (
                <section className="mt-2 rounded-lg border border-[var(--csu-accent)] bg-white px-3 py-2.5">
                    <p className={LABEL}>{t.nextStep}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-[var(--csu-ink)]">{p.nextStep}</p>
                </section>
            )}

            <section className={`${BOX} mt-2 px-3 py-2.5`}>
                <p className={LABEL}>{t.contact}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[14px] text-[var(--csu-ink)]">
                    {textOk ? <MessageCircle className="size-4 shrink-0" aria-hidden /> : <Mail className="size-4 shrink-0" aria-hidden />}
                    {textOk ? t.textOnFile : t.emailOnFile}
                    {p.languageNote && <span className="text-[var(--csu-ink-muted)]">· {p.languageNote}</span>}
                </p>
                {!textOk && <p className="mt-1 text-[12px] text-[var(--csu-ink-muted)]">{t.noTexts(first)}</p>}
            </section>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                <button type="button" className={BTN_PRIMARY} onClick={() => tell(t.draftPhrase(first))}>
                    {t.draftBtn}
                </button>
                <button type="button" className={BTN_SECONDARY} onClick={() => tell(t.timePhrase(first))}>
                    {t.timeBtn}
                </button>
                <button type="button" className={BTN_QUIET} onClick={() => tell(t.backPhrase)}>
                    {t.backBtn}
                </button>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════════
   3. outreach-plan
   ════════════════════════════════════════════════════════════════════════════ */

export interface OutreachPlanProps {
    name?: string;
    firstName?: string;
    /** 'text' | 'email' */
    channel?: string;
    canText?: string;
    languageNote?: string;
    subject?: string;
    /** Newlines arrive as the two characters `\n`. */
    body?: string;
    /** 'draft' | 'queued' */
    status?: string;
    reference?: string;
}

export function OutreachPlanCard(p: OutreachPlanProps) {
    const t = T[useLocale()];
    const first = p.firstName || (p.name ?? '').split(' ')[0];
    const queued = p.status === 'queued';
    const isEmail = p.channel === 'email';
    const body = String(p.body ?? '').replace(/\\n/g, '\n');

    return (
        <div className={CARD}>
            <header className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-voice text-lg font-semibold text-[var(--csu-ink)]">{t.messageTo(p.name ?? '')}</h3>
                <span
                    className={`font-data inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                        queued ? 'bg-[var(--csu-ink)] text-white' : 'bg-white text-[#B45309] ring-1 ring-[#B45309]'
                    }`}
                >
                    {queued ? <CheckCircle2 className="size-3.5" aria-hidden /> : <AlertTriangle className="size-3.5" aria-hidden />}
                    {queued ? t.statusQueued : t.statusDraft}
                </span>
            </header>

            {queued ? (
                <div className={`${BOX} mt-3 px-3 py-2.5`}>
                    <p className={LABEL}>{t.reference}</p>
                    <p className="font-data mt-0.5 text-[16px] font-bold tracking-wider text-[var(--csu-ink)]">{p.reference}</p>
                    <p className="mt-1 text-[12px] text-[var(--csu-ink-muted)]">{t.queuedHelp(first)}</p>
                </div>
            ) : (
                <p className="mt-1 text-[13px] text-[var(--csu-ink-muted)]">{t.draftHelp}</p>
            )}

            <dl className={`${BOX} mt-3 space-y-2 px-3 py-2.5`}>
                <div>
                    <dt className={LABEL}>{t.channel}</dt>
                    <dd className="mt-0.5 flex items-center gap-1.5 text-[14px] text-[var(--csu-ink)]">
                        {isEmail ? <Mail className="size-4 shrink-0" aria-hidden /> : <MessageCircle className="size-4 shrink-0" aria-hidden />}
                        {isEmail ? t.email : t.textMessage}
                        {p.languageNote && <span className="text-[var(--csu-ink-muted)]">· {p.languageNote}</span>}
                    </dd>
                    {p.canText !== '1' && <p className="mt-0.5 text-[12px] text-[var(--csu-ink-muted)]">{t.noTexts(first)}</p>}
                </div>
                {isEmail && p.subject && (
                    <div>
                        <dt className={LABEL}>{t.subject}</dt>
                        <dd className="mt-0.5 text-[14px] font-medium text-[var(--csu-ink)]">{p.subject}</dd>
                    </div>
                )}
            </dl>

            <section className={`${BOX} mt-2 px-3 py-2.5`}>
                <p className={LABEL}>{t.message}</p>
                <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--csu-ink)]">{body}</p>
            </section>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                {queued ? (
                    <>
                        <button type="button" className={BTN_PRIMARY} onClick={() => tell(t.timePhrase(first))}>
                            {t.timeBtn}
                        </button>
                        <button type="button" className={BTN_QUIET} onClick={() => tell(t.backPhrase)}>
                            {t.backBtn}
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" className={BTN_PRIMARY} onClick={() => tell(t.queuePhrase(first))}>
                            {t.queueBtn}
                        </button>
                        <button type="button" className={BTN_SECONDARY} onClick={() => tell(t.rewordPhrase(first))}>
                            {t.rewordBtn}
                        </button>
                        <button type="button" className={BTN_QUIET} onClick={() => tell(t.timePhrase(first))}>
                            {t.timeBtn}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════════════
   4. slot-picker
   ════════════════════════════════════════════════════════════════════════════ */

export interface SlotPickerProps {
    name?: string;
    firstName?: string;
    /** Slot ids `YYYY-MM-DDTHH:MM`, separated by `;`. */
    slots?: string;
    proposedSlot?: string;
}

export function SlotPickerCard({ name, firstName, slots, proposedSlot }: SlotPickerProps) {
    const locale = useLocale();
    const t = T[locale];
    const first = firstName || (name ?? '').split(' ')[0] || undefined;
    const ids = (slots ?? '').split(';').map(dec).filter(Boolean);

    return (
        <div className={CARD}>
            <header className="mb-3">
                <h3 className="font-voice text-lg font-semibold text-[var(--csu-ink)]">{first ? t.slotsFor(first) : t.slotsTitle}</h3>
                <p className="mt-0.5 text-sm text-[var(--csu-ink-muted)]">{t.place}</p>
            </header>

            <ul className="flex min-h-0 flex-1 flex-col gap-1.5">
                {ids.map((id) => {
                    const s = formatSlot(id, locale);
                    const isProposed = id === proposedSlot;
                    return (
                        <li key={id}>
                            <button
                                type="button"
                                onClick={() => tell(t.proposePhrase(s.full, first))}
                                className={`flex w-full items-center gap-3 rounded-lg border bg-white px-3 py-2.5 text-left transition-colors hover:border-[var(--csu-accent)] ${
                                    isProposed ? 'border-[var(--csu-accent)]' : 'border-[var(--csu-border)]'
                                }`}
                            >
                                <CalendarDays className="size-[18px] shrink-0 text-[var(--csu-accent)]" aria-hidden />
                                <span className="min-w-0 flex-1 text-[14px] text-[var(--csu-ink)]">
                                    <span className="font-semibold">{s.day}</span>
                                    {s.time && <span className="text-[var(--csu-ink-muted)]"> · {s.time}</span>}
                                </span>
                                {isProposed ? (
                                    <span className="font-data shrink-0 rounded-full bg-[var(--csu-ink)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                        {t.proposedTag}
                                    </span>
                                ) : (
                                    <ArrowRight className="size-4 shrink-0 text-[var(--csu-ink-muted)]" aria-hidden />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <p className="mt-3 text-center text-[12px] text-[var(--csu-ink-muted)]">{t.slotsHelp(first)}</p>
        </div>
    );
}
