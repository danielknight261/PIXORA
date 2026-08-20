export const brand = {
  name: "Snapp Daddy",
  colors: {
    primary: "#2563EB",
    dark: "#0F172A",
    light: "#F8FAFC",
    accent: "#60A5FA",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
  },
  fonts: {
    heading: "Poppins",
    body: "Inter",
  },
  radius: "1.5rem",
  tagline: "Turn Moments Into Keepsakes",
  shadows: {
    card: "0 1px 3px 0 rgb(15 23 42 / 0.04), 0 4px 12px -2px rgb(15 23 42 / 0.06)",
    cardHover:
      "0 4px 6px -1px rgb(15 23 42 / 0.06), 0 12px 24px -4px rgb(15 23 42 / 0.1)",
    nav: "0 1px 3px 0 rgb(15 23 42 / 0.04), 0 2px 8px -2px rgb(15 23 42 / 0.06)",
  },
  spacing: {
    section: "6rem",
    container: "72rem",
    cardPadding: "1.5rem",
  },
  typography: {
    display: { size: "3.75rem", lineHeight: "1.1", weight: "700" },
    title: { size: "2.25rem", lineHeight: "1.2", weight: "600" },
    body: { size: "1rem", lineHeight: "1.6", weight: "400" },
    caption: { size: "0.875rem", lineHeight: "1.5", weight: "400" },
  },
} as const;
