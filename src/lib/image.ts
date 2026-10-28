/**
 * Reads an image file and downscales it via canvas so it fits nicely
 * in localStorage-backed demo storage and preview thumbnails.
 */
export function fileToDataUrl(file: File, maxDim = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an SVG Data URL of a clean passport-size member portrait for instant demo testing.
 */
export function createSampleMemberPhoto(name = "Ram Sharma"): string {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect width="400" height="480" fill="url(#bg)"/>
    <circle cx="200" cy="180" r="75" fill="#fde047" opacity="0.15"/>
    <!-- Head -->
    <circle cx="200" cy="165" r="62" fill="#fed7aa"/>
    <!-- Hair -->
    <path d="M 140 165 C 140 100 260 100 260 165 C 255 125 145 125 140 165 Z" fill="#1e293b"/>
    <!-- Eyes -->
    <circle cx="180" cy="165" r="5" fill="#1e293b"/>
    <circle cx="220" cy="165" r="5" fill="#1e293b"/>
    <!-- Smile -->
    <path d="M 185 195 Q 200 208 215 195" stroke="#9a3412" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Shirt / Torso -->
    <path d="M 100 440 C 100 300 135 270 200 270 C 265 270 300 300 300 440 Z" fill="url(#bodyGrad)"/>
    <!-- Collar -->
    <polygon points="200,290 170,270 200,320 230,270" fill="#ffffff"/>
    <polygon points="190,320 200,420 210,320" fill="#dc2626"/>
    <!-- Watermark Banner -->
    <rect x="0" y="420" width="400" height="60" fill="#0b1329" opacity="0.85"/>
    <text x="200" y="445" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${name}
    </text>
    <text x="200" y="465" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">
      KYC VERIFIED MEMBER PHOTO
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG Data URL of a realistic government ID card for instant demo testing.
 */
export function createSampleIdCard(
  name = "Ram Sharma",
  membershipCode = "MEM001",
  docType = "Aadhaar Card"
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
      <linearGradient id="topBar" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1e3a8a"/>
        <stop offset="50%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <!-- Card Base -->
    <rect x="0" y="0" width="600" height="380" rx="20" fill="url(#cardBg)" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Top Header Bar -->
    <path d="M 0 20 C 0 8.95 8.95 0 20 0 L 580 0 C 591.05 0 600 8.95 600 20 L 600 70 L 0 70 Z" fill="url(#topBar)"/>
    <text x="30" y="42" font-family="Inter, sans-serif" font-size="18" font-weight="800" fill="#ffffff" letter-spacing="1">
      GOVERNMENT IDENTIFICATION CARD
    </text>
    <text x="30" y="60" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#bae6fd">
      ${docType.toUpperCase()} · SANGAM COOPERATIVE VERIFIED
    </text>
    <!-- Photo Box -->
    <rect x="35" y="100" width="130" height="160" rx="12" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="100" cy="160" r="35" fill="#cbd5e1"/>
    <path d="M 60 240 C 60 205 80 195 100 195 C 120 195 140 205 140 240 Z" fill="#94a3b8"/>
    <text x="100" y="275" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#64748b" text-anchor="middle">
      VALID ID PHOTO
    </text>
    <!-- Details -->
    <text x="190" y="125" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#64748b">FULL NAME</text>
    <text x="190" y="150" font-family="Inter, sans-serif" font-size="19" font-weight="800" fill="#0f172a">${name}</text>

    <text x="190" y="185" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#64748b">DOCUMENT NUMBER</text>
    <text x="190" y="208" font-family="Courier, monospace" font-size="16" font-weight="bold" fill="#1e3a8a">8294 1029 4810</text>

    <text x="190" y="240" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#64748b">MEMBER ID</text>
    <text x="190" y="260" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${membershipCode}</text>

    <text x="340" y="240" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#64748b">DOB / ISSUE</text>
    <text x="340" y="260" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">15/08/1988</text>

    <text x="190" y="295" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#64748b">PERMANENT ADDRESS</text>
    <text x="190" y="315" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#334155">Ward 4, Cooperative Nagar, Jaipur, Rajasthan</text>

    <!-- QR Code Mock -->
    <rect x="470" y="100" width="95" height="95" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="480" y="110" width="25" height="25" fill="#0f172a"/>
    <rect x="530" y="110" width="25" height="25" fill="#0f172a"/>
    <rect x="480" y="160" width="25" height="25" fill="#0f172a"/>
    <rect x="515" y="145" width="20" height="20" fill="#0f172a"/>
    <!-- Bottom Hologram / Watermark -->
    <path d="M 0 350 L 600 350 L 600 380 L 0 380 Z" fill="#0f172a"/>
    <text x="300" y="369" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#93c5fd" text-anchor="middle" letter-spacing="2">
      OFFICIAL PROOF OF IDENTITY · SECURE DOCUMENT
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
