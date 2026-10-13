"use strict";

import { AxialSimulatorStep } from "../AxialSimulatorStep.js";
import { AxialQuote } from "../../quotes/AxialQuote.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";

class AxialSimulatorStepFinal extends AxialSimulatorStep
{
    /// vars
    /** @type { Array } */
    #maps;

    /** @type { String } */
    #meetingRequestPath = "./api/meeting/request";

    /** @type { Object } */
    #simulationObject;

    /// elements
    /** @type { AxialQuote } */
    #quote;

    /** @type { HTMLElement } */
    #finalPrice;

    /** @type { AxialButton } */
    #backButton;

    /** @type { AxialServiceButton } */
    #finalButton;

    /// events
    /** @type { Function } */
    #boundQuoteComputedHandler;

    /** @type { Function } */
    #boundBackHandler;

    /** @type { Function } */
    #boundFinalHandler;

    constructor()
    {
        super();
        this.template = "axial-simulator-step-final-template";
        this.stepName = "AxialSimulatorStepFinal";
        this.#boundQuoteComputedHandler = this.#quoteComputedHandler.bind(this);
        this.#meetingRequestPath = PathUtils.getPathFromRelative( this.#meetingRequestPath );

        this.#boundBackHandler = this.#backHandler.bind(this);
        this.#boundFinalHandler = this.#finalHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#quote = this.shadowRoot.getElementById("quote");
        if( this.#quote )
        {
            this.#quote.addEventListener("quoteComputed", this.#boundQuoteComputedHandler );
        }
        this.#finalPrice = this.shadowRoot.getElementById("finalPrice");

        this.#backButton = this.shadowRoot.getElementById("backButton");
        if( this.#backButton )
        {
            this.#backButton.addEventListener( "click", this.#boundBackHandler );
        }

        this.#finalButton = this.shadowRoot.getElementById("finalButton");
        if( this.#finalButton )
        {
            this.#finalButton.addEventListener("click", this.#boundFinalHandler );
        }
    }

    get maps() { return this.#maps; }
    set maps( value )
    {
        // TODO control here
        this.#maps = value;
        this.#quote.data = this.#maps;
    }

    get simulationObject() { return this.#simulationObject; }
    set simulationObject( value )
    {
        // TODO control here
        this.#simulationObject = value;
    }

    clearQuote()
    {

    }

    buildQuote()
    {

    }

    #quoteComputedHandler( event )
    {
        this.#finalButton.enabled = true;
        this.#finalButton.loading = false;
        const prices = event.detail;
        if( this.#finalPrice )
        {
            this.#finalPrice.innerHTML = Number(prices.totalTTC).toLocaleString( undefined, {minimumFractionDigits:2, maximumFractionDigits:2 } ) + " € TTC";
        }

    }

    #finalHandler( event )
    {
        /*
        this.#backButton.enabled = false;
        this.#finalButton.enabled = false;
        this.#finalButton.loading = true;
        this.#sendMeetingRequest();
        */
        const popup = AxialPopupManager.getPopupById("bookingPopup");
        popup.show();
    }

    async #sendMeetingRequest()
    {
        console.log( "sending");
        try
        {
            const meetingRequestInfo = this.#simulationObject;
            const response = await FetchUtils.POST( this.#meetingRequestPath, meetingRequestInfo );
            window.AXIAL.notify("Un email vous a été envoyé et nous avons bien été informé de votre demande. Nous vous contactons dans les plus brefs délais.");
        }
        catch(err)
        {
            console.log(err);
            window.AXIAL.notify("Une erreur s'est produite. Merci de bien vuloir contacter le support.");
        }
        finally
        {
            this.#backButton.enabled = true;
            this.#finalButton.loading = false;
        }
    }

    #backHandler( event )
    {
        AxialPopupManager.currentPopup.hide();
    }

}

window.customElements.define("axial-simulator-step-final", AxialSimulatorStepFinal);
export { AxialSimulatorStepFinal }