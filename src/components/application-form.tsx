"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { submitApplication, type SubmitInput } from "@/app/actions";
import { formatPhoneBR, isValidPhoneBR } from "@/lib/phone";
import {
  BRANCHES,
  OPERATION_QUESTION,
  TOTAL_STEPS,
  pathFromAnswer,
  type ChoiceQuestion,
} from "@/lib/questions";

type Step =
  | { kind: "intro" }
  | { kind: "text"; id: "nome" | "whatsapp" }
  | { kind: "choice"; question: ChoiceQuestion }
  | { kind: "done" };

const LETTERS = "ABCDEFGH";
const pad = (n: number) => String(n).padStart(2, "0");

export function ApplicationForm() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const advancing = useRef(false);

  // Os passos mudam conforme a resposta de "já tem operação?" — o lead não percebe.
  const steps = useMemo<Step[]>(() => {
    const op = answers[OPERATION_QUESTION.id];
    const branch = op ? BRANCHES[pathFromAnswer(op)] : [];
    return [
      { kind: "intro" },
      { kind: "text", id: "nome" },
      { kind: "text", id: "whatsapp" },
      { kind: "choice", question: OPERATION_QUESTION },
      ...branch.map((question) => ({ kind: "choice" as const, question })),
      { kind: "done" },
    ];
  }, [answers]);

  const step = steps[index];
  const questionNumber = index; // intro = 0, primeira pergunta = 1
  const isQuestion = step.kind === "text" || step.kind === "choice";
  const firstName = nome.trim().split(/\s+/)[0] ?? "";

  const go = useCallback((delta: 1 | -1) => {
    setDir(delta);
    setFieldError(null);
    setSubmitError(null);
    setIndex((i) => Math.max(0, i + delta));
  }, []);

  const submit = useCallback(
    (finalAnswers: Record<string, string>) => {
      const params = new URLSearchParams(window.location.search);
      const payload: SubmitInput = {
        nome,
        whatsapp,
        tem_operacao: finalAnswers[OPERATION_QUESTION.id] as SubmitInput["tem_operacao"],
        respostas: finalAnswers,
        website: honeypot,
        utm: {
          source: params.get("utm_source") ?? undefined,
          medium: params.get("utm_medium") ?? undefined,
          campaign: params.get("utm_campaign") ?? undefined,
          content: params.get("utm_content") ?? undefined,
          term: params.get("utm_term") ?? undefined,
        },
      };
      startTransition(async () => {
        try {
          const result = await submitApplication(payload);
          if (result.ok) go(1);
          else setSubmitError(result.error);
        } catch {
          setSubmitError("Sem conexão no momento. Verifique sua internet e tente de novo.");
        }
      });
    },
    [nome, whatsapp, honeypot, go],
  );

  const choose = useCallback(
    (question: ChoiceQuestion, option: string) => {
      if (advancing.current || isPending) return;
      let next = { ...answers, [question.id]: option };
      // Mudou de caminho? Limpa as respostas do caminho antigo.
      if (question.id === OPERATION_QUESTION.id && answers[question.id] !== option) {
        next = { [question.id]: option };
      }
      setAnswers(next);
      advancing.current = true;
      const isLast = steps[index + 1]?.kind === "done" && question.id !== OPERATION_QUESTION.id;
      window.setTimeout(() => {
        advancing.current = false;
        if (isLast) submit(next);
        else go(1);
      }, 380);
    },
    [answers, index, steps, go, submit, isPending],
  );

  const continueText = useCallback(() => {
    if (step.kind !== "text") return;
    if (step.id === "nome") {
      if (nome.trim().length < 2) return setFieldError("Digite seu nome para continuar.");
    } else if (!isValidPhoneBR(whatsapp)) {
      return setFieldError("Digite um WhatsApp válido, com DDD.");
    }
    go(1);
  }, [step, nome, whatsapp, go]);

  // Atalhos de teclado (desktop): letras escolhem opções, Enter avança.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (step.kind === "intro" && e.key === "Enter") return go(1);
      if (step.kind === "choice") {
        const i = LETTERS.indexOf(e.key.toUpperCase());
        const option = step.question.options[i];
        if (option && e.key.length === 1) choose(step.question, option);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, choose, go]);

  const progress = isQuestion ? (questionNumber - 1) / TOTAL_STEPS : step.kind === "done" ? 1 : 0;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      {/* Barra de progresso */}
      <div className="fixed inset-x-0 top-0 z-20 h-px bg-smoke/10" aria-hidden>
        <div
          className="h-full bg-linear-to-r from-gold/60 via-gold to-gold-soft transition-[width] duration-700 ease-luxe"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {step.kind !== "intro" && step.kind !== "done" && (
        <header className="flex items-center justify-between px-5 pt-6 sm:px-10 sm:pt-8">
          <div className="flex items-center gap-3">
            <span className="monogram block w-8" aria-hidden />
            <span className="label text-smoke/60">
              DDD <span className="text-gold">Private</span>
            </span>
          </div>
          <span className="label tabular-nums text-smoke/50">
            <span className="text-smoke">{pad(questionNumber)}</span> / {pad(TOTAL_STEPS)}
          </span>
        </header>
      )}

      <main className="flex flex-1 items-center px-5 py-10 sm:px-10">
        <div
          key={index}
          className="step-enter mx-auto w-full max-w-xl"
          style={{ "--dir": dir } as React.CSSProperties}
        >
          {step.kind === "intro" && <Intro onStart={() => go(1)} />}

          {step.kind === "text" && (
            <TextStep
              id={step.id}
              number={questionNumber}
              firstName={firstName}
              value={step.id === "nome" ? nome : whatsapp}
              onChange={(v) => {
                setFieldError(null);
                if (step.id === "nome") setNome(v);
                else setWhatsapp(formatPhoneBR(v));
              }}
              onContinue={continueText}
              error={fieldError}
            />
          )}

          {step.kind === "choice" && (
            <ChoiceStep
              number={questionNumber}
              question={step.question}
              selected={answers[step.question.id]}
              onChoose={(o) => choose(step.question, o)}
              disabled={isPending}
            />
          )}

          {step.kind === "done" && <Done firstName={firstName} />}

          {isPending && (
            <p className="label mt-8 flex items-center gap-3 text-gold" role="status">
              <span className="size-3 animate-spin rounded-full border border-gold/30 border-t-gold" />
              Enviando sua aplicação
            </p>
          )}
          {submitError && (
            <div className="mt-8 rounded-sm border border-red-300/20 bg-red-950/30 p-4 text-sm text-red-100/90" role="alert">
              {submitError}
              <button
                type="button"
                onClick={() => submit(answers)}
                className="label ml-3 text-gold underline-offset-4 hover:underline"
              >
                Tentar de novo
              </button>
            </div>
          )}
        </div>
      </main>

      {isQuestion && (
        <footer className="flex items-center justify-between px-5 pb-6 sm:px-10 sm:pb-8">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={isPending}
            className="label flex min-h-11 items-center gap-2 text-smoke/50 transition-colors hover:text-smoke disabled:opacity-40"
          >
            <span aria-hidden>←</span> Voltar
          </button>
          <span className="label hidden text-smoke/25 sm:block">Decisões Determinam Destinos</span>
        </footer>
      )}

      {/* Armadilha para robôs: invisível para pessoas */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        name="website"
      />
    </div>
  );
}

