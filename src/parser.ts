import type { DateMode, DateFormat, DateOrder, DateOpts, ColorFormat, DateResult, ColorResult, ScheduleDay, ScheduleOpts, ScheduleFormat } from "./types";
import { SCHEDULE_RANGE_LENGTH, SCHEDULE_SINGLE_LENGTH, SCHEDULE_SINGLE_DISABLED } from "./types";

function stripCommand(value: string): string {
  if (value.startsWith("/")) {
    const idx = value.indexOf(" ");
    if (idx !== -1) return value.slice(idx + 1);
  }
  return value;
}

function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(/[-:]/).map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  return h * 3600 + m * 60 + s;
}

function validateRange(value: string, mode: DateMode, min?: string, max?: string): void {
  if (!min && !max) return;

  if (mode === "time" || mode === "time-seconds") {
    const sec = timeToSeconds(value);
    if (min !== undefined && sec < timeToSeconds(min)) {
      throw new RangeError(`Value ${value} is below minimum ${min}`);
    }
    if (max !== undefined && sec > timeToSeconds(max)) {
      throw new RangeError(`Value ${value} is above maximum ${max}`);
    }
  } else if (mode === "date" || mode === "datetime") {
    const normalized = value.replace(/_(\d{2})-(\d{2})$/, "T$1:$2").replace(/-/g, (m, offset, str) => {
      const before = str.slice(0, offset);
      const dashCount = (before.match(/-/g) || []).length;
      return dashCount < 2 ? "-" : m;
    });
    const ts = new Date(normalized).getTime();
    if (min !== undefined) {
      const minNorm = min.replace(/_(\d{2})-(\d{2})$/, "T$1:$2");
      if (ts < new Date(minNorm).getTime()) throw new RangeError(`Value ${value} is below minimum ${min}`);
    }
    if (max !== undefined) {
      const maxNorm = max.replace(/_(\d{2})-(\d{2})$/, "T$1:$2");
      if (ts > new Date(maxNorm).getTime()) throw new RangeError(`Value ${value} is above maximum ${max}`);
    }
  }
}

function parseDateStr(value: string, order: DateOrder): string {
  const parts = value.split("-");
  if (order === "ymd") return `${parts[0]}-${parts[1]}-${parts[2]}`;
  if (order === "dmy") return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return `${parts[2]}-${parts[0]}-${parts[1]}`; // mdy
}

