"use strict";

import { AxialForm } from "../../forms/AxialForm.js";
import { AxialModuleView } from "../../view/AxialModuleView.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleProfileView extends AxialModuleView
{
    /// var
    /** @type { String } */
    #apiUserGetPath = "./api/user/get";

    /** @type { String } */
    #apiUserUpdatePath = "./api/user/update";

    /// elements
    /** @type { AxialForm } */
    #profileForm;

    /// events
    /** @type { Function } */
    #boundFormSuccessHandler;

    constructor()
    {
        super();
        this.template = "axial-module-profile-view-template";
        this.#boundFormSuccessHandler = this.#formSuccesHandler.bind(this);
        this.#apiUserGetPath = PathUtils.getPathFromRelative( this.#apiUserGetPath );
        this.#apiUserUpdatePath = PathUtils.getPathFromRelative( this.#apiUserUpdatePath );
        this.getPath = this.#apiUserGetPath;
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#profileForm = this.shadowRoot.getElementById("profileForm");
        if( this.#profileForm )
        {
            this.#profileForm.postPath = this.#apiUserUpdatePath;
            this.#profileForm.addEventListener("serviceSuccess", this.#boundFormSuccessHandler);

        }
    }

    _prepareGetData()
    {
        return this.getPath;
    }

    _onGetResponse()
    {
        console.log("get response in profile view")
        const formObject = this.getData.content;
        if( this.#profileForm )
        {
            this.#profileForm._fillForm(formObject);
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #formSuccesHandler( event )
    {
        window.AXIAL.notify("Les modifications de votre profil on été enregistrées avec succès");
    }

}
window.customElements.define("axial-module-profile-view", AxialModuleProfileView);
export { AxialModuleProfileView }