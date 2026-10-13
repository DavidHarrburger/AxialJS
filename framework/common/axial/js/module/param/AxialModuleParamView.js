"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialTabViewer } from "../../view/AxialTabViewer.js";

import { AxialParamViewQuote } from "./tabview/AxialParamViewQuote.js";
import { AxialParamViewCompany } from "./tabview/AxialParamViewCompany.js";

class AxialModuleParamView extends AxialModuleView
{
    /// elements
    /** @type { AxialTabViewer } */
    #tabViewer;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-module-param-view-template";
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
        
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#tabViewer = this.shadowRoot.getElementById("tabViewer");
        if( this.#tabViewer )
        {
            this.#tabViewer.addEventListener("indexChanged", this.#boundIndexChangedHandler );
        }
    }

    /** @type { CustomEvent } */
    #indexChangedHandler( event )
    {
        this.#updateCurrentParam();
    }

    updateCurrentParam()
    {
        this.#updateCurrentParam();
    }

    #updateCurrentParam()
    {
        const cv = this.#tabViewer.viewer.currentView;
        console.log( cv.holder );
        if( cv.holder === undefined ) { return; }
        const cards = cv.holder.getElementsByTagName("axial-card");
        console.log( cards );
        for( const card of cards )
        {
            const forms = card.getElementsByClassName("axial_form");
            for( const form of forms )
            {
                form.loadGetData();
            }
        }
    }
}

window.customElements.define("axial-module-param-view", AxialModuleParamView);
export { AxialModuleParamView }
