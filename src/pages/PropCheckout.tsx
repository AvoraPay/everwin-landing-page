import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { Reveal } from "../components/Reveal";
import { formatPropCurrency, getPropPlans } from "../data/propPlans";
import { createSubmissionApi, fetchPublicSubmissionsConfigApi } from "../modules/prop-system/api";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  country: string;
  city: string;
  occupation: string;
  experience: string;
  session: string;
  riskPerDay: string;
  motivation: string;
  consistency: string;
  agreeRules: boolean;
  agreeNoGuarantee: boolean;
  agreeLiability: boolean;
};

type CountryKey =
  | "Brazil" | "Portugal" | "Spain" | "United Kingdom" | "United States"
  | "Canada" | "Mexico" | "Argentina" | "Chile" | "Colombia" | "Peru"
  | "France" | "Germany" | "Italy" | "Netherlands" | "Belgium" | "Switzerland"
  | "Austria" | "Ireland" | "Poland" | "Czech Republic" | "Romania" | "Hungary"
  | "Sweden" | "Norway" | "Denmark" | "Finland" | "Greece" | "Turkey"
  | "Japan" | "South Korea" | "China" | "India" | "Singapore" | "Hong Kong"
  | "United Arab Emirates" | "Saudi Arabia" | "Thailand" | "Vietnam"
  | "Philippines" | "Indonesia" | "Malaysia" | "Australia" | "New Zealand"
  | "South Africa" | "Nigeria" | "Kenya" | "Israel" | "Russia" | "Ukraine";

function getDefaultCountry(lang: "pt" | "en" | "es"): CountryKey {
  if (lang === "pt") return "Brazil";
  if (lang === "es") return "Spain";
  return "United Kingdom";
}

function getCountryOptions(lang: "pt" | "en" | "es") {
  const labels: Record<CountryKey, Record<string, string>> = {
    pt: {
      Brazil: "Brasil", Portugal: "Portugal", Spain: "Espanha", "United Kingdom": "Reino Unido",
      "United States": "Estados Unidos", Canada: "Canadá", Mexico: "México", Argentina: "Argentina",
      Chile: "Chile", Colombia: "Colômbia", Peru: "Peru", France: "França", Germany: "Alemanha",
      Italy: "Itália", Netherlands: "Países Baixos", Belgium: "Bélgica", Switzerland: "Suíça",
      Austria: "Áustria", Ireland: "Irlanda", Poland: "Polônia", "Czech Republic": "República Checa",
      Romania: "Romênia", Hungary: "Hungria", Sweden: "Suécia", Norway: "Noruega", Denmark: "Dinamarca",
      Finland: "Finlândia", Greece: "Grécia", Turkey: "Turquia", Japan: "Japão", "South Korea": "Coreia do Sul",
      China: "China", India: "Índia", Singapore: "Singapura", "Hong Kong": "Hong Kong",
      "United Arab Emirates": "Emirados Árabes", "Saudi Arabia": "Arábia Saudita", Thailand: "Tailândia",
      Vietnam: "Vietnã", Philippines: "Filipinas", Indonesia: "Indonésia", Malaysia: "Malásia",
      Australia: "Austrália", "New Zealand": "Nova Zelândia", "South Africa": "África do Sul",
      Nigeria: "Nigéria", Kenya: "Quênia", Israel: "Israel", Russia: "Rússia", Ukraine: "Ucrânia",
    },
    en: {
      Brazil: "Brazil", Portugal: "Portugal", Spain: "Spain", "United Kingdom": "United Kingdom",
      "United States": "United States", Canada: "Canada", Mexico: "Mexico", Argentina: "Argentina",
      Chile: "Chile", Colombia: "Colombia", Peru: "Peru", France: "France", Germany: "Germany",
      Italy: "Italy", Netherlands: "Netherlands", Belgium: "Belgium", Switzerland: "Switzerland",
      Austria: "Austria", Ireland: "Ireland", Poland: "Poland", "Czech Republic": "Czech Republic",
      Romania: "Romania", Hungary: "Hungary", Sweden: "Sweden", Norway: "Norway", Denmark: "Denmark",
      Finland: "Finland", Greece: "Greece", Turkey: "Turkey", Japan: "Japan", "South Korea": "South Korea",
      China: "China", India: "India", Singapore: "Singapore", "Hong Kong": "Hong Kong",
      "United Arab Emirates": "United Arab Emirates", "Saudi Arabia": "Saudi Arabia", Thailand: "Thailand",
      Vietnam: "Vietnam", Philippines: "Philippines", Indonesia: "Indonesia", Malaysia: "Malaysia",
      Australia: "Australia", "New Zealand": "New Zealand", "South Africa": "South Africa",
      Nigeria: "Nigeria", Kenya: "Kenya", Israel: "Israel", Russia: "Russia", Ukraine: "Ukraine",
    },
    es: {
      Brazil: "Brasil", Portugal: "Portugal", Spain: "España", "United Kingdom": "Reino Unido",
      "United States": "Estados Unidos", Canada: "Canadá", Mexico: "México", Argentina: "Argentina",
      Chile: "Chile", Colombia: "Colombia", Peru: "Perú", France: "Francia", Germany: "Alemania",
      Italy: "Italia", Netherlands: "Países Bajos", Belgium: "Bélgica", Switzerland: "Suiza",
      Austria: "Austria", Ireland: "Irlanda", Poland: "Polonia", "Czech Republic": "República Checa",
      Romania: "Rumanía", Hungary: "Hungría", Sweden: "Suecia", Norway: "Noruega", Denmark: "Dinamarca",
      Finland: "Finlandia", Greece: "Grecia", Turkey: "Turquía", Japan: "Japón", "South Korea": "Corea del Sur",
      China: "China", India: "India", Singapore: "Singapur", "Hong Kong": "Hong Kong",
      "United Arab Emirates": "Emiratos Árabes", "Saudi Arabia": "Arabia Saudita", Thailand: "Tailandia",
      Vietnam: "Vietnam", Philippines: "Filipinas", Indonesia: "Indonesia", Malaysia: "Malasia",
      Australia: "Australia", "New Zealand": "Nueva Zelanda", "South Africa": "Sudáfrica",
      Nigeria: "Nigeria", Kenya: "Kenia", Israel: "Israel", Russia: "Rusia", Ukraine: "Ucrania",
    },
  } as const;

  return (Object.keys(labels[lang]) as CountryKey[]).map((value) => ({ value, label: labels[lang][value] }));
}

