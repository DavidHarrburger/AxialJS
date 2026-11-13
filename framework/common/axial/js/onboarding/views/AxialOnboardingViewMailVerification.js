"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialTickerBase } from "../../effect/AxialTickerBase.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { CryptoUtils } from "../../utils/CryptoUtils.js";
import { StringUtils } from "../../utils/StringUtils.js";

class AxialOnboardingViewMailVerification extends AxialOnboardingView
{
    /// vars
    /** @type { RegExp } */
    #numberRegex = /^\d+$/;

    /** @type { String } */
    #emailCodeSendPath =  "./api/auth/email/code/send";

    /** @type { String } */
    #emailCodeVerifyPath =  "./api/auth/email/code/verify";

    /** @type { String } */
    #email;

    /** @type { RegExp} */
    #emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    /// elements
    /** @type { HTMLElement} */
    #holder;

    /** @type { HTMLElement} */
    #recipient;

    /** @type { Array<HTMLInputElement> } */
    #inputs;

    /** @type { AxialServiceButton } */
    #timeButton;

    /** @type { AxialTickerBase } */
    #ticker;

    /// events
    /** @type { Function } */
    #boundPasteHandler;

    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundKeyDownHandler;

    /** @type { Function } */
    #boundFocusHandler;

    /** @type { Function } */
    #boundTickHandler;

    /** @type { Function } */
    #boundTickFinishedHandler;

    /** @type { Function } */
    #boundTimeHandler;

    constructor()
    {
        super();
        this.template = "axial-onboarding-view-mail-verification-template";

        this.#emailCodeSendPath = PathUtils.getPathFromRelative(this.#emailCodeSendPath);
        this.#emailCodeVerifyPath = PathUtils.getPathFromRelative(this.#emailCodeVerifyPath);

        this.#boundPasteHandler = this.#pasteHandler.bind(this);
        this.#boundInputHandler = this.#inputHandler.bind(this);
        this.#boundKeyDownHandler = this.#keyDownHandler.bind(this);
        this.#boundFocusHandler = this.#focusHandler.bind(this);
        
        this.#boundTickHandler = this.#tickHandler.bind(this);
        this.#boundTickFinishedHandler = this.#tickFinishedHandler.bind(this);
        this.#boundTimeHandler = this.#timeHandler.bind(this);
    }

