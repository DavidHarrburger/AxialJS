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
}

export { NumberUtils }