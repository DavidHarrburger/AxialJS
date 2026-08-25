"use strict"

class NumberUtils
{
    /**
     * Determines if a the absolute value of a number is even or odd
     * @param { Number } n
     */
    static isEven(n)
    {
        if( isNaN(n) == true ) { throw new TypeError("Number value expected"); }
        return Math.abs(n) % 2 == 0;
    }

    /**
     * Rounds a number at a chosen number of decimal places.  
     * Example: NumberUtils.roundFixed(31.768, 2) => 31.77
     * @param { Number } number The number you want to round.
     * @param { Number } decimals The number of decimal places to round up to.
     * @returns { Number }
     */
    static roundFixed(number, decimals)
    {
        const tenPower = 10 ** decimals;
        return Math.round(number * tenPower) / tenPower;
    }
}

export { NumberUtils }