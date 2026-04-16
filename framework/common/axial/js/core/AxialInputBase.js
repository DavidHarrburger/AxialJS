"use strict";

import { AxialComponentBase } from "./AxialComponentBase.js";
import { ColorUtils } from "../utils/ColorUtils.js";
import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { StringUtils } from "../utils/StringUtils.js";
import { AxialOverlayManager } from "../overlay/AxialOverlayManager.js";

class AxialInputBase extends AxialComponentBase
{
    /// vars
    /** @type { Set<String> } */
    #INPUT_MODES = new Set( [ "text", "number", "time" ] );

    /** @type { String } */
    #inputMode = "text";

    /** @type { String | Number } */
    #cachedValue;

    /** @type { String } */
    #defaultValue;

    /** @type { String } */
    #initValue;

    /** @type { Number } */
    #step = 1;

    /** @type { Number } */
    #minimum;

    /** @type { Number } */
    #maximum;

    /** @type { RegExp} */
    #textReg = /^[\p{L} '!%*\-_\(\)\?]+$/u;

    /** @type { RegExp} */
    #numberReg = /^[0-9]+(\.[0-9]{1,3})?$/;

    /** @type { Boolean } */
    #isCalc = false;

    /** @type { Boolean } */
    #overlayLocked = true;

    /** @type { Set.<String> } */
    #lockedValues = new Set();

    /** @type { Boolean } */
    #enabled = true;

    /// elements
    /** @type { AxialOverlayBase } */
    #overlay;

    /// events
    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundKeydownHandler;

    /** @type { Function } */
    #boundKeyupHandler;

    /** @type { Function } */
    #boundFocusInHandler;

    /** @type { Function } */
    #boundFocusOutHandler;

    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_input_base");
        this.contentEditable = "true";

        this.#boundInputHandler = this.#inputHandler.bind(this);
        this.#boundKeydownHandler = this.#keydownHandler.bind(this);
        this.#boundKeyupHandler = this.#keyupHandler.bind(this);
        this.#boundFocusInHandler = this.#focusInHandler.bind(this);
        this.#boundFocusOutHandler = this.#focusOutHandler.bind(this);

