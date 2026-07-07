"use strict";

import { AxialAdminApplicationBase } from "../../../../axial/js/admin/base/AxialAdminApplicationBase.js";

import { AxialButton }  from "../../../../axial/js/button/AxialButton.js";
import { AxialServiceButton } from "../../../../axial/js/button/AxialServiceButton.js";
import { AxialToggleRadio } from "../../../../axial/js/button/AxialToggleRadio.js";
import { AxialViewBase } from "../../../../axial/js/view/AxialViewBase.js";
import { AxialToggleSwitch } from "../../../../axial/js/button/AxialToggleSwitch.js";

// forms
import { AxialServiceForm } from "../../../../axial/js/forms/AxialServiceForm.js";
import { AxialServiceFormItem } from "../../../../axial/js/forms/AxialServiceFormItem.js";
import { AxialServiceFormItemInputs } from "../../../../axial/js/forms/AxialServiceFormItemInputs.js";
import { AxialServiceFormItemToggles } from "../../../../axial/js/forms/AxialServiceFormItemToggles.js";
import { AxialServiceFormItemImage } from "../../../../axial/js/forms/AxialServiceFormItemImage.js";
import { AxialServiceFormItemInternalProductPrice } from "../../../../axial/js/forms/AxialServiceFormItemInternalProductPrice.js";

// list
import { AxialAdminList } from "../../../../axial/js/admin/base/AxialAdminList.js";

// date
import { AxialWeekPlanning } from "../../../../axial/js/date/AxialWeekPlanning.js";

// views we need
import { AxialAdminProfileView } from "../../../../axial/js/admin/profile/AxialAdminProfileView.js";
import { AxialAdminCompanyView } from "../../../../axial/js/admin/misc/AxialAdminCompanyView.js";
import { AxialAdminEmployeeView } from "../../../../axial/js/admin/misc/AxialAdminEmployeeView.js";
import { AxialAdminClientView } from "../../../../axial/js/admin/misc/AxialAdminClientView.js";
import { AxialAdminInternalProductView } from "../../../../axial/js/admin/products_internal/AxialAdminInternalProductView.js";

// popups
import { AxialAdminEmployeePopup } from "../../../../axial/js/admin/misc/AxialAdminEmployeePopup.js";
import { AxialAdminClientPopup } from "../../../../axial/js/admin/misc/AxialAdminClientPopup.js";
import { AxialAdminInternalProductPopup } from "../../../../axial/js/admin/products_internal/AxialAdminInternalProductPopup.js";

class UserPage extends AxialAdminApplicationBase
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

    _onApplicationUserReady()
    {
        console.log("user ready");
    }

    /**
     * 
     * @param { AxialViewBase } view 
     */
    _onApplicationViewChanged( view )
    {
        
    }

    /**
     * 
     * @param { AxialPopupBase } popup 
     */
    _onApplicationPopupHidden( popup )
    {
        
    }
}

export { UserPage }