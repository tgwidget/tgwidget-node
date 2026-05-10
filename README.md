# tgwidget

Node.js SDK for [TeleWidget](https://tgwidget.github.io/) — beautiful Telegram Mini App widgets for bots.

## Install

```bash
npm install tgwidget
```

## Usage

### Generate widget URL

```typescript
import { tgwidget } from "tgwidget";

// Date picker
const url = tgwidget("your_bot").date({ mode: "datetime", format: "unix-s" }).url();

// Color picker
const url = tgwidget("your_bot").color({ format: "hex" }).url();

// Schedule
const url = tgwidget("your_bot").schedule().url();

// With styling
const url = tgwidget("your_bot")
  .date({ mode: "date" })
  .style({ colorScheme: "dark", accent: "#FF6600", adoptTgPalette: true })
  .url();
```

### Parse results

When a user completes the widget, the result comes back via deep link `t.me/your_bot?start=VALUE`. Parse the value:

```typescript
import { parseDate, parseColor, parseSchedule } from "tgwidget";

// Date result — includes native Date object
const result = parseDate("2025-03-15", { mode: "date" });
// result.date === '2025-03-15'
// result.dateObj === Date(2025, 2, 15)

// Datetime — native Date with time set
const result = parseDate("2025-03-15_14-30", { mode: "datetime" });
// result.dateObj — Date object with date and time

// Unix timestamp
const result = parseDate("1710460800_1718236800", { mode: "date-range", format: "unix-s" });
// result.dateObj, result.dateEndObj — native Date objects
// result.timestamp === 1710460800

// Color
const result = parseColor("FF6600", { format: "hex" });
// { raw: 'FF6600', hex: '#FF6600' }

// Schedule (56-char bunch format)
const result = parseSchedule("09001800090018000000000009001800090018000000000000000000");
// [{ enabled: true, start: '09:00', end: '18:00' }, ...]
```

All parsers automatically handle Telegram bot command prefixes — you can pass raw `/start payload` strings directly:

```typescript
const result = parseDate("/start 2025-03-15", { mode: "date" });
// result.dateObj — Date(2025, 2, 15)

const result = parseColor("/start FF6600", { format: "hex" });
// result.hex === '#FF6600'
```

### Widget-level parsing with `parse()`

If you keep a reference to the widget builder, you can call `.parse()` directly — it automatically uses the configured widget type and options. The return type is inferred from the widget type:

```typescript
const widget = tgwidget("your_bot").date({ mode: "datetime" });
const url = widget.url();

// Later, when the user completes the widget:
const result = widget.parse("/start 2025-03-15_14-30");
// result is DateResult (type-safe!)
// result.dateObj — native Date object
```

## API

### `tgwidget(botUsername)`

Create a widget builder. Returns a chainable `TgWidget` instance.

- `.date({ mode?, format?, order? })` — Date/time picker → `TgWidget<"date">`
- `.color({ format? })` — Color picker → `TgWidget<"color">`
- `.schedule()` — Weekly schedule → `TgWidget<"schedule">`
- `.style({ colorScheme?, accent?, tint?, liquidGlass?, adaptTgTheme?, adoptTgPalette? })` — Styling
- `.url(baseUrl?)` — Generate the final URL
- `.payload()` — Get the raw payload object
- `.parse(value)` — Parse a widget result string (return type matches widget type)

### Parsers

- `parseDate(value, { mode?, format?, order? })` → `DateResult`
- `parseColor(value, { format? })` → `ColorResult`
- `parseSchedule(value)` → `ScheduleDay[]`

### Result types

#### `DateResult`
- `date`, `time`, `dateEnd`, `timeEnd` — string representations
- `timestamp`, `timestampEnd` — raw integer timestamps (unix modes)
- `dateObj`, `dateEndObj` — native `Date` objects

#### `ColorResult`
- `raw` — original value string
- `hex` — e.g. `'#FF6600'`
- `rgb` — e.g. `[255, 102, 0]`
- `hsl` — e.g. `[24, 100, 50]`

#### `ScheduleDay`
- `enabled` — whether the day is active
- `start`, `end` — time strings e.g. `'09:00'`
