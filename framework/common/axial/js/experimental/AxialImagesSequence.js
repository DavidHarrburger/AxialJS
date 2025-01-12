"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialImagesSequence extends AxialComponentBase
{
    /// ATTRIBUTES
    /** @type { Number } */
    #start = 0;

    /** @type { Number } */
    #end = 0;

    /** @type { Number } */
    #digit = 4;

    /** @type { String } */
    #path = "";

    /** @type { Boolean } */
    #loop = false;

    /// UI 
    /** @type {HTMLCanvasElement} */
    #canvas;

    /** @type {CanvasRenderingContext2D} */
    #context;

    /// LOAD PART
    /** @type { Array } */
    #bitmaps = new Array();

    /** @type { Boolean } */
    #hasError = false;

    /** @type { Boolean } */
    #isReady = false;

    /** @type { Boolean } */
    #drawFirst = false;

    
    /// RAF PART
    /** @type { Boolean } */
    #isRunning = false;

    /** @type { Boolean } */
    #backward = false;

    /** @type { Number } */
    #requestFrameId = undefined;

    /** @type { Number } */
    #duration = 0;

    /** @type { Number } */
    #maxDuration = 0;

    /** @type { Number } */
    #index = 0;

    /** @type { Number } */
    #startIndex = 0;

    /** @type { Number } */
    #endIndex = 0;

    /** @type { Number } */
    #currentIndex = 0;

    /**@type { Number} */
    #frameRate = 16; // base 24

    /** @type { Number } */
    #timeStart = 0;

    /** @type { Function } */
    #boundAnimate;

    /// for loading / preloading
    /** @type { Number } */
    #maxImages = 0;

    constructor()
    {
        super();
        this.#boundAnimate = this.#animate.bind(this);
    }

    /**
     * Returns the maximum of images in the Sequence.
     * @readonly
     */
    get maxImages() { return this.#maxImages; }

    /**
     * @readonly
     */
    get currentIndex() { return this.#currentIndex; }

    /**
     * @readonly
     */
    get isRunning() { return this.#isRunning; }

    get loop() { return this.#loop; }
    set loop( value )
    {
        this.#loop = value;
    }

    get drawFirst() { return this.#drawFirst; }
    set drawFirst( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        this.#drawFirst = value;
    }

    get backward() { return this.#backward; }
    set backward( value )
    {
        if( this.#isRunning == true )
        {
            throw new Error("Incorrect call : you can't change direction while the sequence is runnig");
        }
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( value === this.#backward ) { return; }
        
        this.#backward = value;
        if( this.#backward === false )
        {
            this.#endIndex = this.#end;
        }
        else
        {
            this.#endIndex = this.#start;
        }
    }

    get frameRate() { return this.#frameRate; }
    set frameRate( value )
    {
        if( this.#isRunning == true )
        {
            throw new Error("Incorrect call : you can't change the frame rate while the sequence is runnig");
        }
        if( isNaN( value ) === true )
        {
            throw new TypeError("Number value required");
        }

        if( value < 16 ) { value = 16; }
        else if( value > 64 ) { value = 64; }
        
        this.#frameRate = value;
    }

    _buildComponent()
    {
        super._buildComponent();

        // start
        const tempStart = Number(this.getAttribute("axial-start"));
        if( isNaN(tempStart) == false && tempStart >= 0 )
        {
            this.#start = tempStart;
            this.#startIndex = tempStart;
            this.#currentIndex = tempStart;
        }

        // end
        const tempEnd = Number(this.getAttribute("axial-end"));
        if( isNaN(tempEnd) == false && tempEnd >= 0 )
        {
            this.#end = tempEnd;
            this.#endIndex = tempEnd;
        }

        // preload --> redundancy here but normal
        this.#maxImages = this.#end - this.#start + 1;

        // duration
        this.#maxDuration = (this.#end - this.#start + 1) * this.#frameRate;
        this.#duration = this.#maxDuration;
        //console.log("maxDuration = " + this.#maxDuration);

        // digit
        const tempDigit = Number(this.getAttribute("axial-digit"));
        if( isNaN(tempDigit) == false && tempDigit >= 0 )
        {
            this.#digit = tempDigit;
        }

        // property
        const tempPath = this.getAttribute("axial-path");
        if( tempPath !== null )
        {
            this.#path = tempPath;
        }


        this.#canvas = document.createElement("canvas");
        this.#canvas.style.position = "absolute";
        this.#canvas.width = this.offsetWidth;
        this.#canvas.height = this.offsetHeight;

        this.appendChild(this.#canvas);
        this.#context = this.#canvas.getContext("2d");

        this.#fetchImages();
    }

    async #fetchImages()
    {
        try
        {
            for( let i = this.#start; i <= this.#end; i++ )
            {
                const filepath = this.#path + this.#getDigit(i) + ".webp";
                //console.log(filepath);
                const response = await fetch(filepath);
                const blob = await response.blob();
                if( blob )
                {
                    const sequenceEvent = new CustomEvent("sequenceLoad", { bubbles: true });
                    this.dispatchEvent(sequenceEvent);
                }
                const bitmap = await window.createImageBitmap(blob);
                this.#bitmaps[i] = bitmap;
            }
        }
        catch(err)
        {
            console.log(err);
            if( err ) { this.#hasError = true; }
        }
        finally
        {
            if( this.#hasError == false )
            {
                this.#isReady = true;
                const sequenceEvent = new CustomEvent("sequenceReady", { bubbles: true });
                this.dispatchEvent(sequenceEvent);
                console.log("SEQUENCE READY");
                if( this.#drawFirst === true )
                {
                    const w = this.offsetWidth;
                    const h = this.offsetHeight;
                    this.#canvas.width = w;
                    this.#canvas.height = h;
                    this.#context.clearRect(0, 0, w, h);
                    this.#context.drawImage(this.#bitmaps[this.#start], 0, 0, w, h);
                }
            }
        }
    }

    startSequence()
    {
        //console.log("START SEQUENCE CALLED");
        if( this.#isReady == false ) { return; }
        if( this.#isRunning == false )
        {
            const tempDurationRatio = ( Math.abs( (this.#endIndex - this.#startIndex + 1 ) * this.#frameRate) ) / this.#maxDuration;
            //console.log(tempDurationRatio);
            this.#duration = this.#maxDuration * tempDurationRatio;
            
            this.#isRunning = true;
            this.#requestFrameId = window.requestAnimationFrame( this.#boundAnimate );
        }
    }

    stopSequence()
    {
        //console.log("STOP SEQUENCE CALLED");
        if( this.#isReady == false ) { return; }
        if( this.#isRunning == true && this.#requestFrameId != undefined )
        {
            window.cancelAnimationFrame(this.#requestFrameId);
            this.#requestFrameId = undefined;
            this.#isRunning = false;
            this.#timeStart = 0;
            this.#startIndex = this.#currentIndex;
        }
    }

    
    playAt( r = 1 )
    {
        if( this.#isReady == false ) { return; }
        //console.log("sequence.playAt : r = " + r);
        /*
        if( this.#isRunning === true )
        {
            this.stopSequence();
        }
        */

        const indexToGo = this.#start + Math.round( (this.#end - this.#start) * r );
        //console.log( indexToGo );

        if( indexToGo == this.#startIndex )
        {
            //console.log("no move");
        }
        else
        {
            //console.log("should start");
            this.#endIndex = indexToGo;
            this.startSequence();
        }
    }
    

    #getDigit( atNumber )
    {
        let digit = "";
        let numberOfZeros = this.#digit - String(atNumber).length;
        for( let i = 0; i < numberOfZeros; i++ )
        {
            digit = digit + "0";
        }
        digit = digit + String(atNumber);
        return digit;
    }

    reinit()
    {
        this.#startIndex = this.#start;
    }

    clear()
    {
        const w = this.offsetWidth;
        const h = this.offsetHeight;
        this.#context.clearRect(0, 0, w, h);
    }

    /// REQUEST ANIMATION FRAME PART
    #animate( timestamp )
    {
        const w = this.offsetWidth;
        const h = this.offsetHeight;

        let deltaTime;
        let progress;
        let finished = false;

        if( this.#timeStart == 0 )
        {
            this.#timeStart = timestamp;
            deltaTime = 0;
            progress = 0;
        }
        else
        {
            deltaTime = timestamp - this.#timeStart;
            if( deltaTime >= this.#duration )
            {
                deltaTime = this.#duration;
                finished = true;
            }
            progress = deltaTime / this.#duration;
        }


        const tempIndex = this.#startIndex + Math.round( (this.#endIndex - this.#startIndex) * progress );
        if( isNaN(tempIndex) === false )
        {
            this.#currentIndex = tempIndex;    
        }
        //this.#currentIndex = this.#startIndex + Math.round( (this.#endIndex - this.#startIndex) * progress );
        //console.log(this.#currentIndex);

        this.#canvas.width = w;
        this.#canvas.height = h;
        this.#context.clearRect(0, 0, w, h);
        this.#context.drawImage(this.#bitmaps[this.#currentIndex], 0, 0, w, h);

        if( finished == false )
        {
            this.#requestFrameId = window.requestAnimationFrame(this.#boundAnimate);
        }
        else
        {
            window.cancelAnimationFrame(this.#requestFrameId);
            this.#requestFrameId = undefined;
            this.#isRunning = false;
            this.#timeStart = 0;

            // dispatch
            console.log("sequence finished");
            this.#startIndex = this.#currentIndex;
            const sequenceEvent = new CustomEvent( "sequenceFinished" );
            this.dispatchEvent(sequenceEvent);

            if( this.#loop === true )
            {
                this.#startIndex = this.#start;
                this.startSequence();
            }
            /*
            if( this.#backward === false )
            {
                this.#startIndex = this.#end;
                this.#endIndex = this.#start;
                this.#backward = true;
            }
            else
            {
                this.#startIndex = this.#start;
                this.#endIndex = this.#end;
                this.#backward = false;
            }
            this.#currentIndex = this.#startIndex;
            */
        }
    }

    resizeSequence()
    {
        if( this.#isReady === false )
        {
            return;
        }
        
        const w = this.offsetWidth;
        const h = this.offsetHeight;

        this.#canvas.width = w;
        this.#canvas.height = h;
        this.#context.clearRect(0, 0, w, h);
        this.#context.drawImage(this.#bitmaps[this.#currentIndex], 0, 0, w, h);
    }
}

window.customElements.define("axial-images-sequence", AxialImagesSequence);
export { AxialImagesSequence }