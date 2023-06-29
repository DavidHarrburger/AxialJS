"use strict"

class LanguageUtils
{
    /**
     * @return { String } - the lower case 2 chars language string
     */
    static getNavigatorLanguage()
    {
        let finalLanguage = undefined;
        const splitter = "-";
        let currentLanguage = navigator.language;
        if( currentLanguage.indexOf(splitter) > 0 )
        {
            let languages = currentLanguage.split(splitter);
            finalLanguage = languages[0].toLowerCase();
        }
        else
        {
            finalLanguage = currentLanguage.toLowerCase();
        }
        return finalLanguage;
    }
}

export { LanguageUtils }