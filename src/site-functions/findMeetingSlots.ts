/**
 * findMeetingSlots: Jordan's open advising slots this week (ported from
 * Venkat's build). Fixed to the demo week (today is Monday, June 21, 2027),
 * never computed from the real date. Books nothing.
 *
 * Once Jordan picks a slot to propose, Natalie calls addToCalendar for a
 * "Proposed" hold on Jordan's own calendar. The student still has to say yes.
 */
import renderScene from './renderScene';
import { ADVISOR, findStudent, openSlots, NOT_ON_CASELOAD } from '@/data/advisors';
import { ledgerFor } from '@/data/outreachLedger';
import { badge } from './advisorBadges';

export default function findMeetingSlots(args?: { studentId?: string; name?: string }): Record<string, unknown> {
    const asked = Boolean(String(args?.studentId ?? '').trim() || String(args?.name ?? '').trim());
    const e = asked ? findStudent(args?.studentId, args?.name) : null;
    if (asked && !e) {
        return { ...NOT_ON_CASELOAD, note: "Say plainly that this student is not on Jordan's caseload." };
    }
    const slots = openSlots();
    const proposedSlot = e ? ledgerFor(e.id).proposedSlot : undefined;

    const result = renderScene({
        template: 'slot-picker',
        badge: badge('slots'),
        layout: '1',
        fields: {
            name: e?.name,
            firstName: e?.firstName,
            slots: slots.map((s) => s.id),
            proposedSlot,
        },
    });
    if (!result.ok) return { ok: false, error: result.error };

    return {
        ok: true,
        student: e?.name ?? null,
        studentId: e?.id ?? null,
        place: ADVISOR.meetingPlace,
        slots,
        nothingIsBooked: true,
        note:
            'The open times are on screen; do not read them all. Ask which one to propose, or name two at most. Once ' +
            "Jordan picks one, call addToCalendar with that slot id for a proposed hold on Jordan's own calendar. Never " +
            'say booked: the student has not accepted.',
    };
}
