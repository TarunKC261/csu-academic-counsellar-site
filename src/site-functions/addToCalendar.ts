/**
 * addToCalendar: a "Proposed" hold on the COUNSELOR's own calendar (ported from
 * Venkat's build, rebuilt like the navigator's: no server, no blob: URLs).
 *
 * Venkat's descriptions disagreed on WHEN this runs (one said the moment the
 * counselor picks a time, another only after the student accepts). Resolved:
 * it runs once Jordan has picked one of the open slots to propose. The event is
 * titled "Proposed: advising with <student>", marked tentative, and says it is
 * pending the student's yes. Nothing is booked and the student is not invited.
 *
 * The card offers a `data:text/calendar` (.ics) download and a Google Calendar
 * link. Neither writes anything by itself: Jordan taps and saves.
 */
import renderScene from './renderScene';
import { ADVISOR, findSlot, findStudent, formatSlot, openSlots, NOT_ON_CASELOAD } from '@/data/advisors';
import { proposeSlot } from '@/data/outreachLedger';
import { currentLocale } from '@/lib/i18n/useLocale';
import { dict } from '@/lib/i18n/dict';
import { logEvent } from '@/lib/sessionLog';

const T = dict({
    en: {
        badge: 'PROPOSED TIME',
        icsTitle: (when: string) => `Hold on your calendar · ${when}`,
        icsBody: (first: string) =>
            `Not booked: it stays a hold until ${first} says yes. Works with Outlook, Apple or any calendar.`,
        icsCta: 'Download (.ics)',
        gTitle: 'Use Google Calendar?',
        gBody: 'Opens Google Calendar with the hold filled in.',
        gCta: 'Open Google Calendar',
    },
    es: {
        badge: 'HORA PROPUESTA',
        icsTitle: (when: string) => `Reserva en tu calendario · ${when}`,
        icsBody: (first: string) =>
            `No está reservada: queda pendiente hasta que ${first} diga que sí. Funciona con Outlook, Apple o cualquier calendario.`,
        icsCta: 'Descargar (.ics)',
        gTitle: '¿Usas Google Calendar?',
        gBody: 'Abre Google Calendar con la reserva ya completada.',
        gCta: 'Abrir Google Calendar',
    },
    zh: {
        badge: '提议的时间',
        icsTitle: (when: string) => `在你的日历中预留 · ${when}`,
        icsBody: (first: string) => `尚未预订：在 ${first} 同意之前只是预留。适用于 Outlook、Apple 或任何日历。`,
        icsCta: '下载 (.ics)',
        gTitle: '使用 Google 日历？',
        gBody: '打开 Google 日历，预留信息已填好。',
        gCta: '打开 Google 日历',
    },
    tl: {
        badge: 'INALOK NA ORAS',
        icsTitle: (when: string) => `Hold sa kalendaryo mo · ${when}`,
        icsBody: (first: string) =>
            `Hindi pa naka-book: hold ito hangga’t hindi pumapayag si ${first}. Gumagana sa Outlook, Apple o kahit anong kalendaryo.`,
        icsCta: 'I-download (.ics)',
        gTitle: 'Gamit mo ba ang Google Calendar?',
        gBody: 'Bubuksan ang Google Calendar na may laman na ang hold.',
        gCta: 'Buksan ang Google Calendar',
    },
    vi: {
        badge: 'GIỜ ĐÃ ĐỀ XUẤT',
        icsTitle: (when: string) => `Giữ chỗ trên lịch của bạn · ${when}`,
        icsBody: (first: string) =>
            `Chưa đặt lịch: chỉ giữ chỗ cho đến khi ${first} đồng ý. Dùng được với Outlook, Apple hoặc bất kỳ lịch nào.`,
        icsCta: 'Tải xuống (.ics)',
        gTitle: 'Dùng Google Calendar?',
        gBody: 'Mở Google Calendar với lịch giữ chỗ đã điền sẵn.',
        gCta: 'Mở Google Calendar',
    },
    de: {
        badge: 'VORGESCHLAGENER TERMIN',
        icsTitle: (when: string) => `Platzhalter in deinem Kalender · ${when}`,
        icsBody: (first: string) =>
            `Nicht gebucht: bleibt ein Platzhalter, bis ${first} zusagt. Funktioniert mit Outlook, Apple und jedem Kalender.`,
        icsCta: 'Herunterladen (.ics)',
        gTitle: 'Google Kalender?',
        gBody: 'Öffnet Google Kalender mit dem ausgefüllten Platzhalter.',
        gCta: 'Google Kalender öffnen',
    },
});

