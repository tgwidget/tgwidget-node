export type DateMode = "date" | "time" | "datetime" | "date-range" | "time-range";
export type DateFormat = "default" | "unix-s" | "unix-ms";
export type DateOrder = "ymd" | "dmy" | "mdy";
export type ColorFormat = "hex" | "rgb" | "hsl";
export type ColorScheme = "light" | "dark" | "auto";
export type WidgetType = "date" | "color" | "schedule";
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
    dateObj?: Date;
    dateEndObj?: Date;
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
export type ParseResult<T extends WidgetType | null> = T extends "date" ? DateResult : T extends "color" ? ColorResult : T extends "schedule" ? ScheduleDay[] : DateResult | ColorResult | ScheduleDay[];