const COUNTRY_DOCS: Record<CountryKey, readonly string[]> = {
  Brazil: ["CPF", "RG", "Passport"],
  Portugal: ["NIF", "Bilhete de Identidade", "Passport"],
  Spain: ["DNI", "NIE", "Passport"],
  "United Kingdom": ["Passport", "National Insurance Number", "Driving Licence"],
  "United States": ["Passport", "SSN", "Driver License", "State ID"],
  Canada: ["Passport", "SIN", "Driver License"],
  Mexico: ["Passport", "CURP", "INE"],
  Argentina: ["Passport", "DNI", "CUIT"],
  Chile: ["Passport", "RUT", "Cédula de Identidad"],
  Colombia: ["Passport", "Cédula de Ciudadanía", "NIT"],
  Peru: ["Passport", "DNI", "CE"],
  France: ["Passport", "Carte Nationale d'Identité", "NIR"],
  Germany: ["Passport", "Personalausweis", "Steuer-ID"],
  Italy: ["Passport", "Carta d'Identità", "Codice Fiscale"],
  Netherlands: ["Passport", "BSN", "ID Card"],
  Belgium: ["Passport", "eID", "National Number"],
  Switzerland: ["Passport", "ID Card", "AHV Number"],
  Austria: ["Passport", "Personalausweis", "SV-Nummer"],
  Ireland: ["Passport", "PPS Number", "Public Services Card"],
  Poland: ["Passport", "Dowód Osobisty", "PESEL"],
  "Czech Republic": ["Passport", "Občanský průkaz", "Rodné číslo"],
  Romania: ["Passport", "Carte de Identitate", "CNP"],
  Hungary: ["Passport", "Személyi Igazolvány", "Adószám"],
  Sweden: ["Passport", "Personnummer", "ID-kort"],
  Norway: ["Passport", "Personnummer", "ID-kort"],
  Denmark: ["Passport", "CPR-nummer", "ID-kort"],
  Finland: ["Passport", "Henkilötunnus", "ID-kort"],
  Greece: ["Passport", "Αριθμός Ταυτότητας", "ΑΦΜ"],
  Turkey: ["Passport", "Kimlik Numarası", "TC Kimlik"],
  Japan: ["Passport", "My Number Card", "Driver License"],
  "South Korea": ["Passport", "Resident Registration Number", "Driver License"],
  China: ["Passport", "Shenfenzheng", "Residence Permit"],
  India: ["Passport", "Aadhaar Card", "PAN Card"],
  Singapore: ["Passport", "NRIC", "FIN"],
  "Hong Kong": ["Passport", "HKID", "Travel Permit"],
  "United Arab Emirates": ["Passport", "Emirates ID", "Residence Visa"],
  "Saudi Arabia": ["Passport", "National ID", "Iqama"],
  Thailand: ["Passport", "Thai ID Card", "Work Permit"],
  Vietnam: ["Passport", "CCCD", "CMND"],
  Philippines: ["Passport", "PhilSys ID", "Driver License"],
  Indonesia: ["Passport", "KTP", "SIM"],
  Malaysia: ["Passport", "MyKad", "PR Card"],
  Australia: ["Passport", "Driver License", "Medicare"],
  "New Zealand": ["Passport", "Driver License", "Firearms Licence"],
  "South Africa": ["Passport", "ID Book", "Driver License"],
  Nigeria: ["Passport", "NIN", "Voter's Card"],
  Kenya: ["Passport", "National ID", "Alien Card"],
  Israel: ["Passport", "Teudat Zehut", "Driver License"],
  Russia: ["Passport", "СНИЛС", "ИНН"],
  Ukraine: ["Passport", "ID Card", "ІПН"],
};

