"use strict";

import { AxialMailTemplateBase } from "./AxialMailTemplateBase.js";
import
{
    MAIN_DOMAIN,
    MAIN_NAME
} from "../AxialServerConstants.js";
import { AxialServerDateUtils } from "../utils/AxialServerDateUtils.js";

class AxialMailTemplateBookingRequestUser extends AxialMailTemplateBase
{
    constructor()
    {
        super();
        this.name = "booking_request_user";
        //35, 41, 47
        //242, 245, 248
    }

    _getHTML( object )
    {
        let html = "";

        html += "<!DOCTYPE html><html lang='fr'>"
        html += "<head>";
        html += "<meta charset='utf-8'>"
        html += "<title>Welcome on Board</title>"
        html += "<meta content='width=device-width, initial-scale=1.0' name='viewport'>";
        html += "</head>";
        html += "<body style='width:100% !important; min-width:100%; height:auto !important; background-color:rgb(242, 245, 248); padding-left:0; padding-right:0; padding-top: 20px; padding-bottom:20px; margin:0;'>";
        
        // div blue then white
        html += "<div style='max-width:720px; height:auto; background-color:rgb(242, 245, 248); padding:20px; margin-left:auto; margin-right:auto;'>";
        html += "<div style='width:auto; height:auto; background-color:rgb(255, 255, 255); padding:30px; border-radius:12px;'>";

        html += this._getHeader( object.title );
        //header divider
        html += `<div style='display:block; width:100%; height:20px;'></div>`;
        
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:21px; font-weight:bold'>Bonjour ${object.client.first_name},</div>`;
        html += `<div style='display:block; width:100%; height:10px;'></div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>Merci d'avoir pris rendez-vous le</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>${AxialServerDateUtils.toLocale(new Date(object.booking.booking_date))} à ${object.booking.booking_start}h.</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>à l'adresse suivante.</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>${object.booking.address_line_1}, ${object.booking.address_zip} ${object.booking.address_city}</div>`;
        
        html += `<div style='display:block; width:100%; height:20px;'></div>`;

        html += `<div style='display:block; width:100%; height:10px;'></div>`;
        // div close white
        html += "</div>";
        
        
        html += this._getFooter();

        html += "</div>";
        html += "</body>";
        html += "</html>";

        return html;
    }
}

export { AxialMailTemplateBookingRequestUser }