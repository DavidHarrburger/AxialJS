"use strict"
import { AxialEase } from "./AxialEase.js";

const AXIAL_CSS_TRANSFORM_FUNCTIONS = new Set(["matrix", "matrix3d", "translate", "translateX", "translateY", "translateZ", "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ", "skew", "skewX", "skewY"]); 

class AxialEffectBase extends EventTarget
{
    /** @type { HTMLElement } */
    #target;

    /** @type { String } */
    #property;

    /** @type { Number } */
    #duration = 500;

    constructor()
    {
        this._target;
        this._property = "";
        this._duration = 500;
        this._distance = 0;
        this._destination = undefined;
        this._delay = 0; /// TODO
        this._easing = AxialEase.linear;
        this._initialPropertyValue = undefined;
        this._transformFunction = "none";

        this._isStyleProperty = undefined;

        this._isRunning = false;
        this._startTime = 0;
        this._unit = "";
        
    }

    /**
     * @public
     * Get or set the Element targeted by the effect. 
     * @type { HTMLElement }
     * @param { HTMLElement } value
     * @return { HTMLElement }
     */
    get target() { return this.#target; }
    set target( value )
    {
        if( value instanceof HTMLElement === false )
        {
            throw new TypeError("HTMLElement value expected");
        }
        if( value == this.#target ) { return; }
        this.#target = value;
    }

    /**
     * @public
     * Get or set the CSS style property you want to be animated
     * @type { String }
     * @param { String } value
     * @return { String }
     */
    get property() { return this.#property; }
    set property( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        if( this.#target == undefined )
        {
            throw new ReferenceError("The 'target' property of AxialEffectBase must be setted before its property value (because this setter check the property)");
        }

        //console.log(this._target.style[value] == "");
        //console.log(this._target.style[value] == null);
        //console.log(this._target.style[value] == undefined);
        //console.log(!this._target.style[value]);

        //console.log(this._target[value] == "");
        //console.log(this._target[value] == null);
        //console.log(this._target[value] == undefined);
        //console.log(!this._target[value]);
        
        // do better control here ie for window.scrollTop
        if( this._target.style[value] == undefined || this._target.style[value] == null )
        {
            /// throw new ReferenceError("The CSS style property on the Element target does not exist");

            // not css
            if( this._target[value] == undefined || this._target[value] == null )
            {
                throw new ReferenceError("The property or CSS style property on the Element target does not exist");
            }
            else
            {
                this._isStyleProperty = false;    
            }
        }
        else
        {
            this._isStyleProperty = true;
        }
        
        if( value == this._property ) { return; }
        this._property = value;
    }

    /**
     * @public
     * Get or set the unit of the property / CSS style property you want to be animated
     * @type { String }
     * @param { String } value
     * @return { String }
     */
    get unit() { return this._unit; }
    set unit( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        
        // do control here 
        this._unit = value;
    }

    /**
     * @public
     * Get or set the duration of the effect in milliseconds. Default 500. 
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     */
    get duration() { return this._duration; }
    set duration( value )
    {
        if( isNaN(value) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( value == this._duration ) { return; }
        this._duration = value;
    }

    /**
     * @public
     * Get or set the distance ie the amount by which you want target property will be increased. Default 0. 
     * Silent fail if the effect isRunning. 
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     */
    get distance() { return this._distance; }
    set distance( value )
    {
        if( isNaN(value) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this._isRunning == true ) { return; }
        if( value == this._distance ) { return; }
        this._distance = value;
    }

    /**
     * @public
     * Get or set the destination ie the final value. Default undefined. 
     * Silent fail if the effect isRunning. 
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     */
    get destination() { return this._destination; }
    set destination( value )
    {
        if( isNaN(value) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this._isRunning == true ) { return; }
        if( value == this._destination ) { return; }
        this._destination = value;
    }

    /**
     * @public
     * Get or set the easing function. The easing function takes only one parameter. 
     * Default : AxialEase.linear. Silent fail if the effect is running. 
     * @type { Function }
     * @param { Function }
     * @return { Function }
     */
    get easing() { return this._easing; }
    set easing( value )
    {
        if( typeof value !== "function" )
        {
            throw new TypeError("Function value expected");
        }
        if( this._isRunning == true ) { return; }
        if( value == this._easing ) { return; }
        this._easing = value;
    }

    /**
     * @public
     * Get or set the initial property value. Note if it is undefined, the effect try to get it for you.
     * Silent fail if the effect is the running.
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     */
    get initialPropertyValue() { return this._initialPropertyValue; }
    set initialPropertyValue( value )
    {
        if( isNaN(value) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this._isRunning == true ) { return; }
        if( value == this._initialPropertyValue ) { return; }
        this._initialPropertyValue = value;
    }

    get transformFunction() { return this._transformFunction; }
    set transformFunction( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        if( AXIAL_CSS_TRANSFORM_FUNCTIONS.has(value) == false )
        {
            throw new Error("Not a transform function");
        }
        if( this._isRunning == true ) { return; }
        if( value == this._transformFunction ) { return; }
        this._transformFunction = value;
    }

    /**
     * @public
     * Indicates if the effect is actually running
     * @type { Boolean }
     * @return { Boolean }
     */
    get isRunning() { return this._isRunning; }

    /**
     * @public
     * A shortcut to add listener to the updgraded element.
     */
    addEventListener( type, listener, useCapture = false )
    {
        if( this._target )
        {
            this._target.addEventListener(type, listener, useCapture);
        }
    }

    /**
     * @public
     * A shortcut to remove listener to the updgraded element.
     */
    removeEventListener( type, listener, useCapture = false )
    {
        if( this._target )
        {
            this._target.removeEventListener(type, listener, useCapture);
        }
    }

    /**
     * @public
     * Start the effect if instance's properties are ok
     */
    start()
    {
        // check if we can run
        if( this._isRunning == true ) { return; }
        if( this._property == "transform" && this._transformFunction == "none" )
        {
            throw new Error("A transform function must be setted on the effect when its property value is 'transform'");
        }
        this._isRunning = true;
        // get the initial property as number if undefined
        if( this._initialPropertyValue == undefined )
        {
            this._initialPropertyValue = this._isStyleProperty == true ?
            Number( String(this._target.style[this._property]).replace( /[a-z]/g, "") ) : Number( String(this._target[this._property]).replace( /[a-z]/g, "") );
            // see if we return or throw instead of normalize
            if( isNaN(this._initialPropertyValue) == true )
            {
                this._initialPropertyValue = 0;
            }
        }

        //console.log("this._initialPropertyValue = " + this._initialPropertyValue);
        
        if( this._destination != undefined ) { this._distance = this._destination - this._initialPropertyValue; }
        // call 'on' method and dispacth event
        // event
        // explorer polyfill
        let effectStartedEvent;
        if (Environment.browser == "explorer")
        {
            effectStartedEvent = document.createEvent("Event");
            effectStartedEvent.initEvent("effectstarted", true, true);
        }
        else
        {
            effectStartedEvent = new Event("effectstarted");
        }
        if( this._target ) { this._target.dispatchEvent(effectStartedEvent); }

        window.requestAnimationFrame( this._effectStep.bind(this) );
    }

    /**
     * @private
     * The private function executed in background via raf. 
     * @param { Number } ts - The timestamp
     */
    _effectStep( ts )
    {
        let deltaTime;
        let progress;
        let tempFinalPropValue;
        let finalPropValue; // for units or transform, box-shadow etc

        if( this._startTime == 0 )
        {
            this._startTime = ts;
            deltaTime = 0;
            progress = 0;
        }
        else
        {
            deltaTime = ts - this._startTime;
            progress = deltaTime / this._duration;
        }

        /// KEEP
        //console.log("time elapsed in ms = " + deltaTime);
        //console.log("time progress in % = " + progress);

        if( deltaTime >= this._duration )
        {
            this._isRunning = false;
            this._startTime = 0;
            // actualize value
            tempFinalPropValue = this._initialPropertyValue + this._distance;
            if( this._unit != "" ) { tempFinalPropValue = String(tempFinalPropValue) + this._unit; }
            finalPropValue = this._property == "transform" ? this._transformFunction + "(" + tempFinalPropValue + ")" : tempFinalPropValue;

            if( this._isStyleProperty == true )
            {
                this._target.style[this._property] = finalPropValue;    
            }
            else
            {
                this._target[this._property] = finalPropValue;
            }

            // call 'on' method and dispacth event
            // event
            // explorer polyfill
            let effectEndedEvent;
            if (Environment.browser == "explorer")
            {
                effectEndedEvent = document.createEvent("Event");
                effectEndedEvent.initEvent("effectended", true, true);
            }
            else
            {
                effectEndedEvent = new Event("effectended");
            }
            if( this._target ) { this._target.dispatchEvent(effectEndedEvent); }
        }
        
        if( this._isRunning == true )
        {
            // actualize value
            tempFinalPropValue = this._initialPropertyValue + this._distance * this._easing(progress);
            finalPropValue = this._property == "transform" ? this._transformFunction + "(" + tempFinalPropValue + ")" : tempFinalPropValue + this._unit;

            if( this._isStyleProperty == true )
            {
                this._target.style[this._property] = finalPropValue;    
            }
            else
            {
                this._target[this._property] = finalPropValue;
            }
            window.requestAnimationFrame( this._effectStep.bind(this) );
        }
    }
}

export { AxialEffectBase }