/**
 * getCaseload: "who needs me today?" (ported from Venkat's build).
 *
 * Draws Jordan's caseload card (the five flagged students, worst first, with
 * anything queued or proposed this session marked) and returns the same rows
 * in short form so Natalie can say one true sentence without reading the table.
 * All data is from src/data/advisors.ts.
 */
import renderScene from './renderScene';
import { ADVISOR, caseload } from '@/data/advisors';
import { ledgerFor } from '@/data/outreachLedger';
import { badge } from './advisorBadges';

/** 'queued', 'proposed', both comma-joined, or ''. */
function statusOf(id: string): string {
    const l = ledgerFor(id);
    return [l.queuedRef ? 'queued' : '', l.proposedSlot ? 'proposed' : ''].filter(Boolean).join(',');
}

export default function getCaseload(): Record<string, unknown> {
    const rows = caseload();
    const result = renderScene({
        template: 'caseload-list',
        badge: badge('caseload'),
        layout: '1',
        fields: {
            flagged: ADVISOR.flagged,
            total: ADVISOR.caseloadSize,
            onTrack: ADVISOR.onTrack,
            rows: rows.map((e) => ({
                id: e.id,
                name: e.name,
                year: `${e.year}, ${e.major}`,
                score: e.riskScore,
                band: e.band,
                headline: e.headline,
                canText: e.canText,
                status: statusOf(e.id),
            })),
        },
    });
    if (!result.ok) return { ok: false, error: result.error };

    const start = rows[0];
    return {
        ok: true,
        advisor: `${ADVISOR.firstName} ${ADVISOR.lastName}`,
        caseloadSize: ADVISOR.caseloadSize,
        flagged: ADVISOR.flagged,
        onTrack: ADVISOR.onTrack,
        students: rows.map((e) => {
            const l = ledgerFor(e.id);
            return {
                id: e.id,
                name: e.name,
                riskScore: e.riskScore,
                band: e.band,
                headline: e.headline,
                canText: e.canText,
                queuedReference: l.queuedRef ?? null,
                proposedSlot: l.proposedSlot ?? null,
            };
        }),
        startWith: start.name,
        note:
            `The caseload card is on screen; do not read it out. Say ${ADVISOR.flagged} of ${ADVISOR.caseloadSize} are flagged, ` +
            `name ${start.name} as the one to start with and why in a few words, then stop and let Jordan choose. ` +
            'These five are the only students you may name. canText false means email only: never offer a text.',
    };
}
