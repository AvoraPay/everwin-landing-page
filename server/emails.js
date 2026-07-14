import { Resend } from "resend";
import { config } from "./config.js";

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

function buildEmailShell({ preheader, title, bodyHtml, ctaLabel, ctaUrl, footerNote }) {
  return `
    <div style="margin:0;background:#f1f5f9;padding:32px 12px;font-family:Inter,Arial,sans-serif;color:#0f172a;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid rgba(15,23,42,0.08);border-radius:28px;overflow:hidden;box-shadow:0 28px 60px -42px rgba(15,23,42,0.35);">
        <div style="background:linear-gradient(135deg,#09111f 0%,#0f172a 100%);padding:28px 28px 22px;">
          <img src="https://i.postimg.cc/RFLkLvK0/everwin-logo.png" alt="Everwin" style="height:28px;width:auto;display:block;" />
          <div style="margin-top:18px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6ee7b7;font-weight:700;">Everwin Prop</div>
          <h1 style="margin:10px 0 0;color:#ffffff;font-size:30px;line-height:1.1;font-family:'Bricolage Grotesque',Inter,Arial,sans-serif;">${title}</h1>
        </div>
        <div style="padding:28px;">
          ${bodyHtml}
          ${
            ctaLabel && ctaUrl
              ? `<div style="margin-top:24px;">
                  <a href="${ctaUrl}" style="display:inline-block;padding:14px 20px;border-radius:16px;background:#10b981;color:#09111f;text-decoration:none;font-weight:700;">
                    ${ctaLabel}
                  </a>
                </div>`
              : ""
          }
          <div style="margin-top:28px;padding-top:18px;border-top:1px solid rgba(15,23,42,0.08);font-size:12px;line-height:1.7;color:#64748b;">
            ${footerNote ?? `Se precisar de ajuda, responda este e-mail ou fale com ${config.supportEmail}.`}
          </div>
        </div>
      </div>
    </div>
  `;
}

async function sendMail({ to, subject, html, text }) {
  if (!resend) {
    throw new Error("Resend is not configured.");
  }

  const response = await resend.emails.send({
    from: config.resendFrom,
    to,
    subject,
    html,
    text,
  });

  return response;
}

