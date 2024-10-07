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

	return BaseController.extend("zhcm_ux_lms_abr.controller.AbrRequestList", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "abrRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrRequestList").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("abrRequestListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                RequestList:[{
                    Under:"Bilecik Şeyh Edebali Üniversitesi",
                    Maste:"Bilgisayar Mühendisliği",
                    Masten:"Bilgisayar Mühendisliği EN",
                    Subjet:"Bilgisayar Ağları ve Güvenliği",
                    Subjen:"Bilgisayar Ağları ve Güvenliği EN",
                    Count:"Almanya",
                    Quqta:"23",
                    Direc:"Ünite Müdürlüğü",
                    Reaso:"Yüksek Lisans"
                },{
                    Under:"Düzce Üniversitesi",
                    Maste:"Elektronik Mühendisliği",
                    Masten:"Elektronik Mühendisliği EN",
                    Subjet:"Bilgisayar Ağları ve Güvenliği",
                    Subjen:"Bilgisayar Ağları ve Güvenliği EN",
                    Count:"Fransa",
                    Quqta:"30",
                    Direc:"Ünite Müdürlüğü",
                    Reaso:"Yüksek Lisans"
                }]
            });
        },
        _getRequestList: function () { 

        },
        onNewTrainingRequest: function (oEvent) {
            if (!this._oNewRequestDialog) {
				this._oNewRequestDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrRequestList.TrainingRequestFormDialog", this);
				this.getView().addDependent(this._oNewRequestDialog);
			}
			this._oNewRequestDialog.open();
         },
         onAddNewCountry: async function () {
            if (!this._oNewCountryDialog) {
				this._oNewCountryDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrRequestList.CountryNewTable", this);
				this.getView().addDependent(this._oNewCountryDialog);
			}
			this._oNewCountryDialog.open();
          },
	});
});