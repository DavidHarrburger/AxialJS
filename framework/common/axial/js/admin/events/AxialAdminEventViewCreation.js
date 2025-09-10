"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialViewBase } from "../../view/AxialViewBase.js";
import { AxialCalendarButton } from "../../date/AxialCalendarButton.js";

class AxialAdminEventViewCreation extends AxialViewBase
{
    /// vars
    

    /// elements
    /** @type { HTMLElement } */
    #main;

    /** @type { Array<HTMLInputElement> } */
    #inputs = new Array();

    /** @type { AxialCalendarButton } */
    #startCalendarButton;

    /** @type { HTMLInputElement } */
    #startTime;

    /** @type { AxialCalendarButton } */
    #endCalendarButton;

    /** @type { HTMLInputElement } */
    #endTime;

    /** @type { AxialServiceButton } */
    #saveButton;

    /// styles
    /** @type { String } */
    #normalColor = "#232323";

    /** @type { String } */
    #errorColor = "#cc0000";

    /// events
    /** @type { Function } */
    #boundSaveHandler;

    /** @type { Function } */
    #boundDateStartChangedHandler;

    /** @type { Function } */
    #boundTimeStartChangedHandler;

    /** @type { Function } */
    #boundInputChangedHandler;

    /** @type { Function } */
    #boundCalendarChangedHandler;

    constructor()
    {
        super();
        this.template = "axial-admin-event-view-creation-template";
        this.postPath = "../api/events/set";
        this.#boundSaveHandler = this.#saveHandler.bind(this);
        this.#boundDateStartChangedHandler = this.#dateStartChangedHandler.bind(this);
        this.#boundTimeStartChangedHandler = this.#timeStartChangedHandler.bind(this);
        this.#boundInputChangedHandler = this.#inputChangedHandler.bind(this);
        this.#boundCalendarChangedHandler = this.#calendarChangedHandler.bind(this);
    }

    _preparePostData()
    {
        return this.#getViewAsObject();
    }

    _buildComponent()
    {
        this.#main = this.shadowRoot.getElementById("main");
        if( this.#main )
        {
            this.#inputs = Array.from( this.#main.getElementsByTagName("input") );
        }

        for( const input of this.#inputs )
        {
            input.addEventListener("focusout", this.#boundInputChangedHandler);
        }

        this.#saveButton = this.shadowRoot.getElementById("saveButton");

        this.#startCalendarButton = this.shadowRoot.getElementById("startCalendarButton");
        if( this.#startCalendarButton )
        {
            this.#startCalendarButton.addEventListener("dateChanged", this.#boundDateStartChangedHandler );
            this.#startCalendarButton.addEventListener("dateChanged", this.#boundCalendarChangedHandler );
        }

        this.#startTime = this.shadowRoot.getElementById("startTime");
        if( this.#startTime )
        {
            this.#startTime.addEventListener("input", this.#boundTimeStartChangedHandler);
        }

        this.#endCalendarButton = this.shadowRoot.getElementById("endCalendarButton");
        if( this.#endCalendarButton )
        {
            this.#endCalendarButton.enabled = false;
            this.#endCalendarButton.addEventListener("dateChanged", this.#boundCalendarChangedHandler );
        }

        this.#endTime = this.shadowRoot.getElementById("endTime");
        if( this.#endTime )
        {
            this.#endTime.setAttribute("disabled", "");
        }

        if( this.#saveButton )
        {
            this.#saveButton.enabled = false;
            this.#saveButton.addEventListener("click", this.#boundSaveHandler);
        }
    }

    #saveHandler( event )
    {
        this.#saveButton.loading = true;
        this.loadPostData();
        //console.log(window.AXIAL.userUuid)
        //const eventStepCompleted = new CustomEvent("eventStepCompleted", { bubbles: false } );
        //this.dispatchEvent(eventStepCompleted);
    }

    #getViewAsObject()
    {
        let o = {};
        for( const input of this.#inputs )
        {
            const prop = input.name;
            const value = input.value;
            o[prop] = value;
        }

        o.date_start = this.#startCalendarButton.date;
        o.date_end = this.#endCalendarButton.date;

        const uuid = window.AXIAL.userUuid;

        o.user_uuid = uuid;

        return o;
    }

    _onPostResponse()
    {
        console.log("event post response ok");
        this.#saveButton.loading = false;
        this.#saveButton.enabled = false;
        if( this.postData.content && this.postData.content.insertedId )
        {
            const eventStepCompleted = new CustomEvent("eventStepCompleted", { bubbles: false, detail: {_id: this.postData.content.insertedId } } );
            this.dispatchEvent(eventStepCompleted);
        }
    }

    #checkView()
    {
        let valid = true;
        for( const input of this.#inputs )
        {
            if( input.validity.valid === false )
            {
                valid = false;
                break;
            }
        }

        if( this.#startCalendarButton.date === undefined ) { valid = false; }
        if( this.#endCalendarButton.date === undefined ) { valid = false; }
        
        if( this.#saveButton )
        {
            this.#saveButton.enabled = valid;
        }

    }

    init()
    {
        this.#startCalendarButton.calendar.allowPast = false;
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #dateStartChangedHandler( event )
    {
        const newDate = event.detail.date;
        if( this.#endCalendarButton )
        {
            this.#endCalendarButton.calendar.min = newDate;
        }
        this.#checkStartValues();
    }

    #timeStartChangedHandler( event )
    {
        this.#checkStartValues();
    }

    #checkStartValues()
    {
        if( this.#startTime.value !== "" && this.#startCalendarButton.date !== undefined )
        {
            this.#endCalendarButton.enabled = true;
            this.#endTime.removeAttribute("disabled");
        }
    }

    #inputChangedHandler( event )
    {
        const input = event.target;
        if( input.validity.valid === false )
        {
            input.style.borderColor = this.#errorColor;
        }
        else
        {
            input.style.borderColor = this.#normalColor;
        }
        this.#checkView();
    }

    #calendarChangedHandler( event )
    {
        this.#checkView();
    }
    
}

window.customElements.define("axial-admin-event-view-creation", AxialAdminEventViewCreation);
export { AxialAdminEventViewCreation }