        this.#boundClickHandler = this.#clickHandler.bind(this);
    }

    static get observedAttributes()
    {
        return ["axial-mode", "axial-step", "axial-min", "axial-max", "axial-size", "axial-weight", "axial-calc" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-mode" )
        {
            if( this.#INPUT_MODES.has(newValue) === true && this.#inputMode !== newValue )
            {
                this.#inputMode = newValue;
            }
        }

        if( name === "axial-step" )
        {
            const tempStep = Number( newValue );
            if( isNaN( tempStep ) === false && tempStep > 0 )
            {
                this.#step = tempStep;
            }
        }

        if( name === "axial-min" )
        {
            const tempMin = Number( newValue );
            if( isNaN( tempMin ) === false && tempMin > 0 )
            {
                this.#minimum = tempMin;
            }
        }

        if( name === "axial-max" )
        {
            const tempMax = Number( newValue );
            if( isNaN( tempMax ) === false && tempMax > 0 )
            {
                this.#maximum = tempMax;
            }
        }

        if( name === "axial-calc" )
        {
            this.#isCalc = newValue === null ? false : true;
        }
    }

    get inputMode() { return this.#inputMode; }
    set inputMode( value )
    {
        if( this.#INPUT_MODES.has( value ) === false )
        {
            throw new TypeError("Invalid input mode");
        }
        if( this.#inputMode === value ) { return; }
        this.#inputMode = value;
    }

    get isCalc() { return this.#isCalc; }
    set isCalc( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }

        if( this.#isCalc === value ) { return; }
        this.#isCalc = value;
    }

    get overlay() { return this.#overlay; }
    set overlay( value )
    {
        if( value instanceof AxialOverlayBase === false )
        {
            throw new TypeError("AxialOverlayBase required");
        }
        this.#overlay = value;
    }

    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value === this.#enabled ) { return; }
        this.#enabled = value;

        if( this.#enabled === true )
        {
            this.style.pointerEvents = "all";
            this.contentEditable = "true";
            this.style.opacity = "1";
        }
        else
        {
            this.style.pointerEvents = "none";
            this.contentEditable = "false";
            this.style.opacity = "0.5";
        }
    }

    get value()
    {
        /// IMPORTANT TO CHECK
        if( this.innerText === "" && this.#cachedValue !== undefined )
        {
            return this.#cachedValue;
        }

        let v;
        switch ( this.#inputMode )
        {
            case "text":
                v = this.innerText.trim();
            break;

            case "number":
                v = Number( this.innerText.trim() );
            break;
        
            default:
                v = this.innerText.trim();
            break;
        }
        return v;
    }
    set value( value )
    {
        if( this.#inputMode === "text" && typeof value !== "string" )
        {
            throw new TypeError("String value required in AxialInputBase when mode defined on 'text'");
        }
        else if( this.#inputMode === "number" && isNaN(value) === true )
        {
            throw new TypeError("Number value required in AxialInputBase when mode defined on 'number'")
        }
        this.#cachedValue = value;
        //console.log( this.#cachedValue );
        //console.log( this.innerText );
        this.innerText = value;
    }

    get step() { return this.#step; }
    set step( value )
    {
        if( isNaN( value ) )
        {
            throw new TypeError("Number value required");
        }
        if( this.#step === value ) { return; }
        this.#step = value;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#defaultValue = this.innerText;

        this.addEventListener("input", this.#boundInputHandler);
        this.addEventListener("keydown", this.#boundKeydownHandler);
        this.addEventListener("keyup", this.#boundKeyupHandler);
        this.addEventListener("focusin", this.#boundFocusInHandler);
        this.addEventListener("focusout", this.#boundFocusOutHandler);

        if( this.#cachedValue )
        {
            this.innerText = this.#cachedValue;
        }
    }

    #inputHandler( event )
    {
        this.#dispatchValueChangedEvent();
    }

    /**
     * @param { KeyboardEvent } event 
     */
    #keydownHandler( event )
    {
        //console.log("keydown");
        const key = event.key;
        
        if( key === "Tab" && document.hasFocus(this) === true && this.#overlay && this.#overlay.isShown === true )
        {
            this.#overlay.hide();
            return;
        }

        const isControlModifier = event.getModifierState("Control");
        if( isControlModifier === true )
        {
            if( key === "d" || key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight" )
            {
                event.preventDefault();
                event.stopImmediatePropagation();

                const inputEvent = new CustomEvent("inputShortcutRequested", { bubbles: true, detail: { shortcut: key } } );
                this.dispatchEvent( inputEvent );
            }
            
            return;
        }

        if( this.#overlay !== undefined && this.#overlayLocked === true )
        {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
        }

        if( this.#inputMode === "number" )
        {
            // KEEP FOR LATER : && key !== "Enter"
            //&& key !== "Delete" && key !== "ArrowLeft" && key !== "ArrowRight" && key !== "." 
            if( isNaN( Number(key) ) === true 
                && key !== "Delete"  && key !== "Tab" && key !== "Backspace" 
                && key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight" 
                && key !== "." && key !== "+" && key !== "-" && key !== "*" && key !== "/" )
            {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            else
            {
                if( this.#isCalc === false )
                {
                    if( key === "+" || key === "-" || key === "*" || key === "/" )
                    {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }

                    if( key === "." && StringUtils.countDots( this.innerText.trim() ) >= 1 )
                    {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                    }

                    //console.log( "count dots" );
                    //console.log( StringUtils.countDots( this.innerHTML ) );
                }

                if( key === "ArrowUp" || key === "ArrowDown" )
                {
                    event.preventDefault();
                    let currentValue = this.value;
                    let newValue;
                    if( key === "ArrowUp" )
                    {
                        newValue = currentValue + this.#step;
                    }
                    else if( key === "ArrowDown" )
                    {
                        newValue = currentValue - this.#step;
                    }
                    
                    // normalize
                    if( this.#minimum !== undefined && newValue < this.#minimum )
                    {
                        newValue = this.#minimum;
                    }

                    if( this.#maximum !== undefined && newValue > this.#maximum )
                    {
                        newValue = this.#maximum;
                    }

                    let newValueString = String( newValue );
                    if( newValueString.indexOf(".") !== -1 )
                    {
                        let decimalPart = newValueString.split(".")[1];
                        if( decimalPart.length > 2 )
                        {
                            newValueString = newValue.toFixed(2);
                        }
                    }
                    this.innerText = newValueString;
                }
                
            }
        }
        else if( this.#inputMode === "time" )
        {
            
        }
        else if( this.#inputMode === "measure" )
        {
            
        }
        else if( this.#inputMode === "text" )
        {
            
        }
    }

    #clickHandler( event )
    {
        //console.log( "input clicked");
        event.stopImmediatePropagation();

        const overlays = AxialOverlayManager.OVERLAYS;
        for( const overlay of overlays )
        {
            //console.log( overlay.contains(this) )
            
            if( overlay.isShown === true && this.#overlay !== overlay )
            {
                overlay.hide();
            }
            
        }
    }

    #keyupHandler( event )
    {
        const key = event.key;
        if( this.#inputMode === "number" )
        {
            if( key === "ArrowUp" || key === "ArrowDown" )
            {
                this.#dispatchValueChangedEvent();
            }
        }
    }

    #focusInHandler( event )
    {
        //console.log("focus in input base");
        this.addEventListener("click", this.#boundClickHandler);

        this.#initValue = this.innerText.trim();

        const selection = window.getSelection();
        selection.removeAllRanges();

        const range = document.createRange();
        range.selectNodeContents(this);
        selection.addRange(range);

        if( this.#overlay )
        {
            this.#overlay.showAtTarget(this, event);
        }
    }

    #focusOutHandler( event )
    {
        //console.log("focus out input base");
        this.removeEventListener("click", this.#boundClickHandler);
        
        const selection = window.getSelection();
        selection.removeAllRanges();                

        const finalValue = this.innerText.trim();
        this.innerText = finalValue;
        if( finalValue !== this.#initValue )
        {
            this.#dispatchFinalValueChangedEvent();
        }

        this.#initValue = undefined;
    }

    #calculate()
    {

    }

    addLockedValue( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#lockedValues.add( value.trim() );
    }

    /**
     * Exprimental - A util to update value and dispatch
     */
    forceValue( value )
    {
        this.value = value;
        this.#dispatchValueChangedEvent();
        this.#dispatchFinalValueChangedEvent();
    }

    #dispatchValueChangedEvent()
    {
        const valueChangedEvent = new CustomEvent( "valueChanged" );
        this.dispatchEvent( valueChangedEvent );
    }

    #dispatchFinalValueChangedEvent()
    {
        const finalValueChangedEvent = new CustomEvent( "finalValueChanged" );
        this.dispatchEvent( finalValueChangedEvent );
    }
}

window.customElements.define("axial-input-base", AxialInputBase);
export { AxialInputBase };