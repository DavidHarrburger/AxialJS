"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialTogglePasswordButton } from "../button/AxialTogglePasswordButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { PathUtils } from "../utils/PathUtils.js";
import { AxialAccordionContainer } from "../accordion/AxialAccordionContainer.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { AxialButton } from "../button/AxialButton.js";
import { CryptoUtils } from "../utils/CryptoUtils.js";

class AxialAuthResetter extends AxialComponentBase
{
    /// vars
    /** @type { RegExp } */
    #lowerRegex = /[a-z]/;

    /** @type { RegExp } */
    #upperRegex = /[A-Z]/;

    /** @type { RegExp } */
    #numberRegex = /[0-9]/;

    /** @type { RegExp } */
    #specialRegex = /[!@#$%&*()-_=+?]/;

    /** @type { RegExp } */
    #emailReg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    /** @type { RegExp } */
    #numberInputRegex = /^\d+$/;

    /** @type { String } */
    #emailCheckPath =  "./api/auth/email/check";

    /** @type { String } */
    #passwordRequestPath =  "./api/auth/password/request";

    /** @type { String } */
    #passwordChangePath =  "./api/auth/password/change";

    /// elements
    /** @type { HTMLElement } */
    #message;

    /** @type { HTMLInputElement } */
    #emailInput;

    /** @type { HTMLInputElement } */
    #password;

    /** @type { AxialTogglePasswordButton } */
    #passwordToggle;

    /** @type { AxialServiceButton } */
    #sendCodeButton;

    /** @type { AxialAccordionContainer } */
    #messageContainer;

    /** @type { AxialAccordionContainer } */
    #codeContainer;

    /** @type { HTMLElement } */
    #holder;

    /** @type { Array<HTMLInputElement> } */
    #inputs;

    /** @type { AxialButton } */
    #generateButton;

    /** @type { AxialServiceButton } */
    #changeButton;

    /// events
    /** @type { Function } */
    #boundEmailFocusOutHandler;

    /** @type { Function } */
    #boundSendCodeHandler;

    /** @type { Function } */
    #boundPasteHandler;

    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundKeyDownHandler;

    /** @type { Function } */
    #boundGenerateHandler;

    /** @type { Function } */
    #boundChangePasswordHandler;

    /** @type { Function } */
    #boundPasswordToggleHandler;

    /** @type { Function } */
    #boundPasswordFocusOutHandler;

    /** @type { Function } */
    #boundPasswordInputHandler;
    
    constructor()
    {
        super();
        this.classList.add("axial_auth_resetter");
        this.template = "axial-auth-resetter-template";

        this.#emailCheckPath = PathUtils.getPathFromRelative(this.#emailCheckPath);
        this.#passwordRequestPath = PathUtils.getPathFromRelative(this.#passwordRequestPath);
        this.#passwordChangePath = PathUtils.getPathFromRelative( this.#passwordChangePath );

        this.#boundEmailFocusOutHandler = this.#emailFocusOutHandler.bind(this);
        this.#boundSendCodeHandler = this.#sendCodeHandler.bind(this);
        this.#boundGenerateHandler = this.#generateHandler.bind(this);
        this.#boundChangePasswordHandler = this.#changePasswordHandler.bind(this);
        this.#boundPasswordToggleHandler = this.#passwordToggleHandler.bind(this);

        this.#boundPasteHandler = this.#pasteHandler.bind(this);
        this.#boundInputHandler = this.#inputHandler.bind(this);
        this.#boundKeyDownHandler = this.#keyDownHandler.bind(this);

        this.#boundPasswordFocusOutHandler = this.#passwordFocusOutHandler.bind(this);
        this.#boundPasswordInputHandler = this.#passwordInputHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#emailInput = this.shadowRoot.getElementById("emailInput");
        this.#password = this.shadowRoot.getElementById("password");
        this.#sendCodeButton = this.shadowRoot.getElementById("sendCodeButton");
        this.#changeButton = this.shadowRoot.getElementById("changeButton");
        this.#message = this.shadowRoot.getElementById("message");
        this.#generateButton = this.shadowRoot.getElementById("generateButton");
        this.#passwordToggle = this.shadowRoot.getElementById("passwordToggle");

        this.#messageContainer = this.shadowRoot.getElementById("messageContainer");
        this.#codeContainer = this.shadowRoot.getElementById("codeContainer");

        this.#emailInput.addEventListener("focusout", this.#boundEmailFocusOutHandler);

        this.#generateButton.addEventListener("click", this.#boundGenerateHandler);
        
        this.#sendCodeButton.enabled = false;
        this.#sendCodeButton.addEventListener("click", this.#boundSendCodeHandler);

        this.#changeButton.enabled = false;
        this.#changeButton.addEventListener("click", this.#boundChangePasswordHandler);

        this.#passwordToggle.addEventListener("toggleChanged", this.#boundPasswordToggleHandler);

        this.#holder = this.shadowRoot.getElementById("holder");
        if( this.#holder )
        {
            this.#inputs = Array.from(  this.#holder.getElementsByTagName("input") );
            console.log(this.#inputs);
            for( const input of this.#inputs )
            {
                input.addEventListener("paste", this.#boundPasteHandler);
                input.addEventListener("input", this.#boundInputHandler);
                input.addEventListener("keydown", this.#boundKeyDownHandler);
            }
        }

        this.#password.addEventListener("input", this.#boundPasswordInputHandler);
        this.#password.addEventListener("focusout", this.#boundPasswordFocusOutHandler);

        const sp = new URL(window.location.href).searchParams;
        const emailValue = sp.get("m");
        console.log(emailValue);
        const emailValid = this.#emailReg.test( emailValue );
        if( emailValid === true )
        {
            this.#checkEmail(emailValue);
        }
        
    }

    #passwordToggleHandler( event )
    {
        if( this.#password )
        {
            this.#password.type = this.#passwordToggle.selected === true ? "text": "password";
        }
    }

    #emailFocusOutHandler( event )
    {
        if( this.#emailInput.validity.valid === true )
        {
            this.#checkEmail(this.#emailInput.value, true);
        }
        else
        {
            this.#sendCodeButton.enabled = false;
        }
    }

    /**
     * 
     * @param { String } email 
     * @param { Boolean } displayMessage 
     */
    async #checkEmail( email, displayMessage = false )
    {
        try
        {
            const lowerEmail = email.toLowerCase();
            const infos = { email: lowerEmail };
            const json = await FetchUtils.POST( this.#emailCheckPath, infos );
            console.log(json);
            if( json && json.status && json.status ==="ok" && json.exists && json.exists === true )
            {
                if( this.#emailInput.value !== lowerEmail )
                {
                    this.#emailInput.value = lowerEmail;
                }
                this.#sendCodeButton.enabled = true;
            }
            else
            {
                if( displayMessage === true )
                {
                    this.#message.innerHTML = "Cet email n'est pas enregistré. Vérifiez le mail entré ci-dessous."
                    this.#messageContainer.open();
                }
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #sendCodeHandler( event )
    {
        this.#emailInput.disabled = true;
        this.#emailInput.style.opacity = "0.5";
        this.#sendCodeButton.enabled = true;
        this.#sendCodeButton.loading = true;

        this.#sendPasswordRequest();
    }

    async #sendPasswordRequest()
    {
        try
        {
            const infos = { email: this.#emailInput.value.toLowerCase() }
            const json = await FetchUtils.POST( this.#passwordRequestPath, infos );
            console.log(json);
            if( json.status && json.status === "ok" )
            {
                this.#emailInput.disabled = true;
                this.#emailInput.style.opacity = "0.5";
                this.#sendCodeButton.enabled = false;
                this.#sendCodeButton.loading = false;
                this.#codeContainer.open();
            }
        }
        catch(err)
        {
            console.log(err);
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
        //console.log( event );
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
                nextInput.select()
            }
            else if( index === (this.#inputs.length - 1) )
            {
                input.blur();
            }
        }
        this.#checkNumAndPass();
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
                newInput.focus();
                
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
        const isValidData = this.#numberInputRegex.test(data) === true && data.length === this.#inputs.length;
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
        
        this.#checkNumAndPass();
    }

    #generateHandler( event )
    {
        this.#passwordToggle.selected = true;
        this.#password.type = "text";
        this.#password.value = CryptoUtils.generatePassword(16);

        this.#password.style.backgroundColor = "#fff";
        this.#password.classList.remove("axial_auth_register_invalid");
        this.#password.style.borderColor = "#232323";

        this.#checkNumAndPass();
    }

    #passwordFocusOutHandler( event )
    {
        this.#checkNumAndPass();
    }

    #passwordInputHandler( event )
    {
        this.#checkNumAndPass();
    }

    #changePasswordHandler( event )
    {
        for( const input of this.#inputs )
        {
            input.disabled = true;
            input.style.opacity = "0.5";
        }

        this.#password.disabled = true;
        this.#password.style.opacity = "0.5";

        this.#generateButton.enabled = false;

        this.#changeButton.enabled = false;
        this.#changeButton.loading = true;

        this.#sendNewPassword();
    }

    #checkNumAndPass()
    {
        // num inputs
        let tempCode = "";
        for( let i = 0; i < this.#inputs.length; i++ )
        {
            const input = this.#inputs[i];
            tempCode += input.value;
        }
        const isValidCode = this.#numberRegex.test(tempCode) === true && tempCode.length === this.#inputs.length;
        
        // password
        const tempPass = this.#password.value;

        const lower = this.#lowerRegex.test(tempPass);
        const upper = this.#upperRegex.test(tempPass);
        const number = this.#numberRegex.test(tempPass);
        const special = this.#specialRegex.test(tempPass);
        const count = tempPass.length >= 12;
        
        const isValidPass = ( lower === true && upper === true && number === true && special === true && count === true );

        const resetValid = (isValidCode === true && isValidPass === true);
        console.log("resetValid ", resetValid);

        this.#changeButton.enabled = resetValid;
    }

    async #sendNewPassword()
    {
        try
        {
            let tempCode = "";
            for( let i = 0; i < this.#inputs.length; i++ )
            {
                const input = this.#inputs[i];
                tempCode += input.value;
            }
            const email = this.#emailInput.value.toLowerCase();
            const newPass = this.#password.value;

            const infos =
            {
                email: email,
                code: tempCode,
                password: newPass
            };

            const json = await FetchUtils.POST( this.#passwordChangePath, infos );
            if( json.status && json.message )
            {
                this.#message.innerHTML = json.message;
                this.#messageContainer.open();

                if( json.status === "ok" )
                {
                    window.location.href = window.location.origin;
                }
                else
                {

                }
            }

        }
        catch(err)
        {
            console.log( err );
        }
        finally
        {
            this.#emailInput.disabled = false;
            this.#emailInput.value = "";

            this.#sendCodeButton.enabled = false;
            this.#sendCodeButton.loading = false;

            for( const input of this.#inputs )
            {
                input.disabled = false;
                input.style.opacity = "1";
                input.value = "";
            }

            this.#password.value = "";
            this.#password.disabled = false;
            this.#password.style.opacity = "1"
            
            this.#generateButton.enabled = true;

            this.#changeButton.loading = false;
            this.#changeButton.enabled = false;

            this.#codeContainer.close();
        }
    }
   
}

window.customElements.define("axial-auth-resetter", AxialAuthResetter);
export { AxialAuthResetter }