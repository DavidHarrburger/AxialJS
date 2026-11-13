"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialView } from "../view/AxialView.js";

class AxialOnboardingView extends AxialView
{
    /// vars
    /** @type { Boolean } */
    #isValidated = true;

    /** @type { Object } */
    #validatedData = {};

    /** @type { Boolean } */
    #saveCalled = false;

    /// elements
    /** @type { AxialServiceButton } */
    #nextButton;

    /** @type { AxialButton } */
    #backButton;

    /// events
    /** @type { Function } */
    #boundValidatedHandler;

    /** @type { Function } */
    #boundNextHandler;

    /** @type { Function } */
    #boundBackHandler;

    constructor()
    {
        super();
        this.#boundValidatedHandler = this.#validatedHandler.bind(this);
        this.#boundNextHandler = this.#nextHandler.bind(this);
        this.#boundBackHandler = this.#backHandler.bind(this);

        this.addEventListener("onboardingViewValidated", this.#boundValidatedHandler);
    }

    /**
     * @type { AxialServiceButton }
     * @readonly
     */
    get nextButton() { return this.#nextButton; }

    /**
     * @type { AxialButton }
     * @readonly
     */
    get backButton() { return this.#backButton; }

    /**
     * @type { Boolean }
     * @readonly
     */
    get isValidated() { return this.#isValidated; }

    _buildComponent()
    {
        this.#nextButton = this.shadowRoot.getElementById("nextButton");
        if( this.#nextButton )
        {
            this.#nextButton.enabled = false;
        }

        this.#backButton = this.shadowRoot.getElementById("backButton");

        super._buildComponent();
    }

    #validatedHandler( event )
    {
        const validated = event.detail.validated;
        this.#validatedData = {}; // reinit each time
        
        // avoid falsy / truthy
        if( validated === true )
        {
            this.#isValidated = true;
            this.#nextButton.enabled = true;
            this.#nextButton.addEventListener("click", this.#boundNextHandler);
            const data = event.detail.data;
            if( data !== undefined )
            {
                this.#validatedData = data;
            }
        }
        else
        {
            this.#isValidated = false;
            this.#nextButton.enabled = false;
            this.#nextButton.removeEventListener("click", this.#boundNextHandler);   
        }
    }

    #nextHandler( event )
    {
        console.log( "next clicked")
        if( this.#isValidated === true )
        {
            console.log( "check pass")
            this.#nextButton.removeEventListener("click", this.#boundNextHandler);
            this.#nextButton.enabled = false;
            this.#nextButton.loading = true;
            const onboardingEvent = new CustomEvent( "onboardingViewSave", { bubbles: true, composed: true, detail: { validatedData: this.#validatedData } } );
            this.dispatchEvent( onboardingEvent );
        }
    }

    #backHandler( event )
    {
        this.#backButton.removeEventListener("click", this.#boundBackHandler);
        const onboardingEvent = new CustomEvent( "onboardingViewBack", { bubbles: true, composed: true } );
        this.dispatchEvent( onboardingEvent );
    }

    /**
     * 
     * @deprecated
     */
    _dispatchSaveOnce()
    {
        if( this.#saveCalled === true ) { return; }
        this.#saveCalled = true;

        const onboardingEvent = new CustomEvent( "onboardingViewSave", { bubbles: true, composed: true, detail: { validatedData: this.#validatedData } } );
        this.dispatchEvent( onboardingEvent );
    }

    _onBackwardEntering( event )
    {
        // ensure the listener is removed
        if( this.#nextButton )
        {
            this.#nextButton.removeEventListener("click", this.#boundNextHandler);
            this.#nextButton.loading = false;
            this.#nextButton.enabled = true;
            this.#nextButton.addEventListener("click", this.#boundNextHandler);
        }

        if( this.#backButton )
        {
            this.#backButton.removeEventListener("click", this.#boundBackHandler);
        }
    }

    _onForwardEntering( event )
    {
        if( this.#backButton )
        {
            this.#backButton.addEventListener("click", this.#boundBackHandler);
        }
    }
}

window.customElements.define("axial-onboarding-view", AxialOnboardingView);
export { AxialOnboardingView }