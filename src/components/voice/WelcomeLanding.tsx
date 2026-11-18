'use client';

import { useState } from 'react';
import {
  Check,
  Mic,
  Users,
  Send,
  CalendarDays,
  Search,
  ListChecks,
  ChevronDown,
  Sparkles,
} from '@/lib/icons';
import { useVoiceSessionStore } from '@/lib/stores/voice-session-store';
import { useLocale } from '@/lib/i18n/useLocale';
import { dict } from '@/lib/i18n/dict';

// Icons + per-step number stay here; the words come from STRINGS so the home
// follows the EN/DE toggle (owner 2026-10-16).
const HIGHLIGHT_ICONS = [Users, Search, Send, CalendarDays];
const STEP_NUMS = ['01', '02', '03'];

/**
 * Quick actions. Each sends a phrase to Natalie; the phrases match the ones her
 * prompt's own card buttons use. The LABEL comes from STRINGS by index; the
 * phrase stays English (the agent parses it).
 */
const QUICK_ACTIONS: Array<{ Icon: typeof Users; phrase: string }> = [
  { Icon: Users, phrase: 'Who needs my attention this week?' },
  { Icon: Search, phrase: 'Why is Maria flagged?' },
  { Icon: Send, phrase: 'Draft a message to the student I should contact first' },
  { Icon: ListChecks, phrase: "Show me today's actions" },
];

