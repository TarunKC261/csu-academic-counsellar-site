/**
 * getStudentRisk: one student and the evidence behind the flag (ported from
 * Venkat's build). Draws the student card: score, the signals exactly as
 * recorded, the next step, and the channel the student agreed to.
 *
 * Unknown names get {ok:false, error:'not on this caseload'}: saying one
 * person's grades under another person's name is the failure this guards.
 */
import renderScene from './renderScene';
import { findStudent, NOT_ON_CASELOAD } from '@/data/advisors';
import { ledgerFor } from '@/data/outreachLedger';
import { badge } from './advisorBadges';

export default function getStudentRisk(args?: { studentId?: string; name?: string }): Record<string, unknown> {
    const e = findStudent(args?.studentId, args?.name);
    if (!e) {
        return {
            ...NOT_ON_CASELOAD,
            note: "Say plainly that this student is not on Jordan's caseload. Do not guess or name anyone else.",
        };
    }
    const l = ledgerFor(e.id);

    const result = renderScene({
        template: 'student-brief',
        badge: badge('student'),
        layout: '1',
        fields: {
            name: e.name,
            firstName: e.firstName,
            year: e.year,
            major: e.major,
            campus: e.campus,
            score: e.riskScore,
            band: e.band,
            signals: e.signals,
            nextStep: e.nextStep,
            canText: e.canText,
            languageNote: e.languageNote,
            queuedRef: l.queuedRef,
            proposedSlot: l.proposedSlot,
        },
    });
    if (!result.ok) return { ok: false, error: result.error };

    return {
        ok: true,
        id: e.id,
        name: e.name,
        year: e.year,
        major: e.major,
        riskScore: e.riskScore,
        band: e.band,
        signals: e.signals,
        nextStep: e.nextStep,
        canText: e.canText,
        channel: e.canText ? 'text' : 'email',
        languageNote: e.languageNote || null,
        queuedReference: l.queuedRef ?? null,
        proposedSlot: l.proposedSlot ?? null,
        note:
            'The student card is on screen; do not read it out. Speak only these signals: no inferred cause, no added ' +
            'concern, nothing softened. Give the headline reason and the next step in a sentence or two. A personal signal ' +
            'is said once, neutrally.' +
            (e.canText ? '' : ` ${e.firstName} is email only: never offer a text.`),
    };
}
