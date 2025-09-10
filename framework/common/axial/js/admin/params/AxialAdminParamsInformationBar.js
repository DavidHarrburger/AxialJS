"use strict";

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { AxialToggleSwitch } from "../../button/AxialToggleSwitch.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialDropdownCalendar } from "../../dropdown/AxialDropdownCalendar.js";
import { AxialCalendarButton } from "../../date/AxialCalendarButton.js";
import { DateUtils } from "../../utils/DateUtils.js";

class AxialAdminParamsInformationBar extends AxialServiceComponentBase
{
    /** @type { AxialToggleSwitch } */
    #switch;

    /** @type { HTMLInputElement } */
    #message;

    /** @type { AxialDropdownCalendar } */
    //#calendarStart;

    /** @type { AxialDropdownCalendar } */
    //#calendarEnd;

    /** @type { AxialCalendarButton } */
    #calendarStart;

    /** @type { AxialCalendarButton } */
    #calendarEnd;

    /** @type { HTMLInputElement } */
    #textColor;

    /** @type { HTMLInputElement } */
    #themeColor;

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

    _buildComponent()
    {
        super._buildComponent();

        this.#switch = this.shadowRoot.getElementById("switch");
        this.#message = this.shadowRoot.getElementById("message");
        this.#calendarStart = this.shadowRoot.getElementById("calendarStart");
        this.#calendarEnd = this.shadowRoot.getElementById("calendarEnd");
        this.#textColor = this.shadowRoot.getElementById("textColor");
        this.#themeColor = this.shadowRoot.getElementById("themeColor");
        this.#button = this.shadowRoot.getElementById("button");

        this.#switch.enabled = false;
        this.#message.setAttribute("disabled", "");
        this.#calendarStart.enabled = false;
        this.#calendarEnd.enabled = false;
        this.#textColor.setAttribute("disabled", "");
        this.#themeColor.setAttribute("disabled", "");

        this.#switch.addEventListener("toggleChanged", this.#boundSwitchToggleChangedHandler);
        this.#button.addEventListener("click", this.#boundButtonClickHandler);

        this.loadGetData();
    }

    _onGetResponse()
    {
        try
        {
            console.log("INFOBAR");
            console.log( DateUtils.tomorrow() );

            this.#switch.enabled = true;
            console.log( this.getData );
            const props = this.getData.content;
            

            if( props !== null )
            {
                this.#switch.selected = props.active;
                this.#message.value = props.message;
                
                let tempDateStart = new Date(props.date_start);
                let tempDateEnd = new Date(props.date_end);

                //this.#calendarStart.date = tempDateStart;
                //this.#calendarEnd.date = tempDateEnd;

                
                if( DateUtils.isValidDate(tempDateStart) === true && DateUtils.isValidDate(tempDateEnd) === true && DateUtils.isInPeriod( tempDateStart, tempDateEnd ) === true )
                {
                    this.#calendarStart.date = tempDateStart;
                    this.#calendarEnd.date = tempDateEnd;
                }
                

                this.#textColor.value = props.text_color;
                this.#themeColor.value = props.theme_color;

                if( this.#switch.selected === true )
                {
                    this.#message.removeAttribute("disabled");
                    this.#calendarStart.enabled = true;
                    this.#calendarEnd.enabled = true;
                    this.#textColor.removeAttribute("disabled");
                    this.#themeColor.removeAttribute("disabled");
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
        
        let postObject = 
        {
            active: this.#switch.selected,
            message: this.#message.value,
            date_start: this.#calendarStart.date,
            date_end: this.#calendarEnd.date,
            text_color: this.#textColor.value,
            theme_color: this.#themeColor.value
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

    #switchToggleChangedHandler( event )
    {
        if( this.#switch.selected === true )
        {
            this.#message.removeAttribute("disabled");
            this.#calendarStart.enabled = true;
            this.#calendarEnd.enabled = true;
            this.#textColor.removeAttribute("disabled");
            this.#themeColor.removeAttribute("disabled");
        }
        else
        {
            this.#message.setAttribute("disabled", "");
            this.#calendarStart.enabled = false;
            this.#calendarEnd.enabled = false;
            this.#textColor.setAttribute("disabled", "");
            this.#themeColor.setAttribute("disabled", "");
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