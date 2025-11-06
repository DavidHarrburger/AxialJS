"use strict";

class ColorUtils
{
    static #UI_COLORS = new Map([
        [ "success", { light: "#f7fff2", mid_light: "#c5ffa8", normal: "#82dd55", mid_dark: "#46b310", dark: "#236402" } ],
        [ "error",   { light: "#ffc8c8", mid_light: "#fa9292", normal: "#e23636", mid_dark: "#be1111", dark: "#800101" } ],
        [ "danger",  { light: "#fff3e7", mid_light: "#ffb277", normal: "#fe6e00", mid_dark: "#fe6e00", dark: "#b43c00" } ],
        [ "warning", { light: "#ffedcf", mid_light: "#ffd690", normal: "#edB95e", mid_dark: "#be882b", dark: "#5c3a00" } ],
        [ "info",    { light: "#dbecff", mid_light: "#8ac1ff", normal: "#4a90e2", mid_dark: "#1659a5", dark: "#04203f" } ]
    ]);

    static #MEDALS_COLORS = new Map([
        [ "bronze", { normal: "#ce8946", dark: "#2f1901" } ],
        [ "silver", { normal: "#d7d8d9", dark: "#414243" } ],
        [ "gold",   { normal: "#d4af37", dark: "#463a13" } ]
    ]);

    static get UI_COLORS()     { return ColorUtils.#UI_COLORS; }
    static get MEDALS_COLORS() { return ColorUtils.#MEDALS_COLORS; }

    static get GREEN()  { return ColorUtils.#UI_COLORS.get("success"); }
    static get BLUE()   { return ColorUtils.#UI_COLORS.get("info"); }
    static get YELLOW() { return ColorUtils.#UI_COLORS.get("warning"); }
    static get ORANGE() { return ColorUtils.#UI_COLORS.get("danger"); }
    static get RED()    { return ColorUtils.#UI_COLORS.get("error"); }

    static luminance( hex, lum )
    {
        
    }
}

export { ColorUtils }