/* ---------- Telas ---------- */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="monogram block w-24 sm:w-28" role="img" aria-label="DDD" />
      <p className="label mt-10 text-balance text-gold">Mentoria individual · Matheus Porto</p>
      <h1 className="mt-5 flex items-baseline justify-center gap-3 leading-none">
        <span className="font-display text-6xl font-light tracking-[0.06em] text-smoke sm:text-7xl">DDD</span>
        <span className="gold-text -ml-1 font-script text-6xl sm:text-7xl">Private</span>
      </h1>
      <div className="mx-auto mt-8 h-px w-16 bg-gold/50" />
      <p className="mt-8 max-w-sm font-display text-xl leading-relaxed text-smoke/80 sm:text-2xl">
        Acompanhamento próximo, estratégia sob medida e acesso direto a quem já faturou milhões no
        e-commerce.
      </p>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-smoke/50">
        Cada aplicação é analisada pessoalmente. As vagas são limitadas.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="group mt-10 flex min-h-14 w-full max-w-xs items-center justify-center gap-3 rounded-sm bg-linear-to-br from-[#e2c89f] via-gold to-[#9a7242] px-8 text-ink shadow-[0_10px_40px_-12px_rgb(183_139_86/0.6)] transition-all duration-500 ease-luxe hover:shadow-[0_14px_50px_-10px_rgb(183_139_86/0.8)] active:scale-[0.98]"
      >
        <span className="label text-[0.72rem] font-semibold">Iniciar aplicação</span>
        <span aria-hidden className="transition-transform duration-500 ease-luxe group-hover:translate-x-1">→</span>
      </button>
      <p className="label mt-5 text-smoke/35">{TOTAL_STEPS} perguntas · cerca de 2 minutos</p>
    </div>
  );
}

function QuestionLabel({ number }: { number: number }) {
  return (
    <p className="label flex items-center gap-3 text-gold">
      <span className="tabular-nums">{pad(number)}</span>
      <span className="h-px w-6 bg-gold/50" aria-hidden />
    </p>
  );
}

