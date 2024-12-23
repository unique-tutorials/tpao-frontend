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
        onNavBack: function () {
            // this.goBack(History);
            this.getRouter().navTo("appdispatcher", {}, true);
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("careerContnListModel");
            var today = new Date();
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchCareerContnParameter:{},
                inApprovalList: {},
                absenceFilter : { 
                    begda: new Date(today.getFullYear(), today.getMonth(), 1),
                    endda: new Date(today.getFullYear(), today.getMonth() + 1, 0)
                 },
                 aplicationSetting: {
                    enabled: true,
                },
                rejectStatement:{}
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
        },
        onSearchDateStudentPress:function(){
            debugger;
            var oModel = this.getModel(),
            oViewModel = this.getModel("careerContnListModel"),
            sBegda = oViewModel.getProperty("/absenceFilter/begda"),
            sEndda =  oViewModel.getProperty("/absenceFilter/endda"),
            aFilters = [];
            // aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Histo", FilterOperator.BT, sBegda,sEndda));
            if (this.byId("idIconTabBarAbsence").getSelectedKey() === "DRF") {
                oViewModel.setProperty("/aplicationSetting/enabled", true);
                aFilters.push(new Filter("Prope", FilterOperator.EQ, "1"));
            } else if (this.byId("idIconTabBarAbsence").getSelectedKey() === "PND") {
                oViewModel.setProperty("/aplicationSetting/enabled", false);
                aFilters.push(new Filter("Prope", FilterOperator.EQ, ""));
            }
            oModel.read("/InternAbsenceApprovalSet", {
                filters: aFilters,
                success: function (oData) {
                    this._sweetToast(this.getText("ABSENCE_CONFIRMATION"), "S");
                    oViewModel.setProperty("/inApprovalList", oData.results);
                }.bind(this),
                error: function () {
                }.bind(this)
            });
        },
        onAbsenceConfirmButton: function(oEvent) {
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("careerContnListModel");
        
            var oInApprovalList = oViewModel.getProperty("/inApprovalList");
            var oAbsenceFilter = oViewModel.getProperty("/absenceFilter");
        
            if (!oInApprovalList || !oAbsenceFilter) {
                this._sweetToast(this.getText("DATA_NOT_AVAILABLE"), "E");
                return;
            }
        
            var oSelectedItem = oInApprovalList[0] || {};
            // var sPernr = oSelectedItem.Pernr;
            var sInper = oSelectedItem.Inper;
            var sAprvd = oSelectedItem.Aprvd;
            var sRejre = oSelectedItem.Rejre;
            var sRejec = "";
            var sBegda = oAbsenceFilter.begda;
            var sEndda = oAbsenceFilter.endda;
        
            if (!sBegda || !sEndda) {
                this._sweetToast(this.getText("INVALID_DATA"), "E");
                return;
            }
        
            var oUrlParameters = {
                // "Pernr": sPernr,
                "Inper": sInper,
                "Begda": sBegda,
                "Endda": sEndda,
                "Aprvd": sAprvd,
                "Rejre": sRejre,
                "Rejec": sRejec
            };
        
            this._openBusyFragment("PLEASE_WAIT", []);
            oModel.callFunction("/AppAbsenteeism", {
                method: "POST",
                urlParameters: oUrlParameters,
                success: function(oData, oResponse) {
                    this._sweetToast(this.getText("ABSENCE_CONFIRMATION_MESSAGE"), "S");
                    this._closeBusyFragment();
                }.bind(this),
                error: function(oError) {
                    debugger;
                }.bind(this)
            });
        },
        onAbsenceRejectDialog:function(){
            debugger;
            if (!this._oRejectAbsenceDialog) {
                this._oRejectAbsenceDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInternsContn.AbsenceRejectDialog", this);
                this.getView().addDependent(this._oRejectAbsenceDialog);
            }
            this._oRejectAbsenceDialog.open();
        },
        onRejectDialogButtonPress: function(oEvent){
            if (this._oRejectAbsenceDialog) {
                this._oRejectAbsenceDialog.close();
            }
        },
        onRejectSendButtonPress: function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("careerContnListModel");
        
            var oInApprovalList = oViewModel.getProperty("/inApprovalList");
            var oAbsenceFilter = oViewModel.getProperty("/absenceFilter");
            var DRejre = oViewModel.getProperty("/rejectStatement/Rejre");

        
            if (!oInApprovalList || !oAbsenceFilter) {
                this._sweetToast(this.getText("DATA_NOT_AVAILABLE"), "E");
                return;
            }
        
            var oSelectedItem = oInApprovalList[0] || {};
            // var sPernr = oSelectedItem.Pernr;
            var sInper = oSelectedItem.Inper;
            var sAprvd = "";
            var sRejre = DRejre;
            var sRejec = oSelectedItem.Rejec;
            var sBegda = oAbsenceFilter.begda;
            var sEndda = oAbsenceFilter.endda;
        
            if (!sBegda || !sEndda) {
                this._sweetToast(this.getText("INVALID_DATA"), "E");
                return;
            }
        
            var oUrlParameters = {
                // "Pernr": sPernr,
                "Inper": sInper,
                "Begda": sBegda,
                "Endda": sEndda,
                "Aprvd": sAprvd,
                "Rejre": sRejre,
                "Rejec": sRejec
            };
        
            this._openBusyFragment("PLEASE_WAIT", []);
            oModel.callFunction("/AppAbsenteeism", {
                method: "POST",
                urlParameters: oUrlParameters,
                success: function(oData, oResponse) {
                    this._sweetToast(this.getText("ABSENCE_CONFIRMATION_MESSAGE"), "S");
                    this._closeBusyFragment();
                }.bind(this),
                error: function(oError) {
                    debugger;
                }.bind(this)
            });
        }
        
    });
});