"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxiaNavigationHelper extends AxialComponentBase
{
    /** @type { Array.<HTMLAnchorElement> } */
    #items = new Array();

    /** @type { Array } */
    #itemsFound = new Array();
    

    constructor()
    {
        super();
        this.classList.add("axial_navigation_helper");
    }

    connectedCallback()
    {
        super.connectedCallback();
    }

    _updateItems()
    {
        // TODO clean itemsFound Elements
        this.#items = this.getElementsByTagName("a");
        for( const item of this.#items )
        {
            if( item.href === window.location.href )
            {
                const navigationEvent = new CustomEvent("navigationItemFound", { detail: { item: item } } );
                this.dispatchEvent(navigationEvent);
            }
        }
    }
}
window.customElements.define("axial-navigation-helper", AxiaNavigationHelper);
export { AxiaNavigationHelper }