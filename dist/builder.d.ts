import type { DateMode, DateFormat, DateOrder, ColorFormat, ColorScheme, WidgetType, ParseResult } from "./types";
export declare class TgWidget<T extends WidgetType | null = null> {
    private _botUsername;
    private _widget;
    private _payload;
    private _style;
    constructor(botUsername: string);
    date(opts?: {
        mode?: DateMode;
        format?: DateFormat;
        order?: DateOrder;
    }): TgWidget<"date">;
    color(opts?: {
        format?: ColorFormat;
    }): TgWidget<"color">;
    schedule(): TgWidget<"schedule">;
    style(opts?: {
        colorScheme?: ColorScheme;
        accent?: string;
        tint?: string;
        liquidGlass?: boolean;
        adaptTgTheme?: boolean;
        adoptTgPalette?: boolean;
    }): this;
    private _buildPayload;
    url(baseUrl?: string): string;
    payload(): Record<string, unknown>;
    get pattern(): string;
    parse(value: string): ParseResult<T>;
}
export declare function tgwidget(botUsername: string): TgWidget;
