"use strict";

import { AxialConsentManager } from "./AxialConsentManager.js";
import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialButton } from "../button/AxialButton.js";

class AxialConsentOverlay extends AxialOverlayBase
{
    /// elements
    /** @type { AxialButton } */
    #decline;

    /** @type { AxialButton } */
    #accept;

    /// events
    /** @type { Function } */
    #boundDeclineHandler;

    /** @type { Function } */
    #boundAcceptHandler;

    constructor()
    {
        super();

        this.classList.add("axial_consent_overlay");
        this.template = "axial-consent-overlay-template";

        this.#boundDeclineHandler = this.#declineHandler.bind(this);
        this.#boundAcceptHandler = this.#acceptHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.displayMode = "window";
        this.position = "bottom-right";
        this.isModal = true;

        this.#decline = this.shadowRoot.getElementById("decline");
        this.#accept = this.shadowRoot.getElementById("accept");

        if( this.#decline )
        {
            this.#decline.addEventListener("click", this.#boundDeclineHandler);
        }

        if( this.#accept )
        {
            this.#accept.addEventListener("click", this.#boundAcceptHandler);
        }
    }

    #declineHandler( event )
    {
        AxialConsentManager.setConsent( false );
        this.hide();
    }

    #acceptHandler( event )
    {
        AxialConsentManager.setConsent( true );
        this.hide();
    }
}

window.customElements.define("axial-consent-overlay", AxialConsentOverlay);
export { AxialConsentOverlay }