function getDocumentOptions(country: string, lang: "pt" | "en" | "es") {
  if (country in COUNTRY_DOCS) return COUNTRY_DOCS[country as CountryKey];
  const fallback = { pt: ["Documento Nacional", "Passaporte"], en: ["National ID", "Passport"], es: ["Documento Nacional", "Pasaporte"] } as const;
  return fallback[lang];
}

function getDefaultDocumentType(country: string, lang: "pt" | "en" | "es") {
  return getDocumentOptions(country, lang)[0] ?? (lang === "en" ? "Document" : "Documento");
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === Number(digits[10]);
}

function validateDocument(country: string, documentType: string, documentNumber: string) {
  const normalized = documentNumber.trim();
  if (!normalized) return false;
  if (country === "Brazil" && documentType === "CPF") {
    return isValidCpf(normalized);
  }
  return normalized.length >= 5;
}

function normalizeDocumentForInput(country: string, documentType: string, value: string) {
  if (country === "Brazil" && documentType === "CPF") {
    return formatCpf(value);
  }
  return value.toUpperCase();
}

function getInitialForm(lang: "pt" | "en" | "es"): FormData {
  const country = getDefaultCountry(lang);
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentType: getDefaultDocumentType(country, lang),
    documentNumber: "",
    country,
    city: "",
    occupation: "",
    experience: "",
    session: "",
    riskPerDay: "",
    motivation: "",
    consistency: "",
    agreeRules: false,
    agreeNoGuarantee: false,
    agreeLiability: false,
  };
}

