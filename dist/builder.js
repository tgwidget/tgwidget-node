import { parseDate, parseColor, parseSchedule } from "./parser";
import { getPattern } from "./pattern";
const BASE_URL = "https://tgwidget.github.io/";
const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;
const VALID_DATE_MODES = new Set(["date", "time", "datetime", "date-range", "time-range"]);
const VALID_DATE_FORMATS = new Set(["default", "unix-s", "unix-ms"]);
const VALID_DATE_ORDERS = new Set(["ymd", "dmy", "mdy"]);
const VALID_COLOR_FORMATS = new Set(["hex", "rgb", "hsl"]);
const VALID_COLOR_SCHEMES = new Set(["light", "dark", "auto"]);
function validateHex(color, name) {
    if (!HEX_RE.test(color)) {
        throw new Error(`${name} must be a valid hex color (e.g. '#FF0000'), got '${color}'`);
    }
    return color.startsWith("#") ? color : `#${color}`;
}
function toBase64(str) {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(str).toString("base64");
    }
    return btoa(str);
}
export class TgWidget {
    constructor(botUsername) {
        this._widget = null;
        this._payload = {};
        this._style = {};
        if (!botUsername)
            throw new Error("botUsername is required");
        this._botUsername = botUsername;
    }
    date(opts = {}) {
        const { mode = "date", format = "default", order = "ymd" } = opts;
        if (!VALID_DATE_MODES.has(mode))
            throw new Error(`Invalid date mode '${mode}'`);
        if (!VALID_DATE_FORMATS.has(format))
            throw new Error(`Invalid date format '${format}'`);
        if (!VALID_DATE_ORDERS.has(order))
            throw new Error(`Invalid date order '${order}'`);
        this._widget = "date";
        this._payload = { mode, format, order };
        return this;
    }
    color(opts = {}) {
        const { format = "hex" } = opts;
        if (!VALID_COLOR_FORMATS.has(format))
            throw new Error(`Invalid color format '${format}'`);
        this._widget = "color";
        this._payload = { format };
        return this;
    }
    schedule() {
        this._widget = "schedule";
        this._payload = { format: "bunch" };
        return this;
    }
    style(opts = {}) {
        const { colorScheme = "light", accent, tint, liquidGlass = false, adaptTgTheme = false, adoptTgPalette = false } = opts;
        if (!VALID_COLOR_SCHEMES.has(colorScheme))
            throw new Error(`Invalid colorScheme '${colorScheme}'`);
        this._style = { colorScheme, liquidGlass, adaptTgTheme, adoptTgPalette };
        if (accent)
            this._style.accent = validateHex(accent, "accent");
        if (tint)
            this._style.tint = validateHex(tint, "tint");
        return this;
    }
    _buildPayload() {
        if (!this._widget)
            throw new Error("No widget type set. Call .date(), .color(), or .schedule() first.");
        const payload = {
            widget: this._widget,
            bot_username: this._botUsername,
            ...this._payload,
        };
        if (Object.keys(this._style).length > 0) {
            payload.style = this._style;
        }
        return payload;
    }
    url(baseUrl = BASE_URL) {
        const payload = this._buildPayload();
        const encoded = toBase64(JSON.stringify(payload));
        return `${baseUrl}?p=${encoded}`;
    }
    payload() {
        return this._buildPayload();
    }
    get pattern() {
        if (!this._widget)
            throw new Error("No widget type set. Call .date(), .color(), or .schedule() first.");
        return getPattern(this._widget, this._payload);
    }
    parse(value) {
        if (this._widget === "date") {
            return parseDate(value, this._payload);
        }
        if (this._widget === "color") {
            return parseColor(value, this._payload);
        }
        if (this._widget === "schedule") {
            return parseSchedule(value);
        }
        throw new Error("No widget type set. Call .date(), .color(), or .schedule() first.");
    }
}
export function tgwidget(botUsername) {
    return new TgWidget(botUsername);
}
