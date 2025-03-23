"use strict";

class AxialOverlayManager
{
    static #OVERLAYS = new Set();
    static get OVERLAYS() { return AxialOverlayManager.#OVERLAYS; }

    static get LAYER() { return document.getElementById("axialOverlayLayer"); }

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