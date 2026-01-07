// everwin-page/src/sections/ToolsSection/components/ToolCard.tsx
import React, { useId, useMemo, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";

type ToolCardType = "header" | "alert" | "automation" | "feed" | "calendar";

type FeedItem = { name: string; sub: string };

type CalendarEvent = { title: string; time: string; active?: boolean };

type ToolCardProps = {
  type: ToolCardType;
  title: React.ReactNode;
  description: React.ReactNode;

  // alert
  badgeLabel?: string;
  metricLabel?: string;
  metricValue?: string;
  metricIconUrl?: string; // ✅ novo

  // automation
  resultLabel?: string;
  resultValue?: string;

  // feed
  listTitle?: string;
  list?: FeedItem[];
  footerNote?: string;

  // calendar
  calendarTitle?: string;
  events?: CalendarEvent[];
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export const ToolCard = (props: ToolCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25, once: true });

  // Parallax no scroll (card inteiro + preview)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.15"],
  });

  const cardY = useTransform(scrollYProgress, [0, 1], [10, -10]);
  const previewY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const previewScale = useTransform(scrollYProgress, [0, 1], [0.985, 1.015]);

  const isHeader = props.type === "header";

  const baseCard =
    "relative overflow-hidden rounded-[21px] backdrop-blur-[5px] bg-[linear-gradient(-83deg,rgb(23,26,35)_8%,rgb(37,42,54)_171%)]";

  const headerCard = "relative rounded-2xl bg-transparent md:px-8 md:py-8";

  const wrapperClass = isHeader ? "relative w-full" : `${baseCard} w-full`;

  const previewHeight = useMemo(() => {
    if (props.type === "feed" || props.type === "calendar") return "h-[260px]";
    return "h-[300px]";
  }, [props.type]);

  return (
    <motion.div
      ref={ref}
      variants={reveal}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      style={isHeader ? undefined : { y: cardY }}
      className={wrapperClass}
    >
      {/* Glow / moving light */}
      {!isHeader && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-20 opacity-35"
          animate={{
            rotate: [0, 8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(16,185,129,0.22), rgba(0,0,0,0) 60%)",
          }}
        />
      )}

      {/* HEADER */}
      {isHeader && (
        <div className={headerCard}>
          <div className="flex flex-col items-center text-center gap-4">
            <motion.div
              className="h-[60px] w-[60px] rounded-2xl bg-emerald-500/10 flex items-center justify-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                  stroke="rgb(16,185,129)"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.2 2.2 0 0 1-1.56 3.76 2.2 2.2 0 0 1-1.55-.64l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.06 1.64V22a2.2 2.2 0 0 1-4.4 0v-.06A1.8 1.8 0 0 0 7.1 20.3a1.8 1.8 0 0 0-1.98.36l-.04.04A2.2 2.2 0 1 1 2.52 17l.04-.04A1.8 1.8 0 0 0 2.92 15a1.8 1.8 0 0 0-1.64-1.06H1.2a2.2 2.2 0 0 1 0-4.4h.06A1.8 1.8 0 0 0 2.92 7.9a1.8 1.8 0 0 0-.36-1.98l-.04-.04A2.2 2.2 0 1 1 5.08 3.2l.04.04A1.8 1.8 0 0 0 7.1 3.6 1.8 1.8 0 0 0 8.16 2V1.94a2.2 2.2 0 0 1 4.4 0V2a1.8 1.8 0 0 0 1.06 1.64 1.8 1.8 0 0 0 1.98-.36l.04-.04A2.2 2.2 0 1 1 21.28 5.8l-.04.04A1.8 1.8 0 0 0 20.88 7.9c.2.47.66.8 1.18.84H22a2.2 2.2 0 0 1 0 4.4h-.06A1.8 1.8 0 0 0 19.4 15Z"
                  stroke="rgb(16,185,129)"
                  strokeWidth="1.4"
                  opacity="0.5"
                />
              </svg>
            </motion.div>

            <div className="flex flex-col gap-2">
              <p className="font-bricolage_grotesque text-gray-800 text-[42px] md:text-[62px] font-semibold leading-[1.0]">
                {props.title}
              </p>
              <p className="font-bricolage_grotesque text-gray-500 text-lg leading-[26px] max-w-[720px] mx-auto">
                {props.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      {!isHeader && (
        <div className="flex flex-col">
          {/* PREVIEW */}
          <motion.div
            style={{ y: previewY, scale: previewScale }}
            className={`relative w-full ${previewHeight}`}
          >
            {/* chart background */}
            <div className="absolute inset-0">
              <AnimatedChart type={props.type} />
            </div>

            {/* Floating overlay: ALERT */}
            {props.type === "alert" && (
              <motion.div
                className="absolute left-6 bottom-8 scale-[0.9] md:scale-100"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="rounded-[17px] bg-gray-900/80 backdrop-blur border border-gray-800/50 p-5 w-[270px]">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <p className="font-bricolage_grotesque text-emerald-500 text-sm">
                      {props.badgeLabel ?? "Updates"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center ">
                      {props.metricIconUrl && (
                        <img
                          src={props.metricIconUrl}
                          alt=""
                          className="h-5 w-12 opacity-90"
                          draggable={false}
                        />
                      )}

                    </div>
                    <p className="font-bricolage_grotesque text-neutral-100 text-2xl">
                      {props.metricValue ?? "—"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Floating overlay: AUTOMATION RESULT */}
            {props.type === "automation" && (
              <motion.div
                className="absolute left-1/2 bottom-10 -translate-x-1/2 scale-[0.9] md:scale-100"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="rounded-[20px] bg-gray-900/70 backdrop-blur border border-gray-800/50 px-6 py-4 w-[280px] text-center">
                  <p className="font-bricolage_grotesque text-neutral-100/60 text-xs">
                    {props.resultLabel ?? "Result"}
                  </p>
                  <p className="font-bricolage_grotesque text-emerald-500 text-[42px] leading-[42px] mt-1">
                    {props.resultValue ?? "+0.00"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Feed / Calendar overlays (stagger lists) */}
            {(props.type === "feed" || props.type === "calendar") && (
              <div className="absolute left-6 top-6 right-6">
                <motion.div
                  className="rounded-[18px] bg-gray-900/70 backdrop-blur border border-gray-800/50 p-5"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="font-bricolage_grotesque text-neutral-100 text-sm">
                        {props.type === "calendar"
                          ? props.calendarTitle ?? "Economic calendar"
                          : "News"}
                      </p>
                    </div>
                    <span className="h-4 w-4 rounded bg-emerald-500/20" />
                  </div>

                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate={inView ? "show" : "hidden"}
                    className="mt-4 flex flex-col gap-3"
                  >
                    {props.type === "feed" &&
                      (props.list ?? []).map((x, i) => (
                        <motion.div
                          key={`${x.name}-${i}`}
                          variants={item}
                          className="flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <p className="font-bricolage_grotesque text-neutral-100 text-sm">
                              {x.name}
                            </p>
                            <p className="font-bricolage_grotesque text-neutral-100/60 text-[11px]">
                              {x.sub}
                            </p>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                        </motion.div>
                      ))}

                    {props.type === "calendar" &&
                      (props.events ?? []).map((e, i) => (
                        <motion.div
                          key={`${e.title}-${i}`}
                          variants={item}
                          className="flex items-center justify-between"
                        >
                          <p className="font-bricolage_grotesque text-neutral-100 text-[13px]">
                            {e.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-2 py-[2px] text-[10px] font-bricolage_grotesque ${
                                e.active
                                  ? "bg-emerald-500 text-gray-900"
                                  : "text-white/60"
                              }`}
                            >
                              {e.time}
                            </span>
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          </div>
                        </motion.div>
                      ))}

                    {props.type === "feed" && props.footerNote && (
                      <motion.p
                        variants={item}
                        className="font-bricolage_grotesque text-neutral-100 text-[12px] mt-1"
                      >
                        {props.footerNote}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* CONTENT */}
          <div className="p-8">
            <p className="font-bricolage_grotesque text-white text-[28px] md:text-[32px] font-medium leading-[1.2]">
              {props.title}
            </p>
            <p className="font-bricolage_grotesque text-white/90 text-base leading-[26px] mt-3">
              {props.description}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

function AnimatedChart({ type }: { type: ToolCardType }) {
  const pathId = useId().replace(/:/g, "");

  const path = useMemo(() => {
    if (type === "automation")
      return "M10 170 L60 90 L110 140 L160 70 L210 90 L260 85 L310 120 L360 80 L410 100";
    if (type === "feed" || type === "calendar")
      return "M10 150 L70 110 L120 130 L170 105 L220 115 L270 95 L320 120 L370 90 L410 110";
    return "M10 160 L60 120 L110 135 L160 130 L210 150 L260 110 L310 125 L360 70 L410 95";
  }, [type]);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.14),rgba(0,0,0,0)_55%)]" />

      {/* subtle moving grid */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-15"
        animate={{ backgroundPositionX: ["0px", "120px"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="absolute inset-0">
        <svg viewBox="0 0 420 220" className="h-full w-full">
          {/* path base (fina) */}
          <motion.path
            id={`chart-${pathId}`}
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="1.35"
            initial={{ pathLength: 0, opacity: 0.35 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.15, ease: "easeInOut" }}
          />

          {/* glow sutil (fino) */}
          <motion.path
            d={path}
            fill="none"
            stroke="rgba(16,185,129,0.45)"
            strokeWidth="2.4"
            opacity="0.55"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.45, ease: "easeInOut" }}
          />

          {/* marcador seguindo o path */}
          <g>
            <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#chart-${pathId}`} xlinkHref={`#chart-${pathId}`} />
            </animateMotion>
            <g>
              <circle r="7.2" fill="rgba(16,185,129,0.18)" />
              <circle r="4.2" fill="rgb(16,185,129)" />
              <path
                d="M-2 -6 L2 -6"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* segundo marcador (mais discreto) */}
          <g opacity="0.85">
            <animateMotion dur="7.5s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#chart-${pathId}`} xlinkHref={`#chart-${pathId}`} />
            </animateMotion>
            <g>
              <circle r="3.6" fill="rgba(255,255,255,0.9)" />
            </g>
          </g>
        </svg>
      </div>

      {/* bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgba(0,0,0,0.65),rgba(0,0,0,0))]" />
    </div>
  );
}
