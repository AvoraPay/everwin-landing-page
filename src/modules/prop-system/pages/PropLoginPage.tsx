import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, BarChart3, Target, TrendingUp, Trophy, ArrowRight, CheckCircle2, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Navbar } from "../../../components/Navbar";
import { Footer } from "../../../sections/Footer";
import { DisclaimerBanner } from "../../../components/DisclaimerBanner";
import { usePropSystem } from "../context";

export function PropLoginPage() {
  const { currentUser, login, bootstrapping } = usePropSystem();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!bootstrapping && currentUser) {
    return <Navigate to={currentUser.role === "admin" ? "/prop/admin/dashboard" : "/prop/client/dashboard"} replace />;
  }

  const stateFrom = location.state as { from?: string } | null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const defaultDest = result.role === "admin" ? "/prop/admin/dashboard" : "/prop/client/dashboard";
    const dest = stateFrom?.from && stateFrom.from !== "/prop" ? stateFrom.from : defaultDest;
    navigate(dest, { replace: true });
  };

  return (
    <div className="bg-neutral-100 text-black font-sans_serif">
      <Navbar />
      <DisclaimerBanner />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left — copy */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-400">Avaliação de Trading</span>
                </div>

                <h1 className="font-bricolage_grotesque text-[36px] font-semibold leading-tight tracking-tight text-white lg:text-[44px]">
                  Acompanhe seus<br />resultados e progresso
                </h1>

                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
                  Acesse o painel para acompanhar suas etapas de avaliação, resultados dos testes, métricas de desempenho e o status do projeto de liberação da conta real.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FeatureCard icon={<BarChart3 className="h-5 w-5" />} title="Resultados dos Testes" desc="Veja seu desempenho em cada fase da avaliação" />
                  <FeatureCard icon={<Target className="h-5 w-5" />} title="Etapas do Desafio" desc="Acompanhe progresso, regras e limites em tempo real" />
                  <FeatureCard icon={<TrendingUp className="h-5 w-5" />} title="Projeto de Liberação" desc="Status da liberação da conta operacional" />
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <CheckItem text="Gráficos de equity e score" />
                  <CheckItem text="Regras de drawdown e meta" />
                  <CheckItem text="Credenciais da conta de operação" />
                  <CheckItem text="Histórico de operações" />
                </div>
              </div>

              {/* Right — form */}
              <div className="mx-auto w-full max-w-[420px]">
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                      <Lock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h2 className="font-bricolage_grotesque text-xl font-semibold text-slate-950">
                      Portal do Avaliado
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Acesse seus resultados e acompanhe o progresso
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-sm transition-colors focus:border-emerald-500 focus:ring-emerald-500/20"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 pr-11 text-sm transition-colors focus:border-emerald-500 focus:ring-emerald-500/20"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {error ? (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-700">{error}</p>
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/30"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {loading ? "Entrando..." : "Acessar Resultados"}
                    </Button>
                  </form>

                  <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-center text-xs text-slate-500">
                      <strong className="text-slate-700">Acesso restrito</strong> — Credenciais fornecidas após inscrição na avaliação.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ArrowRight className="h-3 w-3" />
                    <span>Não tem acesso? <Link to="/prop" className="font-medium text-emerald-600 hover:text-emerald-500">Inscreva-se agora</Link></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/5" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/5" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="mb-2 text-emerald-400">{icon}</div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}
