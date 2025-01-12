"use strict";

class AxialDropdownManager
{
    static #DROPDOWNS = new Set();
    static get DROPDOWNS() { return AxialDropdownManager.#DROPDOWNS; }

    static documentDropdownClickHandler( event )
    {
        for( const dropdown of AxialDropdownManager.#DROPDOWNS )
        {
            dropdown.close();
        }
    }
}
export { AxialDropdownManager }