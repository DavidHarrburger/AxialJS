"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialToggleRadio } from "../button/AxialToggleRadio.js";
import { AxialToggleButtonGroup } from "../button/AxialToggleButtonGroup.js";
import { PathUtils } from "../utils/PathUtils.js";

class AxialAuthVerifyer extends AxialComponentBase
{
    /// var
    /** @type { String } */
    #sendPath = "./api/auth/code/send";

    /** @type { String } */
    #verificationPath = "./api/auth/code/verify";

    /** @type { RegExp } */
    #numberRegex = /^\d+$/;

    /// elements
    /** @type { AxialToggleButtonGroup } */
    #group;
    
    /** @type { HTMLElement} */
    #holder;

    /** @type { HTMLElement} */
    #recipient;

    /** @type { Array } */
    #inputs;

    /** @type { AxialServiceButton } */
    #sendButton;
    
    /// events
    /** @type { Function } */
    #boundGroupChangedHandler;

    /** @type { Function } */
    #boundSendButtonHandler;

    /** @type { Function } */
    #boundPasteHandler;

    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundFocusHandler;

    constructor()
    {
        super();
        this.classList.add("axial_auth_verifyer");
        this.template = "axial-auth-verifyer-template";

        this.#sendPath = PathUtils.getPathFromRelative(this.#sendPath);
        this.#verificationPath = PathUtils.getPathFromRelative(this.#verificationPath);

        this.#boundGroupChangedHandler = this.#groupChangedHandler.bind(this);
        this.#boundSendButtonHandler = this.#sendButtonHandler.bind(this);

        this.#boundPasteHandler = this.#pasteHandler.bind(this);
        this.#boundInputHandler = this.#inputHandler.bind(this);
        this.#boundFocusHandler = this.#focusHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#group = this.shadowRoot.getElementById("group");
        this.#group.forceSelection = true;
        
        this.#group.addEventListener("indexChanged", this.#boundGroupChangedHandler);

        this.#sendButton = this.shadowRoot.getElementById("sendButton");
        this.#sendButton.enabled = false;
        this.#sendButton.addEventListener("click", this.#boundSendButtonHandler);
        
        this.#recipient = this.shadowRoot.getElementById("recipient");
        
        this.#holder = this.shadowRoot.getElementById("holder");
        if( this.#holder )
        {
            this.#inputs = Array.from(  this.#holder.getElementsByTagName("input") );
            for( const input of this.#inputs )
            {
                input.addEventListener("paste", this.#boundPasteHandler);
                input.addEventListener("input", this.#boundInputHandler);
                //input.addEventListener("focus", this.#boundFocusHandler);
            }
        }
        //this.#inputs[0].focus();
        //this.#getVerificationCode();
    }

    #groupChangedHandler( event )
    {
        /** @type { AxialToggleRadio } */
        const toggle = this.#group.getSelectedToggle();
        console.log( toggle.value );

        this.#sendButton.enabled = true;
    }

    #sendButtonHandler( event )
    {
        this.#sendButton.enabled = false;
        this.#sendButton.loading = true;
        for( const toggle of this.#group.toggles )
        {
            toggle.enabled = false;
        }
        this.#getVerificationCode();
    }

    
    async #getVerificationCode()
    {
        try
        {
            /** @type { AxialToggleRadio } */
            const toggle = this.#group.getSelectedToggle();
            const infos =
            {
                method: toggle.value
            }; 
            const response = await fetch( this.#sendPath, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            console.log(json);

            
            if( json && json.recipient )
            {
                this.#recipient.innerHTML = json.recipient;
                this.#holder.style.display = "flex";
                this.#inputs[0].focus();
            }
            
        }
        catch(err)
        {
            console.log(err);
        }
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
            this.#checkVerificationCode(tempCode);
        }
    }

    async #checkVerificationCode( code )
    {
        try
        {
            /** @type { AxialToggleRadio } */
            const toggle = this.#group.getSelectedToggle();
            const infos = { code: code, method: toggle.value }; // we will see
            const response = await fetch( this.#verificationPath, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            if( json )
            {
                if( json.status && json.status === "ok" )
                {
                    if( json.uuid )
                    {
                        localStorage.setItem( "axial_auth_uuid", json.uuid );
                    }
                    const verificationSuccessEvent = new CustomEvent("verificationSuccess", { detail: json } );
                    this.dispatchEvent(verificationSuccessEvent);
                }
            }
            else
            {
                const verificationErrorEvent = new CustomEvent("verificationError");
                this.dispatchEvent(verificationErrorEvent);
            }
        }
        catch(err)
        {
            console.log(err);
            const verificationErrorEvent = new CustomEvent("verificationError");
            this.dispatchEvent(verificationErrorEvent);
        }
    }

    #focusHandler( event )
    {
        event.preventDefault();
    }

    /**
     * 
     * @param { InputEvent } event 
     */
    #inputHandler( event )
    {
        console.log( event );
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
}

window.customElements.define("axial-auth-verifyer", AxialAuthVerifyer);
export { AxialAuthVerifyer }