function dateFromYmd(ymdStr: string): Date {
  const [y, m, d] = ymdStr.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function parseDate(
  value: string,
  opts: DateOpts = {},
): DateResult {
  value = stripCommand(value);
  const { mode = "date", format = "default", order = "ymd", min, max } = opts;
  const result: DateResult = {};

  validateRange(value, mode, min, max);

  if (format === "unix-s" || format === "unix-ms") {
    const parts = value.split("_");
    const mul = format === "unix-s" ? 1000 : 1;
    const ts = parseInt(parts[0]!, 10);
    result.timestamp = ts;
    const dt = new Date(ts * mul);
    result.dateObj = dt;
    result.date = dt.toISOString().slice(0, 10);
    result.time = dt.toISOString().slice(11, 16);
    if (parts.length > 1) {
      const tsEnd = parseInt(parts[1]!, 10);
      result.timestampEnd = tsEnd;
      const dtEnd = new Date(tsEnd * mul);
      result.dateEndObj = dtEnd;
      result.dateEnd = dtEnd.toISOString().slice(0, 10);
      result.timeEnd = dtEnd.toISOString().slice(11, 16);
    }
    return result;
  }

  switch (mode) {
    case "date": {
      const dateStr = parseDateStr(value, order);
      result.date = dateStr;
      result.dateObj = dateFromYmd(dateStr);
      break;
    }
    case "time": {
      const [h, m] = value.split("-");
      result.time = `${h}:${m}`;
      break;
    }
    case "time-seconds": {
      const [h, m, s] = value.split("-");
      result.time = `${h}:${m}:${s}`;
      result.seconds = parseInt(s!, 10);
      break;
    }
    case "datetime": {
      const [datePart, timePart] = value.split("_");
      const dateStr = parseDateStr(datePart!, order);
      const [h, m] = timePart!.split("-");
      result.date = dateStr;
      result.time = `${h}:${m}`;
      const d = dateFromYmd(dateStr);
      d.setHours(parseInt(h!, 10), parseInt(m!, 10), 0, 0);
      result.dateObj = d;
      break;
    }
    case "date-range": {
      const parts = value.split("_");
      const dateStr = parseDateStr(parts[0]!, order);
      const dateEndStr = parseDateStr(parts[1]!, order);
      result.date = dateStr;
      result.dateEnd = dateEndStr;
      result.dateObj = dateFromYmd(dateStr);
      result.dateEndObj = dateFromYmd(dateEndStr);
      break;
    }
    case "time-range": {
      const parts = value.split("_");
      const [h1, m1] = parts[0]!.split("-");
      const [h2, m2] = parts[1]!.split("-");
      result.time = `${h1}:${m1}`;
      result.timeEnd = `${h2}:${m2}`;
      break;
    }
  }

  return result;
}

export function parseColor(value: string, opts: { format?: ColorFormat } = {}): ColorResult {
  value = stripCommand(value);
  const { format = "hex" } = opts;
  const result: ColorResult = { raw: value };
  if (format === "hex") {
    result.hex = `#${value}`;
  } else if (format === "rgb") {
    const parts = value.split("_").map(Number);
    result.rgb = [parts[0]!, parts[1]!, parts[2]!];
  } else if (format === "hsl") {
    const parts = value.split("_").map(Number);
    result.hsl = [parts[0]!, parts[1]!, parts[2]!];
  }
  return result;
}

function detectScheduleFormat(value: string, opts: ScheduleOpts): ScheduleFormat {
  if (opts.format) return opts.format;
  if (value.length === SCHEDULE_SINGLE_LENGTH) return "single";
  return "range";
}

function parseRangeSchedule(value: string): ScheduleDay[] {
  if (value.length !== SCHEDULE_RANGE_LENGTH) {
    throw new Error(`Schedule range format must be ${SCHEDULE_RANGE_LENGTH} chars, got ${value.length}`);
  }
  const days: ScheduleDay[] = [];
  for (let i = 0; i < 7; i++) {
    const chunk = value.slice(i * 8, (i + 1) * 8);
    if (chunk === "00000000") {
      days.push({ enabled: false });
    } else {
      days.push({
        enabled: true,
        start: `${chunk.slice(0, 2)}:${chunk.slice(2, 4)}`,
        end: `${chunk.slice(4, 6)}:${chunk.slice(6, 8)}`,
      });
    }
  }
  return days;
}

function parseSingleSchedule(value: string): ScheduleDay[] {
  if (value.length !== SCHEDULE_SINGLE_LENGTH) {
    throw new Error(`Schedule single format must be ${SCHEDULE_SINGLE_LENGTH} chars, got ${value.length}`);
  }
  const days: ScheduleDay[] = [];
  for (let i = 0; i < 7; i++) {
    const chunk = value.slice(i * 4, (i + 1) * 4);
    if (chunk === SCHEDULE_SINGLE_DISABLED) {
      days.push({ enabled: false });
    } else {
      days.push({
        enabled: true,
        time: `${chunk.slice(0, 2)}:${chunk.slice(2, 4)}`,
      });
    }
  }
  return days;
}

export function parseSchedule(value: string, opts: ScheduleOpts = {}): ScheduleDay[] {
  value = stripCommand(value);
  const format = detectScheduleFormat(value, opts);
  return format === "single" ? parseSingleSchedule(value) : parseRangeSchedule(value);
}
