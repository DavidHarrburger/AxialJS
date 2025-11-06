"use strict";

class AxialOverlayManager
{
    static #OVERLAY_OBFUSCATOR_ID = "axialOverlayObfuscator";
    static #OVERLAYS = new Set();
    static get OVERLAYS() { return AxialOverlayManager.#OVERLAYS; }

    static get LAYER() { return document.getElementById("axialOverlayLayer"); }

    static get OBFUSCATOR() { return document.getElementById( AxialOverlayManager.#OVERLAY_OBFUSCATOR_ID ); }

    static documentOverlayClickHandler( event )
    {
        for( const overlay of AxialOverlayManager.#OVERLAYS )
        {
            if( overlay.hideMode === "click" && overlay.isModal === false )
            {
                overlay.hide();
            }
        }
    }
}
export { AxialOverlayManager }