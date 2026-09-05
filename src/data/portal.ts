/**
 * Synthetic demo data for the client portal. Nothing here refers to a real
 * client, company or invoice.
 */
export const portalProject = {
  id: "PRJ-2041",
  name: "Aurora Launch Platform",
  client: "Demo Client AG",
  completion: 0.64,
  phase: "Build · Sprint 6 / 9",
  start: "2026-06-01",
  end: "2026-10-30",
};

export type MilestoneStatus = "done" | "active" | "planned";

export const milestones: { id: string; title: string; date: string; status: MilestoneStatus }[] = [
  { id: "m1", title: "Discovery & Strategy", date: "2026-06-12", status: "done" },
  { id: "m2", title: "Design System", date: "2026-07-03", status: "done" },
  { id: "m3", title: "3D Hero & Motion", date: "2026-08-07", status: "done" },
  { id: "m4", title: "Commerce & Checkout", date: "2026-09-11", status: "active" },
  { id: "m5", title: "Localisation (5 languages)", date: "2026-09-25", status: "planned" },
  { id: "m6", title: "QA & Launch", date: "2026-10-30", status: "planned" },
];

export const tasks: { id: string; title: string; owner: string; status: MilestoneStatus; estimate: string }[] = [
  { id: "t1", title: "Cart drawer spatial transition", owner: "MK", status: "done", estimate: "6h" },
  { id: "t2", title: "Server-side price validation", owner: "MK", status: "done", estimate: "3h" },
  { id: "t3", title: "Stripe test-mode adapter", owner: "MK", status: "active", estimate: "5h" },
  { id: "t4", title: "Order confirmation e-mail template", owner: "MK", status: "active", estimate: "2h" },
  { id: "t5", title: "Wishlist persistence", owner: "MK", status: "planned", estimate: "2h" },
  { id: "t6", title: "Checkout accessibility audit", owner: "MK", status: "planned", estimate: "4h" },
];

export const messages: { id: string; from: string; initials: string; time: string; body: string; own?: boolean }[] = [
  { id: "c1", from: "Demo Client", initials: "DC", time: "09:12", body: "The cart transition feels great. Could the drawer be a touch slower on mobile?" },
  { id: "c2", from: "Michael Kalachin", initials: "MK", time: "09:30", body: "Yes – I'll scale the duration with viewport width and reduce spring stiffness under 768px.", own: true },
  { id: "c3", from: "Demo Client", initials: "DC", time: "10:02", body: "Perfect. Also: the French copy for checkout is approved." },
];

export const files: { id: string; name: string; size: string; type: string; date: string }[] = [
  { id: "f1", name: "design-system-v3.fig", size: "48 MB", type: "Figma", date: "2026-07-01" },
  { id: "f2", name: "motion-spec.pdf", size: "2.1 MB", type: "PDF", date: "2026-07-18" },
  { id: "f3", name: "hero-name-chrome.glb", size: "6.4 MB", type: "GLB", date: "2026-08-02" },
  { id: "f4", name: "checkout-flow-v2.pdf", size: "1.3 MB", type: "PDF", date: "2026-09-04" },
];

export type InvoiceStatus = "paid" | "open" | "draft";

export const invoices: { id: string; label: string; amount: number; status: InvoiceStatus; date: string }[] = [
  { id: "INV-1041", label: "Phase 1 · Discovery & Design", amount: 12500, status: "paid", date: "2026-07-05" },
  { id: "INV-1057", label: "Phase 2 · 3D & Motion", amount: 18000, status: "paid", date: "2026-08-09" },
  { id: "INV-1072", label: "Phase 3 · Commerce", amount: 16500, status: "open", date: "2026-09-12" },
  { id: "INV-1088", label: "Phase 4 · Localisation & QA", amount: 9500, status: "draft", date: "2026-10-30" },
];

export const meetings: { id: string; title: string; date: string; time: string; duration: string }[] = [
  { id: "mt1", title: "Sprint Review 6", date: "2026-09-09", time: "14:00", duration: "45 min" },
  { id: "mt2", title: "Localisation Kick-off", date: "2026-09-16", time: "10:00", duration: "30 min" },
];

export const activity: { id: string; time: string; body: string }[] = [
  { id: "a1", time: "Today · 08:41", body: "Deployment preview · commerce-checkout-v2" },
  { id: "a2", time: "Yesterday · 17:20", body: "Milestone 'Commerce & Checkout' moved to active" },
  { id: "a3", time: "Yesterday · 11:05", body: "File uploaded · checkout-flow-v2.pdf" },
  { id: "a4", time: "Sep 3 · 15:48", body: "Invoice INV-1072 issued" },
];

/** Weekly analytics series – synthetic. */
export const analytics = {
  visitors: [420, 610, 580, 740, 920, 880, 1140, 1320, 1210, 1480, 1620, 1590],
  lcp: [1.9, 1.7, 1.6, 1.5, 1.4, 1.3, 1.3, 1.2, 1.2, 1.1, 1.1, 1.0],
  fps: 118,
  uptime: 99.98,
};
