"use strict"

import { GlobalPage } from "../../../js/GlobalPage.js";

class LocalPage extends GlobalPage
{
    constructor()
    {
        super();
        console.log("Hello Axial LocalPage");
    }
}
export { LocalPage }