// Fixed UI chrome, in the six page languages (see src/lib/locales.ts). Was English-only (the de entry mirrored en so a stray locale
// preference never shows Henkel text).
const STRINGS_EN = {
  eyebrow: 'Academic advising',
  heroA: 'Forty advisees.',
  heroB: 'See who needs you first.',
  lede1: 'Ask Natalie about ',
  ledeAcc1: 'your caseload',
  lede2: '. She shows who is flagged and why, and drafts a message on the channel each student agreed to, so the ',
  ledeAcc2: 'next step',
  lede3: ' takes a minute.',
  steps: [
    { title: 'See your caseload', caption: 'Flagged students, highest risk first' },
    { title: 'See why', caption: 'The signals behind each flag' },
    { title: 'Reach out', caption: 'A draft on the channel they agreed to' },
  ],
  instantResolution: 'Nothing goes to a student until you say yes.',
  console: 'Your caseload this week',
  consoleTag: 'Week of June 21, 2027',
  highlights: ['Caseload by risk', 'Why each student is flagged', 'Message drafts', 'Appointment times'],
  quickActions: ['Who needs me today?', 'Why is Maria flagged?', 'Draft a message', 'Today’s actions'],
  quickActionsLabel: 'Quick actions',
  reviewBadge: 'CHECK BEFORE YOU SEND',
  working: 'One moment, I’m getting that for you.',
  readyHint: 'Natalie is ready. Start talking or pick one.',
  connectingHint: 'Connecting to Natalie…',
  voiceCapabilities: 'What I can help with',
  capabilities: ['Rank your caseload by risk', 'Explain a student’s signals', 'Draft a text or an email', 'Use only the channel a student agreed to', 'Suggest appointment times', 'Spot duplicate courses', 'Look up advising policy', 'Name the right office to refer to'],
};
// Page text follows Natalie’s language (setLocale). Non-English is a first draft:
// have a native speaker review before a client demo. The quick-action PHRASES
// stay English (QUICK_ACTIONS above): they are what the agent parses.
const STRINGS = dict({
  en: STRINGS_EN,
  es: {
    eyebrow: 'Asesoría académica',
    heroA: 'Cuarenta estudiantes.',
    heroB: 'Mira quién te necesita primero.',
    lede1: 'Pregúntale a Natalie por ',
    ledeAcc1: 'tus estudiantes',
    lede2: '. Te muestra a quién hay que atender y por qué, y prepara un mensaje por el canal que cada estudiante aceptó, para que el ',
    ledeAcc2: 'siguiente paso',
    lede3: ' te tome un minuto.',
    steps: [
      { title: 'Mira tus estudiantes', caption: 'Los que tienen alertas, primero el riesgo más alto' },
      { title: 'Mira por qué', caption: 'Las señales detrás de cada alerta' },
      { title: 'Contacta', caption: 'Un borrador por el canal que aceptaron' },
    ],
    instantResolution: 'Nada llega a un estudiante hasta que digas que sí.',
    console: 'Tus estudiantes esta semana',
    consoleTag: 'Semana del 21 de junio de 2027',
    highlights: ['Estudiantes por riesgo', 'Por qué tiene alerta cada uno', 'Borradores de mensajes', 'Horarios de citas'],
    quickActions: ['¿Quién me necesita hoy?', '¿Por qué tiene alerta Maria?', 'Preparar un mensaje', 'Tareas de hoy'],
    quickActionsLabel: 'Acciones rápidas',
    reviewBadge: 'REVISA ANTES DE ENVIAR',
    working: 'Un momento, ya lo busco.',
    readyHint: 'Natalie está lista. Empieza a hablar o elige una opción.',
    connectingHint: 'Conectando con Natalie…',
    voiceCapabilities: 'En qué te puedo ayudar',
    capabilities: ['Ordenar a tus estudiantes por riesgo', 'Explicar las señales de un estudiante', 'Preparar un mensaje de texto o un correo', 'Usar solo el canal que aceptó el estudiante', 'Proponer horarios de citas', 'Detectar cursos repetidos', 'Consultar normas de asesoría', 'Indicar la oficina adecuada'],
  },
  zh: {
    eyebrow: '学业辅导',
    heroA: '四十名学生。',
    heroB: '先看谁最需要你。',
    lede1: '可以问 Natalie 关于',
    ledeAcc1: '你负责的学生',
    lede2: '的情况。她会告诉你谁被标记、原因是什么，并按学生同意的方式起草消息，让',
    ledeAcc2: '下一步',
    lede3: '只需一分钟。',
    steps: [
      { title: '查看学生名单', caption: '被标记的学生，风险最高的在前' },
      { title: '查看原因', caption: '每个标记背后的信号' },
      { title: '联系学生', caption: '按对方同意的方式起草消息' },
    ],
    instantResolution: '在你同意之前，不会有任何内容发给学生。',
    console: '本周你负责的学生',
    consoleTag: '2027 年 6 月 21 日这一周',
    highlights: ['按风险排序', '每名学生被标记的原因', '消息草稿', '预约时间'],
    quickActions: ['今天谁需要我？', 'Maria 为什么被标记？', '起草一条消息', '今天要做的事'],
    quickActionsLabel: '快捷操作',
    reviewBadge: '发送前请检查',
    working: '请稍等，我马上为你处理。',
    readyHint: 'Natalie 已就绪。直接说话或选一项。',
    connectingHint: '正在连接 Natalie…',
    voiceCapabilities: '我可以帮你做什么',
    capabilities: ['按风险给学生排序', '解释学生的信号', '起草短信或邮件', '只用学生同意的联系方式', '建议预约时间', '发现重复的课程', '查询辅导政策', '推荐合适的转介办公室'],
  },
  tl: {
    eyebrow: 'Academic advising',
    heroA: 'Apatnapung estudyante.',
    heroB: 'Tingnan kung sino ang unang nangangailangan sa iyo.',
    lede1: 'Tanungin si Natalie tungkol sa ',
    ledeAcc1: 'mga estudyante mo',
    lede2: '. Ipapakita niya kung sino ang naka-flag at bakit, at gagawa siya ng draft na mensahe sa paraang pinayagan ng bawat estudyante, para ang ',
    ledeAcc2: 'susunod na hakbang',
    lede3: ' ay isang minuto lang.',
    steps: [
      { title: 'Tingnan ang mga estudyante', caption: 'Mga naka-flag, pinakamataas na risk muna' },
      { title: 'Tingnan kung bakit', caption: 'Ang mga senyales sa bawat flag' },
      { title: 'Kumontak', caption: 'Draft sa paraang pinayagan nila' },
    ],
    instantResolution: 'Walang mapupunta sa estudyante hangga’t hindi ka pumapayag.',
    console: 'Mga estudyante mo ngayong linggo',
    consoleTag: 'Linggo ng Hunyo 21, 2027',
    highlights: ['Ayon sa risk', 'Kung bakit naka-flag ang bawat isa', 'Mga draft na mensahe', 'Oras ng appointment'],
    quickActions: ['Sino ang nangangailangan sa akin ngayon?', 'Bakit naka-flag si Maria?', 'Gumawa ng mensahe', 'Mga gagawin ngayon'],
    quickActionsLabel: 'Mabilis na aksyon',
    reviewBadge: 'TINGNAN BAGO IPADALA',
    working: 'Sandali lang, kinukuha ko na.',
    readyHint: 'Handa na si Natalie. Magsalita o pumili ng isa.',
    connectingHint: 'Kumokonekta kay Natalie…',
    voiceCapabilities: 'Ano ang matutulong ko',
    capabilities: ['Ayusin ang mga estudyante ayon sa risk', 'Ipaliwanag ang mga senyales ng estudyante', 'Gumawa ng text o email', 'Gamitin lang ang paraang pinayagan ng estudyante', 'Magmungkahi ng oras ng appointment', 'Makita ang dobleng kurso', 'Hanapin ang patakaran sa advising', 'Sabihin ang tamang opisinang lalapitan'],
  },
  vi: {
    eyebrow: 'Cố vấn học tập',
    heroA: 'Bốn mươi sinh viên.',
    heroB: 'Xem ai cần bạn trước.',
    lede1: 'Hỏi Natalie về ',
    ledeAcc1: 'các sinh viên của bạn',
    lede2: '. Natalie cho biết ai bị gắn cờ và vì sao, rồi soạn tin nhắn qua kênh mà từng sinh viên đã đồng ý, để ',
    ledeAcc2: 'bước tiếp theo',
    lede3: ' chỉ mất một phút.',
    steps: [
      { title: 'Xem danh sách', caption: 'Sinh viên bị gắn cờ, rủi ro cao nhất trước' },
      { title: 'Xem lý do', caption: 'Các dấu hiệu phía sau mỗi cờ' },
      { title: 'Liên hệ', caption: 'Bản nháp qua kênh họ đã đồng ý' },
    ],
    instantResolution: 'Không có gì được gửi tới sinh viên cho đến khi bạn đồng ý.',
    console: 'Sinh viên của bạn tuần này',
    consoleTag: 'Tuần 21/6/2027',
    highlights: ['Theo mức rủi ro', 'Lý do từng sinh viên bị gắn cờ', 'Bản nháp tin nhắn', 'Giờ hẹn'],
    quickActions: ['Hôm nay ai cần tôi?', 'Vì sao Maria bị gắn cờ?', 'Soạn tin nhắn', 'Việc hôm nay'],
    quickActionsLabel: 'Thao tác nhanh',
    reviewBadge: 'KIỂM TRA TRƯỚC KHI GỬI',
    working: 'Chờ một chút, mình lấy ngay cho bạn.',
    readyHint: 'Natalie đã sẵn sàng. Hãy nói hoặc chọn một mục.',
    connectingHint: 'Đang kết nối với Natalie…',
    voiceCapabilities: 'Mình có thể giúp gì',
    capabilities: ['Xếp sinh viên theo mức rủi ro', 'Giải thích dấu hiệu của sinh viên', 'Soạn tin nhắn hoặc email', 'Chỉ dùng kênh sinh viên đã đồng ý', 'Gợi ý giờ hẹn', 'Phát hiện môn học trùng', 'Tra cứu quy định cố vấn', 'Chỉ đúng văn phòng cần chuyển'],
  },
  de: {
    eyebrow: 'Studienberatung',
    heroA: 'Vierzig Studierende.',
    heroB: 'Sieh, wer dich zuerst braucht.',
    lede1: 'Frag Natalie nach ',
    ledeAcc1: 'deinen Studierenden',
    lede2: '. Sie zeigt, wer markiert ist und warum, und entwirft eine Nachricht über den Kanal, dem die Person zugestimmt hat, damit der ',
    ledeAcc2: 'nächste Schritt',
    lede3: ' nur eine Minute dauert.',
    steps: [
      { title: 'Liste ansehen', caption: 'Markierte Studierende, höchstes Risiko zuerst' },
      { title: 'Gründe sehen', caption: 'Die Signale hinter jeder Markierung' },
      { title: 'Kontakt aufnehmen', caption: 'Ein Entwurf über den vereinbarten Kanal' },
    ],
    instantResolution: 'Nichts geht an Studierende, bevor du Ja sagst.',
    console: 'Deine Studierenden diese Woche',
    consoleTag: 'Woche ab 21. Juni 2027',
    highlights: ['Nach Risiko', 'Warum jemand markiert ist', 'Nachrichtenentwürfe', 'Terminvorschläge'],
    quickActions: ['Wer braucht mich heute?', 'Warum ist Maria markiert?', 'Nachricht entwerfen', 'Aufgaben für heute'],
    quickActionsLabel: 'Schnellaktionen',
    reviewBadge: 'VOR DEM SENDEN PRÜFEN',
    working: 'Einen Moment, ich hole das für dich.',
    readyHint: 'Natalie ist bereit. Sprich los oder wähle etwas aus.',
    connectingHint: 'Verbinde mit Natalie…',
    voiceCapabilities: 'Wobei ich helfen kann',
    capabilities: ['Studierende nach Risiko ordnen', 'Signale einer Person erklären', 'SMS oder E-Mail entwerfen', 'Nur den vereinbarten Kanal nutzen', 'Termine vorschlagen', 'Doppelte Kurse finden', 'Beratungsregeln nachschlagen', 'Die richtige Stelle nennen'],
  },
});

