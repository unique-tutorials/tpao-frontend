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
            var today = new Date();
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                reserSearchParameter:[],
                searchParameter:{},
                absenceFilter : { 
                    begda: new Date(today.getFullYear(), today.getMonth(), 1),
                    endda: new Date(today.getFullYear(), today.getMonth() + 1, 0)
                },
                travelRequestList:{}
            });
        },
        _getRequestList: function (oEvent) {
            
        },
       
        onNavBack: function () {
            var oModel = this.getView().getModel("trpolRequestListModel");
            oModel.setProperty("/reserSearchParameter", {});
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
        onReservationSearch:function(){
            debugger;
            var oModel = this.getModel(),
            oViewModel = this.getModel("trpolRequestListModel"),
            sBegda = oViewModel.getProperty("/absenceFilter/begda"),
            sEndda =  oViewModel.getProperty("/absenceFilter/endda"),
            oFilter = oViewModel.getProperty('/reserSearchParameter'),
            aFilters = [];
            
            // aFilters.push(new Filter("Pernr", FilterOperator.EQ, oFilter.Pernr));
            // aFilters.push(new Filter("Vorna", FilterOperator.EQ, oFilter.Vorna));
            // aFilters.push(new Filter("Nachn", FilterOperator.EQ, oFilter.Nachn));
            aFilters.push(new Filter("Rered", FilterOperator.BT, sBegda,sEndda));

            oModel.read("/TravelReservationSet", {
                filters: aFilters,
                success: function (oData) {
                    this._sweetToast(this.getText("ABSENCE_CONFIRMATION"), "S");
                    oViewModel.setProperty("/travelRequestList", oData.results);
                }.bind(this),
                error: function () {
                }.bind(this)
            });
        },
        onReservationSearchs: function (oEvent) {
            debugger;
            var oViewModel = this.getModel('trpolRequestListModel');
            var oFilter = oViewModel.getProperty('/reserSearchParameter');
            
            // Tarih aralığını oFilter'a ekle
            var sBegda = oViewModel.getProperty("/absenceFilter/begda");
            var sEndda = oViewModel.getProperty("/absenceFilter/endda");
            oFilter.begda = sBegda;
            oFilter.endda = sEndda;
            
            // Rered filtresini oluştur
            var aFilters = this._getFilters(oFilter);
            aFilters.push(new Filter("Rered", FilterOperator.BT, sBegda, sEndda));
            
            // Tabloyu al ve filtre uygula
            var oTable = this.getView().byId('reservationTable') || sap.ui.getCore().byId('reservationTable');
            oTable.getBinding('items').filter(aFilters, "Application");
        },
        
        _getFilters: function (oFilter) {
            debugger;
            var aFilters = [];
            
            // oFilter'daki tüm anahtarlar üzerinden geç
            var aKeys = Object.keys(oFilter);
            for (var i = 0; i < aKeys.length; i++) {
                var sKey = aKeys[i];
                var sVal = oFilter[sKey];
                
                // Filtreye eklenebilir değer varsa, filtre oluştur
                if (sVal && sVal !== "") {
                    var oFilterElement = new Filter(sKey, FilterOperator.EQ, sVal);
                    aFilters.push(oFilterElement);
                }
            }
            
            return aFilters;
        }
        
	});
});