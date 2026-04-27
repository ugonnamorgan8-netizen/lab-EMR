import dotenv from "dotenv";

dotenv.config();

const clientUrl = process.env.CLIENT_URL ?? "";
const railwayPublicUrl = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : "";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: clientUrl || railwayPublicUrl,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
  refreshCookieName: "lab_emr_refresh_token",
};