interface Hold {
    uid: string;
    /** YYYYMMDD */
    date: string;
    /** HHMM, local Pacific time */
    start: string;
    end: string;
    title: string;
    location: string;
    description: string;
}

function esc(v: string): string {
    return v.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');
}

function plusMinutes(hhmm: string, minutes: number): string {
    const total = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(2)) + minutes;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}${String(total % 60).padStart(2, '0')}`;
}

function buildIcs(h: Hold): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Student Engagement Platform//Academic Counselor//EN',
        'BEGIN:VEVENT',
        `UID:${h.uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
        `DTSTART:${h.date}T${h.start}00`,
        `DTEND:${h.date}T${h.end}00`,
        `SUMMARY:${esc(h.title)}`,
        `LOCATION:${esc(h.location)}`,
        `DESCRIPTION:${esc(h.description)}`,
        'STATUS:TENTATIVE',
        'END:VEVENT',
        'END:VCALENDAR',
    ];
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}

function googleUrl(h: Hold): string {
    const q = new URLSearchParams({
        action: 'TEMPLATE',
        text: h.title,
        dates: `${h.date}T${h.start}00/${h.date}T${h.end}00`,
        details: h.description,
        location: h.location,
        ctz: 'America/Los_Angeles',
    });
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export default function addToCalendar(args?: { studentId?: string; name?: string; slot?: string }): Record<string, unknown> {
    const e = findStudent(args?.studentId, args?.name);
    if (!e) {
        return { ...NOT_ON_CASELOAD, note: "Nothing was added. Say plainly that this student is not on Jordan's caseload." };
    }
    const slot = findSlot(args?.slot);
    if (!slot) {
        return {
            ok: false,
            error:
                "That is not one of Jordan's open slots. Pass a slot id from findMeetingSlots: " +
                `${openSlots()
                    .map((s) => s.id)
                    .join(', ')}. Nothing was added.`,
        };
    }

    const [date, time] = slot.id.split('T');
    const start = time.replace(':', '');
    const hold: Hold = {
        uid: `${e.id}-${slot.id.replace(/[^0-9]/g, '')}@csuac`,
        date: date.replace(/-/g, ''),
        start,
        end: plusMinutes(start, e.meetingMinutes),
        title: `Proposed: advising with ${e.name}`,
        location: ADVISOR.meetingPlace,
        description:
            `Proposed to ${e.name}, pending the student's yes. Not booked. ${ADVISOR.firstName} ${ADVISOR.lastName}, ` +
            `${ADVISOR.title}, ${ADVISOR.office}.`,
    };

    const locale = currentLocale();
    const t = T[locale];
    const when = formatSlot(slot.id, locale).full;
    const result = renderScene({
        template: 'info-card',
        badge: t.badge,
        layout: '1-1',
        fields: {
            icon: 'calendar',
            title: t.icsTitle(when),
            body: `${hold.title}. ${t.icsBody(e.firstName)}`,
            cta: t.icsCta,
            ctaPhrase: buildIcs(hold),
        },
        extras: [
            { template: 'info-card', fields: { icon: 'calendar', title: t.gTitle, body: t.gBody, cta: t.gCta, ctaPhrase: googleUrl(hold) } },
        ],
    });
    if (!result.ok) return { ok: false, error: result.error };

    proposeSlot(e.id, slot.id);
    logEvent('lifecycle', 'proposed hold offered for the counselor calendar', { student: e.name, slot: slot.id });

    return {
        ok: true,
        booked: false,
        student: e.name,
        slot: slot.id,
        when: slot.label,
        title: hold.title,
        note:
            "Two calendar links for Jordan's own calendar are on screen; Jordan taps one and saves it. Say the time once " +
            `and that it is proposed to ${e.firstName}, pending ${e.firstName}'s yes. Never say booked or that you added ` +
            `it. To put the time in a message, call planOutreach with a draft that offers ${slot.label}.`,
    };
}
