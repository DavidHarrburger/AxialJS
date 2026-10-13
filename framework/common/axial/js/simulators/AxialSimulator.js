"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialSimulatorStep } from "./AxialSimulatorStep.js";
import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";

import { AxialSimulatorStepSelection } from "./steps/AxialSimulatorStepSelection.js";
import { AxialSimulatorStepData } from "./steps/AxialSimulatorStepData.js";
import { AxialSimulatorStepFinal } from "./steps/AxialSimulatorStepFinal.js";

class AxialSimulator extends AxialComponentBase
{
    /** @type { Array<AxialSimulatorStep> } */
    #steps;

    /** @type { Object } */
    #simulators;

    /** @type { Array } */
    #simulatorsCreated = [];

    /** @type { String } */
    #simulatorsPath = "./assets/models/simulators.json";

    /** @type { String } */
    #apiSimulationUpdate = "./api/simulation/update";

    /** @type { String } */
    #apiProductsList = "./api/product/list";

    /** @type { Boolean } */
    #editionMode = false;

    /** @type { Array } */
    #products;

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /// events
    /** @type { Function } */
    #boundNextStepHandler;

    /** @type { Function } */
    #boundPreviousStepHandler;

    /** @type { Function } */
    #boundStepCreateHandler;

    /** @type { Function } */
    //#boundProjectNameEdited;

    /** @type { Function } */
    //#boundProjectNameChanged;

    /** @type { Function } */
    #boundProjectSaveHandler;

    /// axial
    /** @type { Function } */
    #boundAxialUserReadyHandler;

