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

	return BaseController.extend("zhcm_ux_lms_abr.controller.AbrTracking", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "requestListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrTracking").attachPatternMatched(this._onRequestListMatched, this);
        },
        
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("requestListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                searchParameter:{},
                SelectedEmployee:{},
                generalEmployee:{},
                schoolEmployee:{},
                financialEmployee:{},
                abroadEmployee:{},
                domesticAccount:{},
                otherAccount:{},
                domesticEmployee:{},
                abroadOtherEmployee:{},
                identityEmployee:{},
                masterEmployee:{},
                contactEmployee:{},
                newNumberRequest:{
                    Pernr:null,
                    Ename:""                 
                },
            });
        },
        onItemSelected: function(oEvent) {
            debugger;
            var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('requestListModel');
            oViewModel.setProperty("/newNumberRequest/Pernr", oSelectedItem.Pernr); 
            oViewModel.setProperty("/newNumberRequest/Ename", oSelectedItem.Vorna +' '+ oSelectedItem.Nachn ); 
        
            if (this._oSearchHelpDialog) {
                this._oSearchHelpDialog.close();
            }
        }, 
        onSearch:function(oEvent){
            debugger;
            var oViewModel = this.getModel('requestListModel');
            var oFilter = oViewModel.getProperty('/searchParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('studentTable') || sap.ui.getCore().byId('studentTable');
            oTable.getBinding('items').filter(aFilters,"Application");
        },
        onSearchStudentPress: function (oEvent) {
            debugger;
            var that = this;
            var oModel = this.getModel();
            var sPernr = this.getView().getModel("requestListModel").getProperty("/newNumberRequest/Pernr");
        
            if (!sPernr) {
                this._sweetAlert(this.getText("STUDENT_NUMBER_REQUIRED"), "W");
                return;
            }
            function readData(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    success: function (oData) {
                        var oViewModel = that.getModel("requestListModel");
                        oViewModel.setProperty(sModelProperty, oData);
                        console.log(oData);
                    },
                    error: function () {
                        sap.m.MessageToast.show(errorMessage);
                    }
                });
            }
            // Öğrenci bilgileri al
            var sScholarshipPath = oModel.createKey("/ScholarShipstudentAbroadSet", { Pernr: sPernr });
            readData(sScholarshipPath, "/SelectedEmployee", "Öğrenci bilgisi alınamadı.");
        
            // Genel bilgileri al
            var sGeneralInfoPath = oModel.createKey("/GeneralInformationSet", { Pernr: sPernr });
            readData(sGeneralInfoPath, "/generalEmployee", "Genel bilgiler alınamadı.");

            // Okul bilgilerini al
            var sSchoolInfoPath = oModel.createKey("/SchoolInformationSet", { Pernr: sPernr});
            readData(sSchoolInfoPath, "/schoolEmployee", "Okul bilgileri alınamadı.");

            // Mali / Yurtiçi Dil bilgileri al
            var sLanguageSchoolInfoPath = oModel.createKey("/DomesticLanguageSchoolInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sLanguageSchoolInfoPath, "/financialEmployee", "Dil okul bilgileri alınamadı.");

             // Mali / YurtDışı Dil bilgileri al
             var sAbroadInfoPath = oModel.createKey("/LanguageSchoolAbroadSet", { Pernr: sPernr, Partner:"ASD123"});
             readData(sAbroadInfoPath, "/abroadEmployee", "Yurt dışı dil bilgileri alınamadı.");

            // Master Okul bilgileri al
            var sMasterInfoPath = oModel.createKey("/MasterSchoolInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sMasterInfoPath, "/masterEmployee", "Master okul bilgileri alınamadı.");

            // Öğrenci Yurt içi Döviz Hesap bilgileri al
            var sDomesticAccountInfoPath = oModel.createKey("/ForeignCurrencyAccountSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sDomesticAccountInfoPath, "/domesticAccount", "Yurt içi Döviz Hesap bilgileri alınamadı.");

            // Diğer Hesap bilgileri al
            var sotherAccountInfoPath = oModel.createKey("/OtherAccountInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sotherAccountInfoPath, "/otherAccount", "Diğer Hesap bilgileri alınamadı.");

            // Öğrenci Yurt içi Hesap bilgileri al
            var sDomesticEmployeeInfoPath = oModel.createKey("/StudentDomesticAccountInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sDomesticEmployeeInfoPath, "/domesticEmployee", "Öğrenci Yurt içi bilgileri alınamadı.");

             // Öğrenci Yurt dışı Hesap bilgileri al
             var sAbroadOtherEmployeeInfoPath = oModel.createKey("/AbroadOtherAccountInformationSet", { Pernr: sPernr, Partner:"ASD123"});
             readData(sAbroadOtherEmployeeInfoPath, "/abroadOtherEmployee", "Öğrenci Yurt dışı bilgileri alınamadı.");

            // Kimlik bilgilerini al
            var sIdentityInfoPath = oModel.createKey("/IdentityInformationSet", { Pernr: sPernr });
            readData(sIdentityInfoPath, "/identityEmployee", "Kimlik bilgileri alınamadı.");

            // İletişim bilgilerini al
            var sContactInfoPath = oModel.createKey("/ContactInformationSet", { Pernr: sPernr });
            readData(sContactInfoPath, "/contactEmployee", "İletişim bilgileri alınamadı.");

        },
        onSave: function(oEvent) {
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oEntry = oViewModel.getProperty('/generalEmployee');
            var oIdEntry = oViewModel.getProperty('/identityEmployee');
            var oShlEntry = oViewModel.getProperty('/schoolEmployee');
            var oFinEntry = oViewModel.getProperty('/financialEmployee');
            var that = this;
            
            // Genel bilgiler sekmesi seçiliyse
            if (this.byId("TabContainer").getSelectedKey() === "General") {
                oModel.create("/GeneralInformationSet", oEntry, {
                    success: function(oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S") {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: that.getText("EDU_TASK_SAVED_SUCCESSFUL"),
                                showConfirmButton: false,
                                timer: 1500
                              });
                        }
                    },
                    error: function() {
                        debugger;
                    }
                });
            } 
            // Okul bilgileri sekmesi seçiliyse
            else if (this.byId("TabContainer").getSelectedKey() === "School") {
                oModel.create("/SchoolInformationSet", oShlEntry, {
                    success: function(oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S") {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: that.getText("SCHOOL_INFORMATION_SAVED_SUCCESSFUL"),
                                showConfirmButton: false,
                                timer: 1500
                              });
                        }
                    },
                    error: function() {
                        debugger;
                    }
                });
            }
            // Yurtiçi dil okul bilgiler sekmesi seçiliyse
            if (this.byId("TabBarFinancial").getSelectedKey() === "LanguageSchool") {
                oModel.create("/TravelReservationSet", oFinEntry, {
                    success: function(oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S") {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: that.getText("EDU_TASK_SAVED_SUCCESSFUL"),
                                showConfirmButton: false,
                                timer: 1500
                                });
                        }
                    },
                    error: function() {
                        debugger;
                    }
                });
            } 
            // Kimlik bilgileri sekmesi seçiliyse
            else if (this.byId("TabContainer").getSelectedKey() === "Identity") {
                oModel.create("/IdentityInformationSet", oIdEntry, {
                    success: function(oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S") {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: that.getText("IDENTITY_INFORMATION_SAVED_SUCCESSFUL"),
                                showConfirmButton: false,
                                timer: 1500
                              });
                        }
                    },
                    error: function() {
                        debugger;
                    }
                });
            }
        },
        genderFormatter: function(sGesch) {
            if (sGesch === "1") {
                return "Erkek";
            } else if (sGesch === "2") {
                return "Kadın";
            } else {
                return "";
            }
        },
         openGuarantorDialog:function(oEvent){
            if (!this._oGuarantorDialog) {
                this._oGuarantorDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorDocumentDialog", this);
                this.getView().addDependent(this._oGuarantorDialog);
            } else {
                this._oGuarantorDialog.close();
            }
            this._oGuarantorDialog.open();
         },
         openGuarantorContactDialog:function(oEvent){
            if (!this._oGuarantorContactDialog) {
                this._oGuarantorContactDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorContactDialog", this);
                this.getView().addDependent(this._oGuarantorContactDialog);
            } else {
                this._oGuarantorContactDialog.close();
            }
            this._oGuarantorContactDialog.open();
         },
         openGuarantorIdentityDialog:function(oEvent){
            if (!this._oGuarantorIdentityDialog) {
                this._oGuarantorIdentityDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorIdentityDialog", this);
                this.getView().addDependent(this._oGuarantorIdentityDialog);
            } else {
                this._oGuarantorIdentityDialog.close();
            }
            this._oGuarantorIdentityDialog.open();
         },
         onShowPersonSearchHelp: function(oEvent) {
            if (!this._oSearchHelpDialog) {
                this._oSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.StudentSearchHelpDialog", this);
                this.getView().addDependent(this._oSearchHelpDialog);
            } else {
                this._oSearchHelpDialog.close();
            }
            this._oSearchHelpDialog.open();
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
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
        _getRequestList: function (oEvent) { 

        },
        onCancelSearchStudentDialog:function(oEvent){
            if (this._oSearchHelpDialog) {
                this._oSearchHelpDialog.close();
            }
        },
        onCancelGuarantorDialog:function(oEvent){
            if (this._oGuarantorDialog) {
                this._oGuarantorDialog.close();
            }
        },
        onCancelGuarantorContact:function(oEvent){
            if (this._oGuarantorContactDialog) {
                this._oGuarantorContactDialog.close();
            } 
        },
        onCancelGuarantorIdentity:function(oEvent){
            if (this._oGuarantorIdentityDialog) {
                this._oGuarantorIdentityDialog.close();
            } 
        },
        onShowUnitSearchHelp:function(oEvent){
            if (!this._oUnitSearchHelpDialog) {
                this._oUnitSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.UnitSearchHelpDialog", this);
                this.getView().addDependent(this._oUnitSearchHelpDialog);
            } else {
                this._oUnitSearchHelpDialog.close();
            }
            this._oUnitSearchHelpDialog.open();
        },
        onUnitSelected:function(oEvent){
            debugger;
            var oSelectedUnitItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('requestListModel');
            oViewModel.setProperty("/SelectedEmployee/Unicd", oSelectedUnitItem.Orgeh); 
            oViewModel.setProperty("/SelectedEmployee/Orgtx", oSelectedUnitItem.Orgtx ); 

            if (this._oUnitSearchHelpDialog) {
                this._oUnitSearchHelpDialog.close();
            }
        },
        onCancelUnitButtonPress:function(oEvent){
            if (this._oUnitSearchHelpDialog) {
                this._oUnitSearchHelpDialog.close();
            }
        }
        // _callErrorDialog: function (messageText) {
		// 	var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		// 	messageText = (messageText) ? messageText : this.getText("operationFailed");
		// 	MessageBox.error(
		// 		messageText, {
		// 			styleClass: bCompact ? "sapUiSizeCompact" : ""
		// 		}
		// 	);
		// },

        // getValueHelpList: function () {
        //     var that = this;
        //     var oModel = this.getModel();
        //     var aFilters = [new Filter("Id", FilterOperator.EQ, "Waers")];
        //     oModel.read("/ValueHelpSet", {
        //         filters: aFilters,
        //         success: function (oData, oResponse) {
        //             that.getModel("requestListModel").setProperty("/benefitList", oData.results);
        //         },
        //         error: function (oError) {
        //             sap.m.MessageToast.show(oError.toString());
        //         }
        //     });
        // },
	});
});