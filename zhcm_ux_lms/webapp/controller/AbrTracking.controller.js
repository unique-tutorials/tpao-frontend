/*global location history */
/*global _*/
sap.ui.define([
    "zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zhcm_ux_lms_abr/controller/SharedData"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, SharedData) {
    "use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.AbrTracking", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "requestListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrTracking").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("requestListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchParameter:{}
             
            });
        },
        onSearchPress:function(oEvent){
            debugger;
            var oViewModel = this.getModel('requestListModel');
            var oFilter = oViewModel.getProperty('/searchParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('studentTable') || sap.ui.getCore().byId('studentTable');
            oTable.getBinding('items').filter(aFilters,"Application");
        },
        _getFilters: function (oFilter) {
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
        _getRequestList: function () { 

        },
        onNewTrainingRequest: function (oEvent) {
            if (!this._oNewRequestDialog) {
				this._oNewRequestDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.TrainingRequestFormDialog", this);
				this.getView().addDependent(this._oNewRequestDialog);
			}
			this._oNewRequestDialog.open();
         },
         onShowPersonSearchHelp: function(oEvent) {
            if (!this._oSearchHelpDialog) {
                this._oSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.StudentSearchHelpDialog", this);
                this.getView().addDependent(this._oSearchHelpDialog);
            } else {
                this._oSearchHelpDialog.close();
            }
        
            this._oSearchHelpDialog.open();
        },
        
	});
});