"use strict";

import { AxialOverlayBase } from "./AxialOverlayBase.js";

class AxialOverlayManager
{
    /** @type { String } */
    static #OVERLAY_OBFUSCATOR_ID = "axialOverlayObfuscator";
    
    /** @type { Set.<AxialOverlayBase> } */
    static #OVERLAYS = new Set();

    /** @type { Set.<AxialOverlayBase> } */
    static #STACK = new Set();

    /** @type { Number } */
    static #Z_INDEX = 6000;
    
    /**
     * @type { Set.<AxialOverlayBase> }
     * @readonly
     */
    static get OVERLAYS() { return AxialOverlayManager.#OVERLAYS; }

    /**
     * @type { Set.<AxialOverlayBase> }
     * @readonly
     */
    static get STACK() { return AxialOverlayManager.#STACK; }

    /**
     * @type { Number }
     * @readonly
     */
    static get Z_INDEX() { return AxialOverlayManager.#Z_INDEX; }

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
            if( overlay.hideMode === "click" && overlay.isModal === false && overlay.isShown === true && overlay.isPlaying === false )
            {
                overlay.hide();
                console.log("called")
            }
        }
    }
}
export { AxialOverlayManager }