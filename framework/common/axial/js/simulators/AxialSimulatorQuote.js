"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialSimulatorStep } from "./AxialSimulatorStep.js";
import { AxialSimulatorStepDataQuote } from "./steps/AxialSimulatorStepDataQuote.js";

import { AxialQuote } from "../quotes/AxialQuote.js";
import { PathUtils } from "../utils/PathUtils.js";
import { DomUtils } from "../utils/DomUtils.js";

class AxialSimulatorQuote extends AxialComponentBase
{
    /// vars
    /** @type { Array } */
    #maps;

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

    /** @type { Boolean } */
    #editionMode = false;

    /// elements
    /** @type { AxialQuote } */
    #quote;

    /** @type { HTMLElement } */
    #content;

    /// events
    /** @type { Function } */
    #boundProjectSaveHandler;


    constructor()
    {
        super();
        this.classList.add("axial_simulator_quote");
        this.template = "axial-simulator-quote-template";
        this.#simulatorsPath = PathUtils.getPathFromRelative(this.#simulatorsPath);
        this.#apiSimulationUpdate = PathUtils.getPathFromRelative(this.#apiSimulationUpdate);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#content = this.shadowRoot.getElementById("content");
        this.#quote = this.shadowRoot.getElementById("quote");
        if( this.#simulators === undefined )
        {
            this.#fetchSimulators();
        }
    }

    async #fetchSimulators()
    {
        try
        {
            const response = await fetch( this.#simulatorsPath, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
            this.#simulators = json.simulators;
            console.log( "AxialSimulatorQuote simulators",  this.#simulators );
        }
        catch(err)
        {
            console.log(err);
        }

    }

    _onDataChanged()
    {
        const savedData = this.data?.data;
        
        // temp fix
        if( savedData.length === 0 ) { return; }
        
        if( savedData )
        {
            const selectedSimulators = savedData[0].selectedSimulators;
            this.#createSimulatorSteps(selectedSimulators);
            this.#injectData();
            this.#computeFinal();
        }
    }

    #createSimulatorSteps( simulators )
    {
        this.#steps = new Array();
        for( const simName of simulators )
        {
            const simObject = this.#getSimulatorObjectByName(simName);
            const quoteStep = new AxialSimulatorStepDataQuote();
            quoteStep.simulator = simObject;
            this.#content.appendChild( quoteStep );
            this.#steps.push( quoteStep );
        }
    }

    #getSimulatorObjectByName( name )
    {
        for( const so of this.#simulators )
        {
            if( so.id === name )
            {
                return so;
            }
        }
        return undefined;
    }

    #clearSteps()
    {
        DomUtils.cleanElement( this.#content );
        this.#steps = new Array();
    }

    #injectData()
    {
        // redondance
        const savedData = this.data?.data;
        if( savedData )
        {
            for( const projectSavedStep of savedData )
            {
                const projectStepClass = projectSavedStep.class;
                //console.log("class ", projectStepClass);
                for( const step of this.#steps )
                {
                    //console.log( "constructor name ", step.constructor.name );
                    if( projectStepClass === "AxialSimulatorStepData" )
                    {
                        step.savedData = projectSavedStep;
                    }
                }
            }
        }
    }

    #computeFinal()
    {
        console.log("FINAL COMPUTATION SIMULATOR QUOTE HERE");
        let array = [];
        for( const step of this.#steps )
        {
            if( step instanceof AxialSimulatorStepDataQuote === true )
            {
                const map = step.getCalculatedMap();
                const sectionTitle = step.simulator.name;
                const item = { sectionTitle: sectionTitle, map: map }
                array.push(item);
            }
        }
        this.#maps = array;
        if( this.#quote ) { this.#quote.data = array; }
    }

    async #saveSimulationData( data )
    {
        /*
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
            */
    }

}

window.customElements.define("axial-simulator-quote", AxialSimulatorQuote);
export { AxialSimulatorQuote }