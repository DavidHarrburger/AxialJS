"use strict";

import { AxialCard } from "../AxialCard.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialButton } from "../../button/AxialButton.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { DomUtils } from "../../utils/DomUtils.js";

class AxialCardWelcomeUser extends AxialCard
{
    /// vars
    /** @type { String } */
    #apiSimulatorNameGetPath = "./api/nathan/names";

    /** @type { String } */
    #apiProjectsHasGetPath = "./api/projects/has";

    /// elements
    /** @type { AxialButton } */
    #projectButton;

    /** @type { HTMLElement } */
    #names;

    /** @type { HTMLElement } */
    #sims;

    /// events
    /** @type { Function } */
    #boundProjectHandler;

    /// axial
    /** @type { Function } */
    #boundAxialUserReadyHandler;

    constructor()
    {
        super();
        this.template = "axial-card-welcome-user-template";

        this.#apiSimulatorNameGetPath = PathUtils.getPathFromRelative( this.#apiSimulatorNameGetPath );
        this.#apiProjectsHasGetPath = PathUtils.getPathFromRelative( this.#apiProjectsHasGetPath );

        this.#boundProjectHandler = this.#projectHandler.bind(this);
        this.#boundAxialUserReadyHandler = this.#axialUserReadyHandler.bind(this);
        
        window.addEventListener( "axialUserReady", this.#boundAxialUserReadyHandler );
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#names = this.shadowRoot.getElementById("names");
        this.#sims = this.shadowRoot.getElementById("sims");
        
        this.#projectButton = this.shadowRoot.getElementById("projectButton");
        if( this.#projectButton )
        {
            this.#projectButton.addEventListener("click", this.#boundProjectHandler);
        }

        //this.loadGetData();
        
    }

    async loadGetData()
    {

        const simNames = await FetchUtils.GET( this.#apiSimulatorNameGetPath );
        DomUtils.cleanElement( this.#sims );
        for( const simName of simNames.content )
        {
            if( simName.active === false ) { continue; }
            const li = document.createElement("li");
            li.innerHTML = simName.title;
            this.#sims.appendChild( li );
        }

        const hasProjects = await FetchUtils.GET( this.#apiProjectsHasGetPath );
        const count = hasProjects.content;
        if( count === 0 )
        {
            this.#projectButton.text = "Créer mon premier projet";
        }
        else
        {
            this.#projectButton.text = "Accéder à mes projets";
        }

    }

    _onGetResponse()
    {
        super._onGetResponse();
    }

    #projectHandler( event )
    {
        window.AXIAL.gotoView( "toggleProject" );
    }

    #axialUserReadyHandler( event )
    {
        const U = event.detail.user;
        if( this.title )
        {
            this.title.innerHTML = `Bonjour ${U?.first_name}`;
        }

        if( this.content )
        {
            
        }
    }
}

window.customElements.define("axial-card-welcome-user", AxialCardWelcomeUser);
export { AxialCardWelcomeUser }