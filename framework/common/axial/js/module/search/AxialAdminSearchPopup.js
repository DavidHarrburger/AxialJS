"use strict";

import { AxialAdminPopup } from "../base/AxialAdminPopup.js";
import { AxialAdminSearchPopupItem } from "./AxialAdminSearchPopupItem.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { DomUtils } from "../../utils/DomUtils.js";
import { AxialComponentBase } from "../../core/AxialComponentBase.js";

class AxialAdminSearchPopup extends AxialAdminPopup
{
    /// elements
    /** @type { HTMLInputElement } */
    #searchInput;

    /** @type { HTMLElement } */
    #searchResult;

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

    /// events
    /** @type {Function } */
    #boundSearchInputHandler;

    /** @type {Function } */
    #boundSearchItemSelectedHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-search-popup-template";
        this.#searchPath = PathUtils.getPathFromRelative(this.#searchPath);

        this.#boundSearchItemSelectedHandler = this.#searchItemSelectedHandler.bind(this);
    }

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
        this.#searchResult = this.shadowRoot.getElementById("searchResult");
    }

    async getSearchData()
    {
        if( this.#collection === undefined ) { return; }
        if( this.#model === undefined ) { return; }
        try
        {
            const userUuid = window.AXIAL.userUuid;
            const path = `${this.#searchPath}?c=${this.#collection}&m=${this.#model}&f=user_uuid,${userUuid}`;
            console.log("searchPath", path);
            const response = await fetch( path, { method: "GET", headers: { "Content-Type":"application/json", "Cache-Control":"no-cache" } } );
            const json = await response.json();
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
        DomUtils.cleanElement(this.#searchResult);
        if( this.#searchData )
        {
            this.#filterData();
            for( const so of this.#filteredSearchData )
            {
                const item = new AxialAdminSearchPopupItem();
                item.displayedFields = this.#displayedFields;
                item.data = so;
                item.addEventListener("searchItemSelected", this.#boundSearchItemSelectedHandler);
                this.#searchResult.appendChild(item);
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
        if( this.caller !== undefined && this.caller instanceof AxialComponentBase === true ) // not the right place to check but works
        {
            const caller = this.caller;
            caller.data = event.detail;
            this.caller = undefined;
            this.hide();
        }
    }

    _onHiding()
    {
        this.clearFilters();
    }
}

window.customElements.define("axial-admin-search-popup", AxialAdminSearchPopup);
export { AxialAdminSearchPopup }