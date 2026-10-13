"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialAgenda } from "../date/AxialAgenda.js";
import { AxialBookingPanelUser } from "./AxialBookingPanelUser.js";
import { AxialBookingPanelAdmin } from "./AxialBookingPanelAdmin.js";
import { AxialAgendaCell } from "../date/AxialAgendaCell.js";

import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { AxialIconButton } from "../button/AxialIconButton.js";

class AxialBookingAgenda extends AxialComponentBase
{
    /// vars
    /** @type { Array<Object>} */
    #bookings = [];

    /** @type { Number } */
    #widthBreakpoint = 1200;

    /** @type { Boolean } */
    #panelOpen = false;

    /** @type { String } */
    #panelTransformOpen = "translateY(0)";

    /** @type { String } */
    #panelTransformClose = "translateY(101%)";

    /// elements
    /** @type { AxialAgenda } */
    #agenda;

    /** @type { HTMLElement } */
    #panelHolder;

    /** @type { AxialBookingPanelAdmin | AxialBookingPanelUser } */
    #panel;

    /** @type { AxialIconButton } */
    #closer;

    /** @type { String } */
    #localRole;

    /** @type { String } */
    #apiBookingParamGetPath = "./api/booking/param/get"; // on get params plus bookings en cours selon role

    /** @type { String } */
    #apiBookingListPath = "./api/booking/list/"; // on get params plus bookings en cours selon role

    /// events
    /** @type { Function } */
    #boundCellChangedHandler;

    /** @type { Function } */
    #boundBookingCreatedHandler;

    /** @type { Function } */
    #boundBookingErrorHandler;

    /** @type { Function } */
    #boundAgendaUpdatedHandler;

    /** @type { Function } */
    #boundCloserHandler;

    /// axial
    /** @type { Function } */
    #boundAxialUserReadyHandler;

