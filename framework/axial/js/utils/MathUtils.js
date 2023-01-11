"use strict";

class MathUtils
{
    /**
     * Convert degrees to radians
     * @param { Number } degrees 
     */
    static degreesToRadians( degrees )
    {
        return ( (Math.PI / 180 ) * degrees );
    }
}
export { MathUtils }