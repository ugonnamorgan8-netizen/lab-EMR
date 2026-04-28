export const appBrand = {
  shortName: "Lab EMR",
  labName: "Medicare Diagnostic Laboratory",
  shellTagline: "Reception, science, billing, and supervisory oversight in one polished laboratory workspace.",
  loginTagline: "Integrated reception, science, billing, and supervisory oversight for daily laboratory operations.",
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
