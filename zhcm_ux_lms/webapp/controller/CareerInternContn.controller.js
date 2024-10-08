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

	return BaseController.extend("zhcm_ux_lms_abr.controller.CareerInternContn", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "careerContnListModel");
            this._initiateModel();
            this.getRouter().getRoute("CareerInternContn").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("careerContnListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchCareerContnParameter:{}
             
            });
        },
        _getRequestList: function (oEvent) { 

        },
        onShowCareerContnSearchHelp:function(oEvent){
            if (!this._oCareerContnSearchHelpDialog) {
                this._oCareerContnSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInternsContn.CareerContnSearchHelpDialog", this);
                this.getView().addDependent(this._oCareerContnSearchHelpDialog);
            } else {
                this._oCareerContnSearchHelpDialog.close();
            }
            this._oCareerContnSearchHelpDialog.open();
        },
        onCancelSearchCareerContnDialog:function(oEvent){
            if (this._oCareerContnSearchHelpDialog) {
                this._oCareerContnSearchHelpDialog.close();
            }
        }
    });
});