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
            this.setModel(oViewModel, "trplsRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("TrplsApp").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("trplsRequestListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                reserSearchParameter: {
                },
                reservationRequest: {}
             
            });
        },
        _getRequestList: function (oEvent) { 

        },
        onSearch:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("trplsRequestListModel");
            var oFilter = oViewModel.getProperty('/reserSearchParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('reservationTable') || sap.ui.getCore().byId('reservationTable');
            oTable.getBinding('items').filter(aFilters,"Application");
           

            // aFilters.push(new Filter("Rered", FilterOperator.BT, oFilter.beginDate, oFilter.endDate));
            // var oTable = this.getView().byId('reservationTable') || sap.ui.getCore().byId('reservationTable');
            // oTable.getBinding('items').filter(aFilters,"Application");
            
            // oModel.read(sPath, {
            //     filters: aFilters,
            //     success: function(oData) {
                   
            //         console.log(oData);
            //     },
            //     error: function(oError) {
            //         sap.m.MessageToast.show("Veri yüklenirken hata oluştu.");
            //     }
            // });
            
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
        onItemSelected: function(oEvent) {
            debugger;
            var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('trplsRequestListModel');
            oViewModel.setProperty("/newNumberReserRequest/Pernr", oSelectedItem.Pernr); 
            oViewModel.setProperty("/newNumberReserRequest/Ename", oSelectedItem.Vorna +' '+ oSelectedItem.Nachn ); 
        
            if (this._oReserSearchHelpDialog) {
                this._oReserSearchHelpDialog.close();
            }
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