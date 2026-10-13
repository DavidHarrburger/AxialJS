"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialAgendaCell } from "../date/AxialAgendaCell.js";
import { AxialToggleButtonGroup } from "../button/AxialToggleButtonGroup.js";
import { AxialToggleRadio } from "../button/AxialToggleRadio.js";
import { AxialButton } from "../button/AxialButton.js";

import { FetchUtils } from "../utils/FetchUtils.js";
import { PathUtils } from "../utils/PathUtils.js";
import { AxialPopupManager } from "../popup/AxialPopupManager.js";
import { AxialModuleSearchPopup } from "../module/search/AxialModuleSearchPopup.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialBookingPanelAdmin extends AxialComponentBase
{
    ///  vars
    /** @type { String } */
    #apiUserInfoGetPath = "./api/user/info";

    /** @type { Object } */
    #selectedClientData;

    /** @type { String } */
    #apiBookingCreatePath = "./api/booking/create";

    /** @type { Array } */
    #bookings = [];

    /// elements
    /** @type { AxialAgendaCell } */
    #cell;

    /** @type { HTMLElement } */
    #initState;

    /** @type { HTMLElement } */
    #count

    /** @type { HTMLElement } */
    #addState;

    /** @type { HTMLElement } */
    #addHeader;

    /** @type { AxialToggleButtonGroup } */
    #kindGroup;

    /** @type { HTMLElement } */
    #eventHolder;

    /** @type { HTMLElement } */
    #selectedClient;

    /** @type { HTMLElement } */
    #geoHolder;

    /** @type { HTMLElement } */
    #infoState;

    /** @type { HTMLElement } */
    #detailMain;

    /** @type { HTMLElement } */
    #detailSub;

    /** @type { AxialButton } */
    #userSelectButton;

    /** @type { AxialButton } */
    #userCreateButton;

    /** @type { AxialServiceButton } */
    #validateButton;

    /// events
    /** @type { Function } */
    #boundIndexChangedHandler;

    /** @type { Function } */
    #boundUserSelectHandler;

    /** @type { Function } */
    #boundUserCreateHandler;

    /** @type { Function } */
    #boundValidateHandler;

    /** @type { Function } */
    #boundSearchHiddenHandler;

    /// form
    /** @type { HTMLInputElement } */
    #address;

    /** @type { HTMLInputElement } */
    #zip;

    /** @type { HTMLInputElement } */
    #city;

    /** @type { Function } */
    #boundFocusOutHandler;

    
    constructor()
    {
        super();

        this.classList.add("axial_booking_panel");
        this.template = "axial-booking-panel-admin-template";
        
        this.#apiUserInfoGetPath = PathUtils.getPathFromRelative(this.#apiUserInfoGetPath);
        this.#apiBookingCreatePath = PathUtils.getPathFromRelative(this.#apiBookingCreatePath);
        
        this.#boundIndexChangedHandler = this.#indexChangedHandler.bind(this);
        this.#boundUserSelectHandler = this.#userSelectHandler.bind(this);
        this.#boundUserCreateHandler = this.#userCreateHandler.bind(this);

        this.#boundValidateHandler = this.#validateHandler.bind(this);

        this.#boundSearchHiddenHandler = this.#searchHiddenHandler.bind(this);
        this.#boundFocusOutHandler = this.#focusOutHandler.bind(this);

    }

    _buildComponent()
    {
        super._buildComponent();

        this.#initState = this.shadowRoot.getElementById("initState");
        this.#count = this.shadowRoot.getElementById("count");

        this.#addState = this.shadowRoot.getElementById("addState");
        this.#addHeader = this.shadowRoot.getElementById("addHeader");
        this.#kindGroup = this.shadowRoot.getElementById("kindGroup");
        this.#kindGroup.forceSelection = true;
        this.#kindGroup.addEventListener("indexChanged", this.#boundIndexChangedHandler);

        this.#eventHolder = this.shadowRoot.getElementById("eventHolder");
        this.#selectedClient = this.shadowRoot.getElementById("selectedClient");
        this.#geoHolder = this.shadowRoot.getElementById("geoHolder");

        this.#infoState = this.shadowRoot.getElementById("infoState");
        this.#detailMain = this.shadowRoot.getElementById("detailMain");
        this.#detailSub = this.shadowRoot.getElementById("detailSub");

        this.#userSelectButton = this.shadowRoot.getElementById("userSelectButton");
        this.#userSelectButton.addEventListener("click", this.#boundUserSelectHandler);
        this.#userCreateButton = this.shadowRoot.getElementById("userCreateButton");
        this.#userCreateButton.addEventListener("click", this.#boundUserCreateHandler);

        this.#validateButton = this.shadowRoot.getElementById("validateButton");
        this.#validateButton.enabled = false;
        this.#validateButton.style.display = "none";
        this.#validateButton.addEventListener("click", this.#boundValidateHandler);

        /// form
        this.#address = this.shadowRoot.getElementById("address");
        this.#zip = this.shadowRoot.getElementById("zip");
        this.#city = this.shadowRoot.getElementById("city");

        this.#address.addEventListener("focusout", this.#boundFocusOutHandler );
        this.#zip.addEventListener("focusout", this.#boundFocusOutHandler );
        this.#city.addEventListener("focusout", this.#boundFocusOutHandler );
    }

    get cell() { return this.#cell; }
    set cell( value )
    {
        this.#cell = value;
    }

    get bookings() { return this.#bookings }
    set bookings( value )
    {
        this.#bookings = value;
        let filtered = [];
        for( const booking of this.#bookings )
        {
            if( booking.kind == "event" ) {filtered.push(booking);}
        }
        this.#count.innerHTML = `Vous avez ${filtered.length} rendez-vous à venir`;
    }

    gotoInit()
    {
        this.#initState.style.display = "flex";
        this.#addState.style.display = "none";
        this.#infoState.style.display = "none";
    }

    gotoAdd()
    {
        this.#initState.style.display = "none";
        this.#addState.style.display = "flex";
        this.#infoState.style.display = "none";

        this.#addHeader.innerHTML = this.#cell.toLocale();

    }

    gotoInfo()
    {
        this.#initState.style.display = "none";
        this.#addState.style.display = "none";
        this.#infoState.style.display = "flex";

        this.#getInfo();
    }

    async #getInfo()
    {
        try
        {
            
            const createdFor = this.#cell.data.created_for;
            if( createdFor )
            {
                const query =`u=${createdFor}`;
                const clientInfo = await FetchUtils.GET(this.#apiUserInfoGetPath, query);
                //console.log( clientInfo );
                this.#updateInfos( clientInfo.content );
            }
            else
            {
                this.#updateInfos();
            }
            
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #updateInfos( clientInfo )
    {
        let detail = "";
        const bookingData = this.#cell.data;
        const kind = bookingData.kind;
        if( kind == "event" && clientInfo != undefined )
        {
            const localDate = DateUtils.toLocale( new Date(bookingData.booking_date) )
            detail += `Vous avez RDV avec ${clientInfo.first_name} ${clientInfo.last_name}<br>`;
            detail += `le ${localDate} de ${bookingData.booking_start}h à ${bookingData.booking_end}<br>`;
            detail += `à l'addresse suivante<br><br>`;
            detail += `${bookingData.address_line_1}, ${bookingData.address_zip} ${bookingData.address_city}<br>`;
        }
        else
        {
            detail = "Ce créneau a été marqué comme indisponible pour les clients";
        }
        this.#detailMain.innerHTML = detail;
    }

    #indexChangedHandler( event )
    {
        this.#validateButton.style.display = "block";
        const value = this.#kindGroup.getSelectedToggle()?.value;
        switch( value )
        {
            case undefined: return; break;
            
            case "event": 
                console.log("event")
                this.#eventHolder.style.display = "flex";
                this.#validateButton.text = "Enregistrer le RDV";
                this.#checkPanelValidity();
            break;
            
            case "ghost": 
                console.log("ghost")
                this.#eventHolder.style.display = "none";
                this.#validateButton.text = "Rendre indisponible ce créneau horaire";
                this.#validateButton.enabled = true;
            break;
            
            default:
            break;
        }
    }

    #userSelectHandler( event )
    {
        /** @type { AxialModuleSearchPopup } */
        const searchPopup = AxialPopupManager.getPopupById("searchPopup");
        searchPopup.title = "Rechercher un client";
        searchPopup.collection = "users";
        searchPopup.model = "user";
        searchPopup.displayedFields = ["first_name", "last_name"];
        //searchPopup.query = "model=user";
        searchPopup.addEventListener("popupHidden", this.#boundSearchHiddenHandler);
        searchPopup.show();
    }

    #searchHiddenHandler( event )
    {
        /** @type { AxialModuleSearchPopup } */
        const searchPopup = AxialPopupManager.getPopupById("searchPopup");
        searchPopup.removeEventListener("popupHidden", this.#boundSearchHiddenHandler);
        console.log("YOUPI", searchPopup.selectedData);
        this.#selectedClientData = searchPopup.selectedData;
        this.#updateAfterSearch();
    }

    #updateAfterSearch()
    {
        this.#selectedClient.innerHTML = `${this.#selectedClientData.first_name} ${this.#selectedClientData.last_name}`;
        this.#geoHolder.style.display = "flex";

        this.#address.value = this.#selectedClientData.address_line_1;
        this.#zip.value = this.#selectedClientData.address_zip;
        this.#city.value = this.#selectedClientData.address_city;

        this.#checkPanelValidity();
    }

    #userCreateHandler( event )
    {
        const userCreatePopup = AxialPopupManager.getPopupById("userCreatePopup");
        userCreatePopup.show();
    }

    #validateHandler( event )
    {
        this.#validateButton.enabled = false;
        this.#validateButton.loading = true;

        this.#createBooking();
    }

    #focusOutHandler( event )
    {
        this.#checkPanelValidity();
    }

    #checkPanelValidity()
    {
        let isValid = true;
        if( this.#cell == undefined ) { isValid = false; }

        if( this.#address.validity.valid == false ) { isValid = false; }
        if( this.#zip.validity.valid == false ) { isValid = false; }
        if( this.#city.validity.valid == false ) { isValid = false; }

        console.log(isValid);

        this.#validateButton.enabled = isValid;
    }

    async #createBooking()
    {
        
        try
        {
            const kind = this.#kindGroup.getSelectedToggle()?.value;
            console.log("kind", kind);
            let payload =
            {
                booking_date: this.#cell.date,
                booking_start: this.#cell.start,
                booking_end: this.#cell.end,
                kind: kind
            };

            if( kind === "event" )
            {
                payload.kind = kind;
                payload.created_for = this.#selectedClientData.uuid;
                payload.address_line_1 = this.#address.value;
                payload.address_zip = this.#zip.value;
                payload.address_city = this.#city.value;

            }
            else if( kind === "ghost" )
            {
                payload.kind = kind;
            }
            else
            {
                throw new Error("wrong value in admin panel")
            }
            /*
            const body = 
            {
                created_for: this.#selectedClientData.uuid,
                booking_date: this.#cell.date,
                booking_start: this.#cell.start,
                booking_end: this.#cell.end,
                address_line_1: this.#address.value,
                address_zip: this.#zip.value,
                address_city: this.#city.value,
            }
            */
            const json = await FetchUtils.POST( this.#apiBookingCreatePath, payload );
            if( json.status && json.status == "ok" )
            {
                this.currentBooking = payload; // check currentbooking setter
                const bookingEvent = new CustomEvent("bookingCreated", { bubbles: true, composed: true} );
                this.dispatchEvent( bookingEvent );
            }
            else if( json.status == "ko" )
            {
                window.AXIAL.notify("Cet utilisateur a déjà un RDV de pris");
                const bookingEvent = new CustomEvent("bookingError", { bubbles: true, composed: true} );
                this.dispatchEvent( bookingEvent );
            }

            this.#reinit();
        }
        catch(err)
        {
            console.log(err);
            //this.#reinit();
        }
        
    }

    #reinit()
    {
        this.#kindGroup.selectedIndex = -1;
        this.#validateButton.enabled = false;
        this.#validateButton.loading = false;
        this.#validateButton.style.display = "none";
        this.#eventHolder.style.display = "none";
        this.#geoHolder.style.display = "none";

        this.#address.value = "";
        this.#zip.value = "";
        this.#city.value = "";

        this.#selectedClient.innerHTML = "";
        this.#selectedClientData = undefined;

        this.#cell = undefined;

        this.gotoInit();
    }

    async #freezeBooking()
    {

    }
}

window.customElements.define("axial-booking-panel-admin", AxialBookingPanelAdmin);
export { AxialBookingPanelAdmin }