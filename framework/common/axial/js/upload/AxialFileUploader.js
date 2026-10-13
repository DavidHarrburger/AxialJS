"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { PathUtils } from "../utils/PathUtils.js";
import { FileUtils } from "../utils/FileUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { StringUtils } from "../utils/StringUtils.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialButton } from "../button/AxialButton.js";

class AxialFileUploader extends AxialComponentBase
{
    /// vars
    /** @type { Number } */
    #maxFileSize = 5 * 1024 * 1024;

    /** @type { String } */
    #uploadFilePath = PathUtils.getPathFromRelative( "./api/file/upload");

    /** @type { String } */
    #getFilePath = PathUtils.getPathFromRelative( "./api/file/get/");

    /** @type { String } */
    #_id;

    /** @type { Boolean } */
    #reinitOnResponse = true;

    /** @type { Array } */
    #defaultAllowedUploads =
    [
        FileUtils.FILE_TYPES.PNG,
        FileUtils.FILE_TYPES.JPEG,
        FileUtils.FILE_TYPES.WEBP
    ];

    /** @type { File } */
    #file;

    /** @type { String } */
    #objectUrl;

    /** @type { Boolean } */
    #useSave = false;

    /** @type { String } */
    #defaultText = "Déposer votre image ici (png, jpg, webp, max 5 Mb)";

    /** @type { Number } */
    #timeoutId;

    /// elements
    /** @type { HTMLInputElement } */
    #fileButton;

    /** @type { HTMLInputElement } */
    #dropInfo;

    /** @type { HTMLInputElement } */
    #dropZone;

    /** @type { HTMLImageElement } */
    #dropImage;

    /** @type { AxialServiceButton } */
    #saveButton;

    /// events
    /** @type { Function } */
    #boundFileChangeHandler;

    /** @type { Function } */
    #boundSaveHandler;

    /** @type { Function } */
    #boundDragOverHandler;

    /** @type { Function } */
    #boundDragEnterHandler;

    /** @type { Function } */
    #boundDragLeaveHandler;

    /** @type { Function } */
    #boundDropHandler;

    /** @type { String } */
    #boundTimeoutHandler;

    constructor()
    {
        super();
        this.template = "axial-file-uploader-template";
        this.classList.add("axial_file_uploader");

        this.#boundFileChangeHandler = this.#fileChangeHandler.bind(this);
        this.#boundSaveHandler = this.#saveHandler.bind(this);

        this.#boundDragOverHandler = this.#dragOverHandler.bind(this);
        this.#boundDragEnterHandler = this.#dragEnterHandler.bind(this);
        this.#boundDragLeaveHandler = this.#dragLeaveHandler.bind(this);
        this.#boundDropHandler = this.#dropHandler.bind(this);

        this.#boundTimeoutHandler = this.#timeoutHandler.bind(this);
    }

    static get observedAttributes()
    {
        return ["axial-use-save" ];
    }

