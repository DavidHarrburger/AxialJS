"use strict";

import { AxialForm } from "../../forms/AxialForm.js";
import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleUserCreatePopup extends AxialModulePopup
{
    /// vars
    /** @type { String } */
    #userCreatePath = "./api/user/create";
    
    /// elements
    /** @type { AxialForm } */
    #form;

    /// events
    /** @type {Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();

        this.classList.add("axial_module_user_create_popup");
        this.template = "axial-module-user-create-popup-template";

        this.#userCreatePath = PathUtils.getPathFromRelative(this.#userCreatePath);
        
        this.position = "right";
        this.animation = "translate_left";
        this.useObfuscator = true;

        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
    }

    /**
     * @type { AxialForm }
     * @readonly
     */
    get form() { return this.#form; }

    _buildComponent()
    {
        super._buildComponent();
        this.#form = this.shadowRoot.getElementById("form");
        if( this.#form )
        {
            this.#form.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.#form )
        {
            if( this.data === undefined )
            {
                this.title = "Ajouter un client";
                this.#form.postPath = this.#userCreatePath;
                this.#form.clearForm();
            }
            else
            {
                this.#form._fillForm( this.data );
            }
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Utilisateur enregistré avec succès");
        //this.hide();
    }
}

window.customElements.define("axial-module-user-create-popup", AxialModuleUserCreatePopup);
export { AxialModuleUserCreatePopup }