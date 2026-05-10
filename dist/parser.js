function stripCommand(value) {
    if (value.startsWith("/")) {
        const idx = value.indexOf(" ");
        if (idx !== -1)
            return value.slice(idx + 1);
    }
    return value;
}
function parseDateStr(value, order) {
    const parts = value.split("-");
    if (order === "ymd")
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
    if (order === "dmy")
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return `${parts[2]}-${parts[0]}-${parts[1]}`; // mdy
}
function dateFromYmd(ymdStr) {
    const [y, m, d] = ymdStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}
export function parseDate(value, opts = {}) {
    value = stripCommand(value);
    const { mode = "date", format = "default", order = "ymd" } = opts;
    const result = {};
    if (format === "unix-s" || format === "unix-ms") {
        const parts = value.split("_");
        const mul = format === "unix-s" ? 1000 : 1;
        const ts = parseInt(parts[0], 10);
        result.timestamp = ts;
        const dt = new Date(ts * mul);
        result.dateObj = dt;
        result.date = dt.toISOString().slice(0, 10);
        result.time = dt.toISOString().slice(11, 16);
        if (parts.length > 1) {
            const tsEnd = parseInt(parts[1], 10);
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
        case "datetime": {
            const [datePart, timePart] = value.split("_");
            const dateStr = parseDateStr(datePart, order);
            const [h, m] = timePart.split("-");
            result.date = dateStr;
            result.time = `${h}:${m}`;
            const d = dateFromYmd(dateStr);
            d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
            result.dateObj = d;
            break;
        }
        case "date-range": {
            const parts = value.split("_");
            const dateStr = parseDateStr(parts[0], order);
            const dateEndStr = parseDateStr(parts[1], order);
            result.date = dateStr;
            result.dateEnd = dateEndStr;
            result.dateObj = dateFromYmd(dateStr);
            result.dateEndObj = dateFromYmd(dateEndStr);
            break;
        }
        case "time-range": {
            const parts = value.split("_");
            const [h1, m1] = parts[0].split("-");
            const [h2, m2] = parts[1].split("-");
            result.time = `${h1}:${m1}`;
            result.timeEnd = `${h2}:${m2}`;
            break;
        }
    }
    return result;
}
export function parseColor(value, opts = {}) {
    value = stripCommand(value);
    const { format = "hex" } = opts;
    const result = { raw: value };
    if (format === "hex") {
        result.hex = `#${value}`;
    }
    else if (format === "rgb") {
        const parts = value.split("_").map(Number);
        result.rgb = [parts[0], parts[1], parts[2]];
    }
    else if (format === "hsl") {
        const parts = value.split("_").map(Number);
        result.hsl = [parts[0], parts[1], parts[2]];
    }
    return result;
}
export function parseSchedule(value) {
    value = stripCommand(value);
    if (value.length !== 56) {
        throw new Error(`Schedule bunch format must be 56 chars, got ${value.length}`);
    }
    const days = [];
    for (let i = 0; i < 7; i++) {
        const chunk = value.slice(i * 8, (i + 1) * 8);
        if (chunk === "00000000") {
            days.push({ enabled: false });
        }
        else {
            days.push({
                enabled: true,
                start: `${chunk.slice(0, 2)}:${chunk.slice(2, 4)}`,
                end: `${chunk.slice(4, 6)}:${chunk.slice(6, 8)}`,
            });
        }
    }
    return days;
}
