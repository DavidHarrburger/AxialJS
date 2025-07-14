"use strict";

import { AxialAdminApplicationBase } from "../../../../axial/js/admin/base/AxialAdminApplicationBase.js";

// global components
import { AxialButton }  from "../../../../axial/js/button/AxialButton.js";
import { AxialCalendarButton }  from "../../../../axial/js/date/AxialCalendarButton.js";
import { AxialAdminList } from "../../../../axial/js/admin/base/AxialAdminList.js";
import { AxialToggleRadio } from "../../../../axial/js/button/AxialToggleRadio.js";
import { AxialToggleSwitch } from "../../../../axial/js/button/AxialToggleSwitch.js";
import { AxialViewerIndicatorStep } from "../../../../axial/js/view/AxialViewerIndicatorStep.js";
import { AxialViewerIndicator } from "../../../../axial/js/view/AxialViewerIndicator.js";
import { AxialViewBase } from "../../../../axial/js/view/AxialViewBase.js";
import { AxialViewerBase } from "../../../../axial/js/view/AxialViewerBase.js";

//
import { AxialCalendar } from "../../../../axial/js/date/AxialCalendar.js";
import { AxialDropdownCalendar } from "../../../../axial/js/dropdown/AxialDropdownCalendar.js";
import { AxialOverlayCalendar } from "../../../../axial/js/date/AxialOverlayCalendar.js";

import { AxialAdminParamsInformationBar } from "../../../../axial/js/admin/params/AxialAdminParamsInformationBar.js";

// charts
import { AxialChartTraffic } from "../../../../axial/js/charts/AxialChartTraffic.js";

// views
import { AxialAdminProfileView } from "../../../../axial/js/admin/profile/AxialAdminProfileView.js";
import { AxialAdminUserView } from "../../../../axial/js/admin/users/AxialAdminUserView.js";
import { AxialAdminProductView } from "../../../../axial/js/admin/products/AxialAdminProductView.js";
import { AxialAdminParamsView } from "../../../../axial/js/admin/params/AxialAdminParamsView.js";
import { AxialAdminStatView } from "../../../../axial/js/admin/stats/AxialAdminStatView.js";
import { AxialAdminMailView } from "../../../../axial/js/admin/mails/AxialAdminMailView.js";

// popups
import { AxialPopupManager } from "../../../../axial/js/popup/AxialPopupManager.js";
import { AxialAdminPopup } from "../../../../axial/js/admin/base/AxialAdminPopup.js";
import { AxialAdminProductPopup } from "../../../../axial/js/admin/products/AxialAdminProductPopup.js";

// forms
import { AxialServiceForm } from "../../../../axial/js/forms/AxialServiceForm.js";
import { AxialServiceFormItem } from "../../../../axial/js/forms/AxialServiceFormItem.js";
import { AxialServiceFormItemInputs } from "../../../../axial/js/forms/AxialServiceFormItemInputs.js";
import { AxialServiceFormItemToggles } from "../../../../axial/js/forms/AxialServiceFormItemToggles.js";
import { AxialServiceFormItemImage } from "../../../../axial/js/forms/AxialServiceFormItemImage.js";


class AdminPage extends AxialAdminApplicationBase
{
    /// events
    /** @type { Function } */
    #boundPopupHiddenHandler;

    constructor()
    {
        super();
        this.#boundPopupHiddenHandler = this.#popupHiddenHandler.bind(this);
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
        console.log( AxialPopupManager.POPUPS);
    }

    _onApplicationViewChanged( view )
    {
        if( view instanceof AxialAdminParamsView === false )
        {
            view.loadGetData();
        }
        else
        {
            console.log("Params view shown");
        }
        
    }

    #popupHiddenHandler( event )
    {

    }

}

export { AdminPage }