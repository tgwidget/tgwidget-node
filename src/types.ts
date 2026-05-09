export type DateMode = "date" | "time" | "datetime" | "date-range" | "time-range";
export type DateFormat = "default" | "unix-s" | "unix-ms";
export type DateOrder = "ymd" | "dmy" | "mdy";
export type ColorFormat = "hex" | "rgb" | "hsl";
export type ColorScheme = "light" | "dark" | "auto";

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
  dateEnd?: string;
  timeEnd?: string;
  timestamp?: number;
  timestampEnd?: number;
}

export interface ColorResult {
  raw: string;
  hex?: string;
  rgb?: [number, number, number];
  hsl?: [number, number, number];
}

export interface ScheduleDay {
  enabled: boolean;
  start?: string;
  end?: string;
}
