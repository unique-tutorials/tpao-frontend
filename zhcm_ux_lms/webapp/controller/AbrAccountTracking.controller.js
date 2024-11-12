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

	return BaseController.extend("zhcm_ux_lms_abr.controller.AbrAccountTracking", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "abrAccountListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrAccountTracking").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("abrAccountListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchAccountParameter:{},
                accountEmployee:{},
                domesticAccountEmployee:{},
                abroadOtherEmployee:{},
                newAccountNumberRequest:{
                    Pernr:null,
                    Ename:""                 
                },
            });
        },
        _getRequestList: function (oEvent) { 

        },
         openGuarantorDialog:function(oEvent){
            debugger;
         },
         onShowAccountSearchHelp:function(oEvent){
            if (!this._oAccountSearchHelp) {
				this._oAccountSearchHelp = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrAccountTracking.ShowAccountSearchHelp", this);
				this.getView().addDependent(this._oAccountSearchHelp);
			}
			this._oAccountSearchHelp.open();
         },
         onCancelAccountSearchDialog:function(oEvent){
            if (this._oAccountSearchHelp) {
                this._oAccountSearchHelp.close();
            }
        },
        onSearch:function(oEvent){
            debugger;
            var oViewModel = this.getModel('abrAccountListModel');
            var oFilter = oViewModel.getProperty('/searchAccountParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('studentTableAccount') || sap.ui.getCore().byId('studentTableAccount');
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
        onItemSelected: function(oEvent) {
            debugger;
            var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('abrAccountListModel');
            oViewModel.setProperty("/newAccountNumberRequest/Pernr", oSelectedItem.Pernr); 
            oViewModel.setProperty("/newAccountNumberRequest/Ename", oSelectedItem.Vorna +' '+ oSelectedItem.Nachn ); 
        
            if (this._oAccountSearchHelp) {
                this._oAccountSearchHelp.close();
            }
        },

        onAccountSearchButtonPress: function (oEvent) {
            debugger;
            var that = this;
            var oModel = this.getModel();
            var sPernr = this.getView().getModel("abrAccountListModel").getProperty("/newAccountNumberRequest/Pernr");

            var aFilters = [];
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))
            if (!sPernr) {
                this._sweetAlert(this.getText("STUDENT_NUMBER_REQUIRED"), "W");
                return;
            }
            function readData(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    filters: aFilters,
                    success: function (oData) {
                        var oViewModel = that.getModel("abrAccountListModel");
                        oViewModel.setProperty(sModelProperty, oData);
                        console.log(oData);
                    },
                    error: function () {
                        sap.m.MessageToast.show(errorMessage);
                    }
                });
            }

            // Öğrenci Yurt içi Hesap bilgileri al
            var sDomesticEmployeeInfoPath = oModel.createKey("/StudentDomesticAccountInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sDomesticEmployeeInfoPath, "/domesticEmployee", "Öğrenci Yurt içi bilgileri alınamadı.");

             // Öğrenci Yurt dışı Hesap bilgileri al
             var sAbroadOtherEmployeeInfoPath = oModel.createKey("/AbroadOtherAccountInformationSet", { Pernr: sPernr, Partner:"ASD123"});
             readData(sAbroadOtherEmployeeInfoPath, "/abroadOtherEmployee", "Öğrenci Yurt dışı bilgileri alınamadı.");
        },
	});
});