"use strict";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { AxialQuote } from "../../quotes/AxialQuote.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { PathUtils } from "../../utils/PathUtils.js";

class AxialModuleQuotePopup extends AxialModulePopup
{
    /** @type { String } */
    #simulatorsPath = "./assets/models/simulators.json";

    /** @type { String } */
    #apiProductListPath = "./api/product/list";

    /** @type { Object } */
    #simulators;

    /** @type { Array<Object> } */
    #products;

    /** @type { Map } */
    #productsMap;

    /** @type { AxialQuote } */
    #quote;

    constructor()
    {
        super();
        this.template = "axial-module-quote-popup-template";
        this.#simulatorsPath = PathUtils.getPathFromRelative(this.#simulatorsPath);
        this.#apiProductListPath = PathUtils.getPathFromRelative( this.#apiProductListPath );
    }

    _buildComponent()
    {
        super._buildComponent();
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
            
            const productsJson = await FetchUtils.GET( this.#apiProductListPath );
            
            this.#products = productsJson.content;
            this.#productsMap = new Map();
            for( const p of this.#products )
            {
                const uuid = p.uuid;
                this.#productsMap.set( uuid, p );
            }

        }
        catch(err)
        {
            console.log(err);
        }

    }

    _onDataChanged()
    {
        this.title = this.data.simulation_name;
        console.log( "quote popup data = ", this.data);
        this.#computeQuote();
    }

    #computeQuote()
    {
        let selectedSimulators = [];
        const savedData = this.data.data;
        for( const step of savedData )
        {
            if( step.class === "AxialSimulatorStepSelection" )
            {
                selectedSimulators = step.selectedSimulators;
                break;
            }
        }

        if( selectedSimulators.length > 0 )
        {
            /// JUST FOR TEST BE CARREFULL
            
            let dataCounter = 0;

            
            let finalQuoteMap = new Array();
            for( const simulatorName of selectedSimulators )
            {
                
                let quoteMap = new Map();
                
                const model = this.#getSimulatorByName( simulatorName );
                console.log( model );
                dataCounter++;
                const currentData = savedData[dataCounter].steps;
                console.log( currentData );
                if( model !== undefined )
                {
                    
                    //////////////////////////


                    const quoteLines = model.quote_lines
                    for( const quoteLine of quoteLines )
                    {
                        console.warn(" WE BUILD THE QUOTE LINE", quoteLine );
                        // on check si l'id de l'article existe bien dans la base et que c'est bien une chaine --> si non on ne peut pas faire le devis pour le client
                        const productUuid = quoteLine.product;
                        if( productUuid !== undefined && typeof productUuid === "string" )
                        {
                            const product = this.#productsMap.get( productUuid );
                            //console.log(product);
                            if( product )
                            {
                                let quantity = 0;
                                const blockModel = model.steps[ quoteLine.block ];
                                const blockData = currentData[ quoteLine.block];
                                //console.log( blockModel );
                                //console.log( blockData );
                                const isAdded = blockModel.useAdd;
                                //console.log( isAdded );

                                if( isAdded == false  || isAdded == undefined ) // && quoteLine.line != -1 ??????
                                {
                                    const lineModel = blockModel.lines[ quoteLine.line ];
                                    const lineType = lineModel.type;
                                    //console.log("lineType ", lineType)

                                    const lineData = blockData.lines[ quoteLine.line ];
                                    //console.log( lineData );
                                    
                                    // on récupère la valeur en fonction du type de ligne
                                    switch( lineType )
                                    {
                                        case "dim":
                                            const dimIndex = quoteLine.index;
                                            if( dimIndex == 0 ) { quantity = lineData.len; }
                                            else if( dimIndex == 1 ) { quantity = lineData.wid; }
                                            else if( dimIndex == 2 ) { quantity = lineData.len + lineData.wid; }
                                            else if( dimIndex == 3 ) { quantity = lineData.len * lineData.wid; }
                                        break;

                                        case "num":
                                            quantity = lineData.num;
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

                                    // on check enfin l'item est conditionnel ou non
                                    const condition = quoteLine.cond;
                                    
                                    if( condition !== undefined && Array.isArray(condition) === true )
                                    {
                                        //console.log( "check condition")
                                        const conditionBlockModel = model.steps[ condition[0] ];
                                        const conditionBlockData = currentData[ condition[0] ];

                                        //const conditionBlock = this.#simulatorBlocks[ condition[0] ];
                                        
                                        const conditionLineModel = conditionBlockModel.lines[ condition[1] ];
                                        const conditionLineData = conditionBlockData.lines[ condition[1] ];

                                        //console.log( "conditionLineData", conditionLineData )
                                        
                                        let calcCondition;
                                        if( conditionLineData.selected )
                                        {
                                            calcCondition = conditionLineData.selected;
                                        }
                                        
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
                                    
                                    quoteMap.set( quoteLine.name, { product: product, quantity: quantity } );
                                }
                                else
                                {
                                    console.warn("CASE LINE TO ADD")
                                    console.log( quoteLine );
                                    const lineTypeToAdd = blockModel.lineToAdd.type;
                                    console.log( "lineTypeToAdd ", lineTypeToAdd );
                                    //const lines = block.lines;
                                    console.log( blockData )
                                    const linesData = blockData.lines;
                                    console.log( linesData );
                                    
                                    let dimQuantity = 0;
                                    for( const lineData of linesData )
                                    {
                                        //const lineType = L.line.type;

                                        switch( lineTypeToAdd )
                                        {
                                            case "select":
                                                const key = lineData.value;
                                                console.log( "SELECT", key );
                                                
                                                if( quoteLine.name == key )
                                                {
                                                    if( quoteMap.has( key ) === true )
                                                    {
                                                        const newQuantity = quoteMap.get(key).quantity + 1;
                                                        quoteMap.set( key, { product: product, quantity: newQuantity } );
                                                    }
                                                    else
                                                    {
                                                        quoteMap.set( key, { product: product, quantity: 1 } );
                                                    }
                                                }
                                            break;

                                            case "dim":
                                                const dimIndex = quoteLine.index;
                                                if( dimIndex == 0 ) { dimQuantity = lineData.len; }
                                                else if( dimIndex == 1 ) { dimQuantity = lineData.wid; }
                                                else if( dimIndex == 2 ) { dimQuantity = lineData.len + lineData.wid; }
                                                else if( dimIndex == 3 ) { dimQuantity = lineData.len * lineData.wid; }
                                                //dimQuantity = dimQuantity + L._getCalculation()[quoteLine.index];
                                            break;

                                            default:
                                            break;
                                        }
                                    }

                                    // condition
                                    if( lineTypeToAdd === "dim" )
                                    {
                                        // check condition here, willbe probably be factorized
                                        const condition = quoteLine.cond;
                                        if( condition !== undefined && Array.isArray(condition) === true )
                                        {
                                            //console.log( "check condition")
                                            const conditionBlockModel = model.steps[ condition[0] ];
                                            const conditionBlockData = currentData[ condition[0] ];
                                            
                                            const conditionLineModel = conditionBlockModel.lines[ condition[1] ];
                                            const conditionLineData = conditionBlockData.lines[ condition[1] ];

                                            //console.log( "conditionLineData", conditionLineData )
                                            
                                            let calcCondition;
                                            if( conditionLineData.selected )
                                            {
                                                calcCondition = conditionLineData.selected;
                                            }
                                            
                                            const quoteLineName = quoteLine.name;
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
                                                dimQuantity = calcCondition == quoteLineName ? dimQuantity : 0;
                                            }
                                        }
                                    
                                        quoteMap.set( quoteLine.name, { product: product, quantity: dimQuantity } );
                                    }
                                }
                            }
                        }
                    }

                //console.log( quoteMap );        
                }
                finalQuoteMap.push( { sectionTitle: model.name, map: quoteMap } );
            }
            
            this.#quote.data = finalQuoteMap;
        }
        else
        {
            // display warning message
        }

    }

    #getSimulatorByName( simName )
    {
        for( const sim of this.#simulators )
        {
            if( sim.id === simName )
            {
                return sim;
            }
        }
        return undefined;
    }
}

window.customElements.define("axial-module-quote-popup", AxialModuleQuotePopup);
export { AxialModuleQuotePopup }