export default function PropCheckout() {
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const lang: "pt" | "en" | "es" = i18n.language?.startsWith("pt")
    ? "pt"
    : i18n.language?.startsWith("es")
      ? "es"
      : "en";

  const labels = LABELS[lang];
  const plans = getPropPlans(i18n.language);
  const selectedPlan = plans.find((plan) => plan.key === params.get("plan")) ?? plans[1] ?? plans[0];

  const [form, setForm] = useState<FormData>(() => getInitialForm(lang));
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [currentPlanKey, setCurrentPlanKey] = useState<string | null>(params.get("plan"));
  const [vacanciesLocked, setVacanciesLocked] = useState(false);
  const [vacanciesMessage, setVacanciesMessage] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  // Reset form and step when plan parameter changes
  useEffect(() => {
    const newPlanKey = params.get("plan");
    if (newPlanKey !== currentPlanKey) {
      setCurrentPlanKey(newPlanKey);
      setStep(1);
      setSubmissionError(null);
      setForm(getInitialForm(lang));
    }
  }, [params.get("plan"), currentPlanKey, lang]);

  useEffect(() => {
    setForm((prev) => {
      const nextCountry = getDefaultCountry(lang);
      const defaultCountries = ["Brazil", "Spain", "United Kingdom"];
      if (!defaultCountries.includes(prev.country)) return prev;
      return {
        ...prev,
        country: nextCountry,
        documentType: getDefaultDocumentType(nextCountry, lang),
        documentNumber: "",
      };
    });
  }, [lang]);

  useEffect(() => {
    fetchPublicSubmissionsConfigApi()
      .then((config) => {
        setVacanciesLocked(config.vacanciesLocked);
        setVacanciesMessage(config.vacanciesMessage || "");
      })
      .catch(() => {
        setVacanciesLocked(false);
      });
  }, []);

  const update = (key: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const countryOptions = useMemo(() => getCountryOptions(lang), [lang]);
  const documentOptions = useMemo(() => getDocumentOptions(form.country, lang), [form.country, lang]);
  const documentLabel = form.country === "Brazil" && form.documentType === "CPF" ? labels.cpf : labels.documentNumber;
  const documentHelp = form.country === "Brazil" && form.documentType === "CPF" ? labels.cpfHelp : labels.documentHelp;
  const documentValid = validateDocument(form.country, form.documentType, form.documentNumber);

  const stepOneValid = useMemo(
    () =>
      form.firstName.trim().length >= 2 &&
      form.lastName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
      form.phone.trim().length >= 8 &&
      documentValid &&
      form.country.trim().length >= 2 &&
      form.city.trim().length >= 2 &&
      form.occupation.trim().length >= 2,
    [documentValid, form],
  );

  const stepTwoValid = useMemo(
    () =>
      form.experience.trim().length > 0 &&
      form.session.trim().length > 0 &&
      form.riskPerDay.trim().length > 0 &&
      form.motivation.trim().length >= 20 &&
      form.consistency.trim().length >= 20,
    [form],
  );

  const stepThreeValid = useMemo(
    () => form.agreeRules && form.agreeNoGuarantee && form.agreeLiability,
    [form],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepThreeValid) return;

    setSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await createSubmissionApi({
        planKey: selectedPlan.key,
        locale: i18n.language,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        documentType: form.documentType.trim(),
        documentNumber: form.documentNumber.trim(),
        country: form.country.trim(),
        city: form.city.trim(),
        occupation: form.occupation.trim(),
        experience: form.experience.trim(),
        session: form.session.trim(),
        riskPerDay: form.riskPerDay.trim(),
        motivation: form.motivation.trim(),
        consistency: form.consistency.trim(),
        agreeRules: true,
        agreeNoGuarantee: true,
        agreeLiability: true,
      });

      // Save submission code for status tracking
      localStorage.setItem("everwin-prop-last-submission", result.submissionCode);

      // Waitlist mode: redirect to status page (payment link will be sent by admin later)
      navigate(`/prop/submission?id=${result.submissionCode}`);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : labels.errorFallback);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(187deg,rgb(246,247,249)_-24%,rgb(224,227,235)_100%)] px-4 pb-24 pt-[110px] md:pt-[140px]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.06]" style={{
        backgroundImage:
          "linear-gradient(rgba(15,23,42,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px)",
        backgroundSize: "58px 58px",
      }} />

      <div className="relative z-[1] mx-auto max-w-[1060px]">
        <Reveal>
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-bricolage_grotesque text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">
                {labels.badge}
              </span>
            </div>

            <h1 className="font-bricolage_grotesque text-[36px] font-bold leading-[1.08] tracking-[-0.02em] text-gray-800 md:text-[54px]">
              {labels.title}
            </h1>
            <p className="max-w-[720px] font-bricolage_grotesque text-base leading-7 text-gray-500">{labels.subtitle}</p>
            
            {/* Selected Plan Display */}
            <div className="mt-4 inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2">
              <p className="font-bricolage_grotesque text-sm text-gray-600">
                {labels.selectedBalance}: <span className="font-bold text-emerald-700">{formatPropCurrency(selectedPlan.size, i18n.language)}</span>
              </p>
            </div>

            {vacanciesLocked ? (
              <div className="mt-4 w-full max-w-[820px] rounded-2xl border border-amber-300/60 bg-amber-50 px-5 py-4 text-left">
                <p className="font-bricolage_grotesque text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">{labels.vacanciesTitle}</p>
                <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-amber-800">{vacanciesMessage || labels.vacanciesDefaultMessage}</p>
              </div>
            ) : null}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <Reveal delay={90}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <StepChip active={step === 1} done={step > 1} index="1" label={labels.step1} onClick={() => setStep(1)} />
                <div className="h-px flex-1 bg-gray-300" />
                <StepChip active={step === 2} done={step > 2} index="2" label={labels.step2} onClick={() => stepOneValid && setStep(2)} />
                <div className="h-px flex-1 bg-gray-300" />
                <StepChip active={step === 3} done={false} index="3" label={labels.step3} onClick={() => stepOneValid && stepTwoValid && setStep(3)} />
              </div>

              {step === 1 && (
                <CardSection title={labels.personalTitle}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField label={labels.firstName} value={form.firstName} onChange={(v) => update("firstName", v)} />
                    <InputField label={labels.lastName} value={form.lastName} onChange={(v) => update("lastName", v)} />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField label={labels.email} type="email" value={form.email} onChange={(v) => update("email", v)} />
                    <InputField label={labels.phone} type="tel" value={form.phone} onChange={(v) => update("phone", v)} />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SelectField
                      label={labels.country}
                      value={form.country}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          country: value,
                          documentType: getDefaultDocumentType(value, lang),
                          documentNumber: "",
                        }))
                      }
                      options={countryOptions.map((option) => option.value)}
                      optionLabels={Object.fromEntries(countryOptions.map((option) => [option.value, option.label]))}
                    />
                    <SelectField
                      label={labels.documentType}
                      value={form.documentType}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          documentType: value,
                          documentNumber: "",
                        }))
                      }
                      options={documentOptions}
                    />
                    <InputField
                      label={documentLabel}
                      value={form.documentNumber}
                      onChange={(value) => update("documentNumber", normalizeDocumentForInput(form.country, form.documentType, value))}
                      helper={documentHelp}
                      error={!documentValid && form.documentNumber.length > 0 ? labels.documentInvalid : undefined}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <InputField label={labels.city} value={form.city} onChange={(v) => update("city", v)} />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <InputField label={labels.occupation} value={form.occupation} onChange={(v) => update("occupation", v)} />
                  </div>

                  <div className="mt-6">
                    <PrimaryButton type="button" disabled={!stepOneValid} onClick={() => setStep(2)}>
                      {labels.continue}
                    </PrimaryButton>
                  </div>
                </CardSection>
              )}

              {step === 2 && (
                <CardSection title={labels.profileTitle}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SelectField label={labels.experience} value={form.experience} onChange={(v) => update("experience", v)} options={labels.experienceOptions} />
                    <SelectField label={labels.session} value={form.session} onChange={(v) => update("session", v)} options={labels.sessionOptions} />
                    <SelectField label={labels.riskPerDay} value={form.riskPerDay} onChange={(v) => update("riskPerDay", v)} options={labels.riskOptions} />
                  </div>

                  <div className="mt-4">
                    <TextAreaField label={labels.motivation} value={form.motivation} onChange={(v) => update("motivation", v)} placeholder={labels.motivationPlaceholder} />
                  </div>
                  <div className="mt-4">
                    <TextAreaField label={labels.consistency} value={form.consistency} onChange={(v) => update("consistency", v)} placeholder={labels.consistencyPlaceholder} />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <GhostButton type="button" onClick={() => setStep(1)}>{labels.back}</GhostButton>
                    <PrimaryButton type="button" disabled={!stepTwoValid} onClick={() => setStep(3)}>{labels.continue}</PrimaryButton>
                  </div>
                </CardSection>
              )}

              {step === 3 && (
                <CardSection title={labels.termsTitle}>
                  <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                    <p className="font-bricolage_grotesque text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{labels.summaryTitle}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 font-bricolage_grotesque text-sm">
                      <div>
                        <span className="text-gray-500">{labels.selectedBalance}</span>
                        <p className="font-bold text-slate-900">{formatPropCurrency(selectedPlan.size, i18n.language)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">{labels.applicationFee}</span>
                        <p className="font-bold text-slate-900">{formatPropCurrency(selectedPlan.price, i18n.language)}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-emerald-200 pt-3 font-bricolage_grotesque text-xs text-gray-600">
                      <div>{lang === "pt" ? "Meta F1: 10%" : lang === "es" ? "Objetivo F1: 10%" : "Target P1: 10%"}</div>
                      <div>{lang === "pt" ? "Drawdown: 5%" : "Drawdown: 5%"}</div>
                      <div>{lang === "pt" ? "Loss diário: 3%" : lang === "es" ? "Pérdida diaria: 3%" : "Daily loss: 3%"}</div>
                      <div>{lang === "pt" ? "Duração: 30 dias" : lang === "es" ? "Duración: 30 días" : "Duration: 30 days"}</div>
                      <div>{lang === "pt" ? "Dias mín: 5" : lang === "es" ? "Días mín: 5" : "Min days: 5"}</div>
                      <div>Split: 90/10</div>
                    </div>
                  </div>

                  <p className="mb-4 font-bricolage_grotesque text-sm leading-6 text-gray-500">{labels.termsIntro}</p>

                  <div className="flex flex-col gap-3">
                    <CheckRow checked={form.agreeRules} onChange={(v) => update("agreeRules", v)} label={labels.agreeRules} />
                    <CheckRow checked={form.agreeNoGuarantee} onChange={(v) => update("agreeNoGuarantee", v)} label={labels.agreeNoGuarantee} />
                    <CheckRow checked={form.agreeLiability} onChange={(v) => update("agreeLiability", v)} label={labels.agreeLiability} />
                  </div>

                  <div className="mt-6 rounded-2xl border border-amber-400/35 bg-amber-50 p-5">
                    <p className="font-bricolage_grotesque text-xs font-semibold uppercase tracking-[0.11em] text-gray-800">{labels.legalTitle}</p>
                    <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-gray-600">{labels.legalText1}</p>
                    <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-gray-600">{labels.legalText2}</p>
                    <p className="mt-2 font-bricolage_grotesque text-sm leading-6 text-gray-600">{labels.legalText3}</p>
                    <p className="mt-3 font-bricolage_grotesque text-sm leading-6 text-gray-700">
                      <Link to="/legal/prop-trading-terms" className="font-semibold text-emerald-600 hover:text-emerald-500">
                        {labels.readPolicy}
                      </Link>
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <GhostButton type="button" onClick={() => setStep(2)}>{labels.back}</GhostButton>
                    <PrimaryButton type="submit" disabled={!stepThreeValid || submitting}>
                      {submitting ? labels.submitting : labels.submit}
                    </PrimaryButton>
                  </div>
                  {submissionError ? <p className="mt-3 text-sm text-red-600">{submissionError}</p> : null}
                </CardSection>
              )}
            </form>
          </Reveal>

          <Reveal delay={160}>
            <aside className="sticky top-[96px] flex flex-col gap-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-medium text-slate-400">{labels.summaryTitle}</p>

                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-slate-600">{labels.selectedBalance}</p>
                  <p className="mt-1 font-bricolage_grotesque text-xl font-bold text-emerald-700">
                    {formatPropCurrency(selectedPlan.size, i18n.language)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {labels.applicationFee}: <span className="font-semibold text-slate-700">{formatPropCurrency(selectedPlan.price, i18n.language)}</span>
                  </p>
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-950">{labels.nextStepsTitle}</p>
                <div className="mt-3 flex flex-col gap-2.5">
                  {labels.nextSteps.map((point) => (
                    <div key={point} className="flex items-start gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <p className="text-sm leading-6 text-slate-600">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">{labels.importantTitle}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{labels.importantDesc}</p>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function CardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="mb-4 font-bricolage_grotesque text-lg font-semibold text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function StepChip({ active, done, index, label, onClick }: { active: boolean; done: boolean; index: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition md:text-sm",
        active || done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500",
      )}
    >
      <span className={cn(
        "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold",
        active || done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500",
      )}>
        {index}
      </span>
      {label}
    </button>
  );
}

function PrimaryButton({ children, type, disabled, onClick }: { children: ReactNode; type: "button" | "submit"; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function GhostButton({ children, type, onClick }: { children: ReactNode; type: "button" | "submit"; onClick?: () => void }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  helper,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  helper?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
      {helper ? <p className="text-[11px] text-slate-400">{helper}</p> : null}
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  optionLabels,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  optionLabels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="">-</option>
        {options.map((option) => (
          <option key={option} value={option}>{optionLabels?.[option] ?? option}</option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
}

function CheckRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-600" />
      <span className="text-sm leading-6 text-slate-700">{label}</span>
    </label>
  );
}

const LABELS = {
  pt: {
    badge: "Formulário de Candidatura",
    title: "Candidatura para Conta de Avaliação",
    subtitle: "Este formulário funciona como entrevista de perfil para acesso ao programa Prop. Se aprovado, você recebe a conta para iniciar.",
    step1: "Dados",
    step2: "Perfil",
    step3: "Termos",
    personalTitle: "Dados Pessoais",
    firstName: "Nome",
    lastName: "Sobrenome",
    email: "E-mail",
    phone: "Telefone",
    cpf: "CPF",
    documentType: "Tipo de documento",
    documentNumber: "Documento",
    documentHelp: "Informe o documento principal do país selecionado.",
    cpfHelp: "Use um CPF válido.",
    documentInvalid: "Documento inválido para o país selecionado.",
    country: "País",
    city: "Cidade",
    occupation: "Profissão",
    profileTitle: "Perfil Operacional",
    experience: "Experiência",
    session: "Sessão principal",
    riskPerDay: "Risco diário médio",
    motivation: "Por que você quer entrar no programa?",
    consistency: "Como você mantém consistência ao longo dos dias?",
    motivationPlaceholder: "Descreva objetivos e disciplina operacional.",
    consistencyPlaceholder: "Explique sua gestão de risco e controle de drawdown.",
    experienceOptions: ["Menos de 6 meses", "6 meses a 2 anos", "2 a 5 anos", "Mais de 5 anos"],
    sessionOptions: ["Abertura", "Meio de sessão", "Fechamento", "Múltiplas janelas"],
    riskOptions: ["Até 0,5%", "0,5% a 1%", "1% a 2%", "Acima de 2%"],
    continue: "Continuar",
    back: "Voltar",
    termsTitle: "Termos e Responsabilidade",
    termsIntro: "Confirme que leu as regras da política de Prop Trading antes de enviar.",
    agreeRules: "Concordo com as regras operacionais e políticas de risco do programa.",
    agreeNoGuarantee: "Estou ciente de que o envio não garante aprovação, conta financiada ou payout.",
    agreeLiability: "Reconheço responsabilidade integral pelas decisões de trading e isento a Everwin de perdas diretas ou indiretas.",
    legalTitle: "Aviso Legal",
    legalText1: "A Everwin analisa cada candidatura com critérios internos de risco, compliance e consistência operacional.",
    legalText2: "A ativação da conta depende de aprovação manual e cumprimento das condições estabelecidas na política oficial.",
    legalText3: "Operações de mercado envolvem risco elevado e podem gerar perdas financeiras parciais ou totais.",
    readPolicy: "Ler Política Completa de Prop Trading",
    submit: "Enviar Candidatura",
    submitting: "Enviando...",
    summaryTitle: "Resumo da Aplicação",
    selectedBalance: "Saldo selecionado",
    applicationFee: "Taxa de avaliação",
    nextStepsTitle: "Próximas etapas",
    nextSteps: [
      "Análise de perfil e elegibilidade.",
      "Aprovação manual com base nas regras do programa.",
      "Envio dos dados da conta para início da avaliação.",
    ],
    importantTitle: "Importante",
    importantDesc: "A participação exige cumprimento contínuo das regras de risco, execução e payout. Violações podem encerrar a elegibilidade.",
    successTitle: "Candidatura Recebida",
    successDesc: "Seu perfil foi enviado para análise. Se aprovado, você receberá por e-mail os dados da conta de avaliação.",
    successDisclaimer: "Este processo não garante aprovação automática. A continuidade depende das políticas do programa.",
    errorFallback: "Não foi possível enviar sua inscrição agora.",
    vacanciesTitle: "Vagas Fechadas",
    vacanciesDefaultMessage: "Vagas temporariamente fechadas. Sua candidatura continua ativa e o link de pagamento será liberado manualmente quando houver disponibilidade.",
  },
  en: {
    badge: "Candidate Application",
    title: "Evaluation Account Candidate Form",
    subtitle: "This form is used to assess candidate fit before account activation.",
    step1: "Details",
    step2: "Profile",
    step3: "Terms",
    personalTitle: "Personal Details",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    cpf: "CPF / Document",
    documentType: "Document type",
    documentNumber: "Document number",
    documentHelp: "Use the primary identification document for the selected country.",
    cpfHelp: "Enter a valid CPF. Real validation is applied.",
    documentInvalid: "Invalid document for the selected country.",
    country: "Country",
    city: "City",
    occupation: "Occupation",
    profileTitle: "Operational Profile",
    experience: "Experience",
    session: "Main session",
    riskPerDay: "Average daily risk",
    motivation: "Why do you want to join?",
    consistency: "How do you maintain consistency?",
    motivationPlaceholder: "Describe your goals and discipline.",
    consistencyPlaceholder: "Describe risk and drawdown control.",
    experienceOptions: ["Under 6 months", "6 months to 2 years", "2 to 5 years", "Over 5 years"],
    sessionOptions: ["Open", "Mid session", "Close", "Multiple windows"],
    riskOptions: ["Up to 0.5%", "0.5% to 1%", "1% to 2%", "Above 2%"],
    continue: "Continue",
    back: "Back",
    termsTitle: "Terms and Liability",
    termsIntro: "Confirm you read the Prop Trading policy before submitting.",
    agreeRules: "I agree with operational and risk policy rules.",
    agreeNoGuarantee: "I understand submission does not guarantee approval, funding, or payout.",
    agreeLiability: "I accept full responsibility for trading decisions and release Everwin from direct or indirect losses.",
    legalTitle: "Legal Notice",
    legalText1: "Everwin reviews each application based on internal risk, compliance, and consistency criteria.",
    legalText2: "Account activation depends on manual approval and policy compliance.",
    legalText3: "Trading carries substantial risk and may lead to partial or total financial loss.",
    readPolicy: "Read Full Prop Trading Policy",
    submit: "Submit Application",
    submitting: "Submitting...",
    summaryTitle: "Application Summary",
    selectedBalance: "Selected balance",
    applicationFee: "Evaluation fee",
    nextStepsTitle: "Next steps",
    nextSteps: [
      "Profile and eligibility review.",
      "Manual approval based on program policy.",
      "Account details sent by email for evaluation start.",
    ],
    importantTitle: "Important",
    importantDesc: "Ongoing compliance with risk, execution, and payout policy is mandatory.",
    successTitle: "Application Received",
    successDesc: "Your profile is under review. If approved, account details will be sent by email.",
    successDisclaimer: "This process does not guarantee automatic approval.",
    errorFallback: "We could not submit your application right now.",
    vacanciesTitle: "Vacancies Locked",
    vacanciesDefaultMessage: "Vacancies temporarily closed. Your application remains active and the payment link will be released manually when availability opens.",
  },
  es: {
    badge: "Formulario de Candidatura",
    title: "Candidatura para Cuenta de Evaluación",
    subtitle: "Este formulario evalúa elegibilidad antes de activar la cuenta.",
    step1: "Datos",
    step2: "Perfil",
    step3: "Términos",
    personalTitle: "Datos Personales",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo",
    phone: "Teléfono",
    cpf: "CPF / Documento",
    documentType: "Tipo de documento",
    documentNumber: "Documento",
    documentHelp: "Use el documento principal del país seleccionado.",
    cpfHelp: "Ingrese un CPF válido. La validación es real.",
    documentInvalid: "Documento inválido para el país seleccionado.",
    country: "País",
    city: "Ciudad",
    occupation: "Profesión",
    profileTitle: "Perfil Operativo",
    experience: "Experiencia",
    session: "Sesión principal",
    riskPerDay: "Riesgo diario medio",
    motivation: "¿Por qué quiere entrar?",
    consistency: "¿Cómo mantiene consistencia?",
    motivationPlaceholder: "Describa objetivos y disciplina.",
    consistencyPlaceholder: "Describa control de riesgo y drawdown.",
    experienceOptions: ["Menos de 6 meses", "6 meses a 2 años", "2 a 5 años", "Más de 5 años"],
    sessionOptions: ["Apertura", "Media sesión", "Cierre", "Múltiples ventanas"],
    riskOptions: ["Hasta 0,5%", "0,5% a 1%", "1% a 2%", "Más de 2%"],
    continue: "Continuar",
    back: "Volver",
    termsTitle: "Términos y Responsabilidad",
    termsIntro: "Confirme que leyó la política de Prop Trading antes de enviar.",
    agreeRules: "Acepto reglas operativas y políticas de riesgo.",
    agreeNoGuarantee: "Entiendo que el envío no garantiza aprobación, fondeo ni payout.",
    agreeLiability: "Acepto responsabilidad total por decisiones de trading y libero a Everwin de pérdidas directas o indirectas.",
    legalTitle: "Aviso Legal",
    legalText1: "Everwin analiza cada solicitud con criterios internos de riesgo, compliance y consistencia.",
    legalText2: "La activación depende de aprobación manual y cumplimiento de política.",
    legalText3: "Trading implica riesgo alto y puede causar pérdidas parciales o totales.",
    readPolicy: "Leer Política Completa de Prop Trading",
    submit: "Enviar Candidatura",
    submitting: "Enviando...",
    summaryTitle: "Resumen",
    selectedBalance: "Saldo seleccionado",
    applicationFee: "Tarifa de evaluación",
    nextStepsTitle: "Próximos pasos",
    nextSteps: [
      "Revisión de perfil y elegibilidad.",
      "Aprobación manual según política.",
      "Envío de cuenta por correo para iniciar evaluación.",
    ],
    importantTitle: "Importante",
    importantDesc: "Cumplir reglas de riesgo, ejecución y payout es obligatorio para mantener elegibilidad.",
    successTitle: "Candidatura Recibida",
    successDesc: "Su perfil está en revisión. Si se aprueba, recibirá los datos por correo.",
    successDisclaimer: "Este proceso no garantiza aprobación automática.",
    errorFallback: "No fue posible enviar su solicitud ahora mismo.",
    vacanciesTitle: "Vacantes Cerradas",
    vacanciesDefaultMessage: "Vacantes temporalmente cerradas. Su candidatura sigue activa y el enlace de pago será enviado manualmente cuando haya disponibilidad.",
  },
} as const;
