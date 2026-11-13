"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";
import { AxialProgressIndicator } from "../../loader/AxialProgressIndicator.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";

class AxialOnboardingViewCheckout extends AxialOnboardingView
{
    /// vars
    /** @type { String } */
    #sessionCreatePath = "./api/checkout/session/create";

    /** @type { String } */
    #sessionStatusPath = "./api/checkout/session/status";

    #keyPath = "./api/stripe/pkey";

    /** @type { Stripe } */
    #stripe;

    /** @type { Object } */ /// search for the checkout object in Stripe doc
    #checkout;

    /// elements
    /** @type { HTMLElement } */
    #formState;

    /** @type { HTMLElement } */
    #loadingState;

    /** @type { HTMLElement } */
    #nextState;

    /** @type { AxialProgressIndicator } */
    #indicator;

    /// events
    /** @type { Function} */
    #boundCheckoutCompletedHandler;

    /// WARNING TEMP
    /** @type { String } */
    #stripePublicKey;

    /** @type { String } */
    #customerId;

    /** @type { String } */
    #priceId;

    /** @type { String } */
    #sessionId;

    constructor()
    {
        super();
        this.template = "axial-onboarding-view-checkout-template";
        this.#sessionCreatePath = PathUtils.getPathFromRelative( this.#sessionCreatePath );
        this.#sessionStatusPath = PathUtils.getPathFromRelative( this.#sessionStatusPath );
        this.#boundCheckoutCompletedHandler = this.#checkoutCompletedHandler.bind(this);
        this.#keyPath = PathUtils.getPathFromRelative( this.#keyPath );
    }

    /**
     * @type { AxialProgressIndicator }
     * @readonly
     */
    get indicator() { return this.#indicator; }

    get customer() { return this.#customerId; }
    set customer( value )
    {
        this.#customerId = value;
    }

    get price() { return this.#priceId; }
    set price( value )
    {
        this.#priceId = value;
    }

    _buildComponent()
    {
        this.#formState = this.shadowRoot.getElementById("formState");
        this.#loadingState = this.shadowRoot.getElementById("loadingState");
        this.#nextState = this.shadowRoot.getElementById("nextState");
        this.#indicator = this.shadowRoot.getElementById("indicator");

        super._buildComponent();
    }

    async initCheckout()
    {
        await this.#initCheckout();
    }

    async #initCheckout()
    {
        //this.#indicator.show();
        const key = await FetchUtils.GET( this.#keyPath );
        if( key.key !== undefined ) { this.#stripePublicKey = key.key; }
        if( "Stripe" in window )
        {
            this.#stripe = new Stripe(this.#stripePublicKey);
        }

        const fetchClientSecret = async () =>
        {
            const payload = 
            {
                stripe_price_id: this.#priceId,
                stripe_customer_id: this.#customerId,
            }
            const json = await FetchUtils.POST( this.#sessionCreatePath, payload );
            this.#sessionId = json.id;
            return json.secret;
        }
        
        this.#checkout = await this.#stripe.createEmbeddedCheckoutPage( { fetchClientSecret, onComplete: this.#boundCheckoutCompletedHandler },  );

        this.#indicator.hide();
        this.#loadingState.style.display = "none";
        this.#formState.style.display = "block";

        this.#checkout.mount(this.#formState);
    }

    async #checkoutCompletedHandler( event )
    {
        console.log("checkout completed", this.#customerId);
        const path = this.#sessionStatusPath + "/" + this.#sessionId;
        const json = await FetchUtils.GET( path );
        console.log( json );

        if( json.session === "complete" && json.payement === "paid" )
        {
            //this.#checkout.destroy();
            this.#nextState.style.display = "block";
            const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: true, data: { final: "final" } } } );
            this.dispatchEvent(onboardingEvent);
        }
    }
}

window.customElements.define("axial-onboarding-view-checkout", AxialOnboardingViewCheckout);
export { AxialOnboardingViewCheckout }