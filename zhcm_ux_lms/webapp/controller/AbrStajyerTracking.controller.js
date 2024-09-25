/*global location history */
/*global _*/
sap.ui.define([
    "zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "zhcm_ux_lms_abr/controller/SharedData"
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageBox, MessageToast, SharedData) {
    "use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.AbrStajyerTracking", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "requestStajyerListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrTracking").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("requestStajyerListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchStajyerParameter:{},
                SelectedStajyer:{},
                newNumberStajyerRequest:{
                    Pernr:null,
                    Ename:""                 
                },
             
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
         onShowStajyerSearchHelp:function(oEvent){
            if (!this._oStajyerSearchHelpDialog) {
                this._oStajyerSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrStajyerTracking.StajyerSearchHelpDialog", this);
                this.getView().addDependent(this._oStajyerSearchHelpDialog);
            } else {
                this._oStajyerSearchHelpDialog.close();
            }
            this._oStajyerSearchHelpDialog.open();
         },
         onCancelSearchStajyerDialog:function(oEvent){
           if (this._oStajyerSearchHelpDialog) {
            this._oStajyerSearchHelpDialog.close();
           }
         },
         onStajyerSearch:function(){
            debugger;
            var oViewModel = this.getModel('requestStajyerListModel');
            var oFilter = oViewModel.getProperty('/searchStajyerParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('stajyerTable') || sap.ui.getCore().byId('stajyerTable');
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
        onItemStajyerSelected:function(oEvent){
            debugger;
            var oSelectedStajyerItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('requestStajyerListModel');
            oViewModel.setProperty("/newNumberStajyerRequest/Pernr", oSelectedStajyerItem.Pernr); 
            oViewModel.setProperty("/newNumberStajyerRequest/Ename", oSelectedStajyerItem.Vorna +' '+ oSelectedStajyerItem.Nachn ); 
        
            if (this._oStajyerSearchHelpDialog) {
                this._oStajyerSearchHelpDialog.close();
            }
        },
        onSearchStajyerPress: function (oEvent) {
            var that = this;
            var oModel = this.getModel();
            var sPernr = this.getView().getModel("requestStajyerListModel").getProperty("/newNumberStajyerRequest/Pernr");
        
            if (!sPernr) {
                sap.m.MessageToast.show("Stajyer numarası boş bırakılamaz.");
                return;
            }
            function readData(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    success: function (oData) {
                        var oViewModel = that.getModel("requestStajyerListModel");
                        oViewModel.setProperty(sModelProperty, oData);
                        console.log(oData);
                    },
                    error: function () {
                        sap.m.MessageToast.show(errorMessage);
                    }
                });
            }
            // Stajyer bilgileri al
            var sStajyerPath = oModel.createKey("/IntershipStudentSet", { Pernr: sPernr });
            readData(sStajyerPath, "/SelectedStajyer", "Stajyer bilgisi alınamadı.");
        },
        onSavePress:function(oEvent){
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestStajyerListModel");
            var oEntry = oViewModel.getProperty('/SelectedStajyer');
            var that = this;
            if (this.byId("TabContainerStajyer").getSelectedKey() === "info") {
                oModel.create("/IntershipStudentSet", oEntry, {
                    success: function(oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S") {
                            MessageBox.success(that.getText("EDU_TASK_SAVED_SUCCESSFUL"));
                        }
                    },
                    error: function() {
                        debugger;
                    }
                });
            } 
            // Okul bilgileri sekmesi seçiliyse
            // else if (this.byId("TabContainer").getSelectedKey() === "attachments") {
            //     oModel.create("/SchoolInformationSet", oShlEntry, {
            //         success: function(oData, oResponse) {
            //             debugger;
            //             if (oData.Mesty === "S") {
            //                 MessageBox.success(that.getText("SCHOOL_INFORMATION_SAVED_SUCCESSFUL"));
            //             }
            //         },
            //         error: function() {
            //             debugger;
            //         }
            //     });
            // }
        }
        // onStajyerSearch:function(){
        //     debugger;
        //     var oViewModel = this.getModel('requestStajyerListModel');
        //     var oFilter = oViewModel.getProperty('/searchStajyerParameter');
        //     var aFilters = this._getFilters(oFilter);
        
        //     console.log("Search Parameters:", oFilter);
        //     console.log("Filters Applied:", aFilters);
        
        //     var oTable = this.getView().byId('stajyerTable') || sap.ui.getCore().byId('stajyerTable');
        //     console.log("Table ID:", oTable);
            
        //     oTable.getBinding('items').filter(aFilters, "Application");
        // } 
	});
});