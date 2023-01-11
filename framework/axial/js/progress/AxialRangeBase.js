"use strict"

class AxialRangeBase
{
    constructor()
    {
        this._minimum = 0;
        this._maximum = 100;
        this._value = 0;
        this._stepSize = 1;
    }

    get minimum() { return this._minimum; }
    set minimum( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( value >= this._maximum )
        {
            throw new Error( "Minimum cant't be upper than maximum" );
        }
        if( value == this._minimum ) { return; }
        this._minimum = value;
        if( this._value < this._minimum )
        {
            this._value = this._minimum;
        }
        this._commitValue();
    }

    get maximum() { return this._minimum; }
    set maximum( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        
        if( value <= this._minimum )
        {
            throw new Error( "Maximum cant't be lower than minimum" );
        }

        if( value == this._maximum ) { return; }

        this._maximum = value;

        if( this._value > this._maximum )
        {
            this._value = this._maximum;
        }
        this._commitValue();
    }

    get value() { return this._value; }
    set value( newValue )
    {
        if( isNaN( newValue ) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this._value == newValue ) { return; }
        this._value = newValue;
        this._commitValue();
    }

    get stepSize() { return this._stepSize; }
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
        let delta = this._maximum - this._minimum;

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
        this._value = increase == true ? this._value += this._stepSize : this._value -= this._stepSize;
        if( this._value < this._minimum ) { this._value = this._minimum; }
        if( this._value > this._maximum ) { this._value = this._maximum; }
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
        let newValue = Math.round( this._value * percent / 100 );
        if( newValue == this._value ) { return; }
        this._value = newValue;
        this._commitValue();
    }

    /// @override
    _onValueChanged()
    {

    }
    // @override
    _commitValue()
    {
        this._onValueChanged();
    }
}

export { AxialRangeBase }