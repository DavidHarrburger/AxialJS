"use strict";

import { AxialSimulatorStep } from "../AxialSimulatorStep.js";
import { AxialSimulatorBlock } from "../AxialSimulatorBlock.js";
import { ObjectUtils } from "../../utils/ObjectUtils.js";

class AxialSimulatorStepDataQuote extends AxialSimulatorStep
{
    /// vars
    /** @type { Object } */
    #simulator; // we keep he data entry safe ATM

    /** @type { Boolean } */
    #simulatorBuilt = false;

    /** @type { Array<AxialSimulatorBlock> } */
    #simulatorBlocks = [];

    /** @type { Array } */
    #params;
    
    /** @type { Array } */
    #rules;

    /** @type { Array } */
    #quoteLines;

    /** @type { Map } */
    #mapParams;
    
    /** @type { Map } */
    #mapRules;
    
    /// elements
    /** @type { HTMLElement } */
    #title;

    /** @type { HTMLElement } */
    #info;

    /** @type { HTMLElement } */
    #warning;

    /** @type { HTMLElement } */
    #simulatorHolder;

    /// events
    /** @type { Function } */
    #boundSimulatorBlockCompletedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_simulator_step_data_quote");
        this.template = "axial-simulator-step-data-quote-template";
        this.#boundSimulatorBlockCompletedHandler = this.#simulatorBlockCompletedHandler.bind(this);
    }

    get simulator() { return this.#simulator; }
    set simulator( value )
    {
        if( ObjectUtils.isObject(value) === false )
        {
            throw new TypeError("Plain Object value required");
        }

        /// TODO parse object --> we nedd some required fields and value to ensure the Controller works fine
        /// see what AI can suggest and remember we have a strong object utils for that to check deeper an object

        this.#simulator = value;
        if( this.componentBuilt === true )
        {
            this.#buildSimulator();
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#title = this.shadowRoot.getElementById("title");
        this.#info = this.shadowRoot.getElementById("info");
        this.#simulatorHolder = this.shadowRoot.getElementById("simulatorHolder");
        //this.nextButton.enabled = false;
        if( this.#simulator )
        {
            this.#buildSimulator();
        }
    }

    _buildStep()
    {
        /*
        console.log("build step simulator");
        console.log( this.#title);
        if( this.#title )
        {
            this.#title.innerHTML = this.data.name;
        }
        */
    }

    _onNextStep()
    {
        const projectEvent = new CustomEvent( "projectSave", { bubbles: true } );
        this.dispatchEvent( projectEvent );
    }

    _onPreviousStep()
    {
        const projectEvent = new CustomEvent( "projectSave", { bubbles: true } );
        this.dispatchEvent( projectEvent );
    }

    #buildSimulator()
    {
        // params and rules
        this.#mapParams = new Map();
        if( this.#simulator.params && Array.isArray( this.#simulator.params ) === true )
        {
            this.#params = this.#simulator.params;
            for( const p of this.#simulator.params )
            {
                this.#mapParams.set( p.name, p.props );
            }
        }

        this.#mapRules = new Map();
        if( this.#simulator.rules && Array.isArray( this.#simulator.rules ) === true )
        {
            this.#rules = this.#simulator.rules;
            for( const r of this.#simulator.rules )
            {
                this.#mapRules.set( r.name, r.props );
            }
        }

        if( this.#simulator.quote_lines && Array.isArray( this.#simulator.quote_lines ) === true )
        {
            this.#quoteLines = this.#simulator.quote_lines;
        }

        // ui
        if( this.#title )
        {
            this.#title.innerHTML = this.#simulator.name;
        }

        if( this.#info )
        {
            this.#info.innerHTML = this.#simulator?.description;
        }

        const steps = this.#simulator.steps;
        for( const step of steps )
        {
            const el = new AxialSimulatorBlock();
            el.step = step;
            el.addEventListener("simulatorBlockCompleted", this.#boundSimulatorBlockCompletedHandler);
            this.#simulatorHolder.appendChild( el );
            this.#simulatorBlocks.push(el);
        }

    }

    _getAsObject()
    {
        // on sauvegarde le simulateur tel qu'il a été défini
        // celui-ci peut changer au fil du temps
        let obj = 
        {
            class: "AxialSimulatorStepData",
            steps: []
        }

        // on stocke en suite les valeurs saisies
        for( const simBlock of this.#simulatorBlocks )
        {
            obj.steps.push( simBlock._getAsObject() );
        }
        return obj;
    }


    /**
     * 
     * @returns { Map }
     */
    #calculate()
    {
        console.warn("NEW CALC ENTRY POINT");
        let quoteMap = new Map();
        for( const quoteLine of this.#quoteLines )
        {
            // on check si l'id de l'article existe bien dans la base et que c'est bien une chaine --> si non on ne peut pas faire le devis pour le client
            const articleId = quoteLine.article_id;
            if( articleId !== undefined && typeof articleId === "string" )
            {
                const article = this.#mapParams.get( articleId );
                if( article )
                {
                    let quantity = 0;
                    const block = this.#simulatorBlocks[ quoteLine.block ];
                    //console.log(block)
                    const isAdded = block.useAdd;
                    
                    //console.log("IMPORTANT BLOCK useAdd = ", block.useAdd );
                    //console.log("IMPORTANT BLOCK switch = ", block.enabled );

                    if( isAdded === false ) // && quoteLine.line != -1 ??????
                    {
                        const line = block.lines[ quoteLine.line ];
                        const lineType = line.line.type;
                        
                        // on récupère la valeur en fonction du type de ligne
                        switch( lineType )
                        {
                            case "dim":
                                quantity = line._getCalculation()[quoteLine.index];
                            break;

                            case "num":
                                quantity = line._getCalculation();
                            break;

                            default:
                            break;
                        }

                        // on check si une opération doit être effectuée
                        const operation = quoteLine.operation;
                        const factor = quoteLine.factor;

                        switch( operation )
                        {
                            case "multiply":
                                quantity = quantity * factor;
                            break;

                            case "divide":
                                quantity = quantity / factor;
                            break;

                            default:
                            break;
                        }

                        //console.warn("condition");
                        // on check enfin l'item est conditionnel ou non
                        const condition = quoteLine.cond;
                        if( condition !== undefined && Array.isArray(condition) === true )
                        {
                            const conditionBlock = this.#simulatorBlocks[ condition[0] ];
                            const conditionLine = conditionBlock.lines[ condition[1] ];
                            const calcCondition = conditionLine._getCalculation();
                            //console.log( calcCondition );
                            
                            const quoteLineName = quoteLine.name;
                            if( calcCondition === undefined )
                            {
                                quantity = 0;
                            }
                            else if( typeof calcCondition === "boolean" )
                            {
                                quantity = calcCondition == true ? quantity : 0;
                            }
                            if( Array.isArray( calcCondition ) === true )
                            {
                                quantity = calcCondition.indexOf( quoteLineName ) >= 0 ? quantity : 0;
                            }
                            else if( typeof calcCondition === "string" )
                            {
                                quantity = calcCondition == quoteLineName ? quantity : 0;
                            }
                        }
                        quoteMap.set( articleId, { article: article, quantity: quantity } );
                    }
                    // la quantité est à récupérer dans une ligne à ajouter
                    // on sait ds quel block mais pas si elle est présente
                    else
                    {
                        const lineTypeToAdd = block.step.lineToAdd.type;
                        const lines = block.lines;
                        let dimQuantity = 0;
                        for( const L of lines )
                        {
                            //const lineType = L.line.type;

                            switch( lineTypeToAdd )
                            {
                                case "select":
                                    const key = L._getCalculation();
                                    if( key === articleId )
                                    {
                                        const articleFound = quoteMap.get( articleId );
                                        if( articleFound )
                                        {
                                            const newQuantity = articleFound.quantity + 1;
                                            quoteMap.set( articleId, { article: article, quantity: newQuantity } );
                                        }
                                        else
                                        {
                                            quoteMap.set( articleId, { article: article, quantity: 1 } );
                                        }
                                    }
                                break;

                                case "dim":
                                    dimQuantity = dimQuantity + L._getCalculation()[quoteLine.index];
                                break;

                                default:
                                break;
                            }
                            

                        }
                        if( lineTypeToAdd === "dim" )
                        {
                            // check condition here, willbe probably be factorized
                            const condition = quoteLine.cond;
                            if( condition !== undefined && Array.isArray(condition) === true )
                            {
                                const conditionBlock = this.#simulatorBlocks[ condition[0] ];
                                //console.log( conditionBlock );
                                const conditionLine = conditionBlock.lines[ condition[1] ];
                                const calcCondition = conditionLine._getCalculation();
                                //console.log( calcCondition );
                                
                                const quoteLineName = quoteLine.name;
                                //console.log( quoteLineName );
                                
                                if( calcCondition === undefined )
                                {
                                    dimQuantity = 0;
                                }
                                else if( typeof calcCondition === "boolean" )
                                {
                                    dimQuantity = calcCondition == true ? dimQuantity : 0;
                                }
                                if( Array.isArray( calcCondition ) === true )
                                {
                                    dimQuantity = calcCondition.indexOf( quoteLineName ) >= 0 ? dimQuantity : 0;
                                }
                                else if( typeof calcCondition === "string" )
                                {
                                    //console.warn( "check point string", calcCondition);
                                    dimQuantity = calcCondition == quoteLineName ? dimQuantity : 0;
                                }
                            }
                        
                            quoteMap.set( articleId, { article: article, quantity: dimQuantity } );
                        }
                    }
                }
            }
        }
        console.log( quoteMap );
        return quoteMap;
    }

    getCalculatedMap()
    {
        return this.#calculate();
    }

    #simulatorBlockCompletedHandler( event )
    {
        this.#calculate();
        this.control();
    }

    _onSavedData()
    {
        console.log("simulator saved data ", this.savedData);
        const stepsSaved = this.savedData.steps;
        
        const sl = stepsSaved.length;
        const dl = this.#simulatorBlocks.length;
        // control we have the same length -> 
        if( sl === dl )
        {
            for( let i = 0; i < dl; i++ )
            {
                const simStep = this.#simulatorBlocks[i];
                const simStepData = stepsSaved[i];
                simStep.savedData = simStepData;
            }
        }
        //this.nextButton.enabled = true;
    }

    control()
    {
        //console.warn("control entry point");
        let bc = -1;
        let blocksEnabled = [];
        let blocksValidated = [];
        for( const block of this.#simulatorBlocks )
        {
            bc++;
            //console.log( "BLOCK : ", bc);
            let blockValid = true;
            let lc = -1;
            let a = [];
            for( const line of block.lines )
            {
                lc++;
                //console.log("LINE : ", lc);
                //console.log( "req : ", line.isRequired );
                //console.log( "com : ", line.isCompleted );
                let b = false;
                if( line.isRequired === true )
                {
                    if( line.isCompleted === true ) { b = true; }
                }
                else
                {
                    b = true;
                }
                // switch test here
                //if( blockSwitch === false ) { b = false; }
                a.push(b);
            }
            /// toutes les lignes sont contrôlées
            
            if( a.indexOf(false) >= 0 )
            {
                blockValid = false;
            }
            else
            {
                blockValid = true;
            }

            if( block.enabled === false ) { blockValid = true; }

            blocksEnabled.push(block.enabled);
            blocksValidated.push(blockValid);
        }

        //console.log( "blocksEnabled = ", blocksEnabled);
        //console.log( "blocksValidated = ", blocksValidated);

        if( blocksEnabled.indexOf(true) >=0  && blocksValidated.indexOf(false) == -1 )
        {
            //this.nextButton.enabled = true;
        }
        else
        {
            //this.nextButton.enabled = false;
        }
        
    }
}

window.customElements.define("axial-simulator-step-data-quote", AxialSimulatorStepDataQuote);
export { AxialSimulatorStepDataQuote }