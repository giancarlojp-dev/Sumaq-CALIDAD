export const isGoogleAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id" &&
    process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret"
);

export const fallbackSessionUser = {
  id: "demo-user",
  name: "Usuario",
  email: "demo@sumaq.local",
  image: null,
  role: "ADMIN",
};