    constructor()
    {
        super();
        this.classList.add("axial_simulator");
        this.template = "axial-simulator-template";

        this.#simulatorsPath = PathUtils.getPathFromRelative(this.#simulatorsPath);
        this.#apiSimulationUpdate = PathUtils.getPathFromRelative(this.#apiSimulationUpdate);
        this.#apiProductsList = PathUtils.getPathFromRelative(this.#apiProductsList);

        this.#boundNextStepHandler = this.#nextStepHandler.bind(this);
        this.#boundPreviousStepHandler = this.#previousStepHandler.bind(this);

        this.#boundStepCreateHandler = this.#stepCreateHandler.bind(this);

        this.#boundProjectSaveHandler = this.#projectSaveHandler.bind(this);
        this.#boundAxialUserReadyHandler = this.#axialUserReadyHandler.bind(this);
        window.addEventListener( "axialUserReady", this.#boundAxialUserReadyHandler );
    }

    #axialUserReadyHandler( event )
    {
        if( this.#simulators === undefined )
        {
            this.#fetchSimulators();
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#holder = this.shadowRoot.getElementById("holder");
        this.#steps = Array.from( this.#holder.children );
        //console.log( this.#steps );
        
        for( const step of this.#steps )
        {
            step.addEventListener("stepNext", this.#boundNextStepHandler);
            step.addEventListener("stepPrevious", this.#boundPreviousStepHandler);
            step.addEventListener("projectSave", this.#boundProjectSaveHandler);
        }

        if( this.#steps[0] != undefined )
        {
            this.#steps[0].style.display = "block";
        }
    }

    async #fetchSimulators()
    {
        //console.warn("FETCH_SIMULATORS");
        try
        {
            const productsTemps = await FetchUtils.GET( this.#apiProductsList );
            if( productsTemps )
            {
                this.#products = productsTemps.content;
            }
            //console.log( this.#products );
            const response = await fetch( this.#simulatorsPath, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            this.#simulators = json;
            //console.log( this.#simulators );
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            this.#buildSteps();
        }
    }

    #buildSteps()
    {
        if( this.#simulators === undefined )
        {
            console.warn("SUPER IMPORTANT WARN");
        }

        for( const step of this.#steps )
        {
            if( step instanceof AxialSimulatorStepSelection === true )
            {
                step.data = this.#simulators;
                //step.removeEventListener("stepNext", this.#boundNextStepHandler);
                step.addEventListener("stepCreate", this.#boundStepCreateHandler);
            }
        }
    }

    #clearSteps()
    {
        console.log("clearSteps entry point");
        this.#simulatorsCreated = [];
        for( const step of this.#steps )
        {
            if( step instanceof AxialSimulatorStepData === true )
            {
                step.remove();
            }
            else
            {
                step._reinit();
            }
        }

        this.#steps = Array.from( this.#holder.children );
        const stepsLength = this.#steps.length;
        for( let i = 0; i < stepsLength; i++ )
        {
            const step = this.#steps[i];
            step.style.display = i === 0 ? "block" : "none";
        }

    }

    clearSteps()
    {
        this.#clearSteps();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #stepCreateHandler( event )
    {
        const simulators = event.detail.simulators;
        this.#createSimulatorSteps( simulators );
    }

    /**
     * 
     * @param { Array<String> } simulators 
     */
    #createSimulatorSteps( simulators )
    {
        // CREATE SIMULATORS ENTRY POINT
        console.warn("CREATE SIMULATORS ENTRY POINT");
        let simulatorsToCreate = [];
        for( const simulatorObject of this.#simulators.simulators )
        {
            const simulatorObjectName = simulatorObject.id;
            if( simulators.includes( simulatorObjectName ) === true && this.#simulatorsCreated.includes(simulatorObjectName) === false )
            {
                simulatorsToCreate.push( simulatorObject );
                this.#simulatorsCreated.push(simulatorObjectName);
            }
        }
        console.log(simulatorsToCreate);
        
        for( const sc of simulatorsToCreate )
        {
            const childrenSteps = Array.from(this.#holder.children);
            const lastStepIndex = childrenSteps.length - 1;
            const lastStep = this.#holder.children[lastStepIndex];

            const simulatorStep = new AxialSimulatorStepData();

            simulatorStep.addEventListener("stepNext", this.#boundNextStepHandler);
            simulatorStep.addEventListener("stepPrevious", this.#boundPreviousStepHandler);

            simulatorStep.addEventListener("projectSave", this.#boundProjectSaveHandler);

            simulatorStep.products = this.#products;
            simulatorStep.simulator = sc;
            this.#holder.insertBefore(simulatorStep, lastStep);
            this.#steps.splice( (lastStepIndex), 0, simulatorStep );
        }
        console.log(this.#steps);
    }

    /**
     * 
     * @param { AxialSimulatorStepFinal } finalStep 
     */
    #computeFinal( finalStep )
    {
        console.log("FINAL COMPUTATION HERE");
        let array = []
        for( const step of this.#steps )
        {
            if( step instanceof AxialSimulatorStepData === true )
            {
                const map = step.getCalculatedMap();
                const sectionTitle = step.simulator.name;
                const item = { sectionTitle: sectionTitle, map: map }
                array.push(item);
            }
        }
        finalStep.simulationObject = this.data;
        finalStep.maps = array;
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #nextStepHandler( event )
    {
        /** @type { AxialSimulatorStep } */
        const step = event.target;
        const currentStepIndex = this.#steps.indexOf( step );

        if( currentStepIndex < (this.#steps.length-1) )
        {
            step.style.display = "none";
            const nextStep = this.#steps[currentStepIndex+1];
            nextStep.style.display = "block";

            if( nextStep instanceof AxialSimulatorStepData === true )
            {
                nextStep.control();
            }

            if( nextStep instanceof AxialSimulatorStepFinal === true )
            {
                this.#computeFinal(nextStep);
                
            }
        }
        this.scrollTo( { top:0, behavior: "smooth" } );
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #previousStepHandler( event )
    {
        /** @type { AxialSimulatorStep } */
        const step = event.target;
        const currentStepIndex = this.#steps.indexOf( step );

        if( currentStepIndex > 0 )
        {
            step.style.display = "none";
            const previousStep = this.#steps[currentStepIndex-1];
            previousStep.style.display = "block";
        }
        this.scrollTo( { top: 0, behavior: "smooth" } );
    }


    /**
     * 
     * @param { CustomEvent } event 
     */
    #projectSaveHandler( event )
    {
        console.log("WE MUST SAVE");
        let stepsData = new Array();

        for( const step of this.#steps )
        {
            const stepObject = step._getAsObject();
            stepsData.push(stepObject);
        }

        console.log( stepsData );
        const projectSaveRequestEvent = new CustomEvent("projectSaveRequest", { bubbles: true, detail: { data: stepsData } } );
        this.dispatchEvent( projectSaveRequestEvent );

        this.#saveSimulationData( stepsData );
    }

    _onDataChanged()
    {
        console.log(" build from db", this.data);
        const savedData = this.data?.data;
        console.log("SAVED DATA check point before");
        
        // temp fix
        if( savedData.length === 0 ) { return; }
        console.log("SAVED DATA check point");
        if( savedData )
        {
            const selectedSimulators = savedData[0].selectedSimulators;
            console.log( selectedSimulators );
            this.#createSimulatorSteps(selectedSimulators);
            this.#injectData();
        }
    }

    #injectData()
    {
        // redondance
        console.warn("INJECT_DATA");
        const savedData = this.data?.data;
        console.log(savedData);
        if( savedData )
        {
            console.log("IF PASSED")
            for( const projectSavedStep of savedData )
            {
                const projectStepClass = projectSavedStep.class;
                console.log("class ", projectStepClass);
                for( const step of this.#steps )
                {
                    if( projectStepClass === step.stepName )
                    {
                        step.savedData = projectSavedStep;
                    }

                    /*
                    if( step instanceof AxialProjectStepSelection === true
                        && projectSavedStep.selectedSimulators 
                        && Array.isArray(projectSavedStep.selectedSimulators) 
                        && projectSavedStep.selectedSimulators.length > 0 )
                    {
                        step.addEventListener("stepNext", this.#boundNextStepHandler);
                        step.removeEventListener("stepCreate", this.#boundStepCreateHandler);
                    }
                    */
                   console.log("STEP DATA INJECTED OK")
                }
            }
        }
    }

    async #saveSimulationData( data )
    {
        try
        {
            console.log("FINAL SIMULATION UPDATE")
            console.log( this.data._id);
            const simBody = 
            {
                _id: this.data._id,
                data: data
            };
            const updated = await FetchUtils.POST( this.#apiSimulationUpdate, simBody );
        }
        catch(err)
        {
            console.lof(err);
        }
    }
}

window.customElements.define("axial-simulator", AxialSimulator);
export { AxialSimulator }