"use strict";

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { AxialViewerBase } from "../../view/AxialViewerBase.js";
import { AxialViewerIndicator } from "../../view/AxialViewerIndicator.js";
import { AxialAdminEventViewCreation } from "./AxialAdminEventViewCreation.js";

class AxialAdminEventBuilder extends AxialServiceComponentBase
{
    /// elements
    /** @type { AxialViewerIndicator } */
    #indicator;

    /** @type { AxialViewerBase } */
    #viewer;

    /// vars
    /** @type { String } */
    #_id;

    /** @type { Boolean } */
    #initialized = false;

    /// events
    /** @type { Function } */
    #boundEventStepCompletedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_event_builder");
        this.template = "axial-admin-event-builder-template";
        this.#boundEventStepCompletedHandler = this.#eventStepCompletedHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#indicator = this.shadowRoot.getElementById("indicator");
        this.#viewer = this.shadowRoot.getElementById("viewer");
    }


    /**
     * 
     * @param { CustomEvent } event 
     */
    #eventStepCompletedHandler( event )
    {
        console.log( "eventStepCompleted" );
        if( event.detail._id )
        {
            this.#_id = event.detail._id;
            if( this.#viewer )
            {
                this.#viewer.next();
            }
        }
    }

    /**
     * Funckin' workaround on load
     */
    init()
    {
        if( this.#initialized === true ) { return; }
        this.#initialized = true;
        
        if( this.#viewer )
        {
            this.#indicator.viewer = this.#viewer;
            const views = this.#viewer.allViews;
            for( const view of views)
            {
                view.addEventListener("eventStepCompleted", this.#boundEventStepCompletedHandler);
                if( view.init )
                {
                    view.init();
                }
            }
        }
        
    }
}

window.customElements.define("axial-admin-event-builder", AxialAdminEventBuilder);
export { AxialAdminEventBuilder }