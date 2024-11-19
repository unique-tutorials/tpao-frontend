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
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "trpolRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("TrpolApp").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("trpolRequestListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                reserSearchParameter:{},
                searchParameter:{}
                
             
            });
        },
        _getRequestList: function (oEvent) {
            
        },
        onNavBack: function () {
            // this.goBack(History);
            this.getRouter().navTo("appdispatcher", {}, true);
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
        },
        onReservationSearch:function(oEvent){
            debugger;
            var oViewModel = this.getModel('trpolRequestListModel');
       
            var oFilter = oViewModel.getProperty('/reserSearchParameter');
            var aFilters = this._getFilters(oFilter);
            console.log(oFilter);

            var oTable = this.getView().byId('reservationTable') || sap.ui.getCore().byId('reservationTable');
            oTable.getBinding('items').filter(aFilters,"Application");
        },
        _getFilters: function (oFilter) {
            debugger;
            var aFilters = [];
            var aKeys = Object.keys(oFilter);
            for (var i = 0; i < aKeys.length; i++) {
                var sVal = oFilter[aKeys[i]].toString();
                if(sVal){
                    var oFilterElement = new Filter(aKeys[i],FilterOperator.EQ , sVal);
                    aFilters.push(oFilterElement);
                }
            }
            return aFilters;
        },
	});
});