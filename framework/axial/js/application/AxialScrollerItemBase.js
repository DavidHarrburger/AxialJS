"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase";

class AxialScrollerItemBase extends AxialComponentBase
{
    constructor()
    {
        super();
    }

    /**
     * @type { Function }
     * @override
     * @param { IntersectionObserverEntry } entry 
     */
    _animateOnIntersection( entry )
    {
        const bounds = entry.boundingClientRect;
        const ratio = Math.ceil(entry.intersectionRatio * 100);

        if( bounds.y >=0 && ratio > 0 )
        {
            this.innerHTML = String(ratio);
        }
    }
}

window.customElements.define("axial-scroller-item-base", AxialScrollerItemBase);
export { AxialScrollerItemBase }