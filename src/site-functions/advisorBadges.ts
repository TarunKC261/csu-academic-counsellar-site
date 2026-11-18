/**
 * advisorBadges: the scene badges the counselor site functions put above their
 * cards, in the page language. Not a tool (not registered); shared by the
 * counselor site functions only.
 */
import { dict } from '@/lib/i18n/dict';
import { currentLocale } from '@/lib/i18n/useLocale';

const T = dict({
    en: { caseload: 'CASELOAD', student: 'STUDENT', draft: 'DRAFT · NOT SENT', queued: 'QUEUED', slots: 'OPEN TIMES', proposed: 'PROPOSED TIME' },
    es: { caseload: 'ESTUDIANTES', student: 'ESTUDIANTE', draft: 'BORRADOR · NO ENVIADO', queued: 'EN COLA', slots: 'HORAS LIBRES', proposed: 'HORA PROPUESTA' },
    zh: { caseload: '学生名单', student: '学生', draft: '草稿 · 未发送', queued: '已排队', slots: '空闲时间', proposed: '提议的时间' },
    tl: { caseload: 'MGA ESTUDYANTE', student: 'ESTUDYANTE', draft: 'DRAFT · HINDI PA NAIPADALA', queued: 'NAKA-QUEUE', slots: 'BAKANTENG ORAS', proposed: 'INALOK NA ORAS' },
    vi: { caseload: 'DANH SÁCH SINH VIÊN', student: 'SINH VIÊN', draft: 'BẢN NHÁP · CHƯA GỬI', queued: 'ĐÃ XẾP HÀNG', slots: 'GIỜ TRỐNG', proposed: 'GIỜ ĐÃ ĐỀ XUẤT' },
    de: { caseload: 'STUDIERENDE', student: 'STUDENT:IN', draft: 'ENTWURF · NICHT GESENDET', queued: 'IN DER WARTESCHLANGE', slots: 'FREIE TERMINE', proposed: 'VORGESCHLAGENER TERMIN' },
});

export function badge(key: keyof (typeof T)['en']): string {
    return T[currentLocale()][key];
}
