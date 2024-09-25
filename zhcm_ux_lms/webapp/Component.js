/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "zhcm_ux_lms_abr/model/models",
    "zhcm_ux_lms_abr/utils/sweetalert"
],
    function (UIComponent, Device, models, SwalJS) {
        "use strict";

        return UIComponent.extend("zhcm_ux_lms_abr.Component", {
            metadata: {
                manifest: "json",
                 config : { fullWidth : true}
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);