// =====================================================================
// screenProtection.ts
// PRD §5.1 — anti-piracy on the secure video player:
//   - block right-click, common screenshot/save hotkeys
//   - detect DevTools (open -> onViolation)
//   - detect tab switch / window blur -> onPause
// =====================================================================

export interface ScreenProtectionHandlers {
  onPause?: () => void;
  onViolation?: () => void;
}

const BLOCKED_KEY_COMBOS: Array<(e: KeyboardEvent) => boolean> = [
  (e) => ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'),
  (e) => ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u'),
  (e) => ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p'),
  (e) => (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's'),
  (e) => (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')),
  (e) => e.key === 'PrintScreen',
  (e) => e.key === 'F12',
];

function isDevToolsOpen(): boolean {
  const widthGap = window.outerWidth - window.innerWidth > 160;
  const heightGap = window.outerHeight - window.innerHeight > 160;
  const start = performance.now();
  // Console.log timing side-channel. >4ms usually means DevTools is open.
  // eslint-disable-next-line no-console
  console.log('%c', 'font-size:0');
  const took = performance.now() - start;
  const consoleTiming = took > 4;
  return widthGap || heightGap || consoleTiming;
}

/**
 * Installs anti-piracy listeners. Returns a teardown function.
 *  - onViolation: devtools / blocked-keydown detected
 *  - onPause:    visibilitychange / window blur
 */
export function startScreenProtection(handlers: ScreenProtectionHandlers = {}): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const { onPause, onViolation } = handlers;

  const onContextMenu = (e: MouseEvent) => e.preventDefault();
  const onKeyDown = (e: KeyboardEvent) => {
    if (BLOCKED_KEY_COMBOS.some((match) => match(e))) {
      e.preventDefault();
      e.stopPropagation();
      onViolation?.();
    }
  };
  const onVisibilityChange = () => {
    if (document.hidden) onPause?.();
  };
  const onBlur = () => onPause?.();
  const onCopy = (e: ClipboardEvent) => e.preventDefault();

  const pollId = window.setInterval(() => {
    if (document.hidden) return;
    if (isDevToolsOpen()) onViolation?.();
  }, 1500);

  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('blur', onBlur);
  document.addEventListener('copy', onCopy);

  return () => {
    window.clearInterval(pollId);
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('copy', onCopy);
  };
}