    get email() { return this.#email; }
    set email( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new Error("Onboarding Error");
        }
        const test = this.#emailRegex.test( value );
        if( test === true )
        {
            this.#email = value;
            if( this.componentBuilt === true )
            {
                if( this.#recipient )
                {
                    /*
                    const start = this.#email.substring(0, 4);
                    const len = this.#email.length;
                    const end = this.email.substring( len-5 );
                    const rec = start + "..." + end;
                    */
                    this.#recipient.innerHTML = this.#email;
                }

                this.#sendEmailCode();
            }
        }
    }

    _buildComponent()
    {
        this.#recipient = this.shadowRoot.getElementById("recipient");
        this.#holder = this.shadowRoot.getElementById("holder");
        if( this.#holder )
        {
            this.#inputs = Array.from(  this.#holder.getElementsByTagName("input") );
            for( const input of this.#inputs )
            {
                input.addEventListener("paste", this.#boundPasteHandler);
                input.addEventListener("input", this.#boundInputHandler);
                input.addEventListener("keydown", this.#boundKeyDownHandler);
                input.addEventListener("focus", this.#boundFocusHandler);
            }
        }

        this.#timeButton = this.shadowRoot.getElementById("timeButton");
        if( this.#timeButton )
        {
            this.#timeButton.enabled = false;
            this.#timeButton.addEventListener("click", this.#boundTimeHandler);
        }

        super._buildComponent();

        if( this.#email !== undefined )
        {
            this.#sendEmailCode();
            if( this.#recipient )
            {
                /*
                const start = this.#email.substring(0, 2);
                const len = this.#email.length;
                const end = this.email.substring( len-2 );
                const rec = start + "..." + end;
                */
                this.#recipient.innerHTML = this.#email;
            }
        }
    }

    #focusHandler( event )
    {
        event.target.select();
    }

    /**
     * 
     * @param { InputEvent } event 
     */
    #inputHandler( event )
    {
        event.preventDefault();
        const input = event.target;
        const data = event.data;
        const isValidData = this.#numberRegex.test(data);
        if( isValidData === true )
        {
            input.value = data;
            const index = this.#inputs.indexOf(input);
            if( index < (this.#inputs.length - 1) )
            {
                const nextInput = this.#inputs[index+1];
                nextInput.focus();
            }
            else if( index === (this.#inputs.length - 1) )
            {
                input.blur();
            }
        }
        this.#checkInputs();
    }

    /**
     * 
     * @param { KeyboardEvent } event 
     */
    #keyDownHandler( event )
    {
        if( event.key === "Backspace" || event.key === "ArrowLeft" || event.key === "ArrowRight" )
        {
            const input = event.target;
            const index = this.#inputs.indexOf(input);
            if( (event.key === "Backspace" || event.key === "ArrowLeft") && index >= 1 )
            {
                const newInput = this.#inputs[index-1];
                newInput.select();
                newInput.focus()
                
            }
            else if( ( event.key === "ArrowRight" ) && index < this.#inputs.length-1 )
            {
                const newInput = this.#inputs[index+1];
                newInput.select();
                newInput.focus();
            }
        }
    }

    /**
     * 
     * @param { ClipboardEvent } event 
     */
    #pasteHandler( event )
    {
        event.preventDefault();
        const data = event.clipboardData.getData("text");
        const isValidData = this.#numberRegex.test(data) === true && data.length === this.#inputs.length;
        if( isValidData === true )
        {
            const numbers = data.split("");
            for( let i = 0; i < this.#inputs.length; i++ )
            {
                const input = this.#inputs[i];
                const num = numbers[i];
                input.value = num;
            }
        }
        event.target.blur();
        this.#checkInputs();
    }

    #checkInputs()
    {
        let tempCode = "";
        for( let i = 0; i < this.#inputs.length; i++ )
        {
            const input = this.#inputs[i];
            tempCode += input.value;
        }
        const isValidCode = this.#numberRegex.test(tempCode) === true && tempCode.length === this.#inputs.length;
        if( isValidCode === true )
        {
            this.#verifyEmailCode(tempCode);
        }
    }

    async #sendEmailCode()
    {
        if( this.#email === undefined ) { return; }
        try
        {
            const payload = { email: this.#email };
            const mailSent = await FetchUtils.POST( this.#emailCodeSendPath, payload );

            console.log("ticker start");
            if( this.#timeButton )
            {
                this.#timeButton.text = "2 : 00";
            }
            this.#ticker = new AxialTickerBase();
            this.#ticker.timeMax = (2 * 60 * 1000);
            this.#ticker.addEventListener("tick", this.#boundTickHandler);
            this.#ticker.addEventListener("tickFinished", this.#boundTickFinishedHandler);
            this.#ticker.start();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async #verifyEmailCode( code )
    {
        let validated = false;
        try
        {
            const payload = { email: this.#email, code: code };
            const response = await FetchUtils.POST( this.#emailCodeVerifyPath, payload );
            if( response.status !== undefined && response.status === "ok" )
            {
                validated = true;
            }

        }
        catch( err )
        {
            console.log(err)
            
        }
        finally
        {
            if( this.#ticker )
            {
                if( validated === true )
                {
                    this.#ticker.removeEventListener("tick", this.#boundTickHandler);
                    this.#ticker.removeEventListener("tickFinished", this.#boundTickFinishedHandler);
                    this.#ticker.stop();
                    this.#ticker = null;
                }
                else
                {

                }
            }
            const data = { emailVerified: validated };
            const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated, data: data } } );
            this.dispatchEvent(onboardingEvent);
        }
    }

    /**
     * 
     * @param {CustomEvent } event 
     */
    #tickHandler( event )
    {
        const tick = event.detail.tick;
        const delta = 120 - tick;
        const min = String( Math.floor(delta / 60) );
        const sec = String( delta % 60 );
        const timeString = min + " : " + (sec.length === 1 ? "0" + sec : sec);
        this.#timeButton.text = timeString;
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #tickFinishedHandler( event )
    {
        console.log("tick finished")
        this.#timeButton.text = "Envoyer";
        this.#timeButton.enabled = true;
    }

    #timeHandler( event )
    {
        if( this.#ticker )
        {
            this.#ticker.removeEventListener("tick", this.#boundTickHandler);
            this.#ticker.removeEventListener("tickFinished", this.#boundTickFinishedHandler);
            this.#ticker.stop();
            this.#ticker = null;
        }
        this.#sendEmailCode();
    }

    _onBackwardLeaving( event )
    {
        super._onBackwardLeaving( event );
        if( this.#ticker )
        {
            this.#ticker.removeEventListener("tick", this.#boundTickHandler);
            this.#ticker.removeEventListener("tickFinished", this.#boundTickFinishedHandler);
            this.#ticker.stop();
            this.#ticker = null;
        }
        
    }

    _onForwardEntering( event )
    {
        super._onForwardEntering( event );
    }

    _onForwardLeaving( event )
    {
        super._onForwardLeaving( event );
        if( this.#ticker )
        {
            this.#ticker.removeEventListener("tick", this.#boundTickHandler);
            this.#ticker.removeEventListener("tickFinished", this.#boundTickFinishedHandler);
            this.#ticker.stop();
            this.#ticker = null;
        }
    }

}

window.customElements.define("axial-onboarding-view-mail-verification", AxialOnboardingViewMailVerification);
export { AxialOnboardingViewMailVerification }