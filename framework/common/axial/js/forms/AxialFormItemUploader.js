"use strict";

import { AxialFileUploader } from "../upload/AxialFileUploader.js";
import { AxialFormItem } from "./AxialFormItem.js";

class AxialFormItemUploader extends AxialFormItem
{
    /** @type { AxialFileUploader } */
    #uploader;

    /** @type { Function } */
    #boundUploaderReadyHandler;

    constructor()
    {
        super();
        this.template = "axial-form-item-uploader-template";
        this.#boundUploaderReadyHandler = this.#uploaderReadyHandler.bind(this);
    }

    /**
     * @type { Boolean }
     * @readonly
     */
    get canUpload() { return this.#uploader.canUpload; }

    async upload()
    {
        await this.#uploader.uploadFile();
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#uploader = this.shadowRoot.getElementById("uploader");
        this.#uploader.addEventListener("uploadReady", this.#boundUploaderReadyHandler );
    }

    _checkValidity()
    {
        if( this.#uploader )
        {
            return this.#uploader.canUpload;
        }
        return true;
    }

    _getItemAsObject()
    {
        let itemObject = {};

        itemObject.field = this.field;
        itemObject.value = this.#uploader._id;
        console.log(itemObject);

        return itemObject;
    }

    #uploaderReadyHandler( event )
    {
        const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
        this.dispatchEvent( formItemEvent );
    }
}

window.customElements.define("axial-form-item-uploader", AxialFormItemUploader);
export { AxialFormItemUploader }