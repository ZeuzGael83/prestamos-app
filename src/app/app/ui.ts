import { theme } from "./theme";

export const ui = {
  page: {
    minHeight: "100vh",
    padding: theme.spacing.page,
    background: theme.colors.bg,
    color: theme.colors.text,
    fontFamily: "Arial, sans-serif",
  } as React.CSSProperties,

  hero: {
    background: theme.gradients.hero,
    color: theme.colors.white,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.hero,
    boxShadow: theme.shadow.medium,
    marginBottom: 18,
  } as React.CSSProperties,

  heroBadge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: theme.radius.pill,
    background: "rgba(255,255,255,0.12)",
    fontSize: 13,
    marginBottom: 14,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
  } as React.CSSProperties,

  heroTitle: {
    margin: 0,
    fontSize: 38,
    lineHeight: 1.05,
    fontWeight: 800,
    color: theme.colors.white,
  } as React.CSSProperties,

  heroText: {
    marginTop: 14,
    marginBottom: 18,
    color: "rgba(226,232,240,0.88)",
    fontSize: 18,
    lineHeight: 1.5,
  } as React.CSSProperties,

  card: {
    background: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.card,
    boxShadow: theme.shadow.soft,
  } as React.CSSProperties,

  cardAlt: {
    background: theme.colors.cardAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: 14,
  } as React.CSSProperties,

  sectionTitle: {
    margin: "0 0 12px 2px",
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 800,
  } as React.CSSProperties,

  input: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    fontSize: 16,
    outline: "none",
    background: theme.colors.bgSoft,
    color: theme.colors.text,
  } as React.CSSProperties,

  primaryButton: {
    background: theme.colors.primary,
    color: theme.colors.white,
    border: "none",
    padding: "14px 16px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
    boxShadow: theme.shadow.glow,
  } as React.CSSProperties,

  secondaryButton: {
    background: "rgba(255,255,255,0.08)",
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    padding: "12px 16px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
  } as React.CSSProperties,

  whiteButton: {
    background: theme.colors.white,
    color: theme.colors.textDark,
    border: "none",
    padding: "12px 16px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
  } as React.CSSProperties,

  successButton: {
    background: theme.colors.success,
    color: theme.colors.white,
    border: "none",
    padding: "12px 16px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
  } as React.CSSProperties,

  dangerButton: {
    background: theme.colors.dangerBg,
    color: "#fecaca",
    border: `1px solid rgba(248,113,113,0.18)`,
    padding: "12px 16px",
    borderRadius: theme.radius.md,
    fontWeight: 700,
  } as React.CSSProperties,

  metricBox: {
    background: theme.colors.bgSoft,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: 12,
  } as React.CSSProperties,

  metricLabel: {
    fontSize: 13,
    color: theme.colors.textSoft,
    marginBottom: 6,
  } as React.CSSProperties,

  metricValue: {
    fontSize: 24,
    fontWeight: 800,
    color: theme.colors.text,
  } as React.CSSProperties,
};