"use strict";

import { AxialIconButton } from "../../button/AxialIconButton.js";
import { AxialModuleCreateProjectOverlay } from "../../module/projects/AxialModuleCreateProjectOverlay.js";
import { AxialModuleProjectPopup } from "../../module/projects/AxialModuleProjectPopup.js";
import { AxialModuleSelectProjectPopup } from "../../module/projects/AxialModuleSelectProjectPopup.js";
import { StringUtils } from "../../utils/StringUtils.js";

class AxialIconListButtonProject extends AxialIconButton
{
    /// vars
    /** @type { String } */
    #createdFor;

    /** @type { Array } */
    #projectsData;

    /** @type { String } */
    #username;

    /** @type { String } */
    #createProjectOverlayId = "createProjectOverlay";

    /** @type { String } */
    #selectProjectPopupId = "selectProjectPopup";

    /// elements
    /** @type { AxialModuleSelectProjectPopup } */
    #createProjectOverlay;

    /** @type { AxialModuleProjectPopup } */
    #selectProjectPopup;

    /// events
    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();

        this.iconName = "project";
        this.tooltipText = "Créer / Ouvrir les projets";

        this.#boundClickHandler = this.#clickHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#createProjectOverlay = document.getElementById( this.#createProjectOverlayId );
        this.#selectProjectPopup = document.getElementById( this.#selectProjectPopupId );

        this.addEventListener("click", this.#boundClickHandler);
    }

    get username() { return this.#username; }
    set username( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError("String required here");
        }
        this.#username = value;
    }

    get createdFor() { return this.#createdFor; }
    set createdFor( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError("String required here");
        }
        this.#createdFor = value;
        //console.log( this.#createdFor );
    }

    get projectsData() { return this.#projectsData; }
    set projectsData( value )
    {
        if( Array.isArray( value ) === false )
        {
            throw new TypeError("Array required here");
        }
        this.#projectsData = value;
        //console.log( this.#projectsData );
    }

    #clickHandler( event )
    {
        const pl = this.#projectsData.length;
        //console.log(pl);
        if( pl === 0 )
        {
            this.#createProjectOverlay.createdFor = this.#createdFor;
            this.#createProjectOverlay.show();
        }
        else
        {
            if( this.#username != undefined )
            {
                this.#selectProjectPopup.title = "Projets de " + this.#username;
            }
            this.#selectProjectPopup.createdFor = this.#createdFor;
            this.#selectProjectPopup.data = this.#projectsData;
            this.#selectProjectPopup.show();
        }
    }

}

window.customElements.define("axial-icon-list-button-project", AxialIconListButtonProject);
export { AxialIconListButtonProject }