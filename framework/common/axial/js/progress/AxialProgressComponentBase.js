"use strict"

// framework imports
import { AxialComponentBase } from "../core/AxialComponentBase.js";

/**
 * Base class to create a progress component such as a progress bar or circle.
 * The AxialProgressComponentBase 'implements' properties and methods of the AxialRangeBase class.
 * @extends AxialComponentBase
 */
class AxialProgressComponentBase extends AxialComponentBase
{
    #minimum = 0;
    #maximum = 100;
    #value = 0;
    #stepSize = 1;
    
    constructor()
    {
        super();
    }

    get minimum() { return this.#minimum; }
    set minimum( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( value >= this.#maximum )
        {
            throw new Error( "Minimum cant't be upper than maximum" );
        }
        if( value == this.#minimum ) { return; }
        this.#minimum = value;
        if( this.#value < this.#minimum )
        {
            this.#value = this.#minimum;
        }
        this._commitValue();
    }

    get maximum() { return this.#maximum; }
    set maximum( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        
        if( value <= this.#minimum )
        {
            throw new Error( "Maximum cant't be lower than minimum" );
        }

        if( value == this.#maximum ) { return; }

        this.#maximum = value;

        if( this.#value > this.#maximum )
        {
            this.#value = this.#maximum;
        }

        this._commitValue();
    }

    get value() { return this.#value; }
    set value( newValue )
    {
        if( isNaN( newValue ) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this.#value == newValue ) { return; }
        this.#value = newValue;
        this._commitValue();
    }

    get stepSize() { return this.#stepSize; }
    set stepSize( value ) 
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( value <= 0 )
        {
            throw new Error( "Value must be positive" );
        }
        let delta = this.#maximum - this.#minimum;

        // we will change this later to find the better nearest stepSize
        if( value > delta )
        {
            throw new Error("stepSize can't be upper than difference between maximum and minimum")
        }
    }

    changeValueByStep( increase = true )
    {
        if( typeof increase !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        this.#value = increase == true ? this.#value += this.#stepSize : this.#value -= this.#stepSize;
        if( this.#value < this.#minimum ) { this.#value = this.#minimum; }
        if( this.#value > this.#maximum ) { this.#value = this.#maximum; }
        this._commitValue();
    }

    changeValueByPercent( percent )
    {
        if( isNaN(percent) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( percent < 0 || percent > 100 )
        {
            throw new Error("Number value expected between 0 and 100");
        }
        // don't wanna deal with float for the moment
        percent = Math.round(percent);
        
        // not sure Math.round is the best approach for the moment
        let newValue = Math.round( this.#value * percent / 100 );
        if( newValue == this.#value ) { return; }
        this.#value = newValue;
        this._commitValue();
    }

    // @override
    _onValueChanged()
    {

    }
    // @override
    _commitValue()
    {
        this._onValueChanged();
        
        let valueChangedEvent = new Event("valuechanged");
        valueChangedEvent.value = this.#value;
        this.element.dispatchEvent(valueChangedEvent);
    }

    _init()
    {
        super._init();

        // rework ax progress element
        if( this.element.classList.contains("ax-progress-element") == false )
        {
            this.element.classList.add("ax-progress-element");
        }
    }
}

export { AxialProgressComponentBase }