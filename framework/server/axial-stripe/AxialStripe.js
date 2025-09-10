"use strict";

import EventEmitter from "node:events";
import Stripe from "stripe";
import { ObjectUtils } from "../axial-server/utils/ObjectUtils.js";
import { MAIN_DOMAIN } from "../axial-server/AxialServerConstants.js";
import { STRIPE_WEBHOOK_SECRET } from "../axial-server/AxialServerConstants.js";
import { AxialServerUtils } from "../axial-server/AxialServerUtils.js";

class AxialStripe extends EventEmitter
{

    /**
     * @type { Stripe }
     */
    #stripe;

    constructor( key = "" )
    {
        super();
        if( typeof key !== "string" || key === "" )
        {
            throw new TypeError("String value required");
        }
        // add more check
        this.#stripe = new Stripe( key );
    }

    /**
     * @readonly
     * @type { Stripe }
     */
    get stripe(){ return this.#stripe; }

    ///
    /// ADMIN PRODUCT PART
    ///

    async setProduct( object )
    {
        let stripeProduct;
        let stripePrice;
        
        try
        {
            // product object
            const productName = ObjectUtils.findValueInObject( object, "product_name", "value" );
            const productImage = ObjectUtils.findValueInObject( object, "image_main", "value" );
            const productImagePath = AxialServerUtils.getPathFromRelative(productImage);
            const productObject = 
            {
                name: productName,
                images: new Array( productImagePath )
            }
            stripeProduct = await this.#stripe.products.create( productObject );
            console.log( stripeProduct );

            // price object
            const priceAmount = ObjectUtils.findValueInObject( object, "price", "value" ) * 100;

            const is_recurring = ObjectUtils.findValueInObject( object, "is_recurring", "value" );
            const priceType = is_recurring === true ? "recurring" : "one_time";

            const priceRecurrence = ObjectUtils.findValueInObject( object, "recurrence", "value" );

            const priceObject = 
            {
                unit_amount: priceAmount,
                product: stripeProduct.id,
                currency: "eur",
                recurring:
                {
                    interval: priceRecurrence
                }
            }
            stripePrice = await this.#stripe.prices.create( priceObject );
            console.log( stripePrice );

        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {
            return { product:stripeProduct.id, price: stripePrice.id };
        }
    }

    ///
    /// SESSION PART
    ///

    async createSession( mode = "subscription", customer = "", price = "" )
    {
        try
        {
            const sessionObject = 
            {
                mode: mode,
                ui_mode: "embedded",
                customer: customer,
                return_url: `${MAIN_DOMAIN}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
                line_items:
                [
                    {
                        price: price,
                        quantity: 1
                    }
                ]
            }
            const session = await this.#stripe.checkout.sessions.create( sessionObject );
            return session;
        }
        catch(err)
        {
            console.log(err);
        }
    }

    ///
    /// ADMIN CUSTOMER PART
    ///

    async setCustomer( object )
    {
        let stripeCustomer;
        try
        {
            stripeCustomer = await this.#stripe.customers.create( object );
            console.log(stripeCustomer);
        }
        catch(err)
        {
            console.log("STRIPE_ERR");
            console.log( err );
        }
        finally
        {
            return stripeCustomer;
        }
    }

    getCustomer()
    {

    }

    /// WEBHOOKS EVENT
}

export { AxialStripe }