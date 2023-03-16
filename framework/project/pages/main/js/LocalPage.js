"use strict"

import { GlobalPage } from "../../../js/GlobalPage";

class LocalPage extends GlobalPage
{
    constructor()
    {
        super();
        console.log("Hello Axial LocalPage");
    }
}
export { LocalPage }