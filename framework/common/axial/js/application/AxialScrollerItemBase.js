"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialScrollerItemBase extends AxialComponentBase
{
    /**
     * @type { Boolean }
     */
    #playOnlyOnce = true;

    /**
     * @type { Boolean }
     */
    #hasBeenPlayed = false;
    
    /**
     * @type { String }
     */
    #animation = undefined;

    /**
     * @type { Number }
     */
    #intersection = 0.5;

    /**
     * @type { Number }
     */
    #duration = 0;

    /**
     * @type { Number }
     */
    #delay = 0;


    constructor()
    {
        super();
        this.classList.add("axial_scroller_item_base");
    }

    static get observedAttributes()
    {
        return [ "axial-animation", "axial-duration", "axial-delay", "axial-intersection" ];
    }

    get animation() { return this.#animation; }
    set animation( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        if( value == this.#animation ) { return; }
        this.#animation = value;
        this.style.animationName = this.animation;
    }

    get duration() { return this.#duration; }
    set duration( value )
    {
        if( isNaN(value) === true )
        {
            throw new TypeError("Number value expected");
        }
        if( value == this.#duration ) { return; }
        this.#duration = value;
        this.style.animationDuration = String(this.#duration) + "ms";
    }

    get delay() { return this.#delay; }
    set delay( value )
    {
        if( isNaN(value) === true )
        {
            throw new TypeError("Number value expected");
        }
        if( value == this.#delay ) { return; }
        this.#delay = value;
        this.style.animationDelay = String(this.#delay) + "ms";
    }

    get intersection() { return this.#intersection; }
    set intersection( value )
    {
        if( isNaN(value) === true )
        {
            throw new TypeError("Number value expected");
        }
        if( value == this.#intersection ) { return; }
        this.#intersection = value;
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch( name )
        {
            case "axial-animation":
                this.animation = newValue;
            break;

            case "axial-duration":
                this.duration = Number(newValue);
            break;

            case "axial-delay":
                this.delay = Number(newValue);
            break;

            case "axial-intersection":
                this.intersection = Number(newValue);
            break;

            default:
            break;
        }
    }

    get playOnlyOnce() { return this.#playOnlyOnce; }
    set playOnlyOnce( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#playOnlyOnce ) { return; }
        this.#playOnlyOnce = value;
    }

    get hasBeenPlayed() { return this.#hasBeenPlayed; }

    /**
     * The AxialScrollerBase call this function each time its observer callback is invoked
     * You can write your own logic here
     * @type { Function }
     * @override
     * @param { IntersectionObserverEntry } entry 
     */
    _animateOnIntersection( entry )
    {
        if( this.#hasBeenPlayed == true && this.#playOnlyOnce == true ) { return; }
        //console.log(entry.boundingClientRect);

        //if( entry.intersectionRatio >= this.#intersection ) // intersection ratio can have weird values
        if( entry.intersectionRatio > 0 )
        {
            this.#hasBeenPlayed = true;
            if( this.#animation != undefined )
            {
                this.style.animationPlayState = "running";
            }
            else
            {
                if( this._instersectionAnimation )
                {
                    this._instersectionAnimation(entry);
                }
            }
        }
    }

    /**
     * Write here your own animation. Played if the 'animation' property / 'axial-animation' attribute is not defined
     * @type { Function }
     * @override
     * @param { IntersectionObserverEntry } entry 
     */
    _instersectionAnimation( entry ) {}
}

window.customElements.define("axial-scroller-item-base", AxialScrollerItemBase);
export { AxialScrollerItemBase }