function TextStep({
  id,
  number,
  firstName,
  value,
  onChange,
  onContinue,
  error,
}: {
  id: "nome" | "whatsapp";
  number: number;
  firstName: string;
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Pequeno atraso para não brigar com a animação de entrada
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
    return () => window.clearTimeout(t);
  }, []);

  const isName = id === "nome";
  const title = isName ? "Para começar, qual é o seu nome?" : `Prazer, ${firstName}. Qual é o seu WhatsApp?`;
  const hint = isName ? null : "Com DDD. É por lá que nossa equipe vai falar com você.";

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <QuestionLabel number={number} />
      <label htmlFor={id} className="mt-5 block text-balance font-display text-[2rem] leading-[1.15] text-smoke sm:text-[2.6rem]">
        {title}
      </label>
      {hint && <p className="mt-3 text-sm text-smoke/50">{hint}</p>}

      <input
        ref={inputRef}
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={isName ? "text" : "tel"}
        inputMode={isName ? "text" : "numeric"}
        autoComplete={isName ? "name" : "tel-national"}
        autoCapitalize={isName ? "words" : "off"}
        enterKeyHint="next"
        placeholder={isName ? "Seu nome completo" : "(11) 98765-4321"}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-10 w-full border-0 border-b [font-variant-numeric:lining-nums] border-smoke/20 bg-transparent pb-3 font-display text-2xl text-smoke caret-gold outline-none transition-colors duration-300 placeholder:text-smoke/20 focus:border-gold sm:text-3xl"
      />
      <p id={`${id}-error`} className="mt-3 min-h-5 text-sm text-red-200/80" aria-live="polite">
        {error}
      </p>

      <div className="mt-6 flex items-center gap-5">
        <button
          type="submit"
          className="group flex min-h-12 items-center gap-3 rounded-sm border border-gold/60 bg-gold/10 px-6 text-gold-soft transition-all duration-300 hover:bg-gold hover:text-ink active:scale-[0.98]"
        >
          <span className="label">Continuar</span>
          <span aria-hidden>→</span>
        </button>
        <span className="label hidden text-smoke/30 sm:inline">ou pressione Enter ↵</span>
      </div>
    </form>
  );
}

function ChoiceStep({
  number,
  question,
  selected,
  onChoose,
  disabled,
}: {
  number: number;
  question: ChoiceQuestion;
  selected?: string;
  onChoose: (option: string) => void;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <QuestionLabel number={number} />
      <legend className="sr-only">{question.title}</legend>
      <h2 className="mt-5 text-balance font-display text-[2rem] leading-[1.15] text-smoke sm:text-[2.6rem]" aria-hidden>
        {question.title}
      </h2>
      {question.hint && <p className="mt-3 text-sm text-smoke/50">{question.hint}</p>}

      <ul className="mt-9 flex flex-col gap-3" role="radiogroup" aria-label={question.title}>
        {question.options.map((option, i) => {
          const active = selected === option;
          return (
            <li key={option} className="option-enter" style={{ animationDelay: `${120 + i * 55}ms` }}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChoose(option)}
                className={`group flex min-h-14 w-full items-center gap-4 rounded-sm border px-4 py-3 text-left transition-all duration-300 ease-luxe active:scale-[0.99] ${
                  active
                    ? "border-gold bg-pine/50 shadow-[0_0_0_1px_rgb(183_139_86/0.4),0_10px_30px_-15px_rgb(183_139_86/0.5)]"
                    : "border-smoke/12 bg-smoke/[0.025] hover:border-smoke/30 hover:bg-smoke/[0.05]"
                }`}
              >
                <span
                  className={`label flex size-7 shrink-0 items-center justify-center rounded-[3px] border text-[0.6rem] transition-colors duration-300 ${
                    active ? "border-gold bg-gold text-ink" : "border-smoke/20 text-smoke/50 group-hover:border-smoke/40"
                  }`}
                  aria-hidden
                >
                  {active ? "✓" : LETTERS[i]}
                </span>
                <span className={`text-[0.95rem] leading-snug ${active ? "text-smoke" : "text-smoke/80"}`}>
                  {option}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function Done({ firstName }: { firstName: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="monogram block w-20" role="img" aria-label="DDD" />
      <p className="label mt-10 text-gold">Aplicação recebida</p>
      <h1 className="mt-5 font-display text-[2.4rem] leading-[1.1] text-smoke sm:text-5xl">
        Obrigado, <span className="italic">{firstName}</span>.
      </h1>
      <div className="mx-auto mt-8 h-px w-16 bg-gold/50" />
      <p className="mt-8 max-w-sm font-display text-xl leading-relaxed text-smoke/80">
        Nossa equipe vai analisar o seu perfil pessoalmente. Se houver alinhamento, você receberá
        uma mensagem no seu WhatsApp.
      </p>
      <p className="mt-14 font-script text-4xl text-gold/80">Decisões Determinam Destinos</p>
    </div>
  );
}
