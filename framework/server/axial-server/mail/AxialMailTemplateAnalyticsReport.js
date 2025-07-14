"use strict";

import { AxialMailTemplateBase } from "./AxialMailTemplateBase.js";

class AxialMailTemplateAnalyticsReport extends AxialMailTemplateBase
{
    constructor()
    {
        super();
        this.name = "analytics_report";
        //35, 41, 47
        //242, 245, 248
    }

    _getHTML( object )
    {
        // var utils;

        //const greenBack;
        //dark: "#238b45", light: "#f7fcf5"

        const greenLight = "#f7fcf5";
        const greenDark = "#238b45";

        const yellowDark = "#a08500";
        const yellowLight = "#fff9e2";

        const redDark = "#8f0000";
        const redLight = "#ffe3e3";
        
        let lightColor = "#f2f5f8";
        let darkColor = "#232323";

        let html = "";

        html += "<!DOCTYPE html><html lang='fr'>"
        html += "<head>";
        html += "<meta charset='utf-8'>"
        html += "<title>Analytics Report</title>"
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
        html += "<th style='text-align:left; width:40px; height:40px;'><img width='40' height='40' style='width:40px; height:40px;' alt='logo' src='https://axial-js.net/assets/mails/logo-dnd-mail.png'></th>";
        html += "<th style='padding-left:14px; font-size:24px; text-align:left; width:auto; height:40px;'>DnDev Stats Report</th>";
        html += "<tr></thead></table></header>";
        //header divider
        html += "<div style='display:block; width:100%; height:20px;'></div>";

        if( object.data === undefined )
        {
            html += `<div style='text-align: center; color:rgb(35, 41, 47); font-size:21px; font-weight:bold'>Aucune donnée trouvée</div>`;
        }
        else
        {
            // update vars here;
            if( object.cNum === 0 || object.progress === 0 )
            {
                darkColor = yellowDark;
                lightColor = yellowLight;
            }
            else if( object.progress > 0 )
            {
                darkColor = greenDark;
                lightColor = greenLight;
            }
            else if( object.progress < 0 )
            {
                darkColor = redDark;
                lightColor = redLight;
            }

            const progressUpdated = object.progress === "-" ? "-" : String(object.progress) + "%";

            html += `<div style='text-align: left; color:rgb(35, 41, 47); font-size:21px; font-weight:bold; margin-bottom:20px;'>Total visites: ${object.data.length}</div>`;

            // day progress
            html += "<div style='width:auto; height:70px; padding:10px; background-color:rgb(242, 245, 248); margin-bottom:14px; border-radius:8px; box-sizing:border-box;'>";
            html += "<table style='width:100%; border-spacing:0px;'>";
            html += "<tr style='width:100%;'>";
            html += `<td style='font-size:21px; width:80%; padding-left:10px; font-weight:bold;'>${object.cName}</td>`;
            html += `<td style='font-size:32px; width:20%; text-align:center; font-weight:bold;'>${object.cNum}</td>`;
            html += "</tr>";
            html += "</table>";
            html += "</div>";

            html += "<div style='width:auto; height:70px; padding:10px; background-color:rgb(242, 245, 248); margin-bottom:14px; border-radius:8px; box-sizing:border-box;'>";
            html += "<table style='width:100%; border-spacing:0px;'>";
            html += "<tr style='width:100%;'>";
            html += `<td style='font-size:21px; width:80%; padding-left:10px; font-weight:bold;'>${object.yName}</td>`;
            html += `<td style='font-size:32px; width:20%; text-align:center; font-weight:bold;'>${object.yNum}</td>`;
            html += "</tr>";
            html += "</table>";
            html += "</div>";

            html += `<div style='width:auto; height:70px; padding:10px; background-color:${lightColor}; margin-bottom:14px; border-radius:8px; box-sizing:border-box;'>`;
            html += "<table style='width:100%; border-spacing:0px;'>";
            html += "<tr style='width:100%;'>";
            html += `<td style='font-size:21px; width:80%; padding-left:10px; font-weight:bold; color:${darkColor};'>Progression</td>`;
            html += `<td style='font-size:32px; width:20%; text-align:center; font-weight:bold; color:${darkColor};'>${progressUpdated}</td>`;
            html += "</tr>";
            html += "</table>";
            html += "</div>";

            // rank
            html += "<div style='width:100%; height:auto; margin-top:20px;'>";
            html += "<div>Les 3 pages les plus vues:</div>";
            html += "<table style='width:100%; border-spacing:0px;'><thead style='border-bottom: 1px solid #ccc;'><tr><th style='width:80%; text-align:left;'>Url de la page</th><th style='width:20%; text-align:right;'>Vues</th></tr></thead>";
            html += "<tbody>";
            for( let i = 0; i < 3; i++ )
            {
                const page = object.rankArray[i];
                if( page )
                {
                    html += `<tr><td>${page[0]}</td><td style='text-align:right;'>${page[1]}</td></tr>`;
                }
            }
            html += "</tbody>";
            html += "</table>";
            html += "</div>";
        }
        
        
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

export { AxialMailTemplateAnalyticsReport }