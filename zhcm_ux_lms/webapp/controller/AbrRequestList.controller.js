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
                RequestList:[
                    {
                        "Under": "Bilecik Şeyh Edebali Üniversitesi",
                        "Maste": "Bilgisayar Mühendisliği",
                        "Masten": "Computer Engineering",
                        "Subjet": "Bilgisayar Ağları ve Güvenliği",
                        "Subjen": "Computer Networks and Security",
                        "Count": "Almanya",
                        "Quqta": "23",
                        "Direc": "Ünite Müdürlüğü",
                        "Reaso": "Yüksek Lisans"
                    },
                    {
                        "Under": "Düzce Üniversitesi",
                        "Maste": "Elektronik Mühendisliği",
                        "Masten": "Electronics Engineering",
                        "Subjet": "Nesnelerin İnterneti",
                        "Subjen": "Internet of Things (IoT)",
                        "Count": "Fransa",
                        "Quqta": "30",
                        "Direc": "Ünite Müdürlüğü",
                        "Reaso": "Yüksek Lisans"
                    },
                    {
                        "Under": "İstanbul Teknik Üniversitesi",
                        "Maste": "Makine Mühendisliği",
                        "Masten": "Mechanical Engineering",
                        "Subjet": "Enerji Sistemleri",
                        "Subjen": "Energy Systems",
                        "Count": "İsveç",
                        "Quqta": "15",
                        "Direc": "Teknoloji Geliştirme Müdürlüğü",
                        "Reaso": "Doktora"
                    },
                    {
                        "Under": "Boğaziçi Üniversitesi",
                        "Maste": "Endüstri Mühendisliği",
                        "Masten": "Industrial Engineering",
                        "Subjet": "Operasyonel Araştırmalar",
                        "Subjen": "Operational Research",
                        "Count": "İngiltere",
                        "Quqta": "20",
                        "Direc": "Araştırma Geliştirme Müdürlüğü",
                        "Reaso": "Yüksek Lisans"
                    },
                    {
                        "Under": "Orta Doğu Teknik Üniversitesi",
                        "Maste": "Havacılık ve Uzay Mühendisliği",
                        "Masten": "Aerospace Engineering",
                        "Subjet": "Uçak Tasarımı",
                        "Subjen": "Aircraft Design",
                        "Count": "ABD",
                        "Quqta": "10",
                        "Direc": "Savunma Sanayi Müdürlüğü",
                        "Reaso": "Doktora"
                    }
                ],
                selectedAbr: null,
                abrActionData:{
                    displayEnabled: false
                }
            });
        },
        _getRequestList: function () { 

        },
        onAbrItemSelected:function(oEvent){
            var oSelected = oEvent.getParameter('listItem').getBindingContext("abrRequestListModel").getObject();
            this.getModel("abrRequestListModel").setProperty("/selectedAbr", oSelected);

            var oAbrActionData = {
                displayEnabled: true
            };
            this.getModel("abrRequestListModel").setProperty("/abrActionData", oAbrActionData);

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