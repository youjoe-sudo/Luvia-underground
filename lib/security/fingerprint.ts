// =====================================================================
// fingerprint.ts
// Hardware-derived SHA-256 fingerprint. PRD §5.2 + chat directive:
// capture canvas + WebGL + hardware + browser signals into a stable
// hash, cached per-browser so it stays consistent across reloads.
// =====================================================================

const FINGERPRINT_STORAGE_KEY = 'luvia.fingerprint.v1';

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-2d';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 280, 60);
    ctx.fillStyle = '#069';
    ctx.font = '14px Poppins';
    ctx.fillText('Luvia-fingerprint-✨', 4, 24);
    ctx.strokeStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(180, 40, 20, 0, Math.PI * 2, true);
    ctx.stroke();
    return canvas.toDataURL();
  } catch {
    return 'canvas-blocked';
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'no-webgl';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return 'webgl-no-ext';
    return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? 'unknown');
  } catch {
    return 'webgl-blocked';
  }
}

function collectSignals(): string {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return [
    getCanvasFingerprint(),
    getWebGLRenderer(),
    String(nav.hardwareConcurrency ?? 0),
    String(nav.deviceMemory ?? 0),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
    new Date().getTimezoneOffset(),
    nav.language ?? '',
    (nav.languages ?? []).join(','),
    nav.platform ?? '',
    nav.userAgent ?? '',
  ].join('|');
}

/** Returns a stable SHA-256 hash of the device's hardware + browser signals. */
export async function getFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return 'ssr';
  const cached = window.localStorage.getItem(FINGERPRINT_STORAGE_KEY);
  if (cached) return cached;
  const hash = await sha256(collectSignals());
  window.localStorage.setItem(FINGERPRINT_STORAGE_KEY, hash);
  return hash;
}

export const FINGERPRINT_KEY = FINGERPRINT_STORAGE_KEY;
