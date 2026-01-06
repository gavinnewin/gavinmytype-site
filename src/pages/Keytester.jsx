import React, { useEffect, useMemo, useState } from "react";
import "../styles/Keytester.css";

/**
 * React port of the KeyboardTester layout (FULL/TKL + theme dots)
 * - Uses KeyboardEvent.code to match physical keys
 * - Keys stay "pressed" (lit) after first press
 * - Shows current "down" key press simulation while held
 * - Does NOT apply global body/html CSS (scoped CSS only)
 *
 * Attribution idea (MIT):
 * - Portions inspired by Mostafa-Abbasi/KeyboardTester (MIT).
 * - Keep a THIRD_PARTY_LICENSES copy in your repo.
 */

const codeToClass = (code) => (code || "").toLowerCase();

const Key = ({
  code,
  label,
  sub,
  accent = false,
  icon = null,
  pressed,
  down,
}) => {
  const classes = [
    "kt-key",
    "key",
    accent ? "key--accent-color" : "",
    pressed ? "key--pressed" : "",
    down ? "key-pressing-simulation" : "",
    code ? codeToClass(code) : "",
    sub ? "key--sublegend" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-code={code}>
      {/* If there's an icon (Win/Menu/Arrows), render it, else render text */}
      {icon ? (
        icon
      ) : sub ? (
        <>
          <span>{sub.top}</span>
          <span>{sub.bottom}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
};

const ArrowIcon = ({ dir = "up" }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {dir === "up" && <path d="M12 6l-7 7h4v5h6v-5h4z" />}
    {dir === "down" && <path d="M12 18l7-7h-4V6H9v5H5z" />}
    {dir === "left" && <path d="M6 12l7-7v4h5v6h-5v4z" />}
    {dir === "right" && <path d="M18 12l-7 7v-4H6V9h5V5z" />}
  </svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 5l8-1v8H3V5zm9-1l9-1v9h-9V4zM3 13h8v8l-8-1v-7zm9 0h9v9l-9-1v-8z" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 7h12M6 12h12M6 17h12" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Keytester() {
  const [layout, setLayout] = useState("full"); // "full" | "tkl"
  const [pressed, setPressed] = useState(() => new Set()); // stays lit
  const [down, setDown] = useState(() => new Set()); // currently held (press simulation)
  const [lastPressed, setLastPressed] = useState([]);

  const keyLabelByCode = useMemo(() => {
    // Minimal labels for log; you can expand if you want
    const m = new Map();
    m.set("Space", "Space");
    m.set("Backspace", "Backspace");
    m.set("Enter", "Enter");
    m.set("Tab", "Tab");
    m.set("CapsLock", "Caps");
    m.set("ShiftLeft", "Shift");
    m.set("ShiftRight", "Shift");
    m.set("ControlLeft", "Ctrl");
    m.set("ControlRight", "Ctrl");
    m.set("AltLeft", "Alt");
    m.set("AltRight", "Alt");
    m.set("MetaLeft", "Win");
    m.set("MetaRight", "Win");
    m.set("ContextMenu", "Menu");
    return m;
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      // keep site from scrolling with arrows/space while testing
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      setPressed((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });

      setDown((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });

      if (!e.repeat) {
        const label =
          keyLabelByCode.get(e.code) ||
          (e.key === " " ? "Space" : e.key?.length === 1 ? e.key.toUpperCase() : e.key);

        setLastPressed((prev) => [{ code: e.code, label }, ...prev].slice(0, 18));
      }
    };

    const onKeyUp = (e) => {
      setDown((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    const onBlur = () => setDown(new Set());

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [keyLabelByCode]);

  const reset = () => {
    setPressed(new Set());
    setDown(new Set());
    setLastPressed([]);
  };

  const isPressed = (code) => pressed.has(code);
  const isDown = (code) => down.has(code);

  return (
    <div className={`kt-page animate-page`}>
      <header className="kt-intro center-text">
        
        <div className="kt-lastbar">
          <div className="kt-last-left">
            <strong>Last pressed:</strong>
            <div className="kt-chips">
              {lastPressed.length === 0 ? (
                <span className="kt-chip muted">Start typing…</span>
              ) : (
                lastPressed.map((k, idx) => (
                  <span className="kt-chip" key={`${k.code}-${idx}`} title={k.code}>
                    {k.label}
                  </span>
                ))
              )}
            </div>
          </div>

          <button className="kt-reset" onClick={reset} type="button">
            Reset
          </button>
        </div>
        <div className="theme-and-layout">
          <div />
          {/* FULL / TKL */}
          <div className="toggle-section">
            <span onClick={() => setLayout("full")} style={{ opacity: layout === "full" ? 1 : 0.6 }}>
              FULL
            </span>

            <label className="kt-switch" aria-label="Toggle Full/TKL">
              <input
                type="checkbox"
                checked={layout === "full"}
                onChange={(e) => setLayout(e.target.checked ? "full" : "tkl")}
              />
              <span className="kt-slider" />
            </label>

            <span onClick={() => setLayout("tkl")} style={{ opacity: layout === "tkl" ? 1 : 0.6 }}>
              TKL
            </span>
          </div>
        </div>
      </header>

      {/* KEYBOARD */}
      <section className={`keyboard ${layout === "full" ? "full-size" : "tkl"}`} aria-label="Keyboard">
        {/* Function region */}
        <div className="region function">
          <Key code="Escape" label="ESC" pressed={isPressed("Escape")} down={isDown("Escape")} />
          <div />
          <Key code="F1" label="F1" pressed={isPressed("F1")} down={isDown("F1")} />
          <Key code="F2" label="F2" pressed={isPressed("F2")} down={isDown("F2")} />
          <Key code="F3" label="F3" pressed={isPressed("F3")} down={isDown("F3")} />
          <Key code="F4" label="F4" pressed={isPressed("F4")} down={isDown("F4")} />
          <div />
          <Key code="F5" label="F5" pressed={isPressed("F5")} down={isDown("F5")} />
          <Key code="F6" label="F6" pressed={isPressed("F6")} down={isDown("F6")} />
          <Key code="F7" label="F7" pressed={isPressed("F7")} down={isDown("F7")} />
          <Key code="F8" label="F8" pressed={isPressed("F8")} down={isDown("F8")} />
          <div />
          <Key code="F9" label="F9" pressed={isPressed("F9")} down={isDown("F9")} />
          <Key code="F10" label="F10" pressed={isPressed("F10")} down={isDown("F10")} />
          <Key code="F11" label="F11" pressed={isPressed("F11")} down={isDown("F11")} />
          <Key code="F12" label="F12" pressed={isPressed("F12")} down={isDown("F12")} />
        </div>

        {/* System control keys */}
        <div className="region system-control">
          <Key code="PrintScreen" label="Prt Sc" pressed={isPressed("PrintScreen")} down={isDown("PrintScreen")} />
          <Key code="ScrollLock" label="Scr Lk" pressed={isPressed("ScrollLock")} down={isDown("ScrollLock")} />
          <Key code="Pause" label="Pause" pressed={isPressed("Pause")} down={isDown("Pause")} />
        </div>

        {/* Typewriter region */}
        <div className="region typewriter">
          <div className="first-row">
            <Key code="Backquote" label="~" sub={{ top: "~", bottom: "`" }} pressed={isPressed("Backquote")} down={isDown("Backquote")} />
            <Key code="Digit1" label="1" pressed={isPressed("Digit1")} down={isDown("Digit1")} />
            <Key code="Digit2" label="2" pressed={isPressed("Digit2")} down={isDown("Digit2")} />
            <Key code="Digit3" label="3" pressed={isPressed("Digit3")} down={isDown("Digit3")} />
            <Key code="Digit4" label="4" pressed={isPressed("Digit4")} down={isDown("Digit4")} />
            <Key code="Digit5" label="5" pressed={isPressed("Digit5")} down={isDown("Digit5")} />
            <Key code="Digit6" label="6" pressed={isPressed("Digit6")} down={isDown("Digit6")} />
            <Key code="Digit7" label="7" pressed={isPressed("Digit7")} down={isDown("Digit7")} />
            <Key code="Digit8" label="8" pressed={isPressed("Digit8")} down={isDown("Digit8")} />
            <Key code="Digit9" label="9" pressed={isPressed("Digit9")} down={isDown("Digit9")} />
            <Key code="Digit0" label="0" pressed={isPressed("Digit0")} down={isDown("Digit0")} />
            <Key code="Minus" label="-" pressed={isPressed("Minus")} down={isDown("Minus")} />
            <Key code="Equal" label="+" pressed={isPressed("Equal")} down={isDown("Equal")} />
            <Key code="Backspace" label="Backspace" accent pressed={isPressed("Backspace")} down={isDown("Backspace")} />
          </div>

          <div className="second-row">
            <Key code="Tab" label="Tab" accent pressed={isPressed("Tab")} down={isDown("Tab")} />
            {"QWERTYUIOP".split("").map((ch) => {
              const c = `Key${ch}`;
              return <Key key={c} code={c} label={ch} pressed={isPressed(c)} down={isDown(c)} />;
            })}
            <Key code="BracketLeft" label="[" pressed={isPressed("BracketLeft")} down={isDown("BracketLeft")} />
            <Key code="BracketRight" label="]" pressed={isPressed("BracketRight")} down={isDown("BracketRight")} />
            <Key code="Backslash" label="\\"
              pressed={isPressed("Backslash")} down={isDown("Backslash")}
            />
          </div>

          <div className="third-row">
            <Key code="CapsLock" label="Caps" accent pressed={isPressed("CapsLock")} down={isDown("CapsLock")} />
            {"ASDFGHJKL".split("").map((ch) => {
              const c = `Key${ch}`;
              return <Key key={c} code={c} label={ch} pressed={isPressed(c)} down={isDown(c)} />;
            })}
            <Key code="Semicolon" label=";" pressed={isPressed("Semicolon")} down={isDown("Semicolon")} />
            <Key code="Quote" label="'" pressed={isPressed("Quote")} down={isDown("Quote")} />
            <Key code="Enter" label="Enter" accent pressed={isPressed("Enter")} down={isDown("Enter")} />
          </div>

          <div className="fourth-row">
            <Key code="ShiftLeft" label="Shift" accent pressed={isPressed("ShiftLeft")} down={isDown("ShiftLeft")} />
            {"ZXCVBNM".split("").map((ch) => {
              const c = `Key${ch}`;
              return <Key key={c} code={c} label={ch} pressed={isPressed(c)} down={isDown(c)} />;
            })}
            <Key code="Comma" label="," pressed={isPressed("Comma")} down={isDown("Comma")} />
            <Key code="Period" label="." pressed={isPressed("Period")} down={isDown("Period")} />
            <Key code="Slash" label="/" pressed={isPressed("Slash")} down={isDown("Slash")} />
            <Key code="ShiftRight" label="Shift" accent pressed={isPressed("ShiftRight")} down={isDown("ShiftRight")} />
          </div>

          <div className="fifth-row">
            <Key code="ControlLeft" label="Ctrl" accent pressed={isPressed("ControlLeft")} down={isDown("ControlLeft")} />
            <Key
              code="MetaLeft"
              label="Win"
              accent
              pressed={isPressed("MetaLeft")}
              down={isDown("MetaLeft")}
              icon={<WindowsIcon />}
            />
            <Key code="AltLeft" label="Alt" accent pressed={isPressed("AltLeft")} down={isDown("AltLeft")} />
            <Key code="Space" label="—" pressed={isPressed("Space")} down={isDown("Space")} />
            <Key code="AltRight" label="Alt" accent pressed={isPressed("AltRight")} down={isDown("AltRight")} />
            <Key code="Fn" label="Fn" accent pressed={isPressed("Fn")} down={isDown("Fn")} />
            <Key
              code="ContextMenu"
              label="Menu"
              accent
              pressed={isPressed("ContextMenu")}
              down={isDown("ContextMenu")}
              icon={<MenuIcon />}
            />
            <Key code="ControlRight" label="Ctrl" accent pressed={isPressed("ControlRight")} down={isDown("ControlRight")} />
          </div>
        </div>

        {/* Navigation region */}
        <div className="region navigation">
          <Key code="Insert" label="Insert" pressed={isPressed("Insert")} down={isDown("Insert")} />
          <Key code="Home" label="Home" pressed={isPressed("Home")} down={isDown("Home")} />
          <Key code="PageUp" label="Pg Up" pressed={isPressed("PageUp")} down={isDown("PageUp")} />

          <Key code="Delete" label="Delete" pressed={isPressed("Delete")} down={isDown("Delete")} />
          <Key code="End" label="End" pressed={isPressed("End")} down={isDown("End")} />
          <Key code="PageDown" label="Pg Dn" pressed={isPressed("PageDown")} down={isDown("PageDown")} />

          <div />
          <Key
            code="ArrowUp"
            label="↑"
            pressed={isPressed("ArrowUp")}
            down={isDown("ArrowUp")}
            icon={<ArrowIcon dir="up" />}
          />
          <div />

          <Key
            code="ArrowLeft"
            label="←"
            pressed={isPressed("ArrowLeft")}
            down={isDown("ArrowLeft")}
            icon={<ArrowIcon dir="left" />}
          />
          <Key
            code="ArrowDown"
            label="↓"
            pressed={isPressed("ArrowDown")}
            down={isDown("ArrowDown")}
            icon={<ArrowIcon dir="down" />}
          />
          <Key
            code="ArrowRight"
            label="→"
            pressed={isPressed("ArrowRight")}
            down={isDown("ArrowRight")}
            icon={<ArrowIcon dir="right" />}
          />
        </div>

        {/* Numpad region (hidden in TKL) */}
        <div className={`region numpad ${layout === "tkl" ? "hidden--step1 hidden--step2" : ""}`}>
          <Key code="NumLock" label="NumLk" pressed={isPressed("NumLock")} down={isDown("NumLock")} />
          <Key code="NumpadDivide" label="/" pressed={isPressed("NumpadDivide")} down={isDown("NumpadDivide")} />
          <Key code="NumpadMultiply" label="×" pressed={isPressed("NumpadMultiply")} down={isDown("NumpadMultiply")} />
          <Key code="NumpadSubtract" label="−" pressed={isPressed("NumpadSubtract")} down={isDown("NumpadSubtract")} />

          <Key code="Numpad7" label="7" pressed={isPressed("Numpad7")} down={isDown("Numpad7")} />
          <Key code="Numpad8" label="8" pressed={isPressed("Numpad8")} down={isDown("Numpad8")} />
          <Key code="Numpad9" label="9" pressed={isPressed("Numpad9")} down={isDown("Numpad9")} />
          <Key code="NumpadAdd" label="+" pressed={isPressed("NumpadAdd")} down={isDown("NumpadAdd")} />

          <Key code="Numpad4" label="4" pressed={isPressed("Numpad4")} down={isDown("Numpad4")} />
          <Key code="Numpad5" label="5" pressed={isPressed("Numpad5")} down={isDown("Numpad5")} />
          <Key code="Numpad6" label="6" pressed={isPressed("Numpad6")} down={isDown("Numpad6")} />

          <Key code="Numpad1" label="1" pressed={isPressed("Numpad1")} down={isDown("Numpad1")} />
          <Key code="Numpad2" label="2" pressed={isPressed("Numpad2")} down={isDown("Numpad2")} />
          <Key code="Numpad3" label="3" pressed={isPressed("Numpad3")} down={isDown("Numpad3")} />
          <Key code="NumpadEnter" label="Enter" pressed={isPressed("NumpadEnter")} down={isDown("NumpadEnter")} />

          <Key code="Numpad0" label="0" pressed={isPressed("Numpad0")} down={isDown("Numpad0")} />
          <Key code="NumpadDecimal" label="." pressed={isPressed("NumpadDecimal")} down={isDown("NumpadDecimal")} />
        </div>
      </section>

      <footer className="kt-footer">
        <span className="kt-footnote">
          Tip: Some keys (PrintScreen/Pause) may be blocked by your OS/browser.
        </span>
      </footer>
    </div>
  );
}
