"use strict";

class AxialConsentManager extends EventTarget
{
    /** @type { String } */
    static #CONSENT_KEY = "axial_consent";

    /** { @type { String } */
    static #CONSENT_OVERLAY_ID = "axialConsentOverlay";

    /** { @type { Boolean } */
    static #consent;

    constructor()
    {
        super();
    }

    /** @readonly */
    static get CONSENT_KEY() { return AxialConsentManager.#CONSENT_KEY; }

    /** @readonly */
    static get CONSENT_OVERLAY_ID() { return AxialConsentManager.#CONSENT_OVERLAY_ID; }

    /** @readonly */
    static get consent() { return AxialConsentManager.#consent; }

    static checkConsent()
    {
        const consentOverlay = document.getElementById( AxialConsentManager.CONSENT_OVERLAY_ID )
        const storedConsent = window.localStorage.getItem( AxialConsentManager.CONSENT_KEY );
        console.log( storedConsent );
        if( storedConsent === null )
        {
            if( consentOverlay )
            {
                consentOverlay.show()
            }
        }
        else
        {
            const consentObject = JSON.parse( storedConsent );
            if( consentObject && consentObject.consent )
            {
                AxialConsentManager.#consent = consentObject.consent;
            }
            AxialConsentManager.#activate();
        }
    }

    static setConsent( b = false )
    {
        AxialConsentManager.#consent = b;
        const consentObject = { date: new Date(), consent: b };
        window.localStorage.setItem( AxialConsentManager.CONSENT_KEY, JSON.stringify(consentObject) );
        AxialConsentManager.#activate();
    }

    static #activate()
    {
        if( AxialConsentManager.#consent === true )
        {
            const scriptTags = document.head.getElementsByTagName("script");
            for( const tag of scriptTags )
            {
                const att = tag.getAttribute("type");
                if( att && att === "text/plain" )
                {
                    const activeTag = document.createElement("script");
                    activeTag.innerHTML = tag.innerHTML;
                    tag.remove();
                    document.head.appendChild(activeTag);
                }
            }
        }
    }
}

export { AxialConsentManager }