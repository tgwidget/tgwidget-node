import type { WidgetType, DateMode, DateOrder } from "./types";

const DATE_PATTERNS: Record<DateOrder, string> = {
  ymd: "YYYY-MM-DD",
  dmy: "DD-MM-YYYY",
  mdy: "MM-DD-YYYY",
};

const TIME_PATTERN = "HH-MM";
const TIME_SEC_PATTERN = "HH-MM-SS";

export function getPattern(widget: WidgetType, payload: Record<string, unknown>): string {
  if (widget === "date") {
    const mode = (payload.mode as DateMode) ?? "date";
    const order = (payload.order as DateOrder) ?? "ymd";
    const datePat = DATE_PATTERNS[order];

    switch (mode) {
      case "date":
        return datePat;
      case "time":
        return TIME_PATTERN;
      case "time-seconds":
        return TIME_SEC_PATTERN;
      case "datetime":
        return `${datePat}_${TIME_PATTERN}`;
      case "date-range":
        return `${datePat}_${datePat}`;
      case "time-range":
        return `${TIME_PATTERN}_${TIME_PATTERN}`;
    }
  }

  if (widget === "color") {
    const format = (payload.format as string) ?? "hex";
    switch (format) {
      case "hex":
        return "#RRGGBB";
      case "rgb":
        return "R, G, B";
      case "hsl":
        return "H, S, L";
    }
  }

  if (widget === "schedule") {
    const fmt = (payload.format as string) ?? "range";
    if (fmt === "single") return "HH:MM × 7 days";
    return "HH:MM—HH:MM × 7 days";
  }

  return "";
}
