"use strict";

class AxialThemeManager
{
    static getSystemTheme()
    {
        if( !window.matchMedia ) { return "light"; }
        return window.matchMedia( '(prefers-color-scheme: dark)' ).matches ? "dark" : "light";
    }

    static getTheme()
    {
        return localStorage.getItem("axial_local_theme") ?? AxialThemeManager.getSystemTheme();
    }

    static setTheme( theme )
    {
        if( theme === "dark" || theme === "light" )
        {
            localStorage.setItem("axial_local_theme", theme);
            document.documentElement.dataset.theme = theme;
        }
    }

    static restoreTheme()
    {
        const theme = localStorage.getItem("axial_local_theme");
        if( theme ) { AxialThemeManager.setTheme( theme ); return; }
        
        const systemTheme = AxialThemeManager.getSystemTheme();
        AxialThemeManager.setTheme( systemTheme );
    }

    static toggleTheme()
    {
        const current = document.documentElement.dataset.theme;
        const newTheme = current === "light" ? "dark" : "light";
        AxialThemeManager.setTheme( newTheme );
        return newTheme;
    }
}

export { AxialThemeManager }