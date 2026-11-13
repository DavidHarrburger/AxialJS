"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";
import { AxialTickerBase } from "../../effect/AxialTickerBase.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { CryptoUtils } from "../../utils/CryptoUtils.js";
import { StringUtils } from "../../utils/StringUtils.js";
import { FormatUtils } from "../../utils/FormatUtils.js";

class AxialOnboardingViewPhoneVerification extends AxialOnboardingView
{
    /// vars
    /** @type { RegExp } */
    #phoneRegex = /^(?:\+33|0)[67]\d{8}$/;

    /** @type { RegExp } */
    #numberRegex = /^\d+$/;

    /** @type { String } */
    #phoneCodeSendPath =  "./api/auth/phone/code/send";

    /** @type { String } */
    #phoneCodeVerifyPath =  "./api/auth/phone/code/verify";

    /** @type { String } */
    #phone;

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
        this.template = "axial-onboarding-view-phone-verification-template";

        this.#phoneCodeSendPath = PathUtils.getPathFromRelative(this.#phoneCodeSendPath);
        this.#phoneCodeVerifyPath = PathUtils.getPathFromRelative(this.#phoneCodeVerifyPath);

        this.#boundPasteHandler = this.#pasteHandler.bind(this);
        this.#boundInputHandler = this.#inputHandler.bind(this);
        this.#boundKeyDownHandler = this.#keyDownHandler.bind(this);
        this.#boundFocusHandler = this.#focusHandler.bind(this);

        this.#boundTickHandler = this.#tickHandler.bind(this);
        this.#boundTickFinishedHandler = this.#tickFinishedHandler.bind(this);
        this.#boundTimeHandler = this.#timeHandler.bind(this);
    }

    get phone() { return this.#phone; }
    set phone( value )
    {
        console.log("phone setter");
        if( StringUtils.isWhite( value ) === true )
        {
            throw new Error("Onboarding Error");
        }
        const test = this.#phoneRegex.test( value );
        if( test === true )
        {
            this.#phone = value;
            if( this.componentBuilt === true )
            {
                if( this.#recipient )
                {
                    /*
                    const start = this.#phone.substring(0, 2);
                    const len = this.#phone.length;
                    const end = this.phone.substring( len-5 );
                    const rec = start + "..." + end;
                    */
                    this.#recipient.innerHTML = FormatUtils.formatPhone(this.#phone);
                }
                this.#sendPhoneCode();
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
        this.#timeButton.enabled = false;
        
        super._buildComponent();

        if( this.#phone !== undefined )
        {
            if( this.#recipient )
            {
                /*
                const start = this.#phone.substring(0, 2);
                const len = this.#phone.length;
                const end = this.phone.substring( len-5 );
                const rec = start + "..." + end;
                */
                this.#recipient.innerHTML = FormatUtils.formatPhone(this.#phone);
            }
            this.#sendPhoneCode();
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
                newInput.focus()
                
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
            this.#verifyPhoneCode(tempCode);
        }
    }

    async #sendPhoneCode()
    {
        if( this.#phone === undefined ) { return; }
        try
        {
            const payload = {phone: this.#phone };
            const messageSent = await FetchUtils.POST( this.#phoneCodeSendPath, payload );

            this.#ticker = new AxialTickerBase();
            this.#ticker.timeMax = (2 * 60 * 1000);
            this.#ticker.addEventListener("tick", this.#boundTickHandler);
            this.#ticker.addEventListener("tickFinished", this.#boundTickFinishedHandler);
            this.#ticker.start();
        }
        catch(err)
        {

        }
    }
    
    async #verifyPhoneCode( code )
    {
        let validated = false;
        try
        {
            const payload = { phone: this.#phone, code: code };
            const response = await FetchUtils.POST( this.#phoneCodeVerifyPath, payload );
            if( response.status !== undefined && response.status === "ok" )
            {
                validated = true;
            }

        }
        catch( err )
        {
            console.log(err);
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

            const data = { phoneVerified: validated };
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
        const rs = String( Math.floor(delta / 60) ) + " : " + String( delta % 60 );
        this.#timeButton.text = rs;
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #tickFinishedHandler( event )
    {
        console.log("tick finished")
        this.#timeButton.text = "Envoyer";
        //this.#timeButton.
    }

    #timeHandler( event )
    {

    }
}

window.customElements.define("axial-onboarding-view-phone-verification", AxialOnboardingViewPhoneVerification);
export { AxialOnboardingViewPhoneVerification }