    constructor()
    {
        super();
        
        this.classList.add("axial_booking_agenda");
        this.template = "axial-booking-agenda-template";

        this.#apiBookingListPath = PathUtils.getPathFromRelative( this.#apiBookingListPath );

        this.#boundCellChangedHandler = this.#cellChangedHandler.bind(this);
        this.#boundBookingCreatedHandler = this.#bookingCreatedHandler.bind(this);
        this.#boundBookingErrorHandler = this.#bookingErrorHandler.bind(this);
        this.#boundAgendaUpdatedHandler = this.#agendaUpdatedHandler.bind(this);

        this.#boundCloserHandler = this.#closerHandler.bind(this);
        
        this.#boundAxialUserReadyHandler = this.#axialUserReadyHandler.bind(this);
        window.addEventListener("axialUserReady", this.#boundAxialUserReadyHandler);
        this.useResizeObserver = true;
    }

    /** @readonly */
    get agenda() { return this.#agenda; }

    #axialUserReadyHandler( event )
    {
        //console.warn("UPDATE AGENDA WITH USER : componentBuilt", this.componentBuilt);
        if( this.componentBuilt === true )
        {
            this.#localRole = event.detail.user.role;
            if( this.#localRole == "user" )
            {
                this.#panel = new AxialBookingPanelUser();
            }
            else if( this.#localRole == "admin" )
            {
                this.#panel = new AxialBookingPanelAdmin();
            }
            else
            {
                throw new Error("Wrong role in AxialBookingAgenda");
            }

            if( this.#panelHolder && this.#panel && this.#closer )
            {
                this.#panel.addEventListener("bookingCreated", this.#boundBookingCreatedHandler);
                this.#panel.addEventListener("bookingError", this.#boundBookingErrorHandler);
                
                this.#panelHolder.insertBefore( this.#panel, this.#closer );
            }

            this.#loadBookings();
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#agenda = this.shadowRoot.getElementById("agenda");
        //console.error(this.#agenda.componentBuilt);
        if( this.#agenda )
        {
            this.#agenda.setDayTime( 9, 18 );
            this.#agenda.addEventListener("cellChanged", this.#boundCellChangedHandler);
            this.#agenda.addEventListener("agendaUpdated", this.#boundAgendaUpdatedHandler);
        }
        
        this.#panelHolder = this.shadowRoot.getElementById("panel");
        this.#closer = this.shadowRoot.getElementById("closer");
        if( this.#closer )
        {
            this.#closer.addEventListener("click", this.#boundCloserHandler);
        }
    }

    _observerResize( entries, observer )
    {
        //console.log( this.offsetWidth )
        // you can use the setter safely as far as it returns on same value
        if( this.#agenda )
        {
            if( this.offsetWidth >= 1200 )
            {
                this.#agenda.mode = "week";

            }
            else
            {
                this.#agenda.mode = "day";
            }
            this.#updateBookings();
        }
    }

    /**
     * 
     * @param { AxialAgendaCell } cell 
     */
    #showPanel( cell )
    {
        
        if(this.#agenda && this.#agenda.mode == "day" )
        {
            //console.log( "showPanel", cell.selected );
            if( cell && cell.selected == true )
            {
                this.#panelHolder.style.transform = this.#panelTransformOpen;
            }
        }
    }

    #hidePanel()
    {
        if(this.#agenda && this.#agenda.mode == "day" )
        {
            this.#panelHolder.style.transform = this.#panelTransformClose;
        }
    }

    #closerHandler( event )
    {
        this.#hidePanel();
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #cellChangedHandler( event )
    {
        //console.log(event.currentTarget);

        const cell = event.detail.cell;
        const cellData = event.detail.cellData;
        const selected = cellData.selected;

        this.#showPanel( cell );
        
        switch (this.#localRole )
        {
            case "user":
                if( selected == false )
                {
                    this.#panel.setInfos( undefined, undefined, undefined )
                }
                else
                {
                    this.#panel.setInfos( cellData.date, cellData.start, cellData.end );
                }
            break;

            case "admin":
                //console.log( cell, cell.selected, cell.locked, cell.data );
                this.#panel.cell = cell;
                if( cell.selected == true )
                {
                    if( cell.locked == true )
                    {
                        this.#panel.gotoInfo();
                    }
                    else
                    {
                        this.#panel.gotoAdd();
                    }
                }
                else
                {
                    this.#panel.gotoInit();
                }
            break;

            default:
            break;
        }
        
    }

    #bookingCreatedHandler( event )
    {
        this.#agenda.unselect();
        this.#loadBookings();
    }

    #bookingErrorHandler( event )
    {
        this.#agenda.unselect();
        //this.#loadBookings();
    }

    async #loadBookings()
    {
        try
        {
            const json = await FetchUtils.GET( this.#apiBookingListPath );
            this.#bookings = json.content;
            //console.log(this.#bookings);
            if( this.#bookings.length > 0 )
            {
                this.#updateBookings();
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #updateBookings()
    {
        //console.warn("UPDATE BOOKING ENTRY POINT");
        //console.log( this.#bookings );

        const user = window.AXIAL.userObject;
        if( user == undefined ) { return; }
        const role = user.role;
        const uuid = user.uuid;

        let userHasBooking = false;
        if( role === "admin" )
        {
            this.#panel.bookings = this.#bookings;
        }

        for( const cell of this.#agenda.cells )
        {
            let finalCellData;
            let bookingFound = false;
            for( const booking of this.#bookings )
            {
                if( role === "user" )
                {
                    if( booking.created_for === uuid )
                    {
                        //console.log( "should display confirmed state");
                        this.#panel.currentBooking = booking;
                        userHasBooking = true;
                    }
                }
                const bookingData = { date: booking.booking_date, start: booking.booking_start, end: booking.booking_end };
                if( this.#agenda.areSameCellData( cell._getAsObject(), bookingData ) === true )
                {
                    console.log("booking found", bookingData);
                    finalCellData = booking;
                    bookingFound = true;
                }
            }

            if( bookingFound === true )
            {
                cell.data = finalCellData;
                cell.locked = true;
                if( role === "user" ) { cell.enabled = false };
                
            }
            else
            {
                cell.data = undefined;
                cell.locked = false;
            }
        }

        if( userHasBooking === true )
        {
            this.#agenda.interactiveAll( false );
        }
        else
        {
            this.#agenda.interactiveAll( true );
        }
    }

    #agendaUpdatedHandler( event )
    {
        this.#updateBookings();
    }

    refresh()
    {
        this.#agenda.unselect();
        if( this.#localRole === "user" )
        {
            this.#panel.setInfos( undefined, undefined, undefined );
            this.#panel.reinit();
        }
        else
        {
            this.#panel.gotoInit();
        }
        this.#loadBookings();
    }

}
window.customElements.define("axial-booking-agenda", AxialBookingAgenda);
export { AxialBookingAgenda }