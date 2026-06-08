export const appBrand = {
  shortName: "Phenom Labs",
  labName: "PHENOM LABS",
  address: "Africa",
  email: "hello@phenomlabs.com",
  phone: "",
  website: "phenomlabs.com",
  shellTagline: "We Build, Teach and Automate with AI.",
  loginTagline: "Africa's AI Solutions Company — Built for the World.",
  logoPath: "/favicon.svg",
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
