"use strict";

class ProductUtils
{
    static #KINDS = new Map( [ 
        [ "provision", "Prestation" ], 
        [ "service", "Service" ], 
        [ "physical", "Porduit physique" ], 
        [ "digital", "Produit digital" ], 
        [ "subscription", "Abonnement, forfait" ] 
    ] );

    /**
     * @type { Map }
     * @readonly
     */
    static get KINDS() { return ProductUtils.#KINDS; }
}

export { ProductUtils }