    get useSave() { return this.#useSave; }
    set useSave( value )
    {
        if( typeof value !== "boolean") { throw new TypeError("Boolean value required"); }
        if( this.#useSave == value ) { return; }
        this.#useSave = value;
        if( this.#saveButton )
        {
            this.#saveButton.style.display = this.#useSave === true ? "block" : "none";
        }
    }

    get reinitOnResponse() { return this.#reinitOnResponse; }
    set reinitOnResponse( value )
    {
        if( typeof value !== "boolean") { throw new TypeError("Boolean value required"); }
        if( this.#reinitOnResponse == value ) { return; }
        this.#reinitOnResponse = value;
    }

    get _id() { return this.#_id; }
    set _id( value )
    {
        if( StringUtils.isWhite( value ) === true )
        {
            throw new TypeError( "No empty String value required" );
        }
        if( this.#_id == value ) { return; }
        this.#_id = value;
        this.loadFile();
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-use-save" )
        {
            this.useSave = newValue === null ? false : true;
        }

        if( name === "axial-reinit" )
        {
            this.#reinitOnResponse = newValue === null ? false : true;
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#fileButton = this.shadowRoot.getElementById("fileButton");
        this.#dropInfo = this.shadowRoot.getElementById("dropInfo");
        this.#dropZone = this.shadowRoot.getElementById("dropZone");
        this.#dropImage = this.shadowRoot.getElementById("dropImage");
        this.#saveButton = this.shadowRoot.getElementById("saveButton");

        if( this.#fileButton )
        {
            this.#fileButton.addEventListener("change", this.#boundFileChangeHandler );
        }

        if( this.#dropZone )
        {
            this.#dropZone.addEventListener("dragover", this.#boundDragOverHandler );
            this.#dropZone.addEventListener("dragenter", this.#boundDragEnterHandler );
            this.#dropZone.addEventListener("dragleave", this.#boundDragLeaveHandler );
            this.#dropZone.addEventListener("drop", this.#boundDropHandler );
        }

        if( this.#saveButton )
        {
            if( this.#useSave === true ) { this.#saveButton.style.display = "block"; }
            this.#saveButton.enabled = false;
            this.#saveButton.addEventListener( "click", this.#boundSaveHandler);
        }

        /// testage load
        //this.loadFile();
    }

    #fileChangeHandler( event )
    {
        if( this.#fileButton.files.length == 1 )
        {
            this.#checkFile( this.#fileButton.files[0] );
        }
    }

    /**
     * 
     * @param { DragEvent } event 
     */
    #dragOverHandler( event )
    {
        console.log( "dragover" )
        event.preventDefault();
    }

    /**
     * 
     * @param { DragEvent } event 
     */
    #dragEnterHandler( event )
    {
        console.log( "dragenter" )
    }

    /**
     * 
     * @param { DragEvent } event 
     */
    #dragLeaveHandler( event )
    {
        if( this.#timeoutId )
        {
            window.clearTimeout( this.#timeoutId );
        }
        if( this.#dropInfo )
        {
            this.#dropInfo.innerHTML = this.#defaultText;
        }
    }

    /**
     * 
     * @param { DragEvent } event 
     */
    #dropHandler( event )
    {
        console.log( "drop" );
        event.preventDefault();
        const files = event.dataTransfer.files;
        if( files && files.length == 1 )
        {
            this.#checkFile( files[0] );
        }
    }

    #checkFile( file )
    {
        if( file == undefined ) { return; }
        const ext = file.name.split(".").pop().toLowerCase();
        const allowedExtensions = new Set( this.#defaultAllowedUploads.flatMap( type => type.extensions ) );
        
        if( allowedExtensions.has(ext) === false )
        {
            this.#saveButton.enabled = false;
            this.#displayInfo("ext");
            return;
        }

        if( file.size > this.#maxFileSize )
        {
            this.#saveButton.enabled = false;
            this.#displayInfo("size");
            return;
        }

        if( this.#objectUrl != "" )
        {
            URL.revokeObjectURL( this.#objectUrl );
        }

        this.#file = file;

        this.#objectUrl = URL.createObjectURL( this.#file );
        this.#dropInfo.innerHTML = "";
        this.#dropZone.style.display = "none";
        this.#dropImage.style.display = "block";
        this.#dropImage.src = this.#objectUrl;

        this.#saveButton.enabled = true;
    }

    #displayInfo( key )
    {
        if( this.#dropInfo === undefined ) { return; }
        switch( key )
        {
            case "length":
                this.#dropInfo.innerHTML = "Un seul fichier autorisé";
            break;

            case "size":
                this.#dropInfo.innerHTML = "Ce fichier est trop volumineux";
            break;

            case "ext":
                this.#dropInfo.innerHTML = "Type de fichier non pris en charge";
            break;

            default:
            break;
        }

        if( this.#timeoutId )
        {
            window.clearTimeout( this.#timeoutId );
        }
        this.#timeoutId = window.setTimeout( this.#boundTimeoutHandler, 2000 );
    }

    #timeoutHandler()
    {
        if( this.#dropInfo )
        {
            this.#dropInfo.innerHTML = this.#defaultText;
        }
    }

    #saveHandler( event )
    {
        this.#fileButton.disabled = true;
        this.#saveButton.enabled = false;
        this.#saveButton.loading = true;
        this.#uploadFile();
    }

    async #uploadFile()
    {
        try
        {
            const formData = new FormData();
            formData.append("axial_file", this.#file);
            const headers = 
            {
                "axial_filename": this.#file.name,
                "axial_filetype": this.#file.type,
            }

            const json = await FetchUtils.POST( this.#uploadFilePath, formData, headers );
            if( json.id != undefined && json.id != null && typeof json.id === "string" )
            {
                this.#_id = json.id;
            }

            const axialEvent = new CustomEvent( "", { bubbles: true, composed: true, detail: { id: this.#_id } } );
            this.dispatchEvent( axialEvent );

            window.AXIAL.notify("Votre fichier a bien été enregistré");
        }
        catch(err)
        {
            console.log(err)
            window.AXIAL.notify("une erreur s'est produite, votre fichier n'a pas été enregistré");
        }
        finally
        {
            if( this.#reinitOnResponse === true )
            {
                this.#reinit()
            }
            
        }
    }

    #reinit()
    {
        URL.revokeObjectURL( this.#objectUrl );
        this.#objectUrl = undefined;
        this.#file = undefined;
        this.#fileButton.value = null;
        this.#fileButton.disabled = false;
        this.#dropInfo.innerHTML = this.#defaultText;
        this.#dropZone.style.display = "block";
        this.#dropImage.style.display = "none";
        this.#dropImage.src = "";

        this.#saveButton.enabled = false;
        this.#saveButton.loading = false;

    }

    async uploadFile()
    {
        await this.#uploadFile();
    }

    loadFile( download = false )
    {
        console.log(download);
        if( typeof download !== "boolean" )
        {
            download = false;
        }
        
        if( this.#_id == undefined )
        {
            // silent fail here
            return;
        }
    }

}

window.customElements.define("axial-file-uploader", AxialFileUploader);
export { AxialFileUploader }