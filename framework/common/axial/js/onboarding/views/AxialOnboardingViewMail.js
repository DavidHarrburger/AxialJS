"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";
import { AxialTogglePasswordButton } from "../../button/AxialTogglePasswordButton.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { CryptoUtils } from "../../utils/CryptoUtils.js";

class AxialOnboardingViewMail extends AxialOnboardingView
{
    /// vars
    /** @type { String } */
    #emailCheckPath =  "./api/auth/email/check";

    /** @type { RegExp} */
    #emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    /** @type { RegExp } */
    #lowerRegex = /[a-z]/;

    /** @type { RegExp } */
    #upperRegex = /[A-Z]/;

    /** @type { RegExp } */
    #numberRegex = /[0-9]/;

    /** @type { RegExp } */
    #specialRegex = /[!@#$%&*()_=+?]/;

    /** @type { Number } */
    #passwordLength = 8;

    /** @type { String } */
    #passwordSpecial = "! @ # $ % & * ( ) _ = + ?";

    /** @type { Boolean } */
    #emailValid = false;

    /** @type { Boolean } */
    #passwordValid = false;

    /// elements
    /** @type { HTMLInputElement } */
    #emailInput;

    /** @type { HTMLlement } */
    #emailLegend;

    /** @type { HTMLInputElement } */
    #passwordInput;

    /** @type { AxialTogglePasswordButton } */
    #passwordToggle;

    /** @type { AxialButton } */
    //#generateButton;

    /** @type { HTMLlement } */
    #passwordLegend;

    /** @type { HTMLlement } */
    #liLength;

    /** @type { HTMLlement } */
    #liLower;

    /** @type { HTMLlement } */
    #liUpper;

    /** @type { HTMLlement } */
    #liNumber;

    /** @type { HTMLlement } */
    #liSpecial;

    /** @type { String } */
    #normalColor = "#4e4e4e";

    /** @type { String } */
    #validColor = ColorUtils.GREEN.mid_dark;

    /// events
    /** @type { Function } */
    #boundMailHandler;

    /** @type { Function } */
    #boundPasswordHandler;

    /** @type { Function } */
    #boundToggleHandler;

    /** @type { Function } */
    //#boundGenerateHandler;

    constructor()
    {
        super();
        this.template = "axial-onboarding-view-mail-template";

        this.#emailCheckPath = PathUtils.getPathFromRelative(this.#emailCheckPath);
        
        this.#boundMailHandler = this.#mailHandler.bind(this);
        this.#boundPasswordHandler = this.#passwordHandler.bind(this);
        this.#boundToggleHandler = this.#toggleHandler.bind(this);
        //this.#boundGenerateHandler = this.#generateHandler.bind(this);
    }

    _buildComponent()
    {
        this.#emailInput = this.shadowRoot.getElementById("emailInput");
        this.#emailInput.addEventListener("input", this.#boundMailHandler);
        this.#emailLegend = this.shadowRoot.getElementById("emailLegend");

        this.#passwordInput = this.shadowRoot.getElementById("passwordInput");
        this.#passwordInput.addEventListener("input", this.#boundPasswordHandler);
        this.#passwordLegend = this.shadowRoot.getElementById("passwordLegend");

        this.#passwordToggle = this.shadowRoot.getElementById("passwordToggle");
        this.#passwordToggle.addEventListener("toggleChanged", this.#boundToggleHandler);

        //this.#generateButton = this.shadowRoot.getElementById("generateButton");
        //this.#generateButton.addEventListener("click", this.#boundGenerateHandler);

        // checker
        this.#liLength = this.shadowRoot.getElementById("liLength");
        this.#liLower = this.shadowRoot.getElementById("liLower");
        this.#liUpper = this.shadowRoot.getElementById("liUpper");
        this.#liNumber = this.shadowRoot.getElementById("liNumber");
        this.#liSpecial = this.shadowRoot.getElementById("liSpecial");

        this.#liLength.innerHTML = `${this.#passwordLength} caractères minimum`;
        this.#liSpecial.innerHTML = `1 caractère spécial parmi ${this.#passwordSpecial}`;

        super._buildComponent();
    }

