export function deriveAccentColor(defaultColor) {
  let r, g, b;

  // Handle different color formats
  if (defaultColor.startsWith('#')) {
    // Hex colors
    if (defaultColor.length === 4) {
      // 3-digit hex
      r = parseInt(defaultColor[1] + defaultColor[1], 16);
      g = parseInt(defaultColor[2] + defaultColor[2], 16);
      b = parseInt(defaultColor[3] + defaultColor[3], 16);
    } else if (defaultColor.length === 7) {
      // 6-digit hex
      r = parseInt(defaultColor.substr(1, 2), 16);
      g = parseInt(defaultColor.substr(3, 2), 16);
      b = parseInt(defaultColor.substr(5, 2), 16);
    } else {
      throw new Error('Invalid hex color format');
    }
  } else if (defaultColor.startsWith('rgb(')) {
    // RGB format
    const match = defaultColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      [, r, g, b] = parseRGB(match.slice(1));
    } else {
      throw new Error('Invalid RGB color format');
    }
  } else if (defaultColor.startsWith('rgba(')) {
    // RGBA format
    const match = defaultColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      [, r, g, b] = parseRGB(match.slice(1, 4));
    } else {
      throw new Error('Invalid RGBA color format');
    }
  } else if (defaultColor.startsWith('hsl(')) {
    // HSL format
    const match = defaultColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      [r, g, b] = hslToRgb(...parseRGB(match.slice(1)));
    } else {
      throw new Error('Invalid HSL color format');
    }
  } else if (defaultColor.startsWith('hsla(')) {
    // HSLA format
    const match = defaultColor.match(/hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*([\d.]+)\)/);
    if (match) {
      [r, g, b] = hslToRgb(...parseRGB(match.slice(1, 4)));
    } else {
      throw new Error('Invalid HSLA color format');
    }
  // } else if (defaultColor in CSS_COLOR_NAMES) {
  //   // Named colors
  //   const hexColor = CSS_COLOR_NAMES[defaultColor];
  //   r = parseInt(hexColor.substr(1, 2), 16);
  //   g = parseInt(hexColor.substr(3, 2), 16);
  //   b = parseInt(hexColor.substr(5, 2), 16);
  } else {
    throw new Error('Unsupported color format');
  }

  // Calculate perceived brightness
  // Using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Choose black or white based on brightness
  // You can adjust the threshold (0.5) as needed
  return brightness > 0.5 ? '#000000' : '#FFFFFF';
}

function hslToRgb (h, s, l) { 
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

function parseRGB (match) {
  return match.map(x => parseInt(x));
};
