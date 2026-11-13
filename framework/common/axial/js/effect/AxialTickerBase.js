"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialTickerBase extends AxialComponentBase
{

    /** @type { Number } */
    #MIN_TICK_TIME = 1000; // 60 ++

    /** @type { Number } */
    #animationId = undefined;

    /** @type { Number } */
    #startTime = 0;

    /** @type { Number } */
    #tickCount = -1;

    /** @type { Number } */
    #tickTime = 1000;

    /** @type { Number } */
    #timeMax = 0;

    /** @type { Boolean } */
    #isRunning = false;

    /** @type { Function } */
    #boundAnimate;

    constructor()
    {
        super();
        this.#boundAnimate = this.#animate.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        //let tempTickTime = Number( this.getAttribute("axial-tick-time") );
        // TODO better control here --> default and min tick time for getter setter but no time righjt now to code it
        //this.#tickTime = tempTickTime;
    }

    get timeMax() { return this.#timeMax; }
    set timeMax( value )
    {
        if( isNaN( value ) === true || value < this.#MIN_TICK_TIME )
        {
            throw new Error(`value must be > ${this.#MIN_TICK_TIME}` );
        }
        this.#timeMax = value;
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
        if( elapsed < this.#timeMax )
        {
            const currentTick = Math.round( elapsed / this.#tickTime );
            if( currentTick !== this.#tickCount )
            {
                console.log(this.#tickCount);
                this.#tickCount = currentTick;
                const tickEvent = new CustomEvent( "tick", { bubbles:true, composed: true, detail: { tick: this.#tickCount } } );
                this.dispatchEvent( tickEvent );
            }
        }
        else
        {
            this.#isRunning = false;
            const tickEvent = new CustomEvent( "tickFinished", { bubbles:true, composed: true } );
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