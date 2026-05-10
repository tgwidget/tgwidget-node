import type { DateMode, DateFormat, DateOrder, ColorFormat, DateResult, ColorResult, ScheduleDay } from "./types";
export declare function parseDate(value: string, opts?: {
    mode?: DateMode;
    format?: DateFormat;
    order?: DateOrder;
}): DateResult;
export declare function parseColor(value: string, opts?: {
    format?: ColorFormat;
}): ColorResult;
export declare function parseSchedule(value: string): ScheduleDay[];
