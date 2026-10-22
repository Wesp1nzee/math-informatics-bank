"use client";

import { Pause, Play, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";


import { Badge } from "@/components/ui/badge";
import {
  highlightPython,
  solveTask5,
  TASK5_CODE,
  TASK5_SOLUTION,
  type Task5Run,
} from "@/features/home/lib/task5";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "typing" | "running" | "done";

const STATUS_TONE: Record<Status, "neutral" | "accent" | "success"> = {
  idle: "neutral",
  typing: "neutral",
  running: "accent",
  done: "success",
};

const STATUS_LABEL: Record<Status, string> = {
  idle: "Python",
  typing: "Python",
  running: "Выполняется",
  done: "Готово",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const VAR_CELL = "min-w-0 rounded-md border border-line bg-canvas px-3.5 py-2.5";
const VAR_LABEL = "block text-xs text-ink-faint";
const VAR_VALUE =
  "block font-mono text-xl leading-snug tabular-nums [overflow-wrap:anywhere]";

const CONTROL =
  "border-line-strong text-ink hover:border-ink hover:bg-surface inline-flex min-h-10 items-center gap-2 rounded-md border bg-transparent px-4 text-[15px] font-medium transition-colors";

export function CodeDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const pausedRef = useRef(false);
  const skipRef = useRef(false);

  const [typedLines, setTypedLines] = useState<string[]>(() =>
    TASK5_CODE.map(() => ""),
  );
  const [typingLine, setTypingLine] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [vars, setVars] = useState<Partial<Task5Run>>({});
  const [log, setLog] = useState<Task5Run[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [insightVisible, setInsightVisible] = useState(false);

  const reset = useCallback(() => {
    setTypedLines(TASK5_CODE.map(() => ""));
    setTypingLine(null);
    setStatus("idle");
    setActiveLine(null);
    setPaused(false);
    pausedRef.current = false;
    skipRef.current = false;
    setVars({});
    setLog([]);
    setResult(null);
    setInsightVisible(false);
  }, []);

  const showFinal = useCallback(() => {
    setTypedLines([...TASK5_CODE]);
    setTypingLine(null);
    setActiveLine(null);
    setVars({
      n: TASK5_SOLUTION.n,
      binary: TASK5_SOLUTION.n.toString(2),
      r: TASK5_SOLUTION.r,
    });
    setLog([
      {
        n: TASK5_SOLUTION.n,
        binary: TASK5_SOLUTION.n.toString(2),
        r: TASK5_SOLUTION.r,
        hit: true,
      },
    ]);
    setResult(TASK5_SOLUTION.r);
    setStatus("done");
    setInsightVisible(true);
  }, []);

  const play = useCallback(async () => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    const alive = () => runIdRef.current === runId;

    reset();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showFinal();
      return;
    }

    const pauseable = async (ms: number) => {
      let waited = 0;
      while (waited < ms) {
        if (skipRef.current) return;
        if (!pausedRef.current) waited += 40;
        await sleep(40);
      }
    };

    const bail = () => {
      if (!alive()) return true;
      if (skipRef.current) {
        showFinal();
        return true;
      }
      return false;
    };

    setStatus("typing");

    for (let lineIndex = 0; lineIndex < TASK5_CODE.length; lineIndex += 1) {
      const line = TASK5_CODE[lineIndex];
      setTypingLine(lineIndex);
      for (let charIndex = 1; charIndex <= line.length; charIndex += 1) {
        if (bail()) return;
        const slice = line.slice(0, charIndex);
        setTypedLines((previous) => {
          const next = [...previous];
          next[lineIndex] = slice;
          return next;
        });
        await pauseable(line.trimStart().startsWith("#") ? 5 : 16);
      }
      if (bail()) return;
      setTypedLines((previous) => {
        const next = [...previous];
        next[lineIndex] = line;
        return next;
      });
      setTypingLine(null);
      await pauseable(line ? 140 : 40);
    }

    if (bail()) return;
    setStatus("running");
    setActiveLine(7);

    for (const run of solveTask5()) {
      if (bail()) return;
      setActiveLine(7);
      setVars(run);
      setLog((previous) => [...previous, run].slice(-6));
      await pauseable(run.n >= 18 ? 400 : 110);
      if (run.hit) break;
      setActiveLine(8);
      await pauseable(run.n >= 18 ? 250 : 60);
    }

    if (bail()) return;
    setActiveLine(10);
    await pauseable(500);
    if (bail()) return;

    setResult(TASK5_SOLUTION.r);
    setStatus("done");
    setActiveLine(null);
    await pauseable(600);
    if (alive()) setInsightVisible(true);
  }, [reset, showFinal]);

  const playRef = useRef(play);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playRef.current();
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      playRef.current();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void playRef.current();
      },
      { threshold: 0.45 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const isRunning = status === "typing" || status === "running";

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }

  function skip() {
    skipRef.current = true;
    pausedRef.current = false;
    setPaused(false);
  }

  return (
    <div ref={containerRef} className="grid justify-items-start gap-4">
      <div className="js-only grid w-full justify-items-start gap-4">
        <div
          className="editor"
          role="img"
          aria-label="Код на Python, который перебирает N и находит наименьшее R, большее 83"
        >
          <div className="editor-bar">
            <span>task5.py</span>
            <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
          </div>

          <pre className="code" aria-hidden="true">
            {TASK5_CODE.map((line, index) => (
              <span
                key={index}
                className="ln"
                data-active={activeLine === index ? "" : undefined}
                dangerouslySetInnerHTML={{
                  __html:
                    highlightPython(typedLines[index] ?? "") +
                    (typingLine === index ? '<span class="caret"></span>' : ""),
                }}
              />
            ))}
          </pre>
        </div>

        <div className="border-line bg-surface grid w-full gap-4 rounded-lg border p-5">
          <div className="desk:grid-cols-[1fr_2fr_1fr] grid grid-cols-2 gap-3">
            <div className={cn(VAR_CELL, "order-1")}>
              <small className={VAR_LABEL}>N</small>
              <b className={VAR_VALUE}>{vars.n ?? "—"}</b>
            </div>
            <div
              className={cn(
                VAR_CELL,
                "desk:order-2 desk:col-span-1 order-3 col-span-2",
              )}
            >
              <small className={VAR_LABEL}>bin(N)</small>
              <b className={VAR_VALUE}>{vars.binary ?? "—"}</b>
            </div>
            <div className={cn(VAR_CELL, "desk:order-3 order-2")}>
              <small className={VAR_LABEL}>R</small>
              <b className={VAR_VALUE}>{vars.r ?? "—"}</b>
            </div>
          </div>

          <div className="log min-h-[120px]" role="log" aria-label="Ход выполнения">
            {log.map((row) => (
              <div key={row.n} className="log-row" data-hit={row.hit ? "" : undefined}>
                <span>N={row.n}</span>
                <span>R={row.r}</span>
                <span>
                  {row.r} {row.hit ? ">" : "≤"} 83
                </span>
              </div>
            ))}
          </div>

          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "m-0 transition-opacity duration-500",
              result !== null ? "opacity-100" : "opacity-0",
            )}
          >
            <span className="text-ink-soft">Вывод:</span>{" "}
            <b className="text-success ml-2 font-mono text-2xl font-semibold">
              {result ?? ""}
            </b>
          </p>

          <p
            className={cn(
              "border-line text-ink-soft m-0 border-t pt-3.5 text-[15px] transition-opacity duration-500",
              insightVisible ? "opacity-100" : "opacity-0",
            )}
          >
            Что заметить: вторая дописанная цифра всегда 0 — после первой чётность
            единиц уже выровнена. Поэтому R всегда чётное, и 84 и 85 отпадают сразу.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isRunning ? (
            <>
              <button type="button" onClick={togglePause} className={CONTROL}>
                {paused ? (
                  <Play aria-hidden className="size-4" />
                ) : (
                  <Pause aria-hidden className="size-4" />
                )}
                {paused ? "Продолжить" : "Пауза"}
              </button>
              <button type="button" onClick={skip} className={CONTROL}>
                <SkipForward aria-hidden className="size-4" />
                Пропустить
              </button>
            </>
          ) : null}

          {status === "done" ? (
            <button type="button" onClick={() => void play()} className={CONTROL}>
              Повторить
            </button>
          ) : null}
        </div>
      </div>

      <div className="no-js-only">
        <div className="grid w-full gap-3">
          <div className="editor">
            <div className="editor-bar">
              <span>task5.py</span>
              <Badge tone="neutral">Python</Badge>
            </div>
            <pre className="code" data-static-code="">
              {TASK5_CODE.map((line, index) => (
                <span
                  key={`static-${index}`}
                  className="ln"
                  dangerouslySetInnerHTML={{ __html: highlightPython(line) }}
                />
              ))}
            </pre>
          </div>
          <p className="text-ink-soft text-sm">
            Программа выводит <b className="text-ink">86</b>: первое значение R, большее
            83, достигается при N = 21. Анимация выполнения требует JavaScript.
          </p>
        </div>
      </div>
    </div>
  );
}
