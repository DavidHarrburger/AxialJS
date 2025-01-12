"use strict";

import { AxialComponentBase } from "./AxialComponentBase.js";

class AxialServiceComponentBase extends AxialComponentBase
{
    /** @type { String } */
    #getPath;

    /** @type { Object } */
    #getData = undefined;

    /** @type { String } */
    #postPath;

    /** @type { Object } */
    #postData = undefined;

    constructor()
    {
        super();
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#getPath = this.getAttribute("axial-get-path");
        this.#postPath = this.getAttribute("axial-post-path");
    }

    /**
     * @readonly
     */
    get getPath() { return this.#getPath; }

    /**
     * @readonly
     */
    get getData() { return this.#getData; }

    /**
     * @readonly
     */
    get postPath() { return this.#postPath; }

    /**
     * @readonly
     */
    get postData() { return this.#postData; }

    /**
     * will be just removed in future versions
     * @deprecated
     */
    initialize()
    {
        this.#getData = undefined;
        this.#postData = undefined;
    }

    /**
     * Start the private 'callService' if servicePath is provided. You can override to provide your own logic
     * @public
     */
    async loadGetData()
    {
        await this.#loadGetData();
    }

    /**
     * Override to implement your own logic
     * @private
     */
    async #loadGetData()
    {
        if( this.#getPath === undefined || this.#getPath === null ) { return; }
        try
        {
            const path = this._prepareGetData();
            console.log( path );
            const response = await fetch( path, { method: "GET", headers: { "Content-Type":"application/json" } } );
            const json = await response.json();
            this.#getData = json;
            const serviceEvent = new CustomEvent( "serviceSuccess", { detail: { data: this.#getData, method:"get" } } );
            this.dispatchEvent( serviceEvent );
        }
        catch(err)
        {
            console.log(err);
            const serviceEvent = new CustomEvent( "serviceError", { detail: { error: err.message, method: "get" } } );
            this.dispatchEvent( serviceEvent );
        }
        finally
        {
            this._onGetResponse();
        }
    }

    async loadPostData()
    {
        await this.#loadPostData();
    }

    async #loadPostData()
    {
        if( this.#postPath === undefined || this.#postPath === null ) { return; }
        try
        {
            const infos = this._preparePostData();
            const response = await fetch(this.#postPath, { method: "POST", body: JSON.stringify(infos), headers: { "Content-Type":"application/json" } } );
            const json = await response.json();
            this.#postData = json;
                
            const serviceEvent = new CustomEvent( "serviceSuccess", { detail: { data: this.#postData, method: "post" } } );
            this.dispatchEvent( serviceEvent );
        }
        catch(err)
        {
            console.log(err);
            const serviceEvent = new CustomEvent( "serviceError", { detail: { error: err.message, method: "post" } } );
            this.dispatchEvent( serviceEvent );
        }
        finally
        {
            this._onPostResponse();
        }
    }

    /**
     * Update component once data are loaded or not. Use _onGetResponse or _onPostResponse abstract methods
     * @abstract
     * @deprecated
     */
    _updateComponent() {}

    /**
     * Update component once get data are loaded or not
     * @abstract
     */
    _onGetResponse() {}

    /**
     * Update component once post data are loaded or not
     * @abstract
     */
    _onPostResponse() {}

    /**
     * Prepare the data as you want ;)
     * @abstract
     * @returns { Object }
     */
    _prepareGetData() { return this.#getPath; }

    /**
     * Prepare the data as you want ;)
     * @abstract
     * @returns { Object }
     */
    _preparePostData() { return {}; }
}

window.customElements.define("axial-service-component-base", AxialServiceComponentBase);
export { AxialServiceComponentBase }
