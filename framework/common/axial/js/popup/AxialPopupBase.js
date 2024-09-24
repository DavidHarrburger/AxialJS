"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialPopupManager } from "./AxialPopupManager.js";

/**
 * @public
 * Base class for all the Axial Popup components. 
 * @extends AxialComponentBase
 */
class AxialPopupBase extends AxialComponentBase
{
    /// VARS
    /** @type { Set } */
    #POPUP_POSITIONS = new Set( [ "left", "right", "top", "bottom", "center" ] );

    #POPUP_ANIMATIONS = new Set( ["none", "fade", "translate_up", "translate_down", "translate_left", "translate_right", "fade_translate_up", "fade_translate_down", "fade_translate_left", "fade_translate_right"] );

    /** @type { Boolean } */
    #isBuilt = false;

    /** @type { String } */
    #position = "center";

    /** @type { String } */
    #animation = "fade_translate_up";

    /** @type { String } */
    #timingFunction = "ease";

    /** @type { Number } */
    #duration = 400;

    /** @type { Boolean } */
    #useObfuscator = true;

    /** @type { Boolean } */
    #isModal = true;

    /// EVENTS
    #boundPopupPointerDownHandler;

    constructor()
    {
        super();
        this.classList.add("axial_popup_base");
        this.#boundPopupPointerDownHandler = this.#popupPointerDownHandler.bind(this);
        this.addEventListener("pointerdown", this.#boundPopupPointerDownHandler);
        this.isResizable = true;
        AxialPopupManager.registerPopup( this );
    }

    static get observedAttributes()
    {
        return [ "axial-position", "axial-animation", "axial-function", "axial-duration" ];
    }


    get position() { return this.#position; }
    set position( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#POPUP_POSITIONS.has( value ) === true )
        {
            this.#position = value;
        }
        
        this.#layoutPopup();
    }

    get animation() { return this.#animation; }
    set animation( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        if( this.#POPUP_ANIMATIONS.has( value ) === true )
        {
            this.#animation = value;
        }
    }

    get duration() { return this.#duration; }
    set duration( value )
    {
        if( isNaN( value ) === true )
        {
            throw new TypeError("Number value required");
        }

        if( value <= 0 ) { return; }
        this.#duration = value;
    }

    get timingFunction() { return this.#timingFunction; }
    set timingFunction( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }

        this.#timingFunction = value;
    }

    /**
     * @public
     * Get or set if the obfuscator layer is used when the popup is displayed.
     * You can't change this value once the popup is displayed.
     * @type { Boolean }
     * @param { Boolean } value
     * @return { Boolean }
     * @default false
     */
    get useObfuscator() { return this.#useObfuscator; }
    set useObfuscator( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( AxialPopupManager.currentPopup == this )
        {
            return;
        }
        if( value == this.#useObfuscator ) { return; }
        this.#useObfuscator = value;
    }

    /**
     * @public
     * Get or set the popup modal or non-modal. If modal, the web app can't receive any interaction until the popup was explicity closed. 
     * @type { Boolean }
     * @param { Boolean } value
     * @return { Boolean }
     * @default false
     */
    get isModal() { return this.#isModal; }
    set isModal( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#isModal ) { return; }
        this.#isModal = value;
    }

    /**
     * @private
     * Prevent the popup from being closed if user click outside of its DOMRect
     * @param { PointerEvent } event 
     */
    #popupPointerDownHandler( event ) { event.stopImmediatePropagation(); }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);

        if( name === "axial-position" )
        {
            this.position = newValue;
        }
        
    }

    _resize()
    {
        this.#layoutPopup();
    }

    _finalizeComponent()
    {
        super._finalizeComponent();
        this.#buildComponent();
    }

    #buildComponent()
    {
        if( this.#isBuilt === true ) { return; }
        this.#isBuilt = true;
    }

    #layoutPopup()
    {
        const wi = window.innerWidth;
        const hi = window.innerHeight;

        const pwi = this.offsetWidth;
        const phi = this.offsetHeight;

        let nx = 0;
        let ny = 0;
        
        switch( this.#position )
        {
            case "center":
                nx = ( wi - pwi ) / 2;
                ny = ( hi - phi ) / 2;
            break;

            case "left":
                nx = 0;
                ny = ( hi - phi ) / 2;
            break;

            case "right":
                nx = ( wi - pwi );
                ny = ( hi - phi ) / 2;
            break;

            case "top":
                nx = ( wi - pwi ) / 2;
                ny = 0;
            break;

            case "bottom":
                nx = ( wi - pwi ) / 2;
                ny = ( hi - phi );
            break;

            default:
                nx = ( wi - pwi ) / 2;
                ny = ( hi - phi ) / 2;
            break;
        }
        this.style.left = String(nx) + "px";
        this.style.top = String(ny) + "px";
    }

    show()
    {
        AxialPopupManager.showPopup( this );
    }

    hide()
    {
        AxialPopupManager.hidePopup( this );
    }

    /** @abstract */
    _onShowing() {}

    /** @abstract */
    _onShown() {}

    /** @abstract */
    _onHiding() {}

    /** @abstract */
    _onHidden() {}
}

window.customElements.define("axial-popup-base", AxialPopupBase);
export { AxialPopupBase }