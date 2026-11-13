"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";

class AxialOnboardingViewProfile extends AxialOnboardingView
{
    /// elements
    /** @type { HTMLInputElement } */
    #bannerInput;

    /** @type { HTMLInputElement } */
    #userpicInput;

    /** @type { HTMLInputElement } */
    #firstInput;

    /** @type { HTMLInputElement } */
    #lastInput;

    /// events
    /** @type { Function } */
    #boundFileChangeHandler;

    /** @type { Function } */
    #boundDragOverHandler;

    /** @type { Function } */
    #boundDragEnterHandler;

    /** @type { Function } */
    #boundDragLeaveHandler;

    /** @type { Function } */
    #boundDropHandler;

    /** @type { Function } */
    #boundInputHandler;

    constructor()
    {
        super();
        this.template = "axial-onboarding-view-profile-template";

        this.#boundFileChangeHandler = this.#fileChangeHandler.bind(this);
        
        this.#boundDragOverHandler = this.#dragOverHandler.bind(this);
        this.#boundDragEnterHandler = this.#dragEnterHandler.bind(this);
        this.#boundDragLeaveHandler = this.#dragLeaveHandler.bind(this);
        this.#boundDropHandler = this.#dropHandler.bind(this);

        this.#boundInputHandler = this.#inputHandler.bind(this);
    }

    _buildComponent()
    {
        this.#bannerInput = this.shadowRoot.getElementById("bannerInput");
        this.#userpicInput = this.shadowRoot.getElementById("userpicInput");
        this.#bannerInput.addEventListener("input", this.#boundFileChangeHandler);
        this.#userpicInput.addEventListener("input", this.#boundFileChangeHandler);

        this.#firstInput = this.shadowRoot.getElementById("firstInput");
        this.#lastInput = this.shadowRoot.getElementById("lastInput");
        this.#firstInput.addEventListener("input", this.#boundInputHandler);
        this.#lastInput.addEventListener("input", this.#boundInputHandler);

        super._buildComponent();
    }

    #fileChangeHandler( event )
    {
        /** @type { HTMLInputElement } */
        const fileInput = event.target;
        console.log(fileInput.parentElement);
        if( fileInput.files.length == 1 )
        {
            this.#checkFile( fileInput.files[0] );
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

    /**
     * 
     * @param { File } file 
     * @param { HTMLLabelElement } forLabel 
     */
    #checkFile( file, forLabel )
    {
        console.log( file)
    }

    #inputHandler( event )
    {
        this.#checkValidity();
    }

    #checkValidity()
    {
        const validated = this.#firstInput.validity.valid === true && this.#lastInput.validity.valid === true;
        const data = { first_name: this.#firstInput.value.trim(), last_name: this.#lastInput.value.trim() }
        const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated, data: data } } );
        this.dispatchEvent(onboardingEvent);
    }
}

window.customElements.define("axial-onboarding-view-profile", AxialOnboardingViewProfile);
export { AxialOnboardingViewProfile }