"use strict"

const REG_SPE_CHAR_A = new RegExp("[áàâä]",     "gi");
const REG_SPE_CHAR_C = new RegExp("[ç]",        "gi");
const REG_SPE_CHAR_E = new RegExp("[èéêë]",     "gi");
const REG_SPE_CHAR_I = new RegExp("[ìíîï]",     "gi");
const REG_SPE_CHAR_O = new RegExp("[òóôõöø]",   "gi");
const REG_SPE_CHAR_U = new RegExp("[ùúûü]",     "gi");
const REG_SPE_CHAR_Y = new RegExp("[ÿ]",        "gi");

class SearchUtils
{
    static removeSpecialChar( s )
    {
        if( typeof s !== "string" )
        {
            throw new TypeError("String value expected");
        }
        let cleanString = s.toLowerCase();

        cleanString = cleanString.replace( REG_SPE_CHAR_A, "a" );
        cleanString = cleanString.replace( REG_SPE_CHAR_C, "c" );
        cleanString = cleanString.replace( REG_SPE_CHAR_E, "e" );
        cleanString = cleanString.replace( REG_SPE_CHAR_I, "i" );
        cleanString = cleanString.replace( REG_SPE_CHAR_O, "o" );
        cleanString = cleanString.replace( REG_SPE_CHAR_U, "u" );
        cleanString = cleanString.replace( REG_SPE_CHAR_Y, "y" );

        return cleanString;
    }

    static find( stringToSearch, patternToFind )
    {
        if( typeof stringToSearch !== "string" && patternToFind !== "string" )
        {
            throw new TypeError("Strings values expected");
        }

        let s = SearchUtils.removeSpecialChar( stringToSearch );
        let p = SearchUtils.removeSpecialChar( patternToFind );
        let i = s.search( p );

        return (i >= 0);
    }
}

export { SearchUtils }