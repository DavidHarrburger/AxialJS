"use strict"

import { GlobalPage } from "../../../js/GlobalPage.js";

import { AxialBurgerButton } from "../../../../axial/js/button/AxialBurgerButton.js";
import { AxialPopupBurger } from "../../../../axial/js/popup/AxialPopupBurger.js"
import { AxialNavigationHelper } from "../../../../axial/js/experimental/AxialNavigationHelper.js";
import { AxialNotifier } from "../../../../axial/js/application/AxialNotifier.js";

class LocalPage extends GlobalPage
{
    constructor()
    {
        super();
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
    }
}
export { LocalPage }