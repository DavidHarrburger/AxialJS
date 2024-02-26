"use strict";

class Point
{
    /** @type { Number } */
    #x;

    /** @type { Number } */
    #y;
    
    /**
     * Create a point. 
     * @param { Number } x 
     * @param { Number } y 
     */
    constructor( x = 0, y = 0)
    {
        this.#x = x;
        this.#y = y;
    }

    get x() { return this.#x; }
    set x( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        this.#x = value;
    }

    get y() { return this.#y; }
    set y( value )
    {
        if( isNaN( value ) == true )
        {
            throw new TypeError("Number value expected");
        }
        this.#y = value;
    }

    /**
     * Calculate the distance between 2 given points. 
     * @param { Point } p1 
     * @param { Point } p2 
     * @return { Number }
     */
    static distance(p1, p2)
    {
        let dx = p1.#x - p2.#x;
        let dy = p1.#y - p2.#y;

        return Math.hypot(dx, dy);
    }

    /**
     * 
     * @param { Point } p1 
     * @param { Point } p2 
     * @return { Point }
     */
    static middlePoint(p1, p2)
    {
        return new Point( ((p1.#x + p2.#x) / 2) , ((p1.#y + p2.#y) / 2) );
    }
}

export { Point }