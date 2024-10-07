sap.ui.define([
    "zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zhcm_ux_lms_abr/controller/SharedData"
], function(
	BaseController, JSONModel, History, formatter, Filter, FilterOperator, SharedData
) {
	"use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.TrpolApp", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "trpolRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("TrpolApp").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("trpolRequestListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchParameter:{}
             
            });
        },
        _getRequestList: function () { 

        },
        onShowReservationSearchHelp:function(oEvent){
            if (!this._oReservationSearchHelpDialog) {
                this._oReservationSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.TrpolApp.ReservationSearchHelp", this);
                this.getView().addDependent(this._oReservationSearchHelpDialog);
            } else {
                this._oReservationSearchHelpDialog.close();
            }
            this._oReservationSearchHelpDialog.open();
        },
        onReservationSearchCancelButtonPress:function(oEvent){
            if (this._oReservationSearchHelpDialog) {
                this._oReservationSearchHelpDialog.close();
            }
        }
	});
});