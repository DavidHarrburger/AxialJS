"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";
import { AxialAccordionContainer } from "../../accordion/AxialAccordionContainer.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { StringUtils } from "../../utils/StringUtils.js";

class AxialOnboardingViewCompany extends AxialOnboardingView
{
    /// vars
    /** @type { String } */
    #companyInfoPath = "https://recherche-entreprises.api.gouv.fr/search?q=";

    /** @type { RegExp } */
    #numberRegex = /^\d+$/;

    /** @type { Object } */
    #companyObject;

    /** @type { Set } */
    #companyValuesExclusions = new Set( [ "[NON-DIFFUSIBLE]" ] );

    /// elements
    /** @type { HTMLInputElement } */
    #companyCodeInput;

    /** @type { AxialServiceButton } */
    #searchButton;

    /** @type { AxialAccordionContainer } */
    #companyContainer;

    /** @type { HTMLInputElement } */
    #companyNameInput;

    /** @type { HTMLInputElement } */
    #companyAddressInput;

    /** @type { HTMLInputElement } */
    #companyZipInput;

    /** @type { HTMLInputElement } */
    #companyCityInput;


    /// events
    /** @type { Function } */
    #boundCodeInputHandler;

    /** @type { Function } */
    #boundSearchHandler;

    /** @type { Function } */
    #boundCompanyInputHandler;

    constructor()
    {
        super();
        this.template = "axial-onboarding-view-company-template";
        this.#boundCodeInputHandler = this.#codeInputHandler.bind(this);
        this.#boundSearchHandler = this.#searchHandler.bind(this);
        this.#boundCompanyInputHandler = this.#companyInputHandler.bind(this);
    }

    _buildComponent()
    {
        this.#companyCodeInput = this.shadowRoot.getElementById("companyCodeInput");
        this.#companyCodeInput.addEventListener("input", this.#boundCodeInputHandler);

        this.#searchButton = this.shadowRoot.getElementById("searchButton");
        this.#searchButton.enabled = false;
        this.#searchButton.addEventListener("click", this.#boundSearchHandler);

        this.#companyContainer = this.shadowRoot.getElementById("companyContainer");

        this.#companyNameInput = this.shadowRoot.getElementById("companyNameInput");
        this.#companyAddressInput = this.shadowRoot.getElementById("companyAddressInput");
        this.#companyZipInput = this.shadowRoot.getElementById("companyZipInput");
        this.#companyCityInput = this.shadowRoot.getElementById("companyCityInput");

        this.#companyNameInput.addEventListener("input", this.#boundCompanyInputHandler);
        this.#companyAddressInput.addEventListener("input", this.#boundCompanyInputHandler);
        this.#companyZipInput.addEventListener("input", this.#boundCompanyInputHandler);
        this.#companyCityInput.addEventListener("input", this.#boundCompanyInputHandler);

        super._buildComponent();
    }

    #codeInputHandler( event )
    {
        const v = this.#companyCodeInput.value.trim();
        const rv = StringUtils.removeWhites(v);
        const l = rv.length;
        const t = this.#numberRegex.test(rv);
        if( (l === 9 || l === 14 ) && t === true )
        {
            this.#searchButton.enabled = true;
        }
        else
        {
            this.#searchButton.enabled = false;
        }
    }

    #companyInputHandler( event )
    {
        this.#checkValidity();
    }

    #searchHandler( event )
    {
        this.#getCompanyInfo();
    }

    async #getCompanyInfo()
    {
        try
        {
            const v = this.#companyCodeInput.value.trim();
            const rv = StringUtils.removeWhites(v);
            const path = this.#companyInfoPath + rv;
            const response = await fetch(path);
            const json = await response.json();
            if( json.results === undefined ) 
            {
                // toast the error
            }
            else
            {
                if( Array.isArray( json.results ) === true && json.results.length > 0 )
                {
                    this.#companyObject = json.results[0];
                    this.#fillCompany();
                }
            }
            
            
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #fillCompany()
    {
        if( this.#companyObject === undefined ) { return; }
        if( this.#companyObject.date_fermeture !== null ) { return; }

        this.#companyContainer.open();
        
        
        console.log( this.#companyObject );
        const rawName = this.#companyObject.nom_raison_sociale;
        if( rawName !== undefined && this.#companyValuesExclusions.has(rawName) === false )
        {
            this.#companyNameInput.value = this.#companyObject.nom_raison_sociale;
        }

        const rawAddress = this.#companyObject.siege.adresse;
        const rawZip = this.#companyObject.siege.code_postal;
        const rawCity = this.#companyObject.siege.libelle_commune;

        if( rawZip && this.#companyValuesExclusions.has(rawZip) === false )
        {
            this.#companyZipInput.value = rawZip;
        }

        if( rawCity && this.#companyValuesExclusions.has(rawCity) === false )
        {
            this.#companyCityInput.value = rawCity;
        }

        if( rawAddress && this.#companyValuesExclusions.has(rawAddress) === false )
        {
            const addressArray = rawAddress.split(" ");
            let address = "";
            for( const part of addressArray )
            {
                if( part === rawZip || part === rawCity ) { continue; }
                address = address + part + " ";
            }
            this.#companyAddressInput.value = address;

        }
        this.#checkValidity()
    }
    
    #checkValidity()
    {
        const name = this.#companyNameInput.value.trim();
        const address = this.#companyAddressInput.value.trim();
        const zip = this.#companyZipInput.value.trim();
        const city = this.#companyCityInput.value.trim();
        
        const validated = ( name !== "" && address !== "" && zip !== "" && city !== "" );
        const data =
        {
            company_name: name,
            company_address: address,
            company_zip: zip,
            company_city: city,
        }
        const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated, data: data } } );
        this.dispatchEvent(onboardingEvent);
        
    }
}

window.customElements.define("axial-onboarding-view-company", AxialOnboardingViewCompany);
export { AxialOnboardingViewCompany }