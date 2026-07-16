"use strict";

import { AxialOverlayBase } from "../../overlay/AxialOverlayBase.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialToggleCheck } from "../../button/AxialToggleCheck.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";

class AxialModuleCreateProjectOverlay extends AxialOverlayBase
{
    /// vars
    /** @type { String } */
    #apiCreateProjectPath = "./api/projects/create";

    /** @type { String } */
    #projectPopupId = "projectPopup";

    /// elements
    /** @type { HTMLInputElement } */
    #projectNameInput;

    /** @type { HTMLInputElement } */
    #simulationNameInput;

    /** @type { AxialToggleCheck } */
    #toggleCheck;

    /** @type { AxialButton } */
    #cancelButton;

    /** @type { AxialServiceButton } */
    #createButton;

    /// events
    /** @type { Function } */
    #boundProjectInputHandler;

    /** @type { Function } */
    #boundSimulationInputHandler;

    /** @type { Function } */
    #boundCancelHandler;

    /** @type { Function } */
    #boundCreateHandler;

    constructor()
    {
        super();
        this.classList.add("axial_module_create_project_overlay");
        this.template = "axial-module-create-project-overlay-template";

        this.#apiCreateProjectPath = PathUtils.getPathFromRelative( this.#apiCreateProjectPath );

        this.displayMode = "center";
        this.isModal = true;
        this.useObfuscator = true;

        this.#boundProjectInputHandler = this.#projectInputHandler.bind(this);
        this.#boundSimulationInputHandler = this.#simulationInputHandler.bind(this);
        this.#boundCancelHandler = this.#cancelHandler.bind(this);
        this.#boundCreateHandler = this.#createHandler.bind(this);
    }

    /**
     * @type { Boolean }
     * @readonly
     */
    get openOnCreation()
    {
        if( this.#toggleCheck )
        {
            return this.#toggleCheck.selected;
        }
        return false;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#projectNameInput = this.shadowRoot.getElementById("projectNameInput");
        if( this.#projectNameInput )
        {
            this.#projectNameInput.addEventListener("input", this.#boundProjectInputHandler);
        }

        this.#simulationNameInput = this.shadowRoot.getElementById("simulationNameInput");
        if( this.#simulationNameInput )
        {
            this.#simulationNameInput.addEventListener("input", this.#boundSimulationInputHandler);
        }

        this.#cancelButton = this.shadowRoot.getElementById("cancelButton");
        if( this.#cancelButton )
        {
            this.#cancelButton.addEventListener("click", this.#boundCancelHandler);
        }

        this.#createButton = this.shadowRoot.getElementById("createButton");
        if( this.#createButton )
        {
            this.#createButton.addEventListener("click", this.#boundCreateHandler);
        }

        this.#toggleCheck = this.shadowRoot.getElementById("toggleCheck");
    }

    #checkValidity()
    {
        let validity = true;
        const nameValid = this.#projectNameInput.validity.valid;
        const simuValid = this.#simulationNameInput.validity.valid;

        if( nameValid === false ) { validity = false; }
        if( simuValid === false ) { validity = false; }
        if( this.#createButton ) { this.#createButton.enabled = validity; }
    }

    _onShowing()
    {
        this.#reinit();
    }

    _onShown()
    {
        if( this.#projectNameInput )
        {
            this.#projectNameInput.focus();
        }
    }

    #projectInputHandler( event )
    {
        this.#checkValidity();
    }

    #simulationInputHandler( event )
    {
        this.#checkValidity();
    }

    #cancelHandler( event )
    {
        this.hide();
    }

    #createHandler( event )
    {
        if( this.#projectNameInput )
        {
            this.#projectNameInput.disabled = true;
            this.#projectNameInput.style.opacity = "0.5";
        }

        if( this.#simulationNameInput )
        {
            this.#simulationNameInput.disabled = true;
            this.#simulationNameInput.style.opacity = "0.5";
        }

        // it's here because of the click ;)
        this.#createButton.enabled = false;
        this.#createButton.loading = true;

        if( this.#cancelButton )
        {
            this.#cancelButton.enabled = false;
        }
        this.#createProject();
    }

    #reinit()
    {
        if( this.#projectNameInput )
        {
            this.#projectNameInput.value = "";
            this.#projectNameInput.disabled = false;
            this.#projectNameInput.style.opacity = "1";
        }

        if( this.#simulationNameInput )
        {
            this.#simulationNameInput.value = "";
            this.#simulationNameInput.disabled = false;
            this.#simulationNameInput.style.opacity = "1";
        }

        if( this.#createButton )
        {
            this.#createButton.enabled = false;
            this.#createButton.loading = false;
        }

        if( this.#cancelButton )
        {
            this.#cancelButton.enabled = true;
        }
    }

    async #createProject()
    {
        try
        {
            let projectData = {};
            projectData.project_name = this.#projectNameInput.value.trim();
            projectData.simulation_name = this.#simulationNameInput.value.trim();
            const json = await FetchUtils.POST(this.#apiCreateProjectPath, projectData );
            
            if( json.status && json.status === "ok" )
            {
                const projectEvent = new CustomEvent("projectCreated", { bubbles: true, detail: { project: json.content } } );
                this.dispatchEvent( projectEvent );
            }
            else
            {
                const projectEvent = new CustomEvent("projectError", { bubbles: true } );
                this.dispatchEvent( projectEvent );
            }
        }
        catch(err)
        {
            console.warn(err);
            const projectEvent = new CustomEvent("projectError", { bubbles: true } );
            this.dispatchEvent( projectEvent );
        }
        finally
        {
            this.#reinit()
            this.hide();
        }
    }

}

window.customElements.define("axial-module-create-project-overlay", AxialModuleCreateProjectOverlay);
export { AxialModuleCreateProjectOverlay }