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

    /**
     * Convert radians to degrees
     * @param { Number } radians 
     */
    static radiansToDegrees( radians )
    {
        return ( ( 180 / Math.PI ) * radians );
    }
}
export { MathUtils }