export async function sendWaitlistConfirmationEmail({ application, plan, statusUrl }) {
  const subject =
    application.locale === "en"
      ? `Everwin Prop — application received • ${application.submissionCode}`
      : application.locale === "es"
        ? `Everwin Prop — solicitud recibida • ${application.submissionCode}`
        : `Everwin Prop — inscrição recebida • ${application.submissionCode}`;

  const html = buildEmailShell({
    preheader: subject,
    title:
      application.locale === "en"
        ? "Your application is under review"
        : application.locale === "es"
          ? "Su solicitud está en análisis"
          : "Sua candidatura está em análise",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">${application.locale === "en" ? `Hi ${application.firstName},` : application.locale === "es" ? `Hola ${application.firstName},` : `Olá ${application.firstName},`}</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? `We received your Prop Trading application for <strong>${plan?.name ?? application.planId}</strong>. Your submission code is <strong>${application.submissionCode}</strong>.`
            : application.locale === "es"
              ? `Recibimos su solicitud Prop Trading para <strong>${plan?.name ?? application.planId}</strong>. Su código de seguimiento es <strong>${application.submissionCode}</strong>.`
              : `Recebemos sua candidatura Prop Trading para o plano <strong>${plan?.name ?? application.planId}</strong>. Seu código de acompanhamento é <strong>${application.submissionCode}</strong>.`
        }
      </p>
      <div style="margin:16px 0;padding:18px;border-radius:18px;background:#fefce8;border:1px solid rgba(234,179,8,0.25);">
        <div style="font-size:13px;font-weight:700;color:#a16207;">
          ${
            application.locale === "en"
              ? "Your application is being analyzed by our team."
              : application.locale === "es"
                ? "Su solicitud está siendo analizada por nuestro equipo."
                : "Sua candidatura está sendo analisada pela nossa equipe."
          }
        </div>
        <div style="margin-top:8px;font-size:13px;color:#854d0e;line-height:1.6;">
          ${
            application.locale === "en"
              ? "You will receive an email with a payment link as soon as your application is approved. Follow the status page below for updates."
              : application.locale === "es"
                ? "Recibirá un e-mail con el enlace de pago cuando su solicitud sea aprobada. Siga la página de estado para actualizaciones."
                : "Você receberá um e-mail com o link de pagamento assim que sua candidatura for aprovada. Acompanhe pela página de status abaixo."
          }
        </div>
      </div>
    `,
    ctaLabel:
      application.locale === "en"
        ? "Track your application"
        : application.locale === "es"
          ? "Seguir solicitud"
          : "Acompanhar candidatura",
    ctaUrl: statusUrl,
  });

  return sendMail({
    to: application.email,
    subject,
    html,
    text: `${subject}\n${statusUrl}`,
  });
}

export async function sendPaymentLinkReleasedEmail({ application, plan, checkoutUrl, statusUrl }) {
  const subject =
    application.locale === "en"
      ? `Everwin Prop — your payment link is ready • ${application.submissionCode}`
      : application.locale === "es"
        ? `Everwin Prop — su link de pago está listo • ${application.submissionCode}`
        : `Everwin Prop — seu link de pagamento está liberado • ${application.submissionCode}`;

  const html = buildEmailShell({
    preheader: subject,
    title:
      application.locale === "en"
        ? "Your application has been approved"
        : application.locale === "es"
          ? "Su solicitud ha sido aprobada"
          : "Sua candidatura foi aprovada",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">${application.locale === "en" ? `Hi ${application.firstName},` : application.locale === "es" ? `Hola ${application.firstName},` : `Olá ${application.firstName},`}</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? `Great news! Your Prop Trading application for <strong>${plan?.name ?? application.planId}</strong> has been approved. You can now proceed with the payment to activate your evaluation account.`
            : application.locale === "es"
              ? `¡Buenas noticias! Su solicitud Prop Trading para <strong>${plan?.name ?? application.planId}</strong> ha sido aprobada. Ahora puede proceder con el pago para activar su cuenta de evaluación.`
              : `Ótima notícia! Sua candidatura Prop Trading para o plano <strong>${plan?.name ?? application.planId}</strong> foi aprovada. Agora você pode realizar o pagamento para ativar sua conta de avaliação.`
        }
      </p>
      <div style="margin:16px 0;padding:18px;border-radius:18px;background:#ecfdf5;border:1px solid rgba(16,185,129,0.25);">
        <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#047857;font-weight:700;">
          ${plan?.name ?? application.planId}
        </div>
        <div style="margin-top:6px;font-size:22px;font-weight:700;color:#0f172a;">
          ${application.currency} ${application.amount}
        </div>
        <div style="margin-top:4px;font-size:13px;color:#047857;">
          ${application.submissionCode}
        </div>
      </div>
      <p style="margin:0;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? "Click the button below to access your payment page, or visit the status page for full details."
            : application.locale === "es"
              ? "Haga clic en el botón para acceder a su página de pago, o visite la página de estado para más detalles."
              : "Clique no botão abaixo para acessar sua página de pagamento, ou visite a página de status para mais detalhes."
        }
      </p>
    `,
    ctaLabel:
      application.locale === "en"
        ? "Pay now"
        : application.locale === "es"
          ? "Pagar ahora"
          : "Pagar agora",
    ctaUrl: checkoutUrl ?? statusUrl,
  });

  return sendMail({
    to: application.email,
    subject,
    html,
    text: `${subject}\n${checkoutUrl ?? statusUrl}`,
  });
}

