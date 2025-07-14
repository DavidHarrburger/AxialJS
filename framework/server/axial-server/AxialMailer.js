"use strict";

import EventEmitter from "node:events";
import nodemailer from "nodemailer";

import { AxialMailTemplateBase } from "./mail/AxialMailTemplateBase.js";
import { AxialMailTemplateSendCode } from "./mail/AxialMailTemplateSendCode.js";
import { AxialMailTemplateAnalyticsReport } from "./mail/AxialMailTemplateAnalyticsReport.js";

import { EMAIL_USER } from "./AxialServerConstants.js";

class AxialMailer extends EventEmitter
{

    /** @type { nodemailer.Transporter } */
    #transporter;

    /** @type { Array.<AxialMailTemplateBase>} */
    #templates = new Array();

    /**
     * 
     * @param { nodemailer.Transporter } transporter 
     */
    constructor( transporter )
    {
        super();
        if( transporter === undefined || transporter === null )
        {
            throw new Error("nodemailer.Transporter required");
        }
        this.#transporter = transporter;

        this.#templates.push( new AxialMailTemplateSendCode() );
        this.#templates.push( new AxialMailTemplateAnalyticsReport() );
    }

    #getTemplateByName( name )
    {

        for( const template of this.#templates )
        {
            if( template.name === name )
            {
                return template;
            }
        }
        throw new Error("[AXIAL_MAILER] template not found");
    }

    /**
     * Send an email with the selected template t 
     * @param { String } s - The subject of the mail
     * @param { String } d - The recipients, coma separated
     * @param { String } t - The mail template name
     * @param { String } o - The object to fill the template
     */
    async sendMail( s, d, t, o )
    {
        try
        {
            const template = this.#getTemplateByName( t );
            const html = template._getHTML( o );

            this.#transporter.sendMail(
            {
                from: "<" + EMAIL_USER + ">",
                to: d,
                subject: s,
                html: html
            });
        }
        catch(err)
        {
            console.log(err);
        }
    }

}

export { AxialMailer }