"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialButton } from "../button/AxialButton.js";

class AxialSimulatorStep extends AxialComponentBase
{
    /** @type { AxialButton } */
    #previousStepButton;

    /** @type { AxialButton } */
    #nextStepButton;

    /** @type { Function } */
    #boundPreviousStepButtonHandler;

    /** @type { Function } */
    #boundNextStepButtonHandler;

    /** @type { Object } */
    #savedData;

    /** @type { Array<Object> } */
    #products;

    /** @type { Map } */
    #productsMap;

    /** @type { String } */
    #stepName;

    constructor()
    {
        super();
        this.classList.add("axial_simulator_step");
        this.template = "axial-simulator-step-template";
        this.#boundPreviousStepButtonHandler = this.#previousStepButtonHandler.bind(this);
        this.#boundNextStepButtonHandler = this.#nextStepButtonHandler.bind(this);
    }

    get stepName() { return this.#stepName; }
    set stepName( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#stepName = value;
    }

    get savedData() { return this.#savedData; }
    set savedData( value )
    {
        this.#savedData = value;
        if( this._onSavedData )
        {
            this._onSavedData();
        }
    }

    get products() { return this.#products; }
    set products( value )
    {
        if( Array.isArray( value ) === false )
        {
            throw new TypeError("Array required");
        }
        this.#products = value;
        this.#productsMap = new Map();
        for( const p of this.#products )
        {
            if( p === undefined ) { continue; } //
            //console.log( "products setter", p );
            const uuid = p.uuid;
            this.#productsMap.set( uuid, p );
        }
    }

    get productsMap() { return this.#productsMap; }

    /**
     * @type { AxialButton }
     * @readonly
     */
    get nextButton() { return this.#nextStepButton; }

    /**
     * @type { AxialButton }
     * @readonly
     */
    get previousButton() { return this.#previousStepButton; }

    _buildComponent()
    {
        super._buildComponent();

        this.#nextStepButton = this.shadowRoot.getElementById("next");
        if( this.#nextStepButton )
        {
            this.#nextStepButton.addEventListener( "click", this.#boundNextStepButtonHandler );
        }

        this.#previousStepButton = this.shadowRoot.getElementById("previous");
        if( this.#previousStepButton )
        {
            this.#previousStepButton.addEventListener( "click", this.#boundPreviousStepButtonHandler );
        }

        if( this.data !== undefined )
        {
            this.#buildStep();
        }
    }

    _onDataChanged()
    {
        if( this.componentBuilt === true )
        {
            this.#buildStep();
        }
    }

    #buildStep()
    {
        this._buildStep();
    }

    _buildStep() {}

    _onNextStep() {}

    _onPreviousStep() {}
    
    _reinit() {}

    _onSavedData() {}

    #nextStepButtonHandler( event )
    {
        this._onNextStep();

        const stepChangedEvent = new CustomEvent("stepNext");
        this.dispatchEvent( stepChangedEvent );
    }

    #previousStepButtonHandler( event )
    {
        this._onPreviousStep();

        const stepChangedEvent = new CustomEvent("stepPrevious");
        this.dispatchEvent( stepChangedEvent );
    }
}

window.customElements.define("axial-simulator-step", AxialSimulatorStep);
export { AxialSimulatorStep }