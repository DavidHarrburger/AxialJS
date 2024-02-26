"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialTickerBase extends AxialComponentBase
{

    /** @type { Number } */
    #MIN_TICK_TIME = 100; // 60 ++

    /** @type { Number } */
    #animationId = undefined;

    /** @type { Number } */
    #startTime = 0;

    /** @type { Number } */
    #tickCount = -1;

    /** @type { Number } */
    #tickTime = 1000;

    /** */
    #isRunning = false;

    /** @type { Function } */
    #boundAnimate;

    
    constructor()
    {
        super();
        this.#boundAnimate = this.#animate.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();

        let tempTickTime = Number( this.getAttribute("axial-tick-time") );
        // TODO better control here --> default and min tick time for getter setter but no time righjt now to code it
        // but it's very 
        this.#tickTime = tempTickTime;
    }

    start()
    {
        if( this.#isRunning === true ) { return; }
        this.#startTime = 0;
        this.#tickCount = -1;
        this.#isRunning = true;
        this.#animationId = window.requestAnimationFrame( this.#boundAnimate );
    }

    stop()
    {
        if( this.#animationId == undefined ) { return; }
        window.cancelAnimationFrame( this.#animationId );
        this.#animationId = undefined;
        this.#startTime = 0;
        this.#tickCount = -1;
        this.#isRunning = false;
    }

    #animate( ts )
    {
        if( this.#startTime === 0 )
        {
            this.#startTime = ts;
        }

        const elapsed = ts - this.#startTime;
        const currentTick = Math.round( elapsed / this.#tickTime );
        if( currentTick !== this.#tickCount )
        {
            this.#tickCount = currentTick;
            const tickEvent = new CustomEvent( "tick", { detail: { tick: this.#tickCount } } );
            this.dispatchEvent( tickEvent );
        }

        if( this.#isRunning === true )
        {
            this.#animationId = window.requestAnimationFrame( this.#boundAnimate );
        }
        
    }


}

window.customElements.define("axial-ticker-base", AxialTickerBase);
export { AxialTickerBase }