export async function sendSubmissionReceivedEmail({ application, plan, statusUrl }) {
  const subject =
    application.locale === "en"
      ? `Everwin Prop application received • ${application.submissionCode}`
      : application.locale === "es"
        ? `Solicitud Everwin Prop recibida • ${application.submissionCode}`
        : `Inscrição Everwin Prop recebida • ${application.submissionCode}`;

  const html = buildEmailShell({
    preheader: subject,
    title:
      application.locale === "en"
        ? "Your application is now under intake"
        : application.locale === "es"
          ? "Su solicitud ya está en análisis inicial"
          : "Sua inscrição entrou no fluxo de análise",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">${application.locale === "en" ? `Hi ${application.firstName},` : application.locale === "es" ? `Hola ${application.firstName},` : `Olá ${application.firstName},`}</p>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? `We registered your Prop application for <strong>${plan?.name ?? application.planId}</strong>. Your submission code is <strong>${application.submissionCode}</strong>.`
            : application.locale === "es"
              ? `Registramos su solicitud Prop para <strong>${plan?.name ?? application.planId}</strong>. Su código de seguimiento es <strong>${application.submissionCode}</strong>.`
              : `Registramos sua inscrição Prop para o plano <strong>${plan?.name ?? application.planId}</strong>. Seu código de acompanhamento é <strong>${application.submissionCode}</strong>.`
        }
      </p>
      <p style="margin:0;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? "Use the status page below to monitor payment, review, access activation, and future account delivery."
            : application.locale === "es"
              ? "Utilice la página de estado para acompanhar pago, revisión, activación del acceso y entrega de cuenta."
              : "Use a página de status abaixo para acompanhar pagamento, revisão, ativação do acesso e entrega futura da conta."
        }
      </p>
    `,
    ctaLabel:
      application.locale === "en"
        ? "Open status page"
        : application.locale === "es"
          ? "Abrir estado"
          : "Abrir página da inscrição",
    ctaUrl: statusUrl,
  });

  return sendMail({
    to: application.email,
    subject,
    html,
    text: `${subject}\n${statusUrl}`,
  });
}

export async function sendPendingPaymentReminderEmail({ application, payment, statusUrl }) {
  const subject =
    application.locale === "en"
      ? `Pending payment reminder • ${application.submissionCode}`
      : application.locale === "es"
        ? `Recordatorio de pago pendiente • ${application.submissionCode}`
        : `Lembrete de pagamento pendente • ${application.submissionCode}`;

  const html = buildEmailShell({
    preheader: subject,
    title:
      application.locale === "en"
        ? "Your payment is still pending"
        : application.locale === "es"
          ? "Su pago aún está pendiente"
          : "Seu pagamento ainda está pendente",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? "We still have not confirmed the payment for your Prop application."
            : application.locale === "es"
              ? "Todavía no hemos confirmado el pago de su solicitud Prop."
              : "Ainda não confirmamos o pagamento da sua inscrição Prop."
        }
      </p>
      <div style="margin-top:16px;padding:16px;border-radius:18px;background:#ecfdf5;border:1px solid rgba(16,185,129,0.18);">
        <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#047857;font-weight:700;">${payment.currency} ${payment.amount}</div>
        <div style="margin-top:6px;font-size:14px;color:#0f172a;">${application.submissionCode}</div>
      </div>
      <p style="margin:16px 0 0;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? "If you already paid, just wait for confirmation. Otherwise, return to the status page to complete the next step."
            : application.locale === "es"
              ? "Si ya pagó, solo espere la confirmación. En caso contrario, vuelva a la página de estado para completar el siguiente paso."
              : "Se você já pagou, basta aguardar a confirmação. Caso contrário, volte para a página da inscrição para concluir a próxima etapa."
        }
      </p>
    `,
    ctaLabel:
      application.locale === "en"
        ? "Review submission"
        : application.locale === "es"
          ? "Ver solicitud"
          : "Revisar inscrição",
    ctaUrl: payment.checkoutUrl ?? statusUrl,
  });

  return sendMail({
    to: application.email,
    subject,
    html,
    text: `${subject}\n${statusUrl}`,
  });
}

export async function sendPaymentApprovedEmail({ application, statusUrl }) {
  const subject =
    application.locale === "en"
      ? `Payment confirmed • ${application.submissionCode}`
      : application.locale === "es"
        ? `Pago confirmado • ${application.submissionCode}`
        : `Pagamento confirmado • ${application.submissionCode}`;

  const html = buildEmailShell({
    preheader: subject,
    title:
      application.locale === "en"
        ? "Payment confirmed"
        : application.locale === "es"
          ? "Pago confirmado"
          : "Pagamento confirmado",
    bodyHtml: `
      <p style="margin:0;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? "Your application moved to the review and access-preparation phase. We will keep all updates centralized on your submission page."
            : application.locale === "es"
              ? "Su solicitud pasó a la fase de revisión y preparación del acceso. Mantendremos todas las actualizaciones centralizadas en su página de seguimiento."
              : "Sua inscrição avançou para a fase de revisão e preparação do acesso. Vamos manter todas as atualizações centralizadas na sua página de acompanhamento."
        }
      </p>
    `,
    ctaLabel:
      application.locale === "en"
        ? "Track status"
        : application.locale === "es"
          ? "Acompanhar estado"
          : "Acompanhar status",
    ctaUrl: statusUrl,
  });

  return sendMail({
    to: application.email,
    subject,
    html,
    text: `${subject}\n${statusUrl}`,
  });
}

export async function sendAccessReadyEmail({ application, portalUser, temporaryPassword, loginUrl, statusUrl }) {
  const subject =
    application.locale === "en"
      ? `Portal access ready • ${portalUser.email}`
      : application.locale === "es"
        ? `Acceso al portal listo • ${portalUser.email}`
        : `Acesso ao portal liberado • ${portalUser.email}`;

  const html = buildEmailShell({
    preheader: subject,
    title:
      application.locale === "en"
        ? "Your Everwin portal access is ready"
        : application.locale === "es"
          ? "Su acceso al portal Everwin está listo"
          : "Seu acesso ao portal Everwin está pronto",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? "Use the credentials below to enter the client area. For future password changes, use the OTP flow linked to your primary email."
            : application.locale === "es"
              ? "Use las credenciales a continuación para entrar al área del cliente. Para cambiar su contraseña en el futuro, use el flujo OTP vinculado a su e-mail principal."
              : "Use as credenciais abaixo para entrar na área do cliente. Para redefinir a senha no futuro, utilize o fluxo de OTP vinculado ao seu e-mail principal."
        }
      </p>
      <div style="margin-top:16px;padding:16px;border-radius:18px;background:#0f172a;color:#ffffff;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#6ee7b7;">Portal Login</div>
        <div style="margin-top:8px;font-size:15px;line-height:1.7;">${portalUser.email}</div>
        <div style="margin-top:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#6ee7b7;">Temporary Password</div>
        <div style="margin-top:8px;font-size:15px;line-height:1.7;">${temporaryPassword}</div>
      </div>
      <p style="margin:16px 0 0;font-size:15px;line-height:1.8;">${statusUrl}</p>
    `,
    ctaLabel:
      application.locale === "en"
        ? "Go to login"
        : application.locale === "es"
          ? "Ir al login"
          : "Ir para o login",
    ctaUrl: loginUrl,
  });

  return sendMail({
    to: application.email,
    subject,
    html,
    text: `${subject}\n${portalUser.email}\n${temporaryPassword}\n${loginUrl}`,
  });
}

export async function sendAccountCredentialsEmail({ application, portalUser, account, loginUrl }) {
  const subject =
    application.locale === "en"
      ? `Trading account delivered • ${account.accountId}`
      : application.locale === "es"
        ? `Cuenta entregada • ${account.accountId}`
        : `Conta entregue • ${account.accountId}`;

  const html = buildEmailShell({
    preheader: subject,
    title:
      application.locale === "en"
        ? "Your evaluation account is now available"
        : application.locale === "es"
          ? "Su cuenta de evaluación ya está disponible"
          : "Sua conta de avaliação já está disponível",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">
        ${
          application.locale === "en"
            ? "The evaluation account has been attached to your Everwin access. Platform credentials are below."
            : application.locale === "es"
              ? "La cuenta de evaluación fue vinculada a su acceso Everwin. Las credenciales de plataforma se muestran a continuación."
              : "A conta de avaliação foi vinculada ao seu acesso Everwin. As credenciais de plataforma estão abaixo."
        }
      </p>
      <div style="margin-top:16px;padding:16px;border-radius:18px;background:#ecfeff;border:1px solid rgba(14,165,233,0.16);">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#0369a1;">Account ID</div>
        <div style="margin-top:6px;font-size:15px;color:#0f172a;">${account.accountId}</div>
        <div style="margin-top:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#0369a1;">Platform Login</div>
        <div style="margin-top:6px;font-size:15px;color:#0f172a;">${account.platformLogin}</div>
        <div style="margin-top:12px;font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#0369a1;">Platform Password</div>
        <div style="margin-top:6px;font-size:15px;color:#0f172a;">${account.platformPassword}</div>
      </div>
      <p style="margin:16px 0 0;font-size:15px;line-height:1.8;">
        ${portalUser.email}
      </p>
    `,
    ctaLabel:
      application.locale === "en"
        ? "Open client area"
        : application.locale === "es"
          ? "Abrir área del cliente"
          : "Abrir área do cliente",
    ctaUrl: loginUrl,
  });

  return sendMail({
    to: application.email,
    subject,
    html,
    text: `${subject}\n${portalUser.email}\n${account.accountId}\n${loginUrl}`,
  });
}

export async function sendOtpEmail({ email, otp, locale, loginUrl }) {
  const subject =
    locale === "en"
      ? "Your Everwin verification code"
      : locale === "es"
        ? "Su código de verificación Everwin"
        : "Seu código de verificação Everwin";

  const html = buildEmailShell({
    preheader: subject,
    title:
      locale === "en"
        ? "Password reset verification"
        : locale === "es"
          ? "Verificación para redefinir la contraseña"
          : "Verificação para redefinir senha",
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.8;">
        ${
          locale === "en"
            ? "Use the OTP below to define a new password for your portal access."
            : locale === "es"
              ? "Use el OTP a continuación para definir una nueva contraseña para su acceso al portal."
              : "Use o OTP abaixo para definir uma nova senha para o seu acesso ao portal."
        }
      </p>
      <div style="margin-top:16px;padding:18px;border-radius:18px;background:#0f172a;color:#ffffff;text-align:center;">
        <div style="font-size:34px;letter-spacing:0.18em;font-weight:700;">${otp}</div>
      </div>
    `,
    ctaLabel:
      locale === "en"
        ? "Open login"
        : locale === "es"
          ? "Abrir login"
          : "Abrir login",
    ctaUrl: loginUrl,
  });

  return sendMail({
    to: email,
    subject,
    html,
    text: `${subject}\n${otp}\n${loginUrl}`,
  });
}
