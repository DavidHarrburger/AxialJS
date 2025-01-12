"use strict";

class AxialOverlayManager
{
    static #OVERLAYS = new Set();
    static get OVERLAYS() { return AxialOverlayManager.#OVERLAYS; }

    static get LAYER() { return document.getElementById("axialOverlayLayer"); }

    static documentOverlayClickHandler( event )
    {
        //console.log("overlay document click");
        for( const overlay of AxialOverlayManager.#OVERLAYS )
        {
            if( overlay.hideMode === "click" )
            {
                overlay.hide();
            }
        }
    }
}
export { AxialOverlayManager }