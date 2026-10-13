

class AxialThemeManager
{
    static getTheme()
    {
        if( !window.matchMedia ) { return "default"; }
        const theme = window.matchMedia( '(prefers-color-scheme: dark)' ).matches ? "dark" : "light";
    }
}