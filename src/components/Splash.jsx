import { useState, useEffect } from "react";

const NAME = "Aura & Clothes";
const SHOW_MS = 3800; // how long before the fade-out starts
const FADE_MS = 700;  // fade-out time

const CSS = `
.sp-wrap {
  position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 3000;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: radial-gradient(circle at center, #1c1606 0%, #000 70%);
  transition: opacity ${FADE_MS}ms ease, visibility ${FADE_MS}ms ease;
}
.sp-wrap.sp-leave { opacity: 0; visibility: hidden; }

.sp-logo-box {
  position: relative; width: 150px; height: 150px; border-radius: 24px; overflow: hidden;
  animation: spGlow 2.4s ease-in-out infinite alternate;
}
.sp-logo {
  width: 100%; height: 100%; object-fit: contain; display: block;
  animation: spLogo 1.2s cubic-bezier(.2,.8,.2,1) both;
}
.sp-shine {
  position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.4), transparent);
  transform: skewX(-20deg);
  animation: spShine 1.2s ease 1.1s both;
}

.sp-name {
  margin: 1.5rem 0 0; color: #d4af37; font-size: 1.9rem; letter-spacing: .1em;
  font-family: 'Playfair Display', Georgia, serif; white-space: nowrap;
}
.sp-letter { display: inline-block; opacity: 0; animation: spLetter .6s ease forwards; }

.sp-line {
  height: 1px; width: 0; margin-top: 1rem;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  animation: spLine 1s ease 2s forwards;
}
.sp-tag {
  margin: .8rem 0 0; color: #b8a15a; font-size: .9rem; letter-spacing: .3em;
  text-transform: uppercase; opacity: 0; animation: spFade .8s ease 2.3s forwards;
}

.sp-skip {
  position: absolute; right: 1.25rem; bottom: 1.25rem; padding: .4rem .9rem;
  background: transparent; color: #b8a15a; border: 1px solid rgba(212,175,55,.4);
  border-radius: 999px; font-size: .8rem; cursor: pointer;
}
.sp-skip:hover { background: rgba(212,175,55,.15); }

@keyframes spLogo   { from { opacity: 0; transform: scale(.6); filter: blur(8px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
@keyframes spGlow   { from { box-shadow: 0 0 20px rgba(212,175,55,.12); } to { box-shadow: 0 0 70px rgba(212,175,55,.45); } }
@keyframes spShine  { from { left: -60%; } to { left: 130%; } }
@keyframes spLetter { from { opacity: 0; transform: translateY(18px); filter: blur(6px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
@keyframes spLine   { to { width: 220px; } }
@keyframes spFade   { to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .sp-logo-box, .sp-logo, .sp-letter, .sp-tag { animation: none !important; opacity: 1; transform: none; filter: none; }
  .sp-line { animation: none !important; width: 220px; }
  .sp-shine { display: none; }
}
`;

export default function Splash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  // start the fade-out after the animation has played
  useEffect(() => {
    const id = setTimeout(() => setLeaving(true), SHOW_MS);
    return () => clearTimeout(id);
  }, []);

  // remove the splash once it has faded out
  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => setVisible(false), FADE_MS);
    return () => clearTimeout(id);
  }, [leaving]);

  if (!visible) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className={`sp-wrap${leaving ? " sp-leave" : ""}`} role="status" aria-label="Loading Aura & Clothes">
        <div className="sp-logo-box">
          <img className="sp-logo" src="/image/logo.png" alt="" />
          <span className="sp-shine"></span>
        </div>

        <h1 className="sp-name" aria-label={NAME}>
          {NAME.split("").map((char, i) => (
            <span key={i} className="sp-letter" style={{ animationDelay: `${1 + i * 0.06}s` }} aria-hidden="true">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>

        <div className="sp-line"></div>
        <p className="sp-tag">Look · Feel · Royal</p>

        <button type="button" className="sp-skip" onClick={() => setLeaving(true)}>Skip</button>
      </div>
    </>
  );
}
