const DATE_PATTERNS = {
    ymd: "YYYY-MM-DD",
    dmy: "DD-MM-YYYY",
    mdy: "MM-DD-YYYY",
};
const TIME_PATTERN = "HH:MM";
export function getPattern(widget, payload) {
    if (widget === "date") {
        const mode = payload.mode ?? "date";
        const order = payload.order ?? "ymd";
        const datePat = DATE_PATTERNS[order];
        switch (mode) {
            case "date":
                return datePat;
            case "time":
                return TIME_PATTERN;
            case "datetime":
                return `${datePat} ${TIME_PATTERN}`;
            case "date-range":
                return `${datePat} — ${datePat}`;
            case "time-range":
                return `${TIME_PATTERN} — ${TIME_PATTERN}`;
        }
    }
    if (widget === "color") {
        const format = payload.format ?? "hex";
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
        return "HH:MM—HH:MM × 7 days";
    }
    return "";
}
