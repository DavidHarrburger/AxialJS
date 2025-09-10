"use strict";

//import EventEmitter from "node:events";

import { MAIN_DOMAIN } from "../AxialServerConstants.js";

class AxialMailTemplateBase
{
    /** @type { String } */
    name = "";

    constructor()
    {
        //super();
    }

    /**
     * @abstract
     * @param { Object } object
     * @returns { String }
     */
    _getHTML( object )
    {
        return "";
    }

    _getHeader( title = "" )
    {
        const header = 
            `<header style='text-align:left; height:60px; color:rgb(35, 41, 47);'>` +
            `<table style='width:100%; border-spacing:0px;'><thead><tr>` +
            `<th style='text-align:left; width:40px; height:40px;'>`+
            `<img width='40' height='40' style='width:40px; height:40px;' alt='logo' src='${MAIN_DOMAIN}/assets/mails/logo-mail.png'></th>` +
            `<th style='padding-left:14px; font-size:24px; text-align:left; width:auto; height:40px;'>${title}</th>` +
            `<tr></thead></table></header>`;
        return header;
    }

    _getFooter()
    {
        const footer = 
            `<div style='margin-top:20px;'>` +
            `<a href='${MAIN_DOMAIN}' style='color:rgb(35, 41, 47); text-decoration:underline; font-size:12px; font-weight:bold; display:block; text-align:center;'>${MAIN_DOMAIN}</a>` +
            `<div style='text-align:center; color:rgb(35, 41, 47); font-size:11px; margin-top:10px;'>This is an automated message. Please do not reply.</div>`+
            `</div>`;
        return footer;
    }
}

export { AxialMailTemplateBase }