export type BookingServiceId = "discovery" | "strategy" | "review";

export type BookingService = {
  id: BookingServiceId;
  minutes: number;
  index: string;
};

export const bookingServices: BookingService[] = [
  { id: "discovery", minutes: 30, index: "01" },
  { id: "strategy", minutes: 60, index: "02" },
  { id: "review", minutes: 45, index: "03" },
];

export const bookingTimezone = "Europe/Zurich";

export const budgetOptions = ["unsure", "s", "m", "l", "xl"] as const;
export type BudgetOption = (typeof budgetOptions)[number];

export const projectTypes = ["corporate", "luxury", "ecommerce", "portfolio", "launch", "saas", "experience", "custom"] as const;
export type ProjectType = (typeof projectTypes)[number];
