"use strict";

import { AxialServiceFormItem } from "./AxialServiceFormItem.js";
import { AxialUploadTask } from "../upload/AxialUploadTask.js";
import { PathUtils } from "../utils/PathUtils.js";

class AxialServiceFormItemImage extends AxialServiceFormItem
{
    /// elements
    /** @type { HTMLInputElement } */
    #fileInput;

    /** @type { HTMLElement } */
    #placeholder;

    /** @type { HTMLImageElement } */
    #image;

    /// vars
    /** @type { Number } */
    #maxSize = 2000000;

    /** @type { FileReader } */
    #fileReader;

    /** @type { String } */
    #uploadPath;

    /** @type { AxialUploadTask } */
    #uploadTask;

    /** @type { String } */
    #uploadedFilePath;

    /// events
    /** @type { Function } */
    #boundFileInputChangeHandler;

    /** @type { Function } */
    #boundFileReaderLoadedHandler;

    constructor()
    {
        super();
        //this.classList.add("axial_service_form_item");
        this.template = "axial-service-form-item-image-template";

        this.#boundFileInputChangeHandler = this.#fileInputChangeHandler.bind(this);
        this.#boundFileReaderLoadedHandler = this.#fileReaderLoadedHandler.bind(this);
    }

    static get observedAttributes()
    {
        return [ "axial-label", "axial-direction", "axial-field", "axial-upload-path", "axial-max-size" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-upload-path" )
        {
            this.#uploadPath = newValue;
            if( this.#uploadPath.indexOf("./") === 0 )
            {
                this.#uploadPath = PathUtils.getPathFromRelative(this.#uploadPath);
            }
        }

        if( name === "axial-max-size" && isNaN( Number(newValue) ) === false )
        {
            this.#maxSize = Number(newValue);
        }
    }

    /**
     * Check if everything is ok. Please note the _checkValidity ensure the form item to be valid from the form point of view not from the upload one.
     * This is because changing the image is never required in this scenerio
     * @type { Boolean }
     * @readonly
     */
    get canUpload()
    {
        let isUploadPossible = false;
        const file = this.#fileInput.files[0];
        if( file )
        {
            isUploadPossible = true;
        }
        return isUploadPossible;
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#fileInput = this.shadowRoot.getElementById("fileInput");
        if( this.#fileInput )
        {
            this.#fileInput.addEventListener("change", this.#boundFileInputChangeHandler);
        }

        this.#placeholder = this.shadowRoot.getElementById("placeholder");
        this.#image = this.shadowRoot.getElementById("image");
    }

    _checkValidity()
    {
        let finalValid = true;
        /// TO_CHECK : image not required
        /*
        if( (this.#fileInput && this.#fileInput.files[0]) || this.#image.src !== "" )
        {
            finalValid = true;
        }
        */
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
        const imageRelativePath = object[this.field];
        if( imageRelativePath !== "" )
        {
            const imageUrl = new URL( imageRelativePath, window.location.origin);
            this.#image.src = imageUrl.href;
            this.#image.style.display = "block";
        }
    }

    async #fileInputChangeHandler( event )
    {
        try
        {
            const file = this.#fileInput.files[0];

            if( file.size > this.#maxSize )
            {
                console.log("FILE SIZE ALERT TODO");
            }
            
            this.#fileReader = new FileReader();
            this.#fileReader.addEventListener("load", this.#boundFileReaderLoadedHandler);
            this.#fileReader.readAsDataURL(file);
    
            const formItemEvent = new CustomEvent("itemValidityChanged", { bubbles: true } );
            this.dispatchEvent( formItemEvent );
        }
        catch(err) { console.log(err); }
    }

    #fileReaderLoadedHandler( event )
    {
        if( this.#image )
        {
            this.#image.style.display = "block";
            this.#image.src = event.target.result;
        }
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
            this.#uploadTask.file = file;
            this.#uploadTask.public = true;

            const uploadResult = await this.#uploadTask.upload();
            console.log(uploadResult);
            this.#uploadedFilePath = uploadResult.path;
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-service-form-item-image", AxialServiceFormItemImage);
export { AxialServiceFormItemImage }