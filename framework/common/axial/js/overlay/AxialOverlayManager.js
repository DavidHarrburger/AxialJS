"use strict";

import { AxialOverlayBase } from "./AxialOverlayBase.js";

class AxialOverlayManager
{
    /** @type { String } */
    static #OVERLAY_OBFUSCATOR_ID = "axialOverlayObfuscator";
    
    /** @type { Set.<AxialOverlayBase> } */
    static #OVERLAYS = new Set();
    
    /**
     * @type { Set.<AxialOverlayBase> }
     * @readonly
     */
    static get OVERLAYS() { return AxialOverlayManager.#OVERLAYS; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    static get LAYER() { return document.getElementById("axialOverlayLayer"); }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    static get OBFUSCATOR() { return document.getElementById( AxialOverlayManager.#OVERLAY_OBFUSCATOR_ID ); }

    /** @type { Function } */
    static documentOverlayClickHandler( event )
    {
        for( const overlay of AxialOverlayManager.#OVERLAYS )
        {
            if( overlay.hideMode === "click" && overlay.isModal === false && overlay.isShown === true )
            {
                overlay.hide();
            }
        }
    }
}
export { AxialOverlayManager }