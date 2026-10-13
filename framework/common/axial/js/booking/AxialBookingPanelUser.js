"use strict";

import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { DateUtils } from "../utils/DateUtils.js";
import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";

class AxialBookingPanelUser extends AxialComponentBase
{
    /// vars
    /** @type { Date } */
    #currentDate;

    /** @type { Number } */
    #currentStart;

    /** @type { Number } */
    #currentEnd;

    /** @type { String } */
    #apiBookingCreatePath = "./api/booking/create";

    /** @type { Object } */
    #currentBooking;

    /// elements
    /** @type { HTMLElement } */
    #requestState;

    /** @type { HTMLElement } */
    #confirmedState;
    
    /** @type { AxialServiceButton } */
    #saveButton;

    /** @type { HTMLElement } */
    #datetime;

    /** @type { HTMLElement } */
    #datetimeConfirmed;

    /** @type { HTMLInputElement } */
    #address;

    /** @type { HTMLInputElement } */
    #zip;

    /** @type { HTMLInputElement } */
    #city;

    /** @type { HTMLTextAreaElement } */
    #accessMessage;

    /// events
    /** @type { Function } */
    #boundSaveHandler;

    /** @type { Function } */
    #boundFocusOutHandler;


    constructor()
    {
        super();
        this.classList.add("axial_booking_panel");
        this.template = "axial-booking-panel-user-template";
        this.#apiBookingCreatePath = PathUtils.getPathFromRelative(this.#apiBookingCreatePath);
        console.log( this.#apiBookingCreatePath);
        this.#boundSaveHandler = this.#saveHandler.bind(this);
        this.#boundFocusOutHandler = this.#focusOutHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#requestState = this.shadowRoot.getElementById("requestState");
        this.#confirmedState = this.shadowRoot.getElementById("confirmedState");

        this.#saveButton = this.shadowRoot.getElementById("saveButton");
        this.#saveButton.enabled = false;
        this.#saveButton.addEventListener("click", this.#boundSaveHandler);

        this.#datetime = this.shadowRoot.getElementById("datetime");
        this.#datetimeConfirmed = this.shadowRoot.getElementById("datetimeConfirmed");

        this.#address = this.shadowRoot.getElementById("address");
        this.#zip = this.shadowRoot.getElementById("zip");
        this.#city = this.shadowRoot.getElementById("city");
        this.#accessMessage = this.shadowRoot.getElementById("accessMessage");

        this.#address.addEventListener("focusout", this.#boundFocusOutHandler );
        this.#zip.addEventListener("focusout", this.#boundFocusOutHandler );
        this.#city.addEventListener("focusout", this.#boundFocusOutHandler );
        this.#accessMessage.addEventListener("focusout", this.#boundFocusOutHandler );
    }

    get currentDate() { return this.#currentDate; }
    set currentDate( value )
    {
        this.#currentDate = value;
        this.#checkAndDisplayDatetime();
    }

    get currentStart() { return this.#currentStart; }
    set currentStart( value )
    {
        this.#currentStart = value;
        this.#checkAndDisplayDatetime();
    }

    get currentEnd() { return this.#currentEnd; }
    set currentEnd( value )
    {
        this.#currentEnd = value;
        this.#checkAndDisplayDatetime();
    }

    get currentBooking() { return this.#currentBooking; }
    set currentBooking( value )
    {
        this.#currentBooking = value;

        const date = new Date( this.#currentBooking.booking_date );
        const start = this.#currentBooking.booking_start;
        const end = this.#currentBooking.booking_end;

        const locale = DateUtils.toLocale( date );
        const time = `de ${start}h à ${end}h.`;

        const address = `${this.#currentBooking.address_line_1} ${this.#currentBooking.address_zip} ${this.#currentBooking.address_city}`

        this.#datetimeConfirmed.innerHTML = "Vous avez rendez-vous le :<br>" + locale  + " " + time + "<br>à cette adresse : <br>" + address;
        this.#displayConfirmedState();
    }

    #focusOutHandler( event )
    {
        this.#checkPanelValidity();
    }

    setInfos( date, start, end )
    {
        this.#currentDate =  date == undefined ? date : new Date(date);
        this.#currentStart = start;
        this.#currentEnd = end;

        this.#checkAndDisplayDatetime();
    }

    #checkAndDisplayDatetime()
    {
        if( this.#currentDate != undefined && this.#currentStart != undefined && this.#currentEnd != undefined )
        {
            const locale = DateUtils.toLocale( this.#currentDate );
            const time = `de ${this.#currentStart}h à ${this.#currentEnd}h.`;
            this.#datetime.innerHTML = "Vous prenez RDV le " + locale  + " " + time;
            this.#datetime.style.display = "block";
        }
        else
        {
            this.#datetime.style.display = "none";
            this.#datetime.innerHTML = "";
            this.#requestState.style.transform = "translateX(0)";
            this.#confirmedState.style.transform = "translateX(101%)";
        }
        this.#checkPanelValidity();
    }

    #checkPanelValidity()
    {
        let isValid = true;
        if( this.#currentDate == undefined || this.#currentDate == null ) { isValid = false; }
        if( this.#currentStart == undefined || this.#currentStart == null ) { isValid = false; }
        if( this.#currentEnd == undefined || this.#currentEnd == null ) { isValid = false; }

        if( this.#address.validity.valid == false ) { isValid = false; }
        if( this.#zip.validity.valid == false ) { isValid = false; }
        if( this.#city.validity.valid == false ) { isValid = false; }

        console.log(isValid);

        this.#saveButton.enabled = isValid;
    }

    #displayConfirmedState()
    {
        this.#requestState.style.transform = "translateX(-101%)";
        this.#confirmedState.style.transform = "translateX(0)";
    }

    #saveHandler( event )
    {
        this.#saveButton.enabled = false;
        this.#saveButton.loading = true;
        this.#createBooking();
    }

    reinit()
    {
        this.#saveButton.enabled = false;
        this.#saveButton.loading = false;

        this.#address.value = "";
        this.#zip.value = "";
        this.#city.value = "";
        this.#accessMessage.value = "";

        this.#datetime.style.display = "none";
        this.#datetime.innerHTML = "";
        this.#requestState.style.transform = "translateX(0)";
        this.#confirmedState.style.transform = "translateX(101%)";
    }

    async #createBooking()
    {
        try
        {
            const uuid = window.AXIAL.userUuid;
            const body = 
            {
                kind: "event",
                created_for: uuid,
                booking_date: this.#currentDate,
                booking_start: this.#currentStart,
                booking_end: this.#currentEnd,
                address_line_1: this.#address.value,
                address_zip: this.#zip.value,
                address_city: this.#city.value,
                access_message: this.#accessMessage.value
            }
            const json = await FetchUtils.POST( this.#apiBookingCreatePath, body );
            if( json.status && json.status == "ok" )
            {
                this.currentBooking = body; // check currentbooking setter
                const bookingEvent = new CustomEvent("bookingCreated", { bubbles: true, composed: true} );
                this.dispatchEvent( bookingEvent );
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-booking-panel-user", AxialBookingPanelUser);
export { AxialBookingPanelUser }