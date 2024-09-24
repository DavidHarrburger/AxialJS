"use strict";

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { AxialToggleSwitch } from "../../button/AxialToggleSwitch.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialDropdownCalendar } from "../../dropdown/AxialDropdownCalendar.js";
import { DateUtils } from "../../utils/DateUtils.js";

class AxialAdminParamsInformationBar extends AxialServiceComponentBase
{
    /** @type { AxialToggleSwitch } */
    #switch;

    /** @type { HTMLInputElement } */
    #message;

    /** @type { AxialDropdownCalendar } */
    #calendarStart;

    /** @type { AxialDropdownCalendar } */
    #calendarEnd;

    /** @type { AxialServiceButton } */
    #button;

    /// events
    /** @type { Function } */
    #boundSwitchToggleChangedHandler;

    /** @type { Function } */
    #boundButtonClickHandler;

    /** @type { Function } */
    #boundDateStartChangedHandler;

    /** @type { Function } */
    #boundDateEndChangedHandler;

    constructor()
    {
        super();
        this.classList.add("axial_admin_params_infobar");
        this.template = "axial-admin-params-infobar-template";
        this.#boundSwitchToggleChangedHandler = this.#switchToggleChangedHandler.bind(this);
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);
        this.#boundDateStartChangedHandler = this.#dateStartChangedHandler.bind(this)
        this.#boundDateEndChangedHandler = this.#dateEndChangedHandler.bind(this)
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#switch = this.shadowRoot.getElementById("switch");
        this.#message = this.shadowRoot.getElementById("message");
        this.#calendarStart = this.shadowRoot.getElementById("calendarStart");
        this.#calendarEnd = this.shadowRoot.getElementById("calendarEnd");
        this.#button = this.shadowRoot.getElementById("button");

        this.#switch.enabled = false;
        this.#message.setAttribute("disabled", "");
        this.#calendarStart.enabled = false;
        this.#calendarEnd.enabled = false;

        this.#switch.addEventListener("toggleChanged", this.#boundSwitchToggleChangedHandler);
        this.#button.addEventListener("click", this.#boundButtonClickHandler);

        this.loadGetData();
    }

    _onGetResponse()
    {
        try
        {
            console.log("INFOBAR");
            console.log( DateUtils.tomorrow());

            this.#switch.enabled = true;
            this.#switch.selected = this.getData.content.isRequired;
            
            this.#message.value = this.getData.content.information;

            let tempDateStart = new Date(this.getData.content.dateStart);
            let tempDateEnd = new Date(this.getData.content.dateEnd);
            console.log( tempDateStart.getTime());
            console.log( Date.now() );

            if( tempDateStart.getTime() < Date.now() )
            {
                tempDateStart = new Date();
                tempDateEnd = DateUtils.tomorrow();
            }

            this.#calendarStart.date = tempDateStart;
            this.#calendarEnd.date = tempDateEnd;

            if( this.#switch.selected === true )
            {
                this.#message.removeAttribute("disabled");
                this.#calendarStart.enabled = true;
                this.#calendarEnd.enabled = true;
                this.#calendarEnd.enabled = true;
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
        finally
        {
            console.log("Info bar updated ???");
        }
        
    }

    _preparePostData()
    {
        const postObject = 
        {
            isRequired: this.#switch.selected,
            information: this.#message.value,
            dateStart: this.#calendarStart.date,
            dateEnd: this.#calendarEnd.date
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

    #switchToggleChangedHandler( event )
    {
        if( this.#switch.selected === true )
        {
            this.#message.removeAttribute("disabled", "");
            this.#calendarStart.enabled = true;
            this.#calendarEnd.enabled = true;
        }
        else
        {
            this.#message.setAttribute("disabled", "");
            this.#calendarStart.enabled = false;
            this.#calendarEnd.enabled = false;
        }
    }

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

    /**
     * 
     * @param { CustomEvent } event 
     */
    #dateStartChangedHandler( event )
    {

    }

    #dateEndChangedHandler( event )
    {
        
    }
}
window.customElements.define("axial-admin-params-infobar", AxialAdminParamsInformationBar);
export { AxialAdminParamsInformationBar }