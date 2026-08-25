"use strict";

import { AxialOverlayBase } from "../../overlay/AxialOverlayBase.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleOnboardingContactOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { String } */
    #apiOnboardingContactPath = "./api/onboarding/contact";

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { Array<HTMLInputElement> } */
    #inputs;

    /** @type { AxialButton } */
    #cancelButton;

    /** @type { AxialServiceButton } */
    #createButton;

    /// events
    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundFocusHandler;

    /** @type { Function } */
    #boundBlurHandler;

    /** @type { Function } */
    #boundCancelHandler;

    /** @type { Function } */
    #boundCreateHandler;

    constructor()
    {
        super();
        this.classList.add("axial_module_onboarding_contact_overlay");
        this.template = "axial-module-onboarding-contact-overlay-template";

        this.#apiOnboardingContactPath = PathUtils.getPathFromRelative(this.#apiOnboardingContactPath);

        this.displayMode = "center";
        this.isModal = true;
        this.useObfuscator = true;

        this.#boundInputHandler  = this.#inputHandler.bind(this);
        this.#boundFocusHandler  = this.#focusHandler.bind(this);
        this.#boundBlurHandler   = this.#blurHandler.bind(this);

        this.#boundCancelHandler = this.#cancelHandler.bind(this);
        this.#boundCreateHandler = this.#createHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#holder = this.shadowRoot.getElementById("holder");
        this.#inputs = Array.from( this.#holder.getElementsByTagName("input") );
        for( const input of this.#inputs )
        {
            input.addEventListener("input", this.#boundInputHandler);
            input.addEventListener("focus", this.#boundFocusHandler);
            input.addEventListener("blur", this.#boundBlurHandler);
        }

        this.#cancelButton = this.shadowRoot.getElementById("cancelButton");
        if( this.#cancelButton )
        {
            this.#cancelButton.addEventListener("click", this.#boundCancelHandler);
        }

        this.#createButton = this.shadowRoot.getElementById("createButton");
        if( this.#createButton )
        {
            this.#createButton.enabled = false;
            this.#createButton.addEventListener("click", this.#boundCreateHandler);
        }
    }

    _onShown()
    {
        if( this.#inputs && this.#inputs[1] ) { this.#inputs[0].focus(); }
    }

    #inputHandler( event )
    {
        console.log( event );
        /** @type { HTMLInputElement } */
        const input = event.target;
        if( input.validity.valid === true )
        {
            input.style.backgroundColor = "#fff";
            const index = this.#inputs.indexOf( input );
            const nextIndex = index + 1;
            if( nextIndex < 10 )
            {
                const nextInput = this.#inputs[nextIndex];
                nextInput.focus();
            }
            else
            {
                if( this.#checkValidity() === true )
                {
                    input.blur();
                }
            }
        }
        else
        {
            input.style.backgroundColor = ColorUtils.RED.light;
            input.select();
        }
    }

    #checkValidity()
    {
        let isValid = true;
        for( const num of this.#inputs )
        {
            if( num.validity.valid === false )
            {
                isValid = false;
                break;
            }
        }
        if( this.#createButton )
        {
            this.#createButton.enabled = isValid;
        }
        return isValid;
    }

    /**
     * 
     * @param { Event } event 
     */
    #focusHandler( event )
    {
        event.target.select();
    }

    #blurHandler( event )
    {
        this.#checkValidity(); // a bit diplicated but safer
    }

    #cancelHandler( event )
    {
        this.hide();
    }

    #createHandler( event )
    {
        this.#createButton.enabled = false;
        this.#createButton.loading = true;
        this.#cancelButton.enabled = false;
        this.#sendOnboardingMessage();
    }

    #getPhoneNumber()
    {
        let phone = "+33";
        for( let i = 1; i < 10; i++ )
        {
            const input = this.#inputs[i];
            phone = phone + input.value;
        }
        console.log( phone );
        return phone;
    }

    #reinit()
    {
        for( const input of this.#inputs )
        {
            input.value = "";
        }
        this.#createButton.enabled = true;
        this.#createButton.loading = false;
        this.#cancelButton.enabled = true;
    }

    async #sendOnboardingMessage()
    {
        try
        {
            const phone = this.#getPhoneNumber();
            const body = { tel: phone };
            const result = await FetchUtils.POST( this.#apiOnboardingContactPath, body );
            console.log( result );
            window.AXIAL.notify("youpi tra lala lala laaaaala");
        }
        catch(err)
        {
            console.log(err);
            window.AXIAL.notify("arf, raté");
        }
        finally
        {
            this.#reinit();
        }
    }
}

window.customElements.define("axial-module-onboarding-contact-overlay", AxialModuleOnboardingContactOverlay);
export { AxialModuleOnboardingContactOverlay }