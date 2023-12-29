"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialScrollerItemBase } from "./AxialScrollerItemBase.js";

class AxialScrollerBase extends AxialComponentBase
{
    /**
     * @type { IntersectionObserver }
     */
    #intersectionOberserver;

    /**
     * @type { Function }
     */
    #boundIntersectionObserverHandler;

    constructor()
    {
        super();
        this.classList.add("axial_scroller_base");
        this.#boundIntersectionObserverHandler = this.#intersectionObserverHandler.bind(this);
        
        let thresholds = new Array();
        for( let i = 0; i <= 100; i++ )
        {
            let t = i / 100;
            thresholds.push(t);
        }
        
        const intersectionObserverOptions = { root: document , threshold: thresholds }
        this.#intersectionOberserver = new IntersectionObserver( this.#boundIntersectionObserverHandler, intersectionObserverOptions );

    }

    #intersectionObserverHandler( entries, observer )
    {
        //console.log(entries);
        const el = entries.length;
        for( let i = 0; i < el; i++ )
        {
            const entry = entries[i];
            const target = entry.target;

            if( target._animateOnIntersection )
            {
                target._animateOnIntersection(entry);
            }
        }
    }

    _finalizeComponent()
    {
        const elements = this.getElementsByTagName("*");
        const el = elements.length;
        for( let i = 0; i < el; i++ )
        {
            const element = elements[i];
            if( element instanceof AxialScrollerItemBase === true )
            {
                this.#intersectionOberserver.observe(element);
            }
        }
    }
}

window.customElements.define("axial-scroller-base", AxialScrollerBase);
export { AxialScrollerBase }