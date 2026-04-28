import dotenv from "dotenv";

dotenv.config();

const clientUrl = process.env.CLIENT_URL ?? "";
const railwayPublicUrl = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : "";

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  clientUrl: clientUrl || railwayPublicUrl,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
  refreshCookieName: "lab_emr_refresh_token",
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
};

if (config.isProduction) {
  if (!config.jwtAccessSecret || config.jwtAccessSecret === "change-me-access") {
    throw new Error("JWT_ACCESS_SECRET must be set to a strong value in production");
  }

  if (!config.jwtRefreshSecret || config.jwtRefreshSecret === "change-me-refresh") {
    throw new Error("JWT_REFRESH_SECRET must be set to a strong value in production");
  }
}
