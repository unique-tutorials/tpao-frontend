sap.ui.define([
	"zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function(
	BaseController, JSONModel, History, formatter, Filter, FilterOperator
) {
	"use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.CareerInterns", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "careerInternListModel");
            this._initiateModel();
            this.getRouter().getRoute("CareerInterns").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("careerInternListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchCareerParameter:{}
            });
        },
        _getRequestList: function () { 

        },
        onShowCareerSearchHelp:function(oEvent){
            if (!this._oCareerSearchHelpDialog) {
                this._oCareerSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInterns.CareerSearchHelpDialog", this);
                this.getView().addDependent(this._oCareerSearchHelpDialog);
            } else {
                this._oCareerSearchHelpDialog.close();
            }
            this._oCareerSearchHelpDialog.open();
        },
        onCancelSearchCareerDialog:function(oEvent){
            if (this._oCareerSearchHelpDialog) {
                this._oCareerSearchHelpDialog.close();
            }
        }
    });
});