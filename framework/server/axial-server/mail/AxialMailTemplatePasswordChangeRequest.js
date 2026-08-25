"use strict";

import { AxialMailTemplateBase } from "./AxialMailTemplateBase.js";
import { MAIN_DOMAIN } from "../AxialServerConstants.js";

class AxialMailTemplatePasswordChangeRequest extends AxialMailTemplateBase
{
    constructor()
    {
        super();
        this.name = "password_change_request";
    }

    _getHTML( object )
    {
        let html = "";

        html += "<!DOCTYPE html><html lang='fr'>"
        html += "<head>";
        html += "<meta charset='utf-8'>"
        html += "<title>Demande de changement de mot passe</title>"
        html += "<meta content='width=device-width, initial-scale=1.0' name='viewport'>";
        html += "</head>";
        html += "<body style='width:100% !important; min-width:100%; height:auto !important; background-color:rgb(242, 245, 248); padding-left:0; padding-right:0; padding-top: 20px; padding-bottom:20px; margin:0;'>";
        
        // div blue then white
        html += "<div style='max-width:720px; height:auto; background-color:rgb(242, 245, 248); padding:20px; margin-left:auto; margin-right:auto;'>";
        html += "<div style='width:auto; height:auto; background-color:rgb(255, 255, 255); padding:30px; border-radius:12px;'>";

        html += this._getHeader( object.title );
        //header divider
        html += `<div style='display:block; width:100%; height:20px;'></div>`;
        
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:21px; font-weight:bold'>Bonjour ${object.name},</div>`;
        html += `<div style='display:block; width:100%; height:10px;'></div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>Une demande de changement de mot passe a été initialisée.</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>Cliquez sur le lien suivant (ou retournez sur la page de changement de mot passe) et renseignez le code ci-dessous :</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>${MAIN_DOMAIN}/account/password-reset</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>Et renseignez le code ci-dessous :</div>`;
        html += `<div style='text-align: center; color:rgb(35,41,47); font-size:24px; font-weight:bold'>${object.code}</div>`;
        html += `<div style='text-align: left; color:rgb(35,41,47); font-size:16px;'>Si vous n'êtes pas à l'origine de cette demande, merci de contacter le support à l'adresse suivante <a href="mailto:david@srflow.fr">david@srflow.fr</div>`;
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

export { AxialMailTemplatePasswordChangeRequest }