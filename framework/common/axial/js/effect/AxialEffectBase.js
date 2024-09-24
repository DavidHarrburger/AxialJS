"use strict"

class AxialEffectBase extends EventTarget
{
    /** @type { Number } */
    #duration = 1000;

    /** @type { Number } */
    #valueFrom = 0;

    /** @type { Number } */
    #valueTo = 1;

    /** @type { Number } */
    #currentValue = 0

    /** @type { Number } */
    #distance;

    /** @type { Number } */
    #frameId = undefined;

    /** @type { Number } */
    #timeStart = undefined;

    /** @type { Number } */
    #timeElapsed = 0;

    /** @type { Number } */
    #timePrevious = 0;

    /** @type { Number } */
    #timeDelta = 0;

    /** @type { Number } */
    #timeProgress = 0;

    /** @type { Function } */
    #boundAnimate;

    /** @type { Object } */
    #object;

    /** @type { String } */
    #property;

    /** @type { Boolean } */
    #isPlaying = false;

    constructor()
    {
        super();
        this.#boundAnimate = this.#animate.bind(this);
    }

    get object() { return this.#object; }
    set object( value )
    {
        this.#object = value;
    }

    get property() { return this.#property; }
    set property( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#property = value;
    }

    start()
    {
        // silent fails
        if( this.#isPlaying === true ) { return; }
        window.requestAnimationFrame( this.#boundAnimate );
    }

    stop()
    {

    }

    #animate( ts )
    {
        let isFinished = false;
        if( this.#timeStart == undefined )
        {
            this.#timeStart = ts;
            this.#timePrevious = 0;
        }
        
        this.#timeElapsed = ts - this.#timeStart;
        console.log("this.#timeElapsed = " + this.#timeElapsed);
        /*
        if( this.#timeElapsed >= this.#duration )
        {
            this.#timeElapsed = this.#duration;
            isFinished = true;
        }
        */
        
        this.#timeDelta = this.#timeElapsed - this.#timePrevious;
        this.#timePrevious = this.#timeElapsed;


        this.#timeProgress = this.#timeElapsed / this.#duration;
        console.log( "this.#timeDelta = " + this.#timeDelta);

        //this.#object[this.#property] = this.#timeProgress;

        const c = this.#currentValue;
        const n = this.#timeProgress * 1;
        const f = c + ( n - c )*this.#timeDelta/100;
        console.log("n = " + n);
        console.log("f = " + f);

        this.#object[this.#property] = f;
        this.#currentValue = f;

        /*
        if( isFinished === true )
        {
            this.#frameId = undefined;
            this.#timeStart = undefined;
            //console.log("AxialEffectBase FINISHED");
        }
        else
        {
            window.requestAnimationFrame( this.#boundAnimate );
        }
        */
        window.requestAnimationFrame( this.#boundAnimate );

    }


}

export { AxialEffectBase }