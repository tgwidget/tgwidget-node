export type DateMode = "date" | "time" | "time-seconds" | "datetime" | "date-range" | "time-range";
export type DateFormat = "default" | "unix-s" | "unix-ms";
export type DateOrder = "ymd" | "dmy" | "mdy";
export type ColorFormat = "hex" | "rgb" | "hsl";
export type ColorScheme = "light" | "dark" | "auto";
export type ScheduleFormat = "range" | "single";

export type WidgetType = "date" | "color" | "schedule";

export interface DateOpts {
  mode?: DateMode;
  format?: DateFormat;
  order?: DateOrder;
  autoNow?: boolean;
  default?: string;
  min?: string;
  max?: string;
}

export interface WidgetStyle {
  colorScheme?: ColorScheme;
  accent?: string;
  tint?: string;
  liquidGlass?: boolean;
  adaptTgTheme?: boolean;
  adoptTgPalette?: boolean;
}

export interface DateResult {
  date?: string;
  time?: string;
  seconds?: number;
  dateEnd?: string;
  timeEnd?: string;
  timestamp?: number;
  timestampEnd?: number;
  dateObj?: Date;
  dateEndObj?: Date;
}

export interface ColorResult {
  raw: string;
  hex?: string;
  rgb?: [number, number, number];
  hsl?: [number, number, number];
}

export interface ScheduleOpts {
  format?: ScheduleFormat;
}

export interface ScheduleDay {
  enabled: boolean;
  start?: string;
  end?: string;
  time?: string;
}

export type ParseResult<T extends WidgetType | null> =
  T extends "date" ? DateResult :
  T extends "color" ? ColorResult :
  T extends "schedule" ? ScheduleDay[] :
  DateResult | ColorResult | ScheduleDay[];

export const SCHEDULE_RANGE_LENGTH = 56;
export const SCHEDULE_SINGLE_LENGTH = 28;
export const SCHEDULE_SINGLE_DISABLED = "9999";
