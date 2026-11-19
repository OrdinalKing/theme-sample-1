const LABEL = { ready: 'Ready', now: 'Reading', ok: 'Done', wait: 'Waiting' };

/**
 * Numbered step list. `status` maps each step key to
 * 'ready' (current, not started) | 'now' (in progress) | 'ok' (done) | 'wait'.
 */
export default function Rail({ steps, status }) {
  return (
    <ol className="rail">
      {steps.map((step, i) => {
        const s = status[step.k] || 'wait';
        const dataS = s === 'ready' ? 'now' : s === 'wait' ? undefined : s;
        return (
          <li key={step.k} data-k={step.k} data-s={dataS}>
            <span className="pip">{i + 1}</span>
            <span>{step.label}</span>
            <span className="st">{LABEL[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}
