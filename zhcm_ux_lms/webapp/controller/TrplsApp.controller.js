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

	return BaseController.extend("zhcm_ux_lms_abr.controller.TrplsApp", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "requestListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrTracking").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("requestListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {}
             
            });
        },
        _getRequestList: function (oEvent) { 

        },
        onShowReservationSearchHelp: function(oEvent) {
            if (!this._oReserSearchHelpDialog) {
                this._oReserSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.TrplsApp.ReservationSearchHelpDialog", this);
                this.getView().addDependent(this._oReserSearchHelpDialog);
            } else {
                this._oReserSearchHelpDialog.close();
            }
            this._oReserSearchHelpDialog.open();
        },
        onNewTrainingRequest: function (oEvent) {
            if (!this._oNewRequestDialog) {
				this._oNewRequestDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrRequestList.TrainingRequestFormDialog", this);
				this.getView().addDependent(this._oNewRequestDialog);
			}
			this._oNewRequestDialog.open();
         }
	});
});