    #mailHandler( event )
    {
        const input = this.#emailInput.value.trim();
        const test = this.#emailRegex.test( input );
        if( test === true )
        {
            this.#checkEmail();
        }
        else
        {
            this.#emailLegend.style.display = "none";
            this.#emailValid = false;
            this.#checkValidity();
        }
    }

    async #checkEmail()
    {
        try
        {
            const infos =
            {
                email: this.#emailInput.value.trim()
            };
            const response = await FetchUtils.POST( this.#emailCheckPath, infos );
            this.#emailLegend.style.display = "block";
            if( response.exists === true )
            {
                this.#emailLegend.innerHTML = "Cet email est déjà enregistré";
                this.#emailLegend.style.color = ColorUtils.RED.mid_dark;
                this.#emailInput.style.backgroundColor = ColorUtils.RED.light;
                this.#emailInput.style.borderColor = ColorUtils.RED.mid_dark;
                this.#emailInput.classList.add("axial_input_invalid");
                this.#emailValid = false;
            }
            else
            {
                this.#emailLegend.innerHTML = "Cet email est valide";
                this.#emailLegend.style.color = ColorUtils.GREEN.mid_dark;
                this.#emailInput.style.backgroundColor = "#fff";
                this.#emailInput.style.borderColor = "#232323";
                this.#emailInput.classList.remove("axial_input_invalid");
                this.#emailValid = true;
            }

        }
        catch( err )
        {
            console.log(err);
            this.#emailValid = false;
            
        }
        finally
        {
            this.#checkValidity();
        }
    }

    #passwordHandler( event )
    {
        this.#checkPassword();
    }

    #checkPassword()
    {
        const tempPass = this.#passwordInput.value.trim();

        const lower = this.#lowerRegex.test(tempPass);
        const upper = this.#upperRegex.test(tempPass);
        const number = this.#numberRegex.test(tempPass);
        const special = this.#specialRegex.test(tempPass);
        const count = tempPass.length >= this.#passwordLength;

        this.#liLength.style.color  = count   === true ? this.#validColor : this.#normalColor;
        this.#liLower.style.color   = lower   === true ? this.#validColor : this.#normalColor;
        this.#liUpper.style.color   = upper   === true ? this.#validColor : this.#normalColor;
        this.#liNumber.style.color  = number  === true ? this.#validColor : this.#normalColor;
        this.#liSpecial.style.color = special === true ? this.#validColor : this.#normalColor;

        if( lower === true && 
            upper === true &&
            number === true && 
            special === true && 
            count === true )
        {
            this.#passwordValid = true;
            
        }
        else 
        {
            this.#passwordValid = false;
        }
        this.#checkValidity();
    }

    #checkValidity()
    {
        const validated = this.#passwordValid === true && this.#emailValid === true;
        const data = { email: this.#emailInput.value.trim(), password: this.#passwordInput.value.trim() }
        const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated, data: data } } );
        this.dispatchEvent(onboardingEvent);
    }

    #toggleHandler( event )
    {
        this.#passwordInput.type = this.#passwordToggle.selected === true ? "text": "password";
    }

    #generateHandler( event )
    {
        this.#passwordToggle.selected = true;
        this.#passwordInput.type = "text";
        this.#passwordInput.value = CryptoUtils.generatePassword(this.#passwordLength);

        this.#passwordInput.style.backgroundColor = "#fff";
        // this.#passwordInput.classList.remove("axial_auth_register_invalid");
        this.#passwordInput.style.borderColor = "#232323";

        this.#checkPassword();
    }

}

window.customElements.define("axial-onboarding-view-mail", AxialOnboardingViewMail);
export { AxialOnboardingViewMail }