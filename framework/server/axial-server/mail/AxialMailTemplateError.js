"use strict";

import { AxialMailTemplateBase } from "./AxialMailTemplateBase.js";
import { MAIN_DOMAIN } from "../AxialServerConstants.js";

class AxialMailTemplateError extends AxialMailTemplateBase
{
    constructor()
    {
        super();
        this.name = "error_base";
    }

    _getHTML( object )
    {
        let html = "";

        html += "<!DOCTYPE html><html lang='fr'>"
        html += "<head>";
        html += "<meta charset='utf-8'>"
        html += "<title>Error Report</title>"
        html += "<meta content='width=device-width, initial-scale=1.0' name='viewport'>";
        html += "</head>";
        html += "<body style='width:100% !important; min-width:100%; height:auto !important; background-color:rgb(242, 245, 248); padding-left:0; padding-right:0; padding-top: 20px; padding-bottom:20px; margin:0;'>";
        
        // div blue then white
        html += "<div style='max-width:720px; height:auto; background-color:rgb(242, 245, 248); padding:20px; margin-left:auto; margin-right:auto;'>";
        html += "<div style='width:auto; height:auto; background-color:rgb(255, 255, 255); padding:30px; border-radius:12px;'>";

        // header
        html += this._getHeader( object.title )
        
        //header divider
        html += "<div style='display:block; width:100%; height:20px;'></div>";
        
        // content
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:21px; font-weight:bold'>${object.t} error in ${object.w}-end at</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:18px; font-weight:bold'>${object.d}</div>`;
        html += `<div style='display:block; width:100%; height:10px;'></div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>Détail de l'erreur : </div>`;

        const errorObj = object.o;
        const errorProps = Object.getOwnPropertyNames(errorObj);
        console.log(errorProps);
        
        for( const key of errorProps )
        {
            console.log( key );
            html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>${key} : ${errorObj[key]}</div>`;
        }
        
        // div close white
        html += "</div>";
        
        // footer
        html += this._getFooter();

        html += "</div>";
        html += "</body>";
        html += "</html>";

        return html;
    }
}

export { AxialMailTemplateError }