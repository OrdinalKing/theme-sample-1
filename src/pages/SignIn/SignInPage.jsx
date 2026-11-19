import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandMark from '../../components/BrandMark.jsx';
import ChamberBackground from './ChamberBackground.jsx';
import VaultStage from './VaultStage.jsx';
import Rail from './Rail.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { usePatchState } from '../../hooks/usePatchState.js';
import { useTimers } from '../../hooks/useTimers.js';
import './SignIn.css';

const SCAN = '#63E6D2';
const BRASS = '#D9A441';
const CODE_LEN = 6;
const PAD_RING_LEN = 575;

const IN_STEPS = [
  { k: 'face', label: 'Face check' },
  { k: 'print', label: 'Fingerprint check' },
  { k: 'code', label: 'Device handshake' },
];
const UP_STEPS = [
  { k: 'details', label: 'Your details' },
  { k: 'eface', label: 'Record your face' },
  { k: 'eprint', label: 'Record your fingerprint' },
  { k: 'seal', label: 'Seal your vault' },
];
const GOALS = [
  {
    g: 'Emergency Reserve',
    label: 'Emergency',
    icon: <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />,
  },
  {
    g: 'Home Deposit',
    label: 'A home',
    icon: (
      <>
        <path d="M4 11l8-6 8 6v9H4z" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  },
  { g: 'Travel Fund', label: 'Travel', icon: <path d="M3 13l18-7-7 18-2-7-9-4z" /> },
  {
    g: 'Tuition Vault',
    label: 'Study',
    icon: (
      <>
        <path d="M3 9l9-4 9 4-9 4-9-4z" />
        <path d="M7 11v5c3 2 7 2 10 0v-5" />
      </>
    ),
  },
];
const ANGLES = [
  {
    t: 'Look straight ahead',
    h: 'Keep your chin level and fill the frame.',
    c: 'Angle 1 of 3 — look straight into the frame.',
  },
  {
    t: 'Turn slowly to your left',
    h: 'Stop when your right ear comes into view.',
    c: 'Angle 2 of 3 — turn slowly to your left.',
  },
  {
    t: 'Now turn to your right',
    h: 'Last one. Hold still through the sweep.',
    c: 'Angle 3 of 3 — turn slowly to your right.',
  },
];
const QUAL = ['—', 'Partial', 'Good', 'Strong', 'Complete'];
const SEAL_LOG = [
  'Key pair created on this device',
  'Face and fingerprint templates sealed',
  'Vault cast and numbered',
  'Deposit insurance registered',
];

const digit = () => String(Math.floor(Math.random() * 10));

const INITIAL_UI = {
  accent: SCAN,
  arcP: 0,
  arcColor: SCAN,
  spinning: false,
  doorOpen: false,
  spillOn: false,
  win: 'face', // 'face' | 'print' | 'code' | 'engrave' | null
  capTitle: 'Face check',
  capText: "Press start when you're centred in the frame.",
  sensor: 'Sensors idle',
  beamOn: false,
  meshLit: false,
  meshDone: false,
  brackets: '#2B3A47',
  outline: '#33444F',
  angleDots: 0,
  padState: 'idle', // 'idle' | 'hold' | 'ok'
  padRingStroke: SCAN,
  minuLit: false,
  code: Array(CODE_LEN).fill('·'),
  codeSet: 0,
};

const INITIAL_SIGN_IN = {
  rail: { face: 'ready', print: 'wait', code: 'wait' },
  tel: { live: '—', pts: 0, yaw: '—', match: '—' },
  started: false,
  done: false,
  btnLabel: 'Start face check',
};

const INITIAL_ENROL = {
  step: 'details', // 'details' | 'face' | 'print' | 'seal'
  rail: { details: 'ready', eface: 'wait', eprint: 'wait', seal: 'wait' },
  name: '',
  email: '',
  goal: null,
  terms: false,
  error: '',
  angle: 0,
  points: 0,
  capturing: false,
  impressions: 0,
  sealed: 0,
  vaultNo: '',
};

export default function SignInPage() {
  useDocumentTitle('Aurum Savings — Open the vault');
  const navigate = useNavigate();
  const timers = useTimers();

  const [mode, setModeState] = useState('in');
  const [ui, patchUi] = usePatchState(INITIAL_UI);
  const [signIn, patchSignIn] = usePatchState(INITIAL_SIGN_IN);
  const [enrol, patchEnrol] = usePatchState(INITIAL_ENROL);

  const plateRef = useRef(null);
  const engraveRef = useRef(null);
  const printLitRef = useRef(null);
  const padRingRef = useRef(null);
  const pad = useRef({ raf: 0, t0: 0, dur: 1700, busy: false });

  // Timer and animation-frame callbacks read the latest state through this ref.
  const live = useRef({ mode, ui, enrol });
  useLayoutEffect(() => {
    live.current = { mode, ui, enrol };
  });

  useEffect(() => () => cancelAnimationFrame(pad.current.raf), []);

  /* ---------- small helpers ---------- */
  const setArc = (p, color) => patchUi(color ? { arcP: p, arcColor: color } : { arcP: p });
  const goToAccounts = () => navigate('/accounts');

  /* ---------- door ---------- */
  function openDoor(then) {
    if (live.current.ui.doorOpen) return;
    patchUi({ spinning: false, doorOpen: true });
    timers.timeout(() => {
      patchUi({ spillOn: true, win: null, capTitle: 'Vault open', capText: 'Taking you inside.' });
      plateRef.current?.animate(
        [
          { transform: 'perspective(1500px) rotateY(0deg)' },
          { transform: 'perspective(1500px) rotateY(-62deg)' },
        ],
        { duration: 1200, easing: 'cubic-bezier(.3,.8,.2,1)', fill: 'forwards' }
      );
    }, 560);
    timers.timeout(then, 2200);
  }

  /* ---------- tabs ---------- */
  function setMode(m) {
    if (mode === m) return;
    setModeState(m);
    if (m === 'up') {
      patchUi({
        win: 'engrave',
        accent: BRASS,
        arcP: 0,
        arcColor: BRASS,
        sensor: 'Sensors idle',
        capTitle: 'A new vault',
        capText: 'Tell us who you are and what you are saving for.',
      });
    } else {
      patchUi({
        win: 'face',
        accent: SCAN,
        arcP: 0,
        arcColor: SCAN,
        sensor: 'Sensors idle',
        capTitle: 'Face check',
        capText: "Press start when you're centred in the frame.",
      });
    }
  }

  /* ---------- sign in: face ---------- */
  function faceScan() {
    patchSignIn({ started: true, btnLabel: 'Reading your face…' });
    patchUi({
      accent: SCAN,
      spinning: true,
      beamOn: true,
      meshLit: true,
      brackets: SCAN,
      outline: '#6FA3A8',
      sensor: 'Camera live',
      capTitle: 'Face check',
      capText: 'Matching 17 depth points against your enrolled face.',
    });
    let n = 0;
    const iv = timers.interval(() => {
      n = Math.min(n + 1, 17);
      const pts = n;
      const yaw = (Math.random() * 6 - 3).toFixed(1) + '°';
      const liveness = (88 + Math.random() * 11).toFixed(1) + '%';
      patchSignIn((s) => ({ tel: { ...s.tel, pts, yaw, live: liveness } }));
      setArc((pts / 17) * 0.33);
    }, 150);

    timers.timeout(() => {
      timers.clear(iv);
      patchUi({
        beamOn: false,
        spinning: false,
        meshDone: true,
        brackets: BRASS,
        outline: '#F2D293',
        sensor: 'Face matched',
        arcP: 0.33,
        arcColor: BRASS,
      });
      patchSignIn((s) => ({
        tel: { ...s.tel, match: '99.2%', live: 'Confirmed' },
        rail: { ...s.rail, face: 'ok', print: 'now' },
      }));
      timers.timeout(() => {
        patchUi({
          win: 'print',
          accent: SCAN,
          sensor: 'Ridge sensor live',
          capTitle: 'Fingerprint check',
          capText: 'Press and hold the pad until the ring closes.',
        });
        patchSignIn({ btnLabel: 'Waiting for your fingerprint' });
      }, 720);
    }, 3000);
  }

  /* ---------- hold pad (shared by sign-in and enrolment) ---------- */
  function padSet(p) {
    if (printLitRef.current) printLitRef.current.style.clipPath = `inset(${100 - p * 100}% 0 0 0)`;
    if (padRingRef.current) padRingRef.current.style.strokeDashoffset = PAD_RING_LEN * (1 - p);
  }

  function padTick(ts) {
    const s = pad.current;
    if (!s.t0) s.t0 = ts;
    const p = Math.min((ts - s.t0) / s.dur, 1);
    padSet(p);
    if (live.current.mode === 'in') setArc(0.33 + p * 0.33);
    if (p < 1) s.raf = requestAnimationFrame(padTick);
    else padFinish();
  }

  function padStart(e) {
    const s = pad.current;
    if (s.busy || s.raf || live.current.ui.win !== 'print') return;
    if (e.cancelable) e.preventDefault();
    patchUi({ padState: 'hold', sensor: 'Reading ridges' });
    s.t0 = 0;
    s.raf = requestAnimationFrame(padTick);
  }

  function padStop() {
    const s = pad.current;
    if (s.busy || !s.raf) return;
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    padSet(0);
    patchUi({
      padState: 'idle',
      capText: 'Lifted too early — hold until the ring closes.',
      ...(live.current.mode === 'in' ? { arcP: 0.33 } : null),
    });
  }

  function padFinish() {
    const s = pad.current;
    s.raf = 0;
    s.busy = true;
    patchUi({
      padState: 'ok',
      padRingStroke: BRASS,
      sensor: 'Ridge pattern matched',
      minuLit: true,
    });
    timers.timeout(() => {
      s.busy = false;
      if (live.current.mode === 'in') handshake();
      else enrolPrint();
    }, 780);
  }

  const padHandlers = {
    onPointerDown: padStart,
    onPointerUp: padStop,
    onPointerCancel: padStop,
    onPointerLeave: padStop,
    onKeyDown: (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) padStart(e);
    },
    onKeyUp: padStop,
  };

  /* ---------- sign in: handshake ---------- */
  function handshake() {
    patchSignIn((s) => ({
      rail: { ...s.rail, print: 'ok', code: 'now' },
      btnLabel: 'Shaking hands with the vault',
    }));
    patchUi({
      win: 'code',
      accent: SCAN,
      capTitle: 'Device handshake',
      capText: 'Your device and the vault are agreeing on a one-time code.',
    });
    let locked = 0;
    const roll = timers.interval(() => {
      const from = locked;
      const fresh = Array.from({ length: CODE_LEN }, digit);
      patchUi((u) => ({ code: u.code.map((d, j) => (j >= from ? fresh[j] : d)) }));
    }, 60);
    const lock = timers.interval(() => {
      const idx = locked;
      const value = digit();
      locked += 1;
      const n = locked;
      patchUi((u) => ({
        code: u.code.map((d, j) => (j === idx ? value : d)),
        codeSet: n,
        arcP: 0.66 + (n / CODE_LEN) * 0.34,
      }));
      if (n === CODE_LEN) {
        timers.clear(roll);
        timers.clear(lock);
        patchUi({ arcP: 1, arcColor: BRASS, sensor: 'Handshake sealed' });
        patchSignIn((s) => ({
          rail: { ...s.rail, code: 'ok' },
          done: true,
          btnLabel: 'Opening the door…',
        }));
        timers.timeout(() => openDoor(goToAccounts), 520);
      }
    }, 380);
  }

  /* ---------- enrolment ---------- */
  function pickGoal(goal) {
    patchEnrol({ goal });
    engraveRef.current?.animate(
      [
        { opacity: 0.3, transform: 'scale(.95)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 400, easing: 'ease-out' }
    );
  }

  function continueToFace() {
    const n = enrol.name.trim();
    const m = enrol.email.trim();
    let error = '';
    if (!n) error = 'Add your full name as it appears on your ID.';
    else if (!/^\S+@\S+\.\S+$/.test(m)) error = 'That email address looks incomplete.';
    else if (!enrol.goal) error = 'Pick what this first vault is for.';
    else if (!enrol.terms) error = 'Tick the box to keep your template on this device.';
    if (error) {
      patchEnrol({ error });
      return;
    }
    patchEnrol((s) => ({
      error: '',
      step: 'face',
      rail: { ...s.rail, details: 'ok', eface: 'now' },
    }));
    patchUi({
      win: 'face',
      accent: SCAN,
      arcP: 0.25,
      arcColor: SCAN,
      meshLit: false,
      meshDone: false,
      sensor: 'Camera live',
      capTitle: 'Recording your face',
      capText: ANGLES[0].c,
    });
  }

  function captureAngle() {
    const a = enrol.angle;
    let n = enrol.points;
    patchEnrol({ capturing: true });
    patchUi({
      beamOn: true,
      meshLit: true,
      spinning: true,
      brackets: SCAN,
      sensor: `Recording angle ${a + 1}`,
    });
    const iv = timers.interval(() => {
      n = Math.min(n + 1, (a + 1) * 17);
      patchEnrol({ points: n });
    }, 90);

    timers.timeout(() => {
      timers.clear(iv);
      const next = a + 1;
      patchEnrol({ points: next * 17, angle: next, capturing: next >= 3 });
      patchUi({ beamOn: false, spinning: false, angleDots: next, arcP: 0.25 + (next / 3) * 0.25 });
      if (next < 3) {
        patchUi({ meshLit: false, capTitle: 'Recording your face', capText: ANGLES[next].c });
        return;
      }
      patchUi({ meshDone: true, brackets: BRASS, sensor: 'Face template built' });
      patchEnrol((s) => ({ rail: { ...s.rail, eface: 'ok', eprint: 'now' } }));
      timers.timeout(() => {
        pad.current.dur = 900;
        padSet(0);
        patchEnrol({ step: 'print' });
        patchUi({
          win: 'print',
          padRingStroke: SCAN,
          padState: 'idle',
          minuLit: false,
          accent: SCAN,
          capTitle: 'Recording your fingerprint',
          capText: 'Press and hold, lift, and repeat four times.',
        });
      }, 760);
    }, 1600);
  }

  function enrolPrint() {
    const k = live.current.enrol.impressions + 1;
    patchEnrol({ impressions: k });
    setArc(0.5 + (k / 4) * 0.25);
    if (k < 4) {
      padSet(0);
      patchUi({
        padState: 'idle',
        padRingStroke: SCAN,
        minuLit: false,
        capTitle: 'Recording your fingerprint',
        capText: 'Lift your finger, then press again at a slightly different angle.',
      });
      return;
    }
    patchEnrol((s) => ({ rail: { ...s.rail, eprint: 'ok', seal: 'now' } }));
    patchUi({ sensor: 'Fingerprint template built' });
    timers.timeout(sealVault, 760);
  }

  function sealVault() {
    patchEnrol({ step: 'seal' });
    patchUi({
      win: 'engrave',
      accent: BRASS,
      spinning: true,
      capTitle: 'Sealing your vault',
      capText: 'Casting the door and cutting the key.',
    });
    SEAL_LOG.forEach((_, i) =>
      timers.timeout(() => {
        patchEnrol({ sealed: i + 1 });
        setArc(0.75 + ((i + 1) / SEAL_LOG.length) * 0.25, BRASS);
      }, 600 + i * 750)
    );
    timers.timeout(() => {
      const vaultNo =
        'AUR ' + [0, 0, 0].map(() => String(Math.floor(1000 + Math.random() * 9000))).join(' ');
      const { name, goal } = live.current.enrol;
      patchEnrol((s) => ({ vaultNo, rail: { ...s.rail, seal: 'ok' } }));
      patchUi({
        spinning: false,
        sensor: 'Vault ready',
        capTitle: 'Your vault is cast',
        capText: `${name.trim()} — ${goal}`,
      });
    }, 600 + SEAL_LOG.length * 750 + 400);
  }

  /* ---------- render ---------- */
  const angleCard = ANGLES[Math.min(enrol.angle, 2)];

  return (
    <div className="signin-page" style={{ '--accent': ui.accent }}>
      <ChamberBackground accent={ui.accent} />
      <div className="vig" />

      <div className="shell">
        {/* ===================== CONSOLE ===================== */}
        <aside className="console">
          <div className="brandrow">
            <BrandMark />
            <b>AURUM SAVINGS</b>
            <small>
              <span className="pulse" />
              <span>{ui.sensor}</span>
            </small>
          </div>

          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={mode === 'in'} onClick={() => setMode('in')}>
              Sign in
            </button>
            <button role="tab" aria-selected={mode === 'up'} onClick={() => setMode('up')}>
              Open an account
            </button>
          </div>

          {mode === 'in' ? (
            /* ---------- SIGN IN ---------- */
            <div>
              <h1>Your face opens the door.</h1>
              <p className="lede">
                No password to forget, and none for anyone to steal. Three checks, about eight
                seconds.
              </p>

              <Rail steps={IN_STEPS} status={signIn.rail} />

              <div className="tel">
                <div>
                  <span>Liveness</span>
                  <b>{signIn.tel.live}</b>
                </div>
                <div>
                  <span>Depth points</span>
                  <b>{signIn.tel.pts}</b>
                </div>
                <div>
                  <span>Head angle</span>
                  <b>{signIn.tel.yaw}</b>
                </div>
                <div>
                  <span>Match</span>
                  <b>{signIn.tel.match}</b>
                </div>
              </div>

              {signIn.done && (
                <div className="card">
                  <h2>Welcome back, Rina.</h2>
                  <p>This session is sealed to this device until you close it.</p>
                </div>
              )}

              <button className="btn" disabled={signIn.started} onClick={faceScan}>
                {signIn.btnLabel}
              </button>
              <button
                className="btn ghost"
                onClick={() =>
                  patchUi({
                    capText:
                      'Recovery codes are posted to you. Biometrics stay the fastest way in.',
                  })
                }
              >
                Use a recovery code instead
              </button>
            </div>
          ) : (
            /* ---------- SIGN UP ---------- */
            <div>
              <h1>Enrol once, then just show up.</h1>
              <p className="lede">
                We record your face and fingerprint on this device, then cast your first vault.
              </p>

              <Rail steps={UP_STEPS} status={enrol.rail} />

              {enrol.step === 'details' && (
                <div>
                  <div className="field">
                    <input
                      id="fName"
                      placeholder=" "
                      autoComplete="name"
                      value={enrol.name}
                      onChange={(e) => patchEnrol({ name: e.target.value })}
                    />
                    <label htmlFor="fName">Full name</label>
                  </div>
                  <div className="field">
                    <input
                      id="fMail"
                      placeholder=" "
                      type="email"
                      autoComplete="email"
                      value={enrol.email}
                      onChange={(e) => patchEnrol({ email: e.target.value })}
                    />
                    <label htmlFor="fMail">Email</label>
                  </div>
                  <p className="lede" style={{ margin: '14px 0 0', fontSize: 13 }}>
                    What is this first vault for?
                  </p>
                  <div className="goals">
                    {GOALS.map((g) => (
                      <button
                        key={g.g}
                        aria-pressed={enrol.goal === g.g}
                        onClick={() => pickGoal(g.g)}
                      >
                        <svg viewBox="0 0 24 24">{g.icon}</svg>
                        {g.label}
                      </button>
                    ))}
                  </div>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={enrol.terms}
                      onChange={(e) => patchEnrol({ terms: e.target.checked })}
                    />
                    <span>
                      Aurum may keep my biometric template in this device's secure element. It never
                      leaves the device.
                    </span>
                  </label>
                  <p className="err">{enrol.error}</p>
                  <button className="btn" onClick={continueToFace}>
                    Continue to face recording
                  </button>
                </div>
              )}

              {enrol.step === 'face' && (
                <div>
                  <div className="card">
                    <h2>{angleCard.t}</h2>
                    <p>
                      {enrol.angle === 0
                        ? 'Fill the frame with your face, then capture.'
                        : angleCard.h}
                    </p>
                  </div>
                  <div className="tel">
                    <div>
                      <span>Angles recorded</span>
                      <b>{enrol.angle} of 3</b>
                    </div>
                    <div>
                      <span>Points mapped</span>
                      <b>{enrol.points}</b>
                    </div>
                  </div>
                  <button className="btn" disabled={enrol.capturing} onClick={captureAngle}>
                    {enrol.capturing ? 'Recording…' : 'Capture this angle'}
                  </button>
                </div>
              )}

              {enrol.step === 'print' && (
                <div>
                  <div className="card">
                    <h2>Press four times</h2>
                    <p>
                      Lift your finger between presses so the sensor catches the whole ridge
                      pattern.
                    </p>
                  </div>
                  <div className="tel">
                    <div>
                      <span>Impressions</span>
                      <b>{enrol.impressions} of 4</b>
                    </div>
                    <div>
                      <span>Ridge detail</span>
                      <b>{QUAL[enrol.impressions]}</b>
                    </div>
                  </div>
                  <button className="btn ghost" disabled>
                    Hold the pad on the right
                  </button>
                </div>
              )}

              {enrol.step === 'seal' && (
                <div>
                  <ul className="log">
                    {SEAL_LOG.map((text, i) => (
                      <li key={text} className={i < enrol.sealed ? 'on' : undefined}>
                        <i />
                        {text}
                      </li>
                    ))}
                  </ul>
                  {enrol.vaultNo && (
                    <>
                      <div className="vaultno">
                        <span>Your vault number</span>
                        <b>{enrol.vaultNo}</b>
                      </div>
                      <button className="btn" onClick={() => openDoor(goToAccounts)}>
                        Enter my vault
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="foot">
            <div>
              <svg viewBox="0 0 24 24">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              Templates held in this device's secure element
            </div>
            <div>
              <svg viewBox="0 0 24 24">
                <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
              </svg>
              Savings insured to $250,000
            </div>
          </div>
        </aside>

        {/* ===================== DOOR ===================== */}
        <VaultStage
          ui={ui}
          engraveName={enrol.goal}
          plateRef={plateRef}
          engraveRef={engraveRef}
          printLitRef={printLitRef}
          padRingRef={padRingRef}
          padHandlers={padHandlers}
        />
      </div>
    </div>
  );
}
