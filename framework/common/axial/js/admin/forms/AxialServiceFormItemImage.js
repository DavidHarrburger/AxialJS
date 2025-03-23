"use strict";

import { AxialServiceFormItem } from "./AxialServiceFormItem.js";
import { AxialUploadTask } from "../../form/AxialUploadTask.js";

class AxialServiceFormItemImage extends AxialServiceFormItem
{
    /// elements
    /** @type { HTMLInputElement } */
    #fileInput;

    /// vars
    /** @type { String } */
    #uploadPath;

    /** @type { AxialUploadTask } */
    #uploadTask;

    /** @type { String } */
    #uploadedFilePath;

    /// events
    /** @type { Function } */
    #boundFileInputChangeHandler

    constructor()
    {
        super();
        //this.classList.add("axial_service_form_item");
        this.template = "axial-service-form-item-image-template";
        this.#boundFileInputChangeHandler = this.#fileInputChangeHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-direction", "axial-field", "axial-upload-path" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-upload-path" )
        {
            this.#uploadPath = newValue;
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#fileInput = this.shadowRoot.getElementById("fileInput");
        if( this.#fileInput )
        {
            this.#fileInput.addEventListener("change", this.#boundFileInputChangeHandler);
        }
    }

    _checkValidity()
    {
        let finalValid = false;
        if( this.#fileInput && this.#fileInput.files[0] )
        {
            finalValid = true;
        }
        return finalValid;
    }

    _getItemAsObject()
    {
        let itemObject = {};

        itemObject.field = this.field;
        itemObject.value = this.#uploadedFilePath;

        return itemObject;
    }

    _fillItem( object )
    {
        this.#fillItem(object);
    }

    #fillItem( object )
    {
        console.log("#fillItem AxialServiceFormItemImage");
        console.log( object );
    }

    #fileInputChangeHandler( event )
    {
        console.log("display image");
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }

    async upload()
    {
        console.log("try to upload");
        try
        {
            const file = this.#fileInput.files[0];
            if( !file )
            {
                throw new Error("No file selected");
            }

            this.#uploadTask = new AxialUploadTask();
            this.#uploadTask.path = this.#uploadPath;
            this.#uploadTask.file = this.#fileInput.files[0];
            this.#uploadTask.public = true;

            const uploadResult = await this.#uploadTask.upload();
            console.log(uploadResult);
            this.#uploadedFilePath = uploadResult.path;
        }
        catch(err)
        {

        }
    }
}

window.customElements.define("axial-service-form-item-image", AxialServiceFormItemImage);
export { AxialServiceFormItemImage }