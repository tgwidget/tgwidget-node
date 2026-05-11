import type { DateMode, DateFormat, DateOrder, ColorFormat, ColorScheme, WidgetType, ParseResult } from "./types";
import { parseDate, parseColor, parseSchedule } from "./parser";
import { getPattern } from "./pattern";

const BASE_URL = "https://tgwidget.github.io/";
const HEX_RE = /^#?[0-9A-Fa-f]{6}$/;

const VALID_DATE_MODES = new Set(["date", "time", "time-seconds", "datetime", "date-range", "time-range"]);
const VALID_DATE_FORMATS = new Set(["default", "unix-s", "unix-ms"]);
const VALID_DATE_ORDERS = new Set(["ymd", "dmy", "mdy"]);
const VALID_COLOR_FORMATS = new Set(["hex", "rgb", "hsl"]);
const VALID_COLOR_SCHEMES = new Set(["light", "dark", "auto"]);

function validateHex(color: string, name: string): string {
  if (!HEX_RE.test(color)) {
    throw new Error(`${name} must be a valid hex color (e.g. '#FF0000'), got '${color}'`);
  }
  return color.startsWith("#") ? color : `#${color}`;
}

function toBase64(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return btoa(str);
}

export class TgWidget<T extends WidgetType | null = null> {
  private _botUsername: string;
  private _widget: WidgetType | null = null;
  private _payload: Record<string, unknown> = {};
  private _style: Record<string, unknown> = {};

  constructor(botUsername: string) {
    if (!botUsername) throw new Error("botUsername is required");
    this._botUsername = botUsername;
  }

  date(opts: { mode?: DateMode; format?: DateFormat; order?: DateOrder } = {}): TgWidget<"date"> {
    const { mode = "date", format = "default", order = "ymd" } = opts;
    if (!VALID_DATE_MODES.has(mode)) throw new Error(`Invalid date mode '${mode}'`);
    if (!VALID_DATE_FORMATS.has(format)) throw new Error(`Invalid date format '${format}'`);
    if (!VALID_DATE_ORDERS.has(order)) throw new Error(`Invalid date order '${order}'`);
    this._widget = "date";
    this._payload = { mode, format, order };
    return this as unknown as TgWidget<"date">;
  }

  color(opts: { format?: ColorFormat } = {}): TgWidget<"color"> {
    const { format = "hex" } = opts;
    if (!VALID_COLOR_FORMATS.has(format)) throw new Error(`Invalid color format '${format}'`);
    this._widget = "color";
    this._payload = { format };
    return this as unknown as TgWidget<"color">;
  }

  schedule(): TgWidget<"schedule"> {
    this._widget = "schedule";
    this._payload = { format: "bunch" };
    return this as unknown as TgWidget<"schedule">;
  }

  style(opts: {
    colorScheme?: ColorScheme;
    accent?: string;
    tint?: string;
    liquidGlass?: boolean;
    adaptTgTheme?: boolean;
    adoptTgPalette?: boolean;
  } = {}): this {
    const { colorScheme = "light", accent, tint, liquidGlass = false, adaptTgTheme = false, adoptTgPalette = false } = opts;
    if (!VALID_COLOR_SCHEMES.has(colorScheme)) throw new Error(`Invalid colorScheme '${colorScheme}'`);
    this._style = { colorScheme, liquidGlass, adaptTgTheme, adoptTgPalette };
    if (accent) this._style.accent = validateHex(accent, "accent");
    if (tint) this._style.tint = validateHex(tint, "tint");
    return this;
  }

  private _buildPayload(): Record<string, unknown> {
    if (!this._widget) throw new Error("No widget type set. Call .date(), .color(), or .schedule() first.");
    const payload: Record<string, unknown> = {
      widget: this._widget,
      bot_username: this._botUsername,
      ...this._payload,
    };
    if (Object.keys(this._style).length > 0) {
      payload.style = this._style;
    }
    return payload;
  }

  url(baseUrl: string = BASE_URL): string {
    const payload = this._buildPayload();
    const encoded = toBase64(JSON.stringify(payload));
    return `${baseUrl}?p=${encoded}`;
  }

  payload(): Record<string, unknown> {
    return this._buildPayload();
  }

  get pattern(): string {
    if (!this._widget) throw new Error("No widget type set. Call .date(), .color(), or .schedule() first.");
    return getPattern(this._widget, this._payload);
  }

  parse(value: string): ParseResult<T> {
    if (this._widget === "date") {
      return parseDate(value, this._payload as { mode?: DateMode; format?: DateFormat; order?: DateOrder }) as ParseResult<T>;
    }
    if (this._widget === "color") {
      return parseColor(value, this._payload as { format?: ColorFormat }) as ParseResult<T>;
    }
    if (this._widget === "schedule") {
      return parseSchedule(value) as ParseResult<T>;
    }
    throw new Error("No widget type set. Call .date(), .color(), or .schedule() first.");
  }
}

export function tgwidget(botUsername: string): TgWidget {
  return new TgWidget(botUsername);
}
