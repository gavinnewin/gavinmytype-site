import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/Gavintype.css";

const WORDS = [
  "course","early","through","however","the","who","out","number","many","line","too",
  "increase","public","but","to","late","other","hold","few","tell","both","come",
  "since","into","know","make","might","open","this","become","world","time","work",
  "life","still","long","first","great","new","same","need","feel","system","state",
  "place","right","under","again","high","small","every","found","never","point",
];

const PUNCT = [".", ",", "!", "?", ";", ":"];
const DIGITS = ["0","1","2","3","4","5","6","7","8","9"];

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function buildWord({ punctuation, numbers }) {
  let w = WORDS[randInt(WORDS.length)];

  if (numbers && Math.random() < 0.18) {
    const count = 1 + randInt(3);
    for (let i = 0; i < count; i++) w += DIGITS[randInt(10)];
  }

  if (punctuation && Math.random() < 0.14) {
    w += PUNCT[randInt(PUNCT.length)];
  }

  return w;
}

function generateWords({ count, punctuation, numbers }) {
  return Array.from({ length: count }, () => buildWord({ punctuation, numbers }));
}

function calcStats({ correctChars, typedChars, elapsedSec }) {
  const mins = Math.max(elapsedSec / 60, 1e-9);
  const wpm = Math.round((correctChars / 5) / mins);
  const cpm = Math.round(correctChars / mins);
  const acc = typedChars === 0 ? 100 : (correctChars / typedChars) * 100;
  return { wpm, cpm, acc };
}

export default function Gavintype() {
  const [duration, setDuration] = useState(30);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);

  // number of words shown on screen (monkeytype-ish)
  const [wordCount] = useState(40);

  const [words, setWords] = useState(() =>
    generateWords({ count: 40, punctuation: false, numbers: false })
  );

  const [typed, setTyped] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30);
  const startRef = useRef(null);
  const inputRef = useRef(null);

  const target = useMemo(() => words.join(" "), [words]);
  const caretIndex = typed.length;

  const { correctChars, errors } = useMemo(() => {
    let correct = 0;
    let err = 0;
    const len = Math.min(typed.length, target.length);
    for (let i = 0; i < len; i++) {
      if (typed[i] === target[i]) correct++;
      else err++;
    }
    return { correctChars: correct, errors: err };
  }, [typed, target]);

  const elapsed = useMemo(() => {
    if (!startRef.current) return 0;
    // if finished by timer, elapsed should be duration
    if (isFinished && timeLeft === 0) return duration;
    return (Date.now() - startRef.current) / 1000;
  }, [timeLeft, isFinished, duration]);

  const stats = useMemo(
    () => calcStats({ correctChars, typedChars: typed.length, elapsedSec: isFinished ? duration - timeLeft : elapsed }),
    [correctChars, typed.length, elapsed, isFinished, duration, timeLeft]
  );

  const restart = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(duration);
    startRef.current = null;
    setTyped("");
    setWords(generateWords({ count: wordCount, punctuation, numbers }));
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // regenerate when options change (only if not running)
  useEffect(() => {
    if (isRunning) return;
    setTimeLeft(duration);
    startRef.current = null;
    setTyped("");
    setIsFinished(false);
    setWords(generateWords({ count: wordCount, punctuation, numbers }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, punctuation, numbers]);

  // timer
  useEffect(() => {
    if (!isRunning || isFinished) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          setIsFinished(true);
          setIsRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, isFinished]);

  // shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        restart();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, punctuation, numbers, wordCount]);

  const onChange = (e) => {
    if (isFinished) return;

    const val = e.target.value;

    if (!isRunning && val.length > 0) {
      setIsRunning(true);
      startRef.current = Date.now();
    }

    // don’t allow beyond target
    const nextTyped = val.slice(0, target.length);
    setTyped(nextTyped);

    // if user reaches end before timer, finish (optional)
    if (nextTyped.length >= target.length) {
      setIsFinished(true);
      setIsRunning(false);
      setTimeLeft(0);
    }
  };

  // Render words as spans (word wrapped like monkeytype)
  const rendered = useMemo(() => {
    const spans = [];
    for (let i = 0; i < target.length; i++) {
      const t = target[i];
      const g = typed[i];

      let cls = "gt-ch";
      if (i < typed.length) cls += g === t ? " ok" : " bad";
      else cls += " idle";

      if (i === caretIndex && !isFinished) cls += " caret";

      // make spaces render as real spacing but still selectable
      const display = t === " " ? "\u00A0" : t;

      spans.push(
        <span key={i} className={cls}>
          {display}
        </span>
      );
    }
    return spans;
  }, [target, typed, caretIndex, isFinished]);

  return (
    <main className="gt-page animate-page" onClick={() => inputRef.current?.focus()}>
      {/* Top bar */}
      <header className="gt-topbar" aria-label="Typing settings">
        <div className="gt-bar">
          <button
            className={`gt-pill ${punctuation ? "active" : ""}`}
            type="button"
            onClick={() => setPunctuation((v) => !v)}
            disabled={isRunning}
          >
            punctuation
          </button>

          <button
            className={`gt-pill ${numbers ? "active" : ""}`}
            type="button"
            onClick={() => setNumbers((v) => !v)}
            disabled={isRunning}
          >
            numbers
          </button>

          <div className="gt-sep" />

          <div className="gt-group">
            {[15, 30, 60, 120].map((t) => (
              <button
                key={t}
                className={`gt-pill ${duration === t ? "active" : ""}`}
                type="button"
                onClick={() => setDuration(t)}
                disabled={isRunning}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="gt-spacer" />
        </div>
      </header>

      {/* Center area */}
      <section className={`gt-stage ${isFinished ? "finished" : ""}`} aria-label="Typing test">
        <div className="gt-lang">english</div>

        <div className="gt-text" role="presentation">
          {rendered}
        </div>
         <button
  className="gt-x"
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    restart();
  }}
  title="restart (tab)"
>
  ↻
</button>


        {/* Hidden input captures typing */}
        <input
          ref={inputRef}
          className="gt-input"
          value={typed}
          onChange={onChange}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Typing input"
        />

        {isFinished && (
          <div className="gt-results">
            <div className="gt-resRow">
              <div className="gt-resBox">
                <div className="gt-resNum">{stats.wpm}</div>
                <div className="gt-resLab">wpm</div>
              </div>
              <div className="gt-resBox">
                <div className="gt-resNum">{Math.round(stats.acc)}%</div>
                <div className="gt-resLab">accuracy</div>
              </div>
              <div className="gt-resBox">
                <div className="gt-resNum">{errors}</div>
                <div className="gt-resLab">errors</div>
              </div>
            </div>

            <button className="gt-restart centered" type="button" onClick={restart}>
              restart (tab)
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
