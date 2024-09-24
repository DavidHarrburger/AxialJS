"use strict"

import { AxialComponentBase } from "../../core/AxialComponentBase.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialToggleSwitch } from "../../button/AxialToggleSwitch.js"
import { AxialUploadTask } from "../../form/AxialUploadTask.js";


class AxialAdminMediasUploader extends AxialComponentBase
{
    /// vars
    /** @type { AxialUploadTask } */
    #uploadTask;

    /** @type { String } */
    #localUploadPath = "../api/medias/upload";

    /// elements
    /** @type { HTMLInputElement } */
    #fileInput;

    /** @type { AxialToggleSwitch } */
    #switch;

    /** @type { AxialServiceButton } */
    #uploadButton;

    /// events
    /** @type { Function } */
    #boundFileInputChangeHandler;

    /** @type { Function } */
    #boundUploadButtonClickHandler

    constructor()
    {
        super();
        this.classList.add("axial_admin_medias_uploader");
        this.template = "axial-admin-medias-uploader-template";

        this.#boundFileInputChangeHandler = this.#fileInputChangeHandler.bind(this);
        this.#boundUploadButtonClickHandler = this.#uploadButtonClickHandler.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#fileInput = this.shadowRoot.getElementById("fileInput");
        if( this.#fileInput )
        {
            this.#fileInput.addEventListener("change", this.#boundFileInputChangeHandler);
        }

        this.#switch = this.shadowRoot.getElementById("switch");

        this.#uploadButton = this.shadowRoot.getElementById("uploadButton");
        if( this.#uploadButton )
        {
            this.#uploadButton.enabled = false;
            this.#uploadButton.addEventListener("click", this.#boundUploadButtonClickHandler);
        }
    }

    #fileInputChangeHandler( event )
    {
        // should be, no must be !!!
        if( this.#fileInput.files.length > 0 )
        {
            this.#uploadButton.enabled = true;
        }
    }


    async #uploadButtonClickHandler( event )
    {
        this.#uploadButton.enabled = false;
        this.#uploadButton.loading = true;

        this.#uploadTask = new AxialUploadTask();
        this.#uploadTask.path = this.#localUploadPath;
        this.#uploadTask.file = this.#fileInput.files[0];
        this.#uploadTask.public = this.#switch.selected;

        try
        {
            const uploadResult = await this.#uploadTask.upload();
            console.log(uploadResult);
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            this.#uploadButton.enabled = true;
            this.#uploadButton.loading = false;
        }

    }

}
window.customElements.define("axial-admin-medias-uploader", AxialAdminMediasUploader);
export { AxialAdminMediasUploader }