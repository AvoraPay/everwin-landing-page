/**
 * Transactional e-mail for Everwin Prop.
 *
 * One table-based shell renders every message, so a change to the brand happens
 * in a single place and the layout survives Outlook. Every value that comes from
 * a person — names, plans, notes, credentials — is escaped before it reaches the
 * HTML, and every link is validated before it reaches an href.
 */

import { Resend } from "resend";
import { config } from "./config.js";
import { one } from "./db.js";

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

/** Returned by a template that decided this event does not deserve an e-mail. */
export const SKIPPED = "SKIPPED";

const TOKENS = {
  ink: "#0f172a",
  body: "#475569",
  muted: "#94a3b8",
  line: "#e2e8f0",
  surface: "#ffffff",
  canvas: "#f1f5f9",
  header: "#0b1120",
  accent: "#059669",
  accentSoft: "#ecfdf5",
  warn: "#b45309",
  warnSoft: "#fffbeb",
  danger: "#b91c1c",
  dangerSoft: "#fef2f2",
  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};

const LOGO_URL = config.emailLogoUrl;

/* ─────────────────────────── primitives ─────────────────────────── */

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only http(s) survives — a checkout URL is provider-supplied, never trusted. */
function safeUrl(value) {
  const raw = String(value ?? "").trim();
  if (!/^https?:\/\//i.test(raw)) return "";
  return esc(raw);
}

/** Mirrors normalizeLocale in server/index.js so copy never diverges. */
function resolveLocale(locale) {
  const value = String(locale ?? "").toLowerCase();
  if (value.startsWith("pt")) return "pt";
  if (value.startsWith("es")) return "es";
  return "en";
}

const INTL_LOCALE = { pt: "pt-BR", es: "es-ES", en: "en-US" };

function formatMoney(value, currency, locale) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return new Intl.NumberFormat(INTL_LOCALE[locale] ?? "en-US", {
    style: "currency",
    currency: currency || "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value, locale) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? "en-US", { dateStyle: "long" }).format(date);
}

function formatDateTime(value, locale) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function nl2br(value) {
  return esc(value).replace(/\r?\n/g, "<br />");
}

/* ─────────────────────────── blocks ─────────────────────────── */

/** Label/value rows — the workhorse for plan, amount, dates. */
function blockKeyValue(rows) {
  const visible = rows.filter((row) => row && row.value !== undefined && row.value !== null && row.value !== "");
  if (visible.length === 0) return { html: "", plain: "" };

  const html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${TOKENS.line};border-radius:12px;overflow:hidden;">
    ${visible
      .map(
        (row, index) => `
    <tr>
      <td style="padding:12px 16px;background:${index % 2 ? "#f8fafc" : TOKENS.surface};font:400 13px/20px ${TOKENS.font};color:${TOKENS.muted};width:45%;">${esc(row.label)}</td>
      <td style="padding:12px 16px;background:${index % 2 ? "#f8fafc" : TOKENS.surface};font:600 13px/20px ${TOKENS.font};color:${TOKENS.ink};text-align:right;">${esc(row.value)}</td>
    </tr>`,
      )
      .join("")}
  </table>`;

  const plain = visible.map((row) => `${row.label}: ${row.value}`).join("\n");
  return { html, plain };
}

function blockNotice(text, tone = "info") {
  const palette =
    tone === "warn"
      ? { bg: TOKENS.warnSoft, border: "#fcd34d", color: TOKENS.warn }
      : tone === "danger"
        ? { bg: TOKENS.dangerSoft, border: "#fca5a5", color: TOKENS.danger }
        : { bg: TOKENS.accentSoft, border: "#a7f3d0", color: "#047857" };

  return {
    html: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="padding:14px 16px;background:${palette.bg};border:1px solid ${palette.border};border-radius:12px;font:400 13px/20px ${TOKENS.font};color:${palette.color};">${nl2br(text)}</td></tr>
  </table>`,
    plain: text,
  };
}

/** Credentials always travel with the security note attached to them. */
function blockCredentials(rows, securityNote) {
  const visible = rows.filter((row) => row && row.value);
  if (visible.length === 0) return { html: "", plain: "" };

  const html = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border:1px solid ${TOKENS.line};border-radius:12px;background:#f8fafc;">
    ${visible
      .map(
        (row) => `
    <tr>
      <td style="padding:14px 16px 0;font:400 11px/16px ${TOKENS.font};color:${TOKENS.muted};text-transform:uppercase;letter-spacing:1px;">${esc(row.label)}</td>
    </tr>
    <tr>
      <td style="padding:2px 16px 14px;font:600 15px/22px ui-monospace,SFMono-Regular,Menlo,monospace;color:${TOKENS.ink};word-break:break-all;">${esc(row.value)}</td>
    </tr>`,
      )
      .join("")}
  </table>
  <p style="margin:0 0 24px;font:400 12px/18px ${TOKENS.font};color:${TOKENS.muted};">${esc(securityNote)}</p>`;

  const plain = `${visible.map((row) => `${row.label}: ${row.value}`).join("\n")}\n\n${securityNote}`;
  return { html, plain };
}

/** A reference the reader is expected to quote back to support. */
function blockCode(label, code) {
  if (!code) return { html: "", plain: "" };
  return {
    html: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td align="center" style="padding:18px;background:#f8fafc;border:1px dashed ${TOKENS.line};border-radius:12px;">
      <p style="margin:0 0 6px;font:400 11px/16px ${TOKENS.font};color:${TOKENS.muted};text-transform:uppercase;letter-spacing:1px;">${esc(label)}</p>
      <p style="margin:0;font:700 22px/28px ui-monospace,SFMono-Regular,Menlo,monospace;color:${TOKENS.ink};letter-spacing:2px;">${esc(code)}</p>
    </td></tr>
  </table>`,
    plain: `${label}: ${code}`,
  };
}

