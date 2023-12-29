"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialButton } from "../button/AxialButton.js";
import { AxialToggleCheck } from "../button/AxialToggleCheck.js";

class AxialContactForm extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #path = "";

    /** @type { String } */
    #defaultColor = "#232323";

    /** @type { String } */
    #errorColor = "#f00";

    /** @type { String } */
    #validColor = "#0f0";

    /// ui
    /** @type { HTMLInputElement } */
    #name;

    /** @type { HTMLInputElement } */
    #surname;

    /** @type { HTMLInputElement } */
    #email;

    /** @type { HTMLInputElement } */
    #tel;

    /** @type { HTMLInputElement } */
    #address;

    /** @type { HTMLInputElement } */
    #zip;

    /** @type { HTMLInputElement } */
    #city;

    /** @type { HTMLTextAreaElement } */
    #message;

    /** @type { AxialToggleCheck } */
    #toggle;

    /** @type { AxialButton } */
    #button;

    /** @type { Array<HTMLInputElement> } */
    #formElements = new Array();

    /// events
    /** @type { Function } */
    #boundFocusOutHandler;

    /** @type { Function } */
    #boundToggleHandler;

    /** @type { Function } */
    #boundButtonClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_contact_form");
        this.template = "axial-contact-form-template";

        this.#boundFocusOutHandler = this.#focusOutHandler.bind(this);
        this.#boundToggleHandler = this.#toggleHandler.bind(this);
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);
    }

    /**
     * Get or set the path to the login service / api
     * @type { String }
     */
    get path() { return this.#path; }
    set path( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#path = value;
    }

    connectedCallback()
    {
        super.connectedCallback();

        this.#path = this.getAttribute("axial-path");

        this.#name = this.shadowRoot.getElementById("name");
        this.#name.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#surname = this.shadowRoot.getElementById("surname");
        this.#surname.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#email = this.shadowRoot.getElementById("email");
        this.#email.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#tel = this.shadowRoot.getElementById("tel");
        this.#tel.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#address = this.shadowRoot.getElementById("address");
        this.#address.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#zip = this.shadowRoot.getElementById("zip");
        this.#zip.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#city = this.shadowRoot.getElementById("city");
        this.#city.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#message = this.shadowRoot.getElementById("message");
        this.#message.addEventListener("focusout", this.#boundFocusOutHandler);

        this.#formElements.push(this.#name, this.#surname, this.#email, this.#tel, this.#address, this.#zip, this.#city, this.#message);

        this.#toggle = this.shadowRoot.getElementById("toggle");
        this.#toggle.addEventListener("toggleChanged", this.#boundToggleHandler);

        this.#button = this.shadowRoot.getElementById("button");
    }

    #checkFormValidity()
    {
        let isValidForm = true;
        for( const element of this.#formElements )
        {
            const elementValid = element.validity.valid;
            if( elementValid === false )
            {
                isValidForm = false;
                break;
            }
        }

        if( this.#toggle.selected === false )
        {
            isValidForm = false;
        }

        if( isValidForm === true )
        {
            this.#button.style.opacity = "1";
            this.#button.style.pointerEvents = "auto";
            this.#button.addEventListener("click", this.#boundButtonClickHandler);
        }
        else
        {
            this.#button.style.opacity = "0.5";
            this.#button.style.pointerEvents = "none";
            this.#button.removeEventListener("click", this.#boundButtonClickHandler);
        }
    }

    /**
     * Check form field on focus out and change colors if required
     * @param { FocusEvent } event 
     */
    #focusOutHandler( event )
    {
        const element = event.target;
        const isValid = element.validity.valid;

        if( isValid === true )
        {
            element.style.borderColor = this.#validColor;
        }
        else
        {
            element.style.borderColor = this.#errorColor;
        }
        this.#checkFormValidity();
    }

    #toggleHandler( event )
    {
        this.#checkFormValidity();
    }

    #buttonClickHandler( event )
    {
        this.#button.removeEventListener("click", this.#boundButtonClickHandler);
        this.#button.style.opacity = "0.5";
        this.#button.style.pointerEvents = "none";
        this.#sendForm();
    }

    #clearForm()
    {
        for( const element of this.#formElements )
        {
            element.value = "";
            element.style.backgroundColor = "#fff";
            element.style.borderColor = this.#defaultColor;
        }
        this.#toggle.selected = false;
    }

    async #sendForm()
    {
        if( this.#path === "" )
        {
            throw new Error("AxialMessageForm.path is not defined");
        }

        const formSendingEvent = new CustomEvent("formSending");
        this.dispatchEvent(formSendingEvent);

        try
        {
            const infos =
            {
                name: this.#name.value,
                surname: this.#surname.value,
                email: this.#email.value,
                tel: this.#tel.value,
                address: this.#address.value,
                zip: this.#zip.value,
                city: this.#city.value,
                message: this.#message.value
            };
            const response = await fetch(this.#path, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json" } } );
            const json = await response.json();
            
            if( json )
            {
                const formSentEvent = new CustomEvent("formSent", { detail: { response: json} } );
                this.dispatchEvent(formSentEvent);
            }
        }
        catch( err )
        {
            console.log(err);
            const formErrorEvent = new CustomEvent("formError", { detail: { error: err} } );
            this.dispatchEvent(formErrorEvent);

        }
        finally
        {
            this.#clearForm();
        }
    }
}

window.customElements.define("axial-contact-form", AxialContactForm);
export { AxialContactForm }