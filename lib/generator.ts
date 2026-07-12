function hashString(input: string): number {
  let h = 0;
  for (const ch of input) {
    h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  }
  return h;
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generatePalette(input: string): string[] {
  const seed = hashString(input.trim().toLowerCase());
  const baseHue = seed % 360;
  const scheme = [
    { off: 0, s: 70, l: 45 },
    { off: 25, s: 65, l: 60 },
    { off: 180, s: 55, l: 50 },
    { off: 210, s: 60, l: 65 },
    { off: 335, s: 50, l: 40 },
  ];
  return scheme.map(({ off, s, l }) =>
    hslToHex((baseHue + off) % 360, s, l),
  );
}