function blockQuote(text) {
  if (!text) return { html: "", plain: "" };
  return {
    html: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="padding:0 0 0 16px;border-left:3px solid ${TOKENS.line};font:400 13px/20px ${TOKENS.font};color:${TOKENS.body};">${nl2br(text)}</td></tr>
  </table>`,
    plain: text,
  };
}

function blockSteps(steps) {
  if (!steps || steps.length === 0) return { html: "", plain: "" };
  return {
    html: `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    ${steps
      .map(
        (step, index) => `
    <tr>
      <td width="28" valign="top" style="padding:0 0 12px;">
        <div style="width:22px;height:22px;border-radius:11px;background:${TOKENS.accentSoft};color:${TOKENS.accent};font:700 12px/22px ${TOKENS.font};text-align:center;">${index + 1}</div>
      </td>
      <td valign="top" style="padding:1px 0 12px;font:400 13px/20px ${TOKENS.font};color:${TOKENS.body};">${esc(step)}</td>
    </tr>`,
      )
      .join("")}
  </table>`,
    plain: steps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
  };
}

/* ─────────────────────────── shell ─────────────────────────── */

function renderShell({ locale, preheader, eyebrow, title, intro, blocks = [], cta, footerNote }) {
  const copy = COPY[locale] ?? COPY.en;
  const ctaUrl = cta ? safeUrl(cta.url) : "";
  const body = blocks.map((block) => block?.html ?? "").join("");

  return `<!doctype html>
<html lang="${esc(locale)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${TOKENS.canvas};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader ?? title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TOKENS.canvas};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">

      <tr><td style="padding:26px 32px;background:${TOKENS.header};border-radius:16px 16px 0 0;">
        <img src="${esc(LOGO_URL)}" alt="Everwin" height="22" style="height:22px;display:block;border:0;" />
      </td></tr>

      <tr><td style="padding:36px 32px 8px;background:${TOKENS.surface};">
        ${eyebrow ? `<p style="margin:0 0 10px;font:600 11px/16px ${TOKENS.font};color:${TOKENS.accent};text-transform:uppercase;letter-spacing:1.4px;">${esc(eyebrow)}</p>` : ""}
        <h1 style="margin:0 0 14px;font:700 25px/32px ${TOKENS.font};color:${TOKENS.ink};letter-spacing:-0.5px;">${esc(title)}</h1>
        ${intro ? `<p style="margin:0 0 26px;font:400 15px/24px ${TOKENS.font};color:${TOKENS.body};">${nl2br(intro)}</p>` : ""}
      </td></tr>

      <tr><td style="padding:0 32px;background:${TOKENS.surface};">${body}</td></tr>

      ${
        ctaUrl
          ? `<tr><td style="padding:4px 32px 34px;background:${TOKENS.surface};">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="border-radius:12px;background:${TOKENS.accent};">
            <a href="${ctaUrl}" style="display:inline-block;padding:14px 30px;font:600 14px/20px ${TOKENS.font};color:#ffffff;text-decoration:none;border-radius:12px;">${esc(cta.label)}</a>
          </td>
        </tr></table>
        <p style="margin:14px 0 0;font:400 12px/18px ${TOKENS.font};color:${TOKENS.muted};word-break:break-all;">${copy.cta_fallback}<br />${ctaUrl}</p>
      </td></tr>`
          : `<tr><td style="padding:0 32px 34px;background:${TOKENS.surface};"></td></tr>`
      }

      <tr><td style="padding:24px 32px 30px;background:#f8fafc;border-top:1px solid ${TOKENS.line};border-radius:0 0 16px 16px;">
        ${footerNote ? `<p style="margin:0 0 12px;font:400 12px/18px ${TOKENS.font};color:${TOKENS.body};">${nl2br(footerNote)}</p>` : ""}
        <p style="margin:0 0 10px;font:400 12px/18px ${TOKENS.font};color:${TOKENS.muted};">${copy.footer_support} <a href="mailto:${esc(config.supportEmail)}" style="color:${TOKENS.accent};text-decoration:none;">${esc(config.supportEmail)}</a></p>
        <p style="margin:0;font:400 11px/17px ${TOKENS.font};color:${TOKENS.muted};">${copy.footer_risk}</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function renderPlain({ locale, title, intro, blocks = [], cta, footerNote }) {
  const copy = COPY[locale] ?? COPY.en;
  const parts = [title, "", intro];
  for (const block of blocks) if (block?.plain) parts.push("", block.plain);
  if (cta && safeUrl(cta.url)) parts.push("", `${cta.label}: ${cta.url}`);
  if (footerNote) parts.push("", footerNote);
  parts.push("", `${copy.footer_support} ${config.supportEmail}`, copy.footer_risk);
  return parts.filter((part) => part !== undefined && part !== null).join("\n");
}

/* ─────────────────────────── sending ─────────────────────────── */

async function readSetting(key) {
  try {
    const row = await one("SELECT value FROM system_settings WHERE key = $1", [key]);
    return row?.value?.trim() ?? "";
  } catch {
    // A database hiccup must never stop mail — fall back to config.
    return "";
  }
}

/** Sender identity, admin-configurable, always with a working fallback. */
async function resolveSender() {
  const name = await readSetting("email_sender_name");
  const address = await readSetting("email_sender_address");
  const replyTo = (await readSetting("email_reply_to")) || config.emailReplyTo;

  const from = name && address ? `${name} <${address}>` : address || config.resendFrom;
  return { from, replyTo: replyTo || undefined };
}

/**
 * Returns the raw Resend response — sendAndLogEmail in server/index.js reads
 * `response?.data ?? response` then `data?.id` to store provider_message_id.
 */
async function sendMail({ to, subject, html, text }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping:", subject);
    return SKIPPED;
  }

  const sender = await resolveSender();
  return resend.emails.send({
    from: sender.from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    ...(sender.replyTo ? { replyTo: sender.replyTo } : {}),
  });
}

/** Builds both parts from one description and hands them to Resend. */
async function deliver({ to, locale, subject, ...content }) {
  return sendMail({
    to,
    subject,
    html: renderShell({ locale, ...content }),
    text: renderPlain({ locale, ...content }),
  });
}

/* ─────────────────────────── copy ─────────────────────────── */

const COPY = {
  pt: {
    cta_fallback: "Se o botão não funcionar, use este endereço:",
    footer_support: "Dúvidas? Fale com",
    footer_risk:
      "Operar nos mercados envolve risco elevado e pode gerar perdas. A avaliação não garante aprovação nem conta financiada.",
    creds_security: "Guarde estes dados em local seguro e não compartilhe com ninguém. A Everwin nunca pede sua senha.",
    label_plan: "Plano",
    label_capital: "Capital de avaliação",
    label_fee: "Taxa de avaliação",
    label_code: "Código da inscrição",
    label_status: "Status",
    label_account: "Conta",
    label_phase: "Fase",
    label_due: "Vence em",
    label_paid: "Pago em",
    label_login: "Login",
    label_password: "Senha",
    label_portal: "Portal",
    label_platform: "Plataforma",
    cta_status: "Acompanhar inscrição",
    cta_pay: "Pagar agora",
    cta_login: "Entrar no portal",
    cta_trade: "Abrir plataforma",
  },
  en: {
    cta_fallback: "If the button does not work, use this address:",
    footer_support: "Questions? Contact",
    footer_risk:
      "Trading carries substantial risk and may result in losses. The evaluation does not guarantee approval or a funded account.",
    creds_security: "Keep these details safe and never share them. Everwin will never ask for your password.",
    label_plan: "Plan",
    label_capital: "Evaluation capital",
    label_fee: "Evaluation fee",
    label_code: "Application code",
    label_status: "Status",
    label_account: "Account",
    label_phase: "Phase",
    label_due: "Due",
    label_paid: "Paid on",
    label_login: "Login",
    label_password: "Password",
    label_portal: "Portal",
    label_platform: "Platform",
    cta_status: "Track application",
    cta_pay: "Pay now",
    cta_login: "Sign in to the portal",
    cta_trade: "Open the platform",
  },
  es: {
    cta_fallback: "Si el botón no funciona, use esta dirección:",
    footer_support: "¿Dudas? Escriba a",
    footer_risk:
      "Operar en los mercados implica un riesgo elevado y puede generar pérdidas. La evaluación no garantiza aprobación ni cuenta fondeada.",
    creds_security: "Guarde estos datos en un lugar seguro y no los comparta. Everwin nunca le pedirá su contraseña.",
    label_plan: "Plan",
    label_capital: "Capital de evaluación",
    label_fee: "Tarifa de evaluación",
    label_code: "Código de solicitud",
    label_status: "Estado",
    label_account: "Cuenta",
    label_phase: "Fase",
    label_due: "Vence",
    label_paid: "Pagado el",
    label_login: "Usuario",
    label_password: "Contraseña",
    label_portal: "Portal",
    label_platform: "Plataforma",
    cta_status: "Seguir solicitud",
    cta_pay: "Pagar ahora",
    cta_login: "Entrar al portal",
    cta_trade: "Abrir la plataforma",
  },
};

const T = {
  applicationReceived: {
    pt: {
      eyebrow: "Candidatura recebida",
      title: "Recebemos sua inscrição",
      intro: (n) => `Olá ${n}, sua candidatura ao programa Everwin Prop foi registrada. Guarde o código abaixo — ele identifica seu processo em qualquer contato conosco.`,
      steps: ["Pagamento da taxa de avaliação.", "Conferência do seu perfil pelo nosso time.", "Liberação do acesso e entrega da conta de avaliação."],
      subject: (c) => `Everwin Prop — inscrição recebida • ${c}`,
    },
    en: {
      eyebrow: "Application received",
      title: "We received your application",
      intro: (n) => `Hi ${n}, your Everwin Prop application is registered. Keep the code below — it identifies your case in any contact with us.`,
      steps: ["Pay the evaluation fee.", "Our team reviews your profile.", "Access is granted and your evaluation account is delivered."],
      subject: (c) => `Everwin Prop — application received • ${c}`,
    },
    es: {
      eyebrow: "Solicitud recibida",
      title: "Recibimos su solicitud",
      intro: (n) => `Hola ${n}, su solicitud a Everwin Prop fue registrada. Guarde el código: identifica su proceso en cualquier contacto.`,
      steps: ["Pago de la tarifa de evaluación.", "Revisión de su perfil por nuestro equipo.", "Liberación del acceso y entrega de la cuenta."],
      subject: (c) => `Everwin Prop — solicitud recibida • ${c}`,
    },
  },
  paymentLink: {
    pt: {
      eyebrow: "Pagamento liberado",
      title: "Seu link de pagamento está pronto",
      intro: (n) => `Olá ${n}, o pagamento da taxa de avaliação já pode ser feito. Assim que confirmarmos, sua conta é liberada automaticamente.`,
      subject: (c) => `Everwin Prop — finalize seu pagamento • ${c}`,
    },
    en: {
      eyebrow: "Payment ready",
      title: "Your payment link is ready",
      intro: (n) => `Hi ${n}, you can now pay the evaluation fee. As soon as it clears, your account is released automatically.`,
      subject: (c) => `Everwin Prop — complete your payment • ${c}`,
    },
    es: {
      eyebrow: "Pago liberado",
      title: "Su enlace de pago está listo",
      intro: (n) => `Hola ${n}, ya puede pagar la tarifa de evaluación. En cuanto se confirme, su cuenta se libera automáticamente.`,
      subject: (c) => `Everwin Prop — complete su pago • ${c}`,
    },
  },
  paymentReminder: {
    pt: {
      eyebrow: "Lembrete",
      title: "Seu pagamento ainda está pendente",
      intro: (n) => `Olá ${n}, ainda não identificamos o pagamento da sua taxa de avaliação. O link continua válido.`,
      subject: (c) => `Lembrete de pagamento • ${c}`,
    },
    en: {
      eyebrow: "Reminder",
      title: "Your payment is still pending",
      intro: (n) => `Hi ${n}, we have not seen your evaluation fee yet. Your link is still valid.`,
      subject: (c) => `Pending payment reminder • ${c}`,
    },
    es: {
      eyebrow: "Recordatorio",
      title: "Su pago sigue pendiente",
      intro: (n) => `Hola ${n}, todavía no identificamos el pago de su tarifa. El enlace sigue válido.`,
      subject: (c) => `Recordatorio de pago • ${c}`,
    },
  },
  paymentOverdue: {
    pt: {
      eyebrow: "Prazo vencido",
      title: "O prazo do seu pagamento venceu",
      intro: (n) => `Olá ${n}, o prazo para pagamento da taxa de avaliação expirou. Sua inscrição continua salva — se ainda quiser participar, é só concluir o pagamento ou falar com o suporte.`,
      subject: (c) => `Pagamento vencido • ${c}`,
    },
    en: {
      eyebrow: "Expired",
      title: "Your payment window has expired",
      intro: (n) => `Hi ${n}, the deadline to pay the evaluation fee has passed. Your application is still saved — complete the payment or contact support if you still want to join.`,
      subject: (c) => `Payment expired • ${c}`,
    },
    es: {
      eyebrow: "Vencido",
      title: "El plazo de su pago venció",
      intro: (n) => `Hola ${n}, el plazo para pagar la tarifa expiró. Su solicitud sigue guardada — complete el pago o hable con soporte.`,
      subject: (c) => `Pago vencido • ${c}`,
    },
  },
  paymentApproved: {
    pt: {
      eyebrow: "Pagamento confirmado",
      title: "Pagamento aprovado",
      intro: (n) => `Olá ${n}, confirmamos o pagamento da sua taxa de avaliação. Estamos preparando seu acesso e sua conta — você recebe os dados por e-mail em seguida.`,
      subject: (c) => `Pagamento confirmado • ${c}`,
    },
    en: {
      eyebrow: "Payment confirmed",
      title: "Payment approved",
      intro: (n) => `Hi ${n}, your evaluation fee is confirmed. We are preparing your access and your account — the details arrive by e-mail shortly.`,
      subject: (c) => `Payment confirmed • ${c}`,
    },
    es: {
      eyebrow: "Pago confirmado",
      title: "Pago aprobado",
      intro: (n) => `Hola ${n}, confirmamos el pago de su tarifa. Estamos preparando su acceso y su cuenta — los datos llegan por correo enseguida.`,
      subject: (c) => `Pago confirmado • ${c}`,
    },
  },
  portalAccess: {
    pt: {
      eyebrow: "Acesso liberado",
      title: "Seu acesso ao portal está pronto",
      intro: (n) => `Olá ${n}, criamos seu acesso ao portal Everwin Prop. Entre para acompanhar sua avaliação, ver as regras e consultar as credenciais da plataforma.`,
      subject: (e) => `Acesso ao portal liberado • ${e}`,
    },
    en: {
      eyebrow: "Access granted",
      title: "Your portal access is ready",
      intro: (n) => `Hi ${n}, your Everwin Prop portal access is created. Sign in to follow your evaluation, review the rules and find your platform credentials.`,
      subject: (e) => `Portal access ready • ${e}`,
    },
    es: {
      eyebrow: "Acceso liberado",
      title: "Su acceso al portal está listo",
      intro: (n) => `Hola ${n}, creamos su acceso al portal Everwin Prop. Entre para seguir su evaluación y ver sus credenciales.`,
      subject: (e) => `Acceso al portal listo • ${e}`,
    },
  },
  accountDelivered: {
    pt: {
      eyebrow: "Conta liberada",
      title: "Sua conta de avaliação está ativa",
      intro: (n) => `Olá ${n}, sua conta de avaliação foi criada e já pode ser usada. Abaixo estão os dados de acesso à plataforma de operação.`,
      subject: (a) => `Sua conta de avaliação está pronta • ${a}`,
    },
    en: {
      eyebrow: "Account live",
      title: "Your evaluation account is active",
      intro: (n) => `Hi ${n}, your evaluation account is created and ready to trade. Your platform credentials are below.`,
      subject: (a) => `Your evaluation account is ready • ${a}`,
    },
    es: {
      eyebrow: "Cuenta activa",
      title: "Su cuenta de evaluación está activa",
      intro: (n) => `Hola ${n}, su cuenta de evaluación fue creada y ya puede operar. Sus credenciales están abajo.`,
      subject: (a) => `Su cuenta de evaluación está lista • ${a}`,
    },
  },
  submissionStatus: {
    pt: {
      eyebrow: "Atualização",
      title: "Sua inscrição foi atualizada",
      intro: (n, s) => `Olá ${n}, o status da sua inscrição mudou para "${s}".`,
      subject: (c) => `Atualização da sua inscrição • ${c}`,
    },
    en: {
      eyebrow: "Update",
      title: "Your application was updated",
      intro: (n, s) => `Hi ${n}, your application status changed to "${s}".`,
      subject: (c) => `Application update • ${c}`,
    },
    es: {
      eyebrow: "Actualización",
      title: "Su solicitud fue actualizada",
      intro: (n, s) => `Hola ${n}, el estado de su solicitud cambió a "${s}".`,
      subject: (c) => `Actualización de su solicitud • ${c}`,
    },
  },
  accountStatus: {
    pt: {
      eyebrow: "Conta de avaliação",
      title: "Status da sua conta mudou",
      intro: (a, s) => `A conta ${a} agora está com o status "${s}".`,
      subject: (a) => `Status da conta ${a}`,
    },
    en: {
      eyebrow: "Evaluation account",
      title: "Your account status changed",
      intro: (a, s) => `Account ${a} is now "${s}".`,
      subject: (a) => `Account status • ${a}`,
    },
    es: {
      eyebrow: "Cuenta de evaluación",
      title: "El estado de su cuenta cambió",
      intro: (a, s) => `La cuenta ${a} ahora está "${s}".`,
      subject: (a) => `Estado de la cuenta ${a}`,
    },
  },
};

/* ─────────────────────────── templates ─────────────────────────── */

function planRows(copy, plan, application, locale) {
  return [
    { label: copy.label_plan, value: plan?.name },
    { label: copy.label_capital, value: plan ? formatMoney(plan.accountSize, plan.currency, locale) : "" },
    {
      label: copy.label_fee,
      value:
        application?.amount != null
          ? formatMoney(application.amount, application.currency ?? plan?.currency, locale)
          : plan
            ? formatMoney(plan.fee, plan.currency, locale)
            : "",
    },
    { label: copy.label_code, value: application?.submissionCode },
  ];
}

export function buildApplicationReceivedSubject(application) {
  const locale = resolveLocale(application?.locale);
  return T.applicationReceived[locale].subject(application?.submissionCode ?? "");
}

export async function sendApplicationReceivedEmail({ application, plan, statusUrl, customNote }) {
  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.applicationReceived[locale];

  return deliver({
    to: application.email,
    locale,
    subject: buildApplicationReceivedSubject(application),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application.firstName || application.fullName || ""),
    preheader: t.title,
    blocks: [
      blockCode(copy.label_code, application.submissionCode),
      blockKeyValue(planRows(copy, plan, application, locale)),
      blockSteps(t.steps),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: statusUrl ? { label: copy.cta_status, url: statusUrl } : undefined,
  });
}

export function buildPaymentLinkIssuedSubject(application) {
  const locale = resolveLocale(application?.locale);
  return T.paymentLink[locale].subject(application?.submissionCode ?? "");
}

export async function sendPaymentLinkIssuedEmail({ application, plan, checkoutUrl, statusUrl, customNote }) {
  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.paymentLink[locale];

  return deliver({
    to: application.email,
    locale,
    subject: buildPaymentLinkIssuedSubject(application),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application.firstName || application.fullName || ""),
    blocks: [
      blockKeyValue(planRows(copy, plan, application, locale)),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: { label: copy.cta_pay, url: checkoutUrl },
    footerNote: statusUrl ? `${copy.cta_status}: ${statusUrl}` : undefined,
  });
}

export function buildPendingPaymentReminderSubject(application) {
  const locale = resolveLocale(application?.locale);
  return T.paymentReminder[locale].subject(application?.submissionCode ?? "");
}

export async function sendPendingPaymentReminderEmail({ application, payment, statusUrl, customNote }) {
  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.paymentReminder[locale];

  return deliver({
    to: application.email,
    locale,
    subject: buildPendingPaymentReminderSubject(application),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application.firstName || application.fullName || ""),
    blocks: [
      blockKeyValue([
        { label: copy.label_code, value: application.submissionCode },
        {
          label: copy.label_fee,
          value: payment?.amount != null ? formatMoney(payment.amount, payment.currency, locale) : "",
        },
        { label: copy.label_due, value: payment?.dueAt ? formatDateTime(payment.dueAt, locale) : "" },
      ]),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: payment?.checkoutUrl
      ? { label: copy.cta_pay, url: payment.checkoutUrl }
      : statusUrl
        ? { label: copy.cta_status, url: statusUrl }
        : undefined,
  });
}

export function buildPaymentOverdueSubject(application) {
  const locale = resolveLocale(application?.locale);
  return T.paymentOverdue[locale].subject(application?.submissionCode ?? "");
}

export async function sendPaymentOverdueEmail({ application, payment, statusUrl, customNote }) {
  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.paymentOverdue[locale];

  return deliver({
    to: application.email,
    locale,
    subject: buildPaymentOverdueSubject(application),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application.firstName || application.fullName || ""),
    blocks: [
      blockNotice(t.intro(application.firstName || application.fullName || ""), "warn"),
      blockKeyValue([
        { label: copy.label_code, value: application.submissionCode },
        { label: copy.label_due, value: payment?.dueAt ? formatDateTime(payment.dueAt, locale) : "" },
      ]),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: payment?.checkoutUrl
      ? { label: copy.cta_pay, url: payment.checkoutUrl }
      : statusUrl
        ? { label: copy.cta_status, url: statusUrl }
        : undefined,
  });
}

export function buildPaymentApprovedSubject(application) {
  const locale = resolveLocale(application?.locale);
  return T.paymentApproved[locale].subject(application?.submissionCode ?? "");
}

export async function sendPaymentApprovedEmail({ application, plan, statusUrl, customNote }) {
  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.paymentApproved[locale];

  return deliver({
    to: application.email,
    locale,
    subject: buildPaymentApprovedSubject(application),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application.firstName || application.fullName || ""),
    blocks: [
      blockKeyValue([
        ...planRows(copy, plan, application, locale),
        { label: copy.label_paid, value: application.paidAt ? formatDate(application.paidAt, locale) : "" },
      ]),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: statusUrl ? { label: copy.cta_status, url: statusUrl } : undefined,
  });
}

export function buildPortalAccessSubject(portalUser) {
  const locale = resolveLocale(portalUser?.locale);
  return T.portalAccess[locale].subject(portalUser?.email ?? "");
}

export async function sendPortalAccessEmail({ application, portalUser, temporaryPassword, loginUrl, statusUrl, customNote }) {
  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.portalAccess[locale];

  return deliver({
    to: application.email,
    locale,
    subject: T.portalAccess[locale].subject(portalUser.email),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application.firstName || application.fullName || ""),
    blocks: [
      blockCredentials(
        [
          { label: copy.label_portal, value: portalUser.email },
          { label: copy.label_password, value: temporaryPassword },
        ],
        copy.creds_security,
      ),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: { label: copy.cta_login, url: loginUrl },
    footerNote: statusUrl ? `${copy.cta_status}: ${statusUrl}` : undefined,
  });
}

export function buildTradingAccountDeliveredSubject(account, locale) {
  return T.accountDelivered[resolveLocale(locale)].subject(account?.accountId ?? "");
}

export async function sendTradingAccountDeliveredEmail({ application, portalUser, account, plan, loginUrl, tradeRoomUrl, customNote }) {
  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.accountDelivered[locale];

  return deliver({
    to: application?.email ?? portalUser?.email,
    locale,
    subject: buildTradingAccountDeliveredSubject(account, locale),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application?.firstName || application?.fullName || ""),
    blocks: [
      blockKeyValue([
        { label: copy.label_account, value: account?.accountId },
        { label: copy.label_plan, value: plan?.name },
        { label: copy.label_capital, value: plan ? formatMoney(plan.accountSize, plan.currency, locale) : "" },
        { label: copy.label_phase, value: account?.phase ? String(account.phase) : "" },
      ]),
      blockCredentials(
        [
          { label: copy.label_login, value: account?.platformLogin },
          { label: copy.label_password, value: account?.platformPassword },
        ],
        copy.creds_security,
      ),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: tradeRoomUrl ? { label: copy.cta_trade, url: tradeRoomUrl } : { label: copy.cta_login, url: loginUrl },
  });
}

/** Statuses with a dedicated template of their own are skipped here. */
const GENERIC_SUBMISSION_STATUSES = ["under_review", "rejected", "cancelled"];

export function buildSubmissionStatusChangedSubject(application) {
  const locale = resolveLocale(application?.locale);
  return T.submissionStatus[locale].subject(application?.submissionCode ?? "");
}

export async function sendSubmissionStatusChangedEmail({ application, statusLabel, statusUrl, customNote }) {
  if (!GENERIC_SUBMISSION_STATUSES.includes(application?.status)) return SKIPPED;

  const locale = resolveLocale(application?.locale);
  const copy = COPY[locale];
  const t = T.submissionStatus[locale];
  const label = statusLabel ?? application.status;

  return deliver({
    to: application.email,
    locale,
    subject: buildSubmissionStatusChangedSubject(application),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(application.firstName || application.fullName || "", label),
    blocks: [
      blockKeyValue([
        { label: copy.label_code, value: application.submissionCode },
        { label: copy.label_status, value: label },
      ]),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: statusUrl ? { label: copy.cta_status, url: statusUrl } : undefined,
  });
}

/** Only outcomes worth an e-mail; day-to-day states would become daily spam. */
const NOTIFIABLE_ACCOUNT_STATUSES = ["passed", "failed_drawdown", "failed_timeout", "approved_for_funded", "paused", "rejected"];

export function buildAccountStatusChangedSubject(account, locale) {
  return T.accountStatus[resolveLocale(locale)].subject(account?.accountId ?? "");
}

export async function sendAccountStatusChangedEmail({ account, previousStatus, statusLabel, locale, loginUrl, customNote }) {
  if (!NOTIFIABLE_ACCOUNT_STATUSES.includes(account?.status)) return SKIPPED;
  // Without this the daily sync would mail the same verdict every morning.
  if (previousStatus === account?.status) return SKIPPED;

  const resolved = resolveLocale(locale);
  const copy = COPY[resolved];
  const t = T.accountStatus[resolved];
  const label = statusLabel ?? account.status;
  const tone = ["failed_drawdown", "failed_timeout", "rejected"].includes(account.status) ? "danger" : "info";

  return deliver({
    to: account.notifyEmail,
    locale: resolved,
    subject: buildAccountStatusChangedSubject(account, resolved),
    eyebrow: t.eyebrow,
    title: t.title,
    intro: t.intro(account.accountId, label),
    blocks: [
      blockNotice(t.intro(account.accountId, label), tone),
      blockKeyValue([
        { label: copy.label_account, value: account.accountId },
        { label: copy.label_status, value: label },
        { label: copy.label_phase, value: account.phase ? String(account.phase) : "" },
      ]),
      customNote ? blockQuote(customNote) : null,
    ].filter(Boolean),
    cta: loginUrl ? { label: copy.cta_login, url: loginUrl } : undefined,
  });
}

export async function sendOtpEmail({ email, otp, locale, loginUrl }) {
  const resolved = resolveLocale(locale);
  const copy = COPY[resolved];
  const title =
    resolved === "pt" ? "Seu código de verificação" : resolved === "es" ? "Su código de verificación" : "Your verification code";
  const intro =
    resolved === "pt"
      ? "Use o código abaixo para concluir a redefinição da sua senha. Ele expira em poucos minutos."
      : resolved === "es"
        ? "Use el código para completar el restablecimiento de su contraseña. Expira en pocos minutos."
        : "Use the code below to finish resetting your password. It expires in a few minutes.";

  return deliver({
    to: email,
    locale: resolved,
    subject: title,
    eyebrow: "Everwin Prop",
    title,
    intro,
    blocks: [blockCode(resolved === "en" ? "Code" : "Código", otp)],
    cta: loginUrl ? { label: copy.cta_login, url: loginUrl } : undefined,
  });
}

/* ───────────────────── back-compat aliases ─────────────────────
 * server/index.js still imports the previous names. Keeping them as thin
 * aliases means this rewrite ships without touching a single call site.
 */

export const sendSubmissionReceivedEmail = sendApplicationReceivedEmail;
export const sendWaitlistConfirmationEmail = sendApplicationReceivedEmail;
export const sendPaymentLinkReleasedEmail = sendPaymentLinkIssuedEmail;
export const sendAccessReadyEmail = sendPortalAccessEmail;
export const sendAccountCredentialsEmail = sendTradingAccountDeliveredEmail;
