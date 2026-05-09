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

// Date result
const result = parseDate("2025-03-15", { mode: "date" });
// { date: '2025-03-15' }

// Unix timestamp
const result = parseDate("1710460800_1718236800", { mode: "date-range", format: "unix-s" });
// { timestamp: 1710460800, timestampEnd: 1718236800, date: '2025-03-15', ... }

// Color
const result = parseColor("FF6600", { format: "hex" });
// { raw: 'FF6600', hex: '#FF6600' }

// Schedule (56-char bunch format)
const result = parseSchedule("09001800090018000000000009001800090018000000000000000000");
// [{ enabled: true, start: '09:00', end: '18:00' }, ...]
```

## API

### `tgwidget(botUsername)`

Create a widget builder. Returns a chainable `TgWidget` instance.

- `.date({ mode?, format?, order? })` — Date/time picker
- `.color({ format? })` — Color picker
- `.schedule()` — Weekly schedule
- `.style({ colorScheme?, accent?, tint?, liquidGlass?, adaptTgTheme?, adoptTgPalette? })` — Styling
- `.url(baseUrl?)` — Generate the final URL
- `.payload()` — Get the raw payload object

### Parsers

- `parseDate(value, { mode?, format?, order? })` → `DateResult`
- `parseColor(value, { format? })` → `ColorResult`
- `parseSchedule(value)` → `ScheduleDay[]`