/** CSU-red emphasis inside the lede. Not interactive. */
function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#CF102D' }}>{children}</span>;
}

/**
 * Academic Counselor landing — body content only (same layout as the Henkel DX Tele).
 * The enterprise top header is rendered globally by AppShell so it persists
 * across both the static landing and active scenes.
 */
export function WelcomeLanding() {
  const connect = useVoiceSessionStore((s) => s.connect);
  const tellAgent = useVoiceSessionStore((s) => s.tellAgent);
  const sessionState = useVoiceSessionStore((s) => s.sessionState);
  const agentParticipant = useVoiceSessionStore((s) => s.agentParticipant);
  const t = STRINGS[useLocale()];

  const [showAllCapabilities, setShowAllCapabilities] = useState(false);

  // Quick-action handler: connect if needed, then send a deterministic
  // conversation starter to the agent. If the agent isn't ready yet, poll
  // briefly until agentParticipant is published, then send.
  const handleQuickAction = async (phrase: string) => {
    if (sessionState !== 'connected') {
      await connect();
    }
    // Wait up to ~5s for the agent to register before sending the prompt.
    const started = Date.now();
    const send = () => {
      const ready =
        useVoiceSessionStore.getState().sessionState === 'connected' &&
        !!useVoiceSessionStore.getState().agentParticipant;
      if (ready) {
        tellAgent(phrase);
      } else if (Date.now() - started < 5000) {
        setTimeout(send, 200);
      }
    };
    if (agentParticipant && sessionState === 'connected') {
      tellAgent(phrase);
    } else {
      setTimeout(send, 200);
    }
  };

  return (
    // 2026-09-02: `min-h-dvh ... md:h-dvh md:overflow-hidden` and the chrome
    // padding are gone. This now fills the shell's content cell, which is
    // already sized by the grid and already the scroll container, so a viewport
    // height here would double-count the chrome and `overflow-hidden` would
    // clip the hero on short screens.
    // 2026-09-19: `z-10` so the landing sits ABOVE the avatar layers, exactly like a
    // scene (SceneManager's main is `relative z-10`). Without it the landing was BELOW
    // the avatar, so her shoulder painted OVER the buttons and the frost toggle did
    // nothing (a card cannot reveal someone rendered on top of it). Now she is behind,
    // the buttons are clear, and the translucent card reveals her at the overlap, which
    // is why the list frosted and home did not.
    <div
      className="slide-frame relative z-10 flex h-full w-full flex-col"
    >
      {/* ── Body ── */}
      {/* overflow-y-auto is the deliberate safety net for short viewports: the
          spacing below is tuned to fit ~860px+ without scrolling, but a
          1366x768 laptop has ~590px and must still be able to reach the CTA. */}
      <main className="scene-pad-x relative flex min-h-0 flex-1 items-start overflow-y-auto pb-3 pt-5">
        {/* my-auto, not items-center on the parent: an auto margin absorbs
            spare space and collapses to 0 when there is none, so a row TALLER
            than the content centres it and a row SHORTER than the content
            still starts at the top and scrolls. Centring on the flex parent
            would clip the top in the short case, which is the bug the other
            gates in this app already carry a comment about. */}
        <div className="my-auto w-full max-w-[68rem] space-y-2.5">
          {/* Eyebrow */}
          <p
            className="animate-slide-in-left font-data text-[11px] font-medium uppercase tracking-[0.25em] text-[#5A5A5A]"
            style={{ animationDelay: '0.05s' }}
          >
            {t.eyebrow}
          </p>

          {/* Hero */}
          <h1
            className="animate-slide-in-left font-voice font-bold leading-[1.1] tracking-tight text-balance text-[#1A1A1A]"
            // Was a fixed text-[26px] / md:text-[32px], which wrapped to two
            // lines and ate vertical space. clamp() holds it to one line on a
            // laptop and scales it down on narrow viewports instead of wrapping,
            // which is also what helps the phone cases.
            style={{ fontSize: 'clamp(1.25rem, 2.6vw, 2rem)', animationDelay: '0.15s' }}
          >
            {t.heroA} {t.heroB}
          </h1>

          {/* Lede. The red phrases are emphasis only — deliberately spans, not
              links, so nothing here looks clickable when it isn't. */}
          <p
            className="animate-slide-in-left max-w-[58rem] font-voice text-[15px] leading-[1.55] text-[#5A5A5A]"
            style={{ animationDelay: '0.25s' }}
          >
            {t.lede1}<Accent>{t.ledeAcc1}</Accent>{t.lede2}<Accent>{t.ledeAcc2}</Accent>{t.lede3}
          </p>

          {/* How it works — informational, no click targets */}
          <div
            className="dx-card animate-slide-in-left grid w-full grid-cols-1 gap-0 overflow-hidden rounded-md border border-[#DDDDDD] bg-white sm:grid-cols-3"
            style={{ animationDelay: '0.32s' }}
          >
            {t.steps.map(({ title, caption }, i) => (
              <div
                key={STEP_NUMS[i]}
                className={`px-3.5 py-2.5 ${
                  i > 0 ? 'border-t border-[#E5E7EB] sm:border-l sm:border-t-0' : ''
                }`}
              >
                {/* Number sits inline with the title rather than on its own
                    line — the page has to fit the viewport without scrolling,
                    and this row is one of two places reclaiming that height. */}
                <div className="flex items-baseline gap-2">
                  <span className="font-data text-[10px] tracking-[0.2em] text-[#9CA3AF]">{STEP_NUMS[i]}</span>
                  <span className="font-voice text-[13px] font-semibold text-[#1A1A1A]">
                    {title}
                  </span>
                </div>
                <p className="mt-0.5 font-voice text-[12px] leading-snug text-[#5A5A5A]">
                  {caption}
                </p>
              </div>
            ))}
          </div>

          {/* Console card */}
          <div
            className="dx-card animate-slide-in-left w-full rounded-md border border-[#DDDDDD] bg-[var(--csu-card)] p-4"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-voice text-base font-semibold text-[#1A1A1A]">
                {t.console}
              </h2>
              <span className="font-data text-[10px] uppercase tracking-[0.15em] text-[#5A5A5A]">
                {t.consoleTag}
              </span>
            </div>

            {/* Highlights — 2x2 grid per the mockup */}
            <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {HIGHLIGHT_ICONS.map((Icon, i) => (
                <span
                  key={t.highlights[i]}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#DDDDDD] bg-white px-2.5 py-1 font-voice text-[12px] text-[#1A1A1A]/80"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]/60" strokeWidth={1.75} />
                  {t.highlights[i]}
                </span>
              ))}
            </div>

            {/* The one capability worth calling out — deflection before filing.
                Same red tint the PoC banner uses. Static, not a button. */}
            <div
              className="mt-1.5 flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-voice text-[12px] font-medium"
              style={{ borderColor: '#CF102D', background: '#FBE9EC', color: '#A50D24' }}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {t.instantResolution}
            </div>

            <div className="my-2.5 border-t border-[#E5E7EB]" />

            {/* Quick actions */}
            <p className="font-data text-[10px] font-medium uppercase tracking-[0.2em] text-[#5A5A5A]">
              {t.quickActionsLabel}
            </p>
            {/* Pill buttons, not list rows (owner: "these do not look like buttons
                like the other screens"). Centered content, a rounded-full shape, a
                soft shadow and a hover lift give them the same tappable button
                language as the card CTAs. The first (caseload) is the primary
                so it takes the filled CSU-red treatment; the others are the
                matching outlined variant. */}
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {QUICK_ACTIONS.map(({ Icon, phrase }, i) => {
                const primary = i === 0;
                const label = t.quickActions[i];
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (!primary) {
                        // Show the placeholder card at once so the screen is never dead
                        // while Natalie fetches; her scene replaces it.
                        useVoiceSessionStore.getState().showPending('1', t.working);
                      }
                      void handleQuickAction(phrase);
                    }}
                    className={`group inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-voice text-[13px] font-semibold shadow-sm transition hover:-translate-y-[1px] hover:shadow ${
                      primary
                        ? 'border border-[#CF102D] bg-[#CF102D] text-white hover:bg-[#A50D24]'
                        : 'border border-[#E5E7EB] bg-white text-[#1A1A1A] hover:border-[#CF102D]/40'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${primary ? 'text-white' : 'text-[#1A1A1A]/60 group-hover:text-[#1A1A1A]'}`}
                      strokeWidth={1.75}
                    />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* No manual connect button: the session auto-connects during the
                privacy notice and the agent greets on acknowledge. This row now
                carries a live status hint + the capabilities toggle. The
                expanded list stays OUTSIDE the flex row so it opens full width. */}
            <div className="mt-3">
              <div className="flex items-center justify-between gap-4">
                <span
                  className="inline-flex items-center gap-2 font-voice text-[13px] font-medium"
                  style={{ color: sessionState === 'connected' ? '#1A1A1A' : '#5A5A5A' }}
                >
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: sessionState === 'connected' ? '#16A34A' : '#CF102D',
                    }}
                  />
                  {sessionState === 'connected' ? t.readyHint : t.connectingHint}
                </span>

                <button
                  type="button"
                  onClick={() => setShowAllCapabilities((v) => !v)}
                  className="inline-flex shrink-0 items-center gap-1.5 font-data text-[11px] font-medium uppercase tracking-[0.2em] text-[#5A5A5A] transition hover:text-[#1A1A1A]"
                >
                  {t.voiceCapabilities}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      showAllCapabilities ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {showAllCapabilities && (
                <ul className="mt-3 grid grid-cols-1 gap-y-2 gap-x-6 sm:grid-cols-2">
                  {t.capabilities.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 font-voice text-[13px] text-[#1A1A1A]/75"
                    >
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]/40"
                        strokeWidth={2}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* The global footer row was DELETED on 2026-09-02. It held only a
          copyright string and a duplicate of the header title; the copyright
          now sits in AppHeader and its 32px went back to the content grid.
          Nothing renders below this point. Was: rendered by AppShell via
          AppFooter so it appeared on
          every screen, not just this one. */}
    </div>
  );
}

/* Last updated: 2026-09-19 11:31 UTC+8 */