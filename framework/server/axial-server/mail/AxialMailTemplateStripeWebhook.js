"use strict";

import { AxialMailTemplateBase } from "./AxialMailTemplateBase.js";
import { MAIN_DOMAIN } from "../AxialServerConstants.js";

class AxialMailTemplateStripeWebhook extends AxialMailTemplateBase
{
    constructor()
    {
        super();
        this.name = "stripe_webhook";
    }

    _getHTML( object )
    {
        let html = "";

        html += "<!DOCTYPE html><html lang='fr'>"
        html += "<head>";
        html += "<meta charset='utf-8'>"
        html += "<title>Stripe Info</title>"
        html += "<meta content='width=device-width, initial-scale=1.0' name='viewport'>";
        html += "</head>";
        html += "<body style='width:100% !important; min-width:100%; height:auto !important; background-color:rgb(242, 245, 248); padding-left:0; padding-right:0; padding-top: 20px; padding-bottom:20px; margin:0;'>";
        
        // div blue then white
        html += "<div style='max-width:720px; height:auto; background-color:rgb(242, 245, 248); padding:20px; margin-left:auto; margin-right:auto;'>";
        html += "<div style='width:auto; height:auto; background-color:rgb(255, 255, 255); padding:30px; border-radius:12px;'>";

        // header
        html += "<header style='text-align:left; height:60px; color:rgb(35, 41, 47);'>";
        // header logo in table
        html += "<table style='width:100%; border-spacing:0px;'><thead><tr>";
        html += `<th style='text-align:left; width:40px; height:40px;'><img width='40' height='40' style='width:40px; height:40px;' alt='logo' src='${MAIN_DOMAIN}/assets/mails/logo-mail.png'></th>`;
        html += "<th style='padding-left:14px; font-size:24px; text-align:left; width:auto; height:40px;'>DnDev Stripe Info</th>";
        html += "<tr></thead></table></header>";
        //header divider
        html += "<div style='display:block; width:100%; height:20px;'></div>";
        
        html += `<div style='text-align: center; color:rgb(35,41,47); font-size:24px; font-weight:bold'>${object.message}</div>`;
        
        // div close white
        html += "</div>";
        
        // footer
        html += "<div style='margin-top:20px;'>";
        html += "<a href='https://dndev.fr' style='color:rgb(35, 41, 47); text-decoration:underline; font-size:12px; font-weight:bold; display:block; text-align:center;'>dndev.fr</a>";
        html += "<div style='text-align:center; color:rgb(35, 41, 47); font-size:11px; margin-top:10px;'>This is an automated message. Please do not reply.</div>";
        html += "</div>";

        html += "</div>";
        html += "</body>";
        html += "</html>";

        return html;
    }
}

export { AxialMailTemplateStripeWebhook }