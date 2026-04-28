export const appBrand = {
  shortName: "St. David",
  labName: "ST. DAVID MEDICAL DIAGNOSTIC CENTRE",
  address: "BERLIN PLAZA #NO 110 OGUI ROAD ENUGU STATE NIGERIA",
  email: "info@stdavidmedicaldiagnostic.org.ng",
  phone: "08100094967",
  website: "www.stdavidmedicaldiagnostic.org.ng",
  shellTagline: "Laboratory operations, reporting, and finance coordinated in one branded diagnostic workspace.",
  loginTagline: "Trusted diagnostics, streamlined workflow, and patient-ready reporting from a single operations console.",
  logoPath: "/lab-logo.jpeg",
};

export function getBrandLogoUrl(logoUrl?: string | null) {
  return logoUrl?.trim() || appBrand.logoPath;
}

export function getBrandInitials(name?: string | null) {
  const source = name?.trim() || appBrand.labName;
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
