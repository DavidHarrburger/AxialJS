"use strict"

const AXIAL_EASE_MAGIC_NUMBER = 1.70158;

class AxialEase
{

    /**
     * Get the Penner's magic number 1.70158 used in some of easing functions. 
     * @type { Number }
     * @return { Number }
     */
    static get MAGIC_NUMBER() { return AXIAL_EASE_MAGIC_NUMBER; }


    /**
     * BackIn easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static backIn( k )
    {
        return k * k * ( ( AxialEase.MAGIC_NUMBER + 1 ) * k - AxialEase.MAGIC_NUMBER );
    }

    /**
     * BackOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static backOut( k )
    {
        return ( k -= 1 ) * k * ( ( AxialEase.MAGIC_NUMBER + 1 ) * k + AxialEase.MAGIC_NUMBER ) + 1;
    }

    /**
     * Bounce easing function. Equals to bounceOut. 
     * @param { Number } k
     * @return { Number }
     */
    static bounce( k )
    {
        if( k < (1/2.75) )
        {
            return (7.5625 * k * k);
        }
        else if( k < (2 / 2.75) )
        {
            return ( 7.5625 * (k -= (1.5 / 2.75) ) * k + 0.75);
        }
        else if( k < (2.5 / 2.75) )
        {
            return ( 7.5625 * (k -= (2.25 / 2.75) ) * k + 0.9375);
        }
        else
        {
            return (7.5625 * ( k -= (2.625 / 2.75) ) * k + 0.984375);
        }
    }

    /**
     * CircularIn easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static circularIn( k )
    {
        return -( Math.sqrt( 1 - ( k * k ) ) - 1 );
    }

    /**
     * CircularOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static circularOut( k )
    {
        return Math.sqrt( 1 - Math.pow( ( k - 1), 2 ) );
    }

    /**
     * CircularInOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static circularInOut( k )
    {
        if( (k /= 0.5) < 1 )
        {
            return -0.5 * ( Math.sqrt( 1 - k * k) - 1 );
        }
        return 0.5 * ( Math.sqrt( 1 - ( k -= 2 ) * k) + 1 );
    }

    /**
     * Elastic easing function. Equals to elasticOut. 
     * @param { Number } k
     * @return { Number }
     */
    static elastic( k )
    {
        return -1 * Math.pow( 4, -8 * k) * Math.sin( (k*6-1) * (2 * Math.PI) / 2 ) + 1;
    }

    /**
     * Linear easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static linear( k )
    {
        return k;
    }

    /**
     * LinearIn easing function. BAD TO REWRITE
     * @param { Number } k
     * @return { Number }
     */
    static linearIn( k )
    {
        return Math.pow(k, 4);
    }

    /**
     * LinearOut easing function. BAD TO REWRITE
     * @param { Number } k
     * @return { Number }
     */
    static linearOut( k )
    {
        return Math.pow(k, 0.25);
    }

    /**
     * LinearInOut easing function. BAD TO REWRITE
     * @param { Number } k
     * @return { Number }
     */
    static linearInOut( k )
    {
        if( (k /= 0.5) < 1)
        {
            return 0.5 * Math.pow(k, 4);
        }
        return -0.5 * ( (k -=2 ) * Math.pow(k, 3) - 2);
    }

    /**
     * ExponentialIn easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static expoIn( k )
    {
        return (k === 0 ) ? 0 : Math.pow( 2, 10 * (k - 1) );
    }

    /**
     * ExponentialOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static expoOut( k )
    {
        return ( k === 1) ? 1 : -Math.pow( 2, -10 * k ) + 1;
    }

    /**
     * ExponentialInOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static expoInOut( k )
    {
        if( k === 0 ) { return 0; }
        if( k === 1) { return 1; }
        if( (k /= 0.5 ) < 1 ) { return 0.5 * Math.pow( 2, 10 * (k - 1) ); }
        return 0.5 * ( -Math.pow( 2, -10 * --k ) + 2 );
    }

    /**
     * SineIn easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static sineIn( k )
    {
        return -Math.cos( k * ( Math.PI / 2) ) + 1;
    }

    /**
     * SineOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static sineOut( k )
    {
         return Math.sin( k * ( Math.PI / 2 ) );
    }

    /**
     * SineInOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static sineInOut( k )
    {
        return -0.5 * ( Math.cos( Math.PI * k ) - 1 );
    }

    /**
     * QuadraticIn easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static quadIn( k )
    {
        return Math.pow(k, 2);
    }

    /**
     * QuadraticOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static quadOut( k )
    {
        return -( Math.pow( (k-1) , 2 ) -1 );
    }

    /**
     * QuadraticInOut easing function. 
     * @param { Number } k
     * @return { Number }
     */
    static quadInOut( k )
    {
        if( (k /= 0.5 ) < 1 )
        {
            return 0.5 * Math.pow( k, 2 );
        }
        return -0.5 * ( ( k -= 2 ) * k - 2 );
    }

    // new 2022
    // https://github.com/ykob/shape-overlays/blob/master/js/easings.js

    static cubicIn( k )
    {
        return k * k * k;
    }

    static cubicOut( k )
    {
        const f = k - 1.0;
        return f * f * f + 1.0;
    }

    static cubicInOut( k )
    {
        return k < 0.5 ? 4.0 * k * k * k : 0.5 * Math.pow(2.0 * k - 2.0, 3.0) + 1.0;
    }

}

export { AxialEase }