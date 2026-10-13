"use strict";



import { PathUtils } from "../../utils/PathUtils.js";
import { DomUtils } from "../../utils/DomUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";

import { AxialModulePopup } from "../../popup/AxialModulePopup.js";
import { AxialList } from "../../list/AxialList.js";
import { AxialModuleSearchListItem } from "./AxialModuleSearchListItem.js";

class AxialModuleSearchPopup extends AxialModulePopup
{
    /// elements
    /** @type { AxialList } */
    #list;

    /** @type { HTMLInputElement } */
    #searchInput;

    /// vars
    /** @type { String } */
    #collection;

    /** @type { String } */
    #model;

    /** @type { Array } */
    #displayedFields;

    /** @type { String } */
    #searchPath = "./api/data/get";

    /** @type { Object } */
    #searchData;

    /** @type { Object } */
    #filteredSearchData;

    /** @type { Boolean } */
    #isFetching = false;

    /** @type { Array } */
    #filters = new Array();

    /** @type { String } */
    #query;

    /** @type { Object } */
    #selectedData;

    /// events
    /** @type {Function } */
    #boundSearchInputHandler;

    /** @type {Function } */
    #boundSearchItemSelectedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_module_search_popup");
        this.template = "axial-module-search-popup-template";
        this.#searchPath = PathUtils.getPathFromRelative(this.#searchPath);

        this.position = "right";
        this.animation = "translate_left";
        this.useObfuscator = true;

        this.#boundSearchItemSelectedHandler = this.#searchItemSelectedHandler.bind(this);
    }

    /**
     * @readonly
     * @type { Object }
     */
    get selectedData() { return this.#selectedData; }

    get collection() { return this.#collection; }
    set collection( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String required");
        }
        this.#collection = value;
        this.getSearchData();
    }

    get model() { return this.#model; }
    set model( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String required");
        }
        this.#model = value;
        this.getSearchData();
    }

    get filters() { return this.#filters; }
    set filters( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String required");
        }
        this.#filters = value;
        this.getSearchData();
    }

    get displayedFields() { return this.#displayedFields; }
    set displayedFields( value )
    {
        if( Array.isArray( value ) === false )
        {
            throw new TypeError("Array required");
        }
        this.#displayedFields = value;
    }
    
    _buildComponent()
    {
        super._buildComponent();
        this.#searchInput = this.shadowRoot.getElementById("searchInput");
        this.#list = this.shadowRoot.getElementById("list");
        this.#list.itemClass = AxialModuleSearchListItem;
        this.#list.searchInput = this.#searchInput;
    }

    async getSearchData()
    {
        if( this.#collection === undefined ) { return; }
        if( this.#model === undefined ) { return; }
        //if( this.#query === undefined ) { return; }
        try
        {
            const localQuery = `c=${this.#collection}&m=${this.#model}&f=model,${this.#model}`;
            const json = await FetchUtils.GET(this.#searchPath, localQuery);
            console.log(json);
            this.#searchData = json.content;
            const searchEvent = new CustomEvent( "searchSuccess", { detail: { data: this.#searchData } } );
            this.dispatchEvent( searchEvent );
        }
        catch(err)
        {
            console.log(err);
            const searchEvent = new CustomEvent( "searchError", { detail: { error: err.message } } );
            this.dispatchEvent( searchEvent );
        }
        finally
        {
            this.#isFetching = false;
            this.#buildSearch();
        }
    }

    #buildSearch()
    {
        console.log("buildSearch", this.#searchData);
        //this.#list.data = this.#searchData;
        
        this.#list.empty()
        if( this.#searchData )
        {
            for( const so of this.#searchData )
            {
                const item = new AxialModuleSearchListItem();
                item.displayedFields = this.#displayedFields;
                item.data = so;
                item.addEventListener("searchItemSelected", this.#boundSearchItemSelectedHandler);
                this.#list.addListItem(item);
            }
        }
    }

    clearFilters()
    {
        this.#filters = new Array();
    }
    /**
     * Add a filter that check an object. The filter function must return true or false and must have a data object param
     * @param { Function } filter 
     */
    addFilter( filter )
    {
        this.#filters.push(filter);
    }

    #filterData()
    {
        this.#filteredSearchData = new Array();
        
        if( this.#filters.length === 0 )
        {
            this.#filteredSearchData = this.#searchData;
            return;
        }

        for( const so of this.#searchData )
        {
            for( const filterFunction of this.#filters )
            {
                const isFiltered = filterFunction( so );
                //console.log( "isFiltered", isFiltered );
                if( isFiltered === false )
                {
                    this.#filteredSearchData.push(so);
                    break;
                }
            }
        }
        //console.log(this.#filteredSearchData);
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #searchItemSelectedHandler( event )
    {
        console.log( event );
        this.#selectedData = event.detail.data;
        this.hide();
        /*
        if( this.caller !== undefined && this.caller instanceof AxialComponentBase === true ) // not the right place to check but works
        {
            const caller = this.caller;
            caller.data = event.detail;
            this.caller = undefined;
            this.hide();
        }
        */
    }

    _onHiding()
    {
        //this.clearFilters();
    }
}

window.customElements.define("axial-module-search-popup", AxialModuleSearchPopup);
export { AxialModuleSearchPopup }