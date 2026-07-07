"use strict";

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { AxialToggleSwitch } from "../../button/AxialToggleSwitch.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialDropdownCalendar } from "../../dropdown/AxialDropdownCalendar.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { AxialWeekPlanning } from "../../date/AxialWeekPlanning.js";

class AxialAdminParamsWeekTime extends AxialServiceComponentBase
{
    /** @type { AxialWeekPlanning } */
    #weekPlanning;

    /** @type { AxialServiceButton } */
    #button;

    /// events
    /** @type { Function } */
    #boundButtonClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_params_weektime");
        this.template = "axial-admin-params-weektime-template";
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#weekPlanning = this.shadowRoot.getElementById("weekPlanning");
        this.#button = this.shadowRoot.getElementById("button");

        this.#button.addEventListener("click", this.#boundButtonClickHandler);
        
        this.loadGetData();
    }

    _onGetResponse()
    {
        try
        {
            console.log("WEEKTIME");
            console.log(this.getData);
            const props = this.getData.content;
            if( props !== null )
            {
                if( props.planning_half && Array.isArray(props.planning_half) )
                {
                    this.#weekPlanning.setFromArray( props.planning_half );
                }
            }

        }
        catch(err)
        {
            console.log(err);
        }
    }

    _onPostResponse()
    {
        try
        {
            this.#button.loading = false;
        }
        catch(err)
        {
            console.log(err);
        }
    }

    _preparePostData()
    {
        const planningHalf = this.#weekPlanning.getAsArray();
        let postObject = 
        {
            active: false,
            message: "test",
            mode: "half",
            planning_half: planningHalf,
            planning_full: []
        }
        if( this.getData.content && this.getData.content._id )
        {
            postObject._id = this.getData.content._id;
        }
        return postObject;
        
    }

    #checkForm()
    {

    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    /*
    #serviceSuccessHandler( event )
    {

        const method = event.detail.method;
        if( method == "get" )
        {
            
        }
        else if( method == "post" )
        {
            
        }
    }
    */

    async #buttonClickHandler( event )
    {
        this.#button.loading = true;
        try
        {
            await this.loadPostData();
        }
        catch(err)
        {
            console.log(err);
        }
    }

}
window.customElements.define("axial-admin-params-weektime", AxialAdminParamsWeekTime);
export { AxialAdminParamsWeekTime }