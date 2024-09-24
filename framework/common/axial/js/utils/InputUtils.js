"use strict"

class InputUtils extends EventTarget
{
    /** @type { HTMLInputElement } */
    #inputTarget;

    /** @type { CSSStyleDeclaration} */
    #initComputedStyle;

    /** @type { Function } */
    #boundInputChangedHandler;

    /** @type { RegExp} */
    #regexp = /[A-Za-z]/;

    /**
     * @constructor
     * @param { HTMLInputElement } input 
     */
    constructor( inputTarget )
    {
        super();
        this.#boundInputChangedHandler = this.#inputChangedHandler.bind(this);

        if( inputTarget instanceof HTMLInputElement === false )
        {
            throw new TypeError("HTMLInputElement value required");
        }

        this.#inputTarget = inputTarget;
        this.#initComputedStyle = window.getComputedStyle(this.#inputTarget);
        console.log(this.#initComputedStyle);
        this.#inputTarget.addEventListener("input", this.#boundInputChangedHandler);
    }

    get inputTarget() { return this.#inputTarget; }
    set inputTarget( value )
    {
        if( value instanceof HTMLInputElement === false )
        {
            throw new TypeError("HTMLInputElement value required");
        }
        if( this.#inputTarget != undefined )
        {
            // restore init styles ??
            this.#inputTarget.removeEventListener("input", this.#boundInputChangedHandler);
        }
        this.#inputTarget = value;
        this.#initComputedStyle = window.getComputedStyle(this.#inputTarget); // warning not necessarly the init styles...
        this.#inputTarget.addEventListener("input", this.#boundInputChangedHandler);
    }

    /**
     * 
     * @param { InputEvent } event 
     */
    #inputChangedHandler( event )
    {
        const char = event.data;
        //const test = this.#regexp.test(char);

        //const isValid = this.#inputTarget.validity.valid
        
        console.log( this.#inputTarget.validity.valid );
    }

}

export { InputUtils }