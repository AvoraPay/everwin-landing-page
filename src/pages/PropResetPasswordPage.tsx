import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { confirmPasswordOtpApi, requestPasswordOtpApi } from "../modules/prop-system/api";
import { normalizeAppLanguage } from "../lib/language";

const COPY = {
  pt: {
    title: "Redefinir acesso do portal",
    subtitle: "Informe o e-mail principal da compra. Vamos enviar um OTP para esse endereço e você poderá definir uma nova senha.",
    email: "E-mail principal",
    otp: "Código OTP",
    password: "Nova senha",
    requestOtp: "Enviar OTP",
    confirm: "Definir nova senha",
    success: "Senha atualizada com sucesso. Você já pode voltar ao login.",
    otpSent: "OTP enviado com sucesso.",
    otpRequestError: "Falha ao solicitar OTP.",
    passwordResetError: "Falha ao redefinir a senha.",
    loadingOtp: "Enviando...",
    loadingReset: "Salvando...",
    back: "Voltar ao login",
  },
  en: {
    title: "Reset portal access",
    subtitle: "Enter the primary email used on purchase. We will send an OTP there so you can define a new password.",
    email: "Primary email",
    otp: "OTP code",
    password: "New password",
    requestOtp: "Send OTP",
    confirm: "Set new password",
    success: "Password updated successfully. You can now go back to login.",
    otpSent: "OTP sent successfully.",
    otpRequestError: "Failed to request OTP.",
    passwordResetError: "Failed to reset password.",
    loadingOtp: "Sending...",
    loadingReset: "Saving...",
    back: "Back to login",
  },
  es: {
    title: "Restablecer acceso al portal",
    subtitle: "Informe el e-mail principal de la compra. Enviaremos un OTP a esa dirección para que pueda definir una nueva contraseña.",
    email: "E-mail principal",
    otp: "Código OTP",
    password: "Nueva contraseña",
    requestOtp: "Enviar OTP",
    confirm: "Definir nueva contraseña",
    success: "La contraseña fue actualizada. Ya puede volver al login.",
    otpSent: "OTP enviado con éxito.",
    otpRequestError: "Error al solicitar OTP.",
    passwordResetError: "Error al redefinir la contraseña.",
    loadingOtp: "Enviando...",
    loadingReset: "Guardando...",
    back: "Volver al login",
  },
} as const;

export default function PropResetPasswordPage() {
  const { i18n } = useTranslation();
  const lang = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);
  const copy = COPY[lang];
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] px-4 pb-24 pt-[120px]">
      <div className="mx-auto max-w-[620px] rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_28px_70px_-54px_rgba(15,23,42,0.45)]">
        <h1 className="font-bricolage_grotesque text-[34px] font-bold leading-[1.04] tracking-[-0.03em] text-slate-900">{copy.title}</h1>
        <p className="mt-3 font-bricolage_grotesque text-sm leading-7 text-slate-500">{copy.subtitle}</p>

        <div className="mt-7 space-y-4">
          <Field label={copy.email} value={email} onChange={setEmail} type="email" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={async () => {
                setSending(true);
                setError(null);
                setMessage(null);
                try {
                  await requestPasswordOtpApi(email);
                  setMessage(copy.otpSent);
                } catch (err) {
                  setError(err instanceof Error ? err.message : copy.otpRequestError);
                } finally {
                  setSending(false);
                }
              }}
              className="inline-flex rounded-2xl bg-emerald-500 px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-slate-950"
            >
              {sending ? copy.loadingOtp : copy.requestOtp}
            </button>
          </div>

          <Field label={copy.otp} value={otp} onChange={setOtp} />
          <Field label={copy.password} value={newPassword} onChange={setNewPassword} type="password" />

          <button
            type="button"
            onClick={async () => {
              setSaving(true);
              setError(null);
              setMessage(null);
              try {
                await confirmPasswordOtpApi(email, otp, newPassword);
                setMessage(copy.success);
              } catch (err) {
                setError(err instanceof Error ? err.message : copy.passwordResetError);
              } finally {
                setSaving(false);
              }
            }}
            className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 font-bricolage_grotesque text-sm font-semibold text-white"
          >
            {saving ? copy.loadingReset : copy.confirm}
          </button>
        </div>

        {message ? <p className="mt-5 font-bricolage_grotesque text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-5 font-bricolage_grotesque text-sm text-red-600">{error}</p> : null}

        <Link to="/prop/login" className="mt-8 inline-flex font-bricolage_grotesque text-sm font-semibold text-slate-600 hover:text-slate-900">
          {copy.back}
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-bricolage_grotesque text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-slate-300 bg-white px-4 font-bricolage_grotesque text-sm text-slate-900 outline-none focus:border-emerald-400"
      />
    </div>
  );
}
