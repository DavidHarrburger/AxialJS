"use strict";

import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { DomUtils } from "../utils/DomUtils.js";
import { AxialIconButton } from "../button/AxialIconButton.js";
import { NatAxialTransparentButton } from "../nathan/NatAxialTransparentButton.js";

class AxialHelpOverlay extends AxialOverlayBase
{
    /** @type { HTMLElement } */
    #title;

    /** @type { AxialIconButton } */
    #closer;

    /** @type { HTMLElement } */
    #content;

    /** @type { Function } */
    #boundCloserHandler;

    constructor()
    {
        super();
        this.classList.add("axial_help_overlay");
        this.template = "axial-help-overlay-template";

        this.useObfuscator = true;
        this.isModal = true;

        this.displayMode = "center";
        this.offset = 0;
        this.transformDecay = 20;

        this.#boundCloserHandler = this.#closerHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#title = this.shadowRoot.getElementById("title");
        this.#content = this.shadowRoot.getElementById("content");
        this.#closer = this.shadowRoot.getElementById("closer");
        if( this.#closer )
        {
            this.#closer.addEventListener("click", this.#boundCloserHandler);
        }

        if( this.data !== undefined )
        {
            this.#updateOverlay();
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.componentBuilt === true )
        {
            this.#updateOverlay();
        }
    }

    #updateOverlay()
    {
        // reinit 
        this.#title.innerHTML = this.data.title;
        DomUtils.cleanElement( this.#content ); // we will add elements later
        this.#content.innerHTML = this.data.description;
        
    }

    #closerHandler( event )
    {
        this.hide();
    }
}

window.customElements.define("axial-help-overlay", AxialHelpOverlay);
export { AxialHelpOverlay }