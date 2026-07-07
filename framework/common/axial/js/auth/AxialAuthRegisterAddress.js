"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { PathUtils } from "../utils/PathUtils.js";
import { CryptoUtils } from "../utils/CryptoUtils.js";
import { AxialTogglePasswordButton } from "../button/AxialTogglePasswordButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialToggleCheck } from "../button/AxialToggleCheck.js";

class AxialAuthRegisterAddress extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #path = "./api/auth/signup";

    /** @type { String } */
    #emailCheckPath =  "./api/auth/email/check";

    /** @type { RegExp } */
    #lowerRegex = /[a-z]/;

    /** @type { RegExp } */
    #upperRegex = /[A-Z]/;

    /** @type { RegExp } */
    #numberRegex = /[0-9]/;

    /** @type { RegExp } */
    #specialRegex = /[!@#$%&*()-_=+?]/;

    /// elements

    /** @type { HTMLInputElement } */
    #firstname;

    /** @type { HTMLInputElement } */
    #lastname;

    /** @type { HTMLInputElement } */
    #email;

    /** @type { HTMLInputElement } */
    #phone;

    /** @type { HTMLInputElement } */
    #address;

    /** @type { HTMLInputElement } */
    #zip;

    /** @type { HTMLInputElement } */
    #city;

    /** @type { HTMLInputElement } */
    #password;

    /** @type { AxialTogglePasswordButton } */
    #passwordToggle;

    /** @type { AxialButton } */
    #generateButton;

    /** @type { AxialToggleCheck } */
    #legalToggle;

    /** @type { AxialServiceButton } */
    #createButton;

    /** @type { HTMLElement } */
    #lowerPass;

    /** @type { HTMLElement } */
    #upperPass;

    /** @type { HTMLElement } */
    #numberPass;

    /** @type { HTMLElement } */
    #specialPass;

    /** @type { HTMLElement } */
    #countPass;

    /// events
    /** @type { Function } */
    #boundCreateButtonHandler;

    /** @type { Function } */
    #boundPasswordToggleHandler;

    /** @type { Function } */
    #boundInputChangeHandler;

    /** @type { Function } */
    #boundPassInputHandler;

    /** @type { Function } */
    #boundGenerateButtonHandler;

    /** @type { Function } */
    #boundEmailFocusOutHandler;

    /** @type { Function } */
    #boundLegalToggleHandler;


    constructor()
    {
        super();
        this.classList.add("axial_auth_register");
        this.template = "axial-auth-register-address-template";

        this.#path = PathUtils.getPathFromRelative( this.#path );
        this.#emailCheckPath = PathUtils.getPathFromRelative( this.#emailCheckPath );

        this.#boundPasswordToggleHandler = this.#passwordToggleHandler.bind(this);
        this.#boundInputChangeHandler = this.#inputChangeHandler.bind(this);
        this.#boundPassInputHandler = this.#passInputHandler.bind(this);
        this.#boundCreateButtonHandler = this.#createButtonHandler.bind(this);
        this.#boundGenerateButtonHandler = this.#generateButtonHandler.bind(this);
        this.#boundEmailFocusOutHandler = this.#emailFocusOutHandler.bind(this);
        this.#boundLegalToggleHandler = this.#legalToggleHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#firstname = this.shadowRoot.getElementById("firstname");
        this.#lastname = this.shadowRoot.getElementById("lastname");
        
        this.#email = this.shadowRoot.getElementById("email");
        this.#phone = this.shadowRoot.getElementById("phone");

        this.#address = this.shadowRoot.getElementById("address");
        this.#zip = this.shadowRoot.getElementById("zip");
        this.#city = this.shadowRoot.getElementById("city");

        this.#password = this.shadowRoot.getElementById("password");
        this.#passwordToggle = this.shadowRoot.getElementById("passwordToggle");
        this.#generateButton = this.shadowRoot.getElementById("generateButton");

        this.#legalToggle = this.shadowRoot.getElementById("legalToggle");
        
        this.#createButton = this.shadowRoot.getElementById("createButton");

        this.#lowerPass = this.shadowRoot.getElementById("lowerPass");
        this.#upperPass = this.shadowRoot.getElementById("upperPass");
        this.#numberPass = this.shadowRoot.getElementById("numberPass");
        this.#specialPass = this.shadowRoot.getElementById("specialPass");
        this.#countPass = this.shadowRoot.getElementById("countPass");

        if( this.#firstname ) { this.#firstname.addEventListener("change", this.#boundInputChangeHandler); }
        if( this.#lastname ) { this.#lastname.addEventListener("change", this.#boundInputChangeHandler); }
        if( this.#phone ) { this.#phone.addEventListener("change", this.#boundInputChangeHandler); }
        if( this.#address ) { this.#address.addEventListener("change", this.#boundInputChangeHandler); }
        if( this.#zip ) { this.#zip.addEventListener("change", this.#boundInputChangeHandler); }
        if( this.#city ) { this.#city.addEventListener("change", this.#boundInputChangeHandler); }

        if( this.#email )
        {
            this.#email.addEventListener("change", this.#boundInputChangeHandler);
            this.#email.addEventListener("focusout", this.#boundEmailFocusOutHandler);
        }

        if( this.#password )
        {
            this.#password.addEventListener("input", this.#boundPassInputHandler);
            this.#password.addEventListener("change", this.#boundInputChangeHandler);
        }

        if( this.#passwordToggle )
        {
            this.#passwordToggle.addEventListener("toggleChanged", this.#boundPasswordToggleHandler);
        }

        if( this.#legalToggle )
        {
            this.#legalToggle.addEventListener("toggleChanged", this.#boundLegalToggleHandler);
        }

        if( this.#createButton )
        {
            this.#createButton.enabled = false;
            this.#createButton.addEventListener("click", this.#boundCreateButtonHandler);
        }

        if( this.#generateButton )
        {
            this.#generateButton.addEventListener("click", this.#boundGenerateButtonHandler);
        }
    }

    #passwordToggleHandler( event )
    {
        if( this.#password )
        {
            this.#password.type = this.#passwordToggle.selected === true ? "text": "password";
        }
    }

    #inputChangeHandler( event )
    {
        this.#checkValidity();
    }

    #passInputHandler( event )
    {
        this.#checkPassword();
    }

    #checkPassword()
    {
        const tempPass = this.#password.value;
        console.log( tempPass );

        const lower = this.#lowerRegex.test(tempPass);
        const upper = this.#upperRegex.test(tempPass);
        const number = this.#numberRegex.test(tempPass);
        const special = this.#specialRegex.test(tempPass);
        const count = tempPass.length >= 12;
        
        console.log(lower, upper, number, special, count);

        //this.#lowerPass.style.fontWeight = lower === true ? 500 : 400;
        //this.#upperPass.style.fontWeight = upper === true ? 500 : 400;
        //this.#numberPass.style.fontWeight = number === true ? 500 : 400;
        //this.#specialPass.style.fontWeight = special === true ? 500 : 400;
        //this.#countPass.style.fontWeight = count === true ? 500 : 400;

        if( lower === true && 
            upper === true &&
            number === true && 
            special === true && 
            count === true )
        {
            return true;
        } else { return false; }
    }

    #checkValidity()
    {
        const firstNameValid = this.#firstname.validity.valid;
        const lastNameValid = this.#lastname.validity.valid;

        const emailValid = this.#email.validity.valid;
        const passValid = this.#checkPassword();

        const telValid = this.#phone.validity.valid;

        const addressValid = this.#address.validity.valid;
        const zipValid = this.#zip.validity.valid;
        const cityValid = this.#city.validity.valid;

        const legalValid = this.#legalToggle.selected;
        console.log( firstNameValid, lastNameValid, emailValid, passValid, telValid, addressValid, zipValid, cityValid);

        if( emailValid === true && 
            passValid === true && 
            firstNameValid === true && 
            lastNameValid === true && 
            addressValid === true &&
            zipValid === true &&
            cityValid === true &&
            legalValid === true )
        {
            this.#createButton.enabled = true;
        }
        else
        {
            this.#createButton.enabled = false;
        }
    }

    #createButtonHandler( event )
    {
        this.#createButton.enabled = false;
        this.#createButton.loading = true;
        this.#sendRegistration();
    }

    #generateButtonHandler( event )
    {
        this.#passwordToggle.selected = true;
        this.#password.type = "text";
        this.#password.value = CryptoUtils.generatePassword(16);
    }

    #emailFocusOutHandler( event )
    {
        if( this.#email.validity.valid === false ) { return; }
        this.#checkEmail();
    }

    #legalToggleHandler( event )
    {
        console.log("legal toggle check")
        this.#checkValidity();
    }

    async #checkEmail()
    {
        try
        {
            const infos =
            {
                email: this.#email.value
            };
            const response = await fetch( this.#emailCheckPath, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            console.log(json);

        }
        catch( err )
        {
            console.log(err);
            
        }
        finally
        {
            //this.#clearForm();
            
        }
    }

    async #sendRegistration()
    {
        try
        {
            const infos =
            {
                first_name: this.#firstname.value,
                last_name: this.#lastname.value,
                email: this.#email.value,
                password: this.#password.value
            };
            const response = await fetch( this.#path, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            console.log(json);
            
            if( json )
                {
                    if( json.status && json.status === "ok" )
                    {
                        const registerSuccessEvent = new CustomEvent("registerSuccess", { detail: json } );
                        this.dispatchEvent(registerSuccessEvent);
                    }
                }
                else
                {
                    const registerErrorEvent = new CustomEvent("registerError");
                    this.dispatchEvent(verificationErrorEvent);
                }

        }
        catch( err )
        {
            console.log(err);
            const registerErrorEvent = new CustomEvent("registerError");
            this.dispatchEvent(registerErrorEvent);
        }
        finally
        {
            //this.#clearForm();
            
        }
    }
}

window.customElements.define("axial-auth-register-address", AxialAuthRegisterAddress);
export { AxialAuthRegisterAddress }