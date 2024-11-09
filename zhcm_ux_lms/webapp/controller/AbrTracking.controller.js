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
                schoolFeeList:{},
                expendInfoList:{},
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
                expendInfoDialogRequest:{},
                schoolInfoDialogRequest:{},
                guarantorList:{},
                attachmentGuarantorList:[],
                guarantorListRequest:{},
                documentList:{},
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
        onPartnerButtonPress:function(){
            debugger;
            var that = this;
            var oModel = this.getModel(); 
            var oViewModel = this.getView().getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"); 
            var sPartner = oViewModel.getProperty("/financialEmployee/Partner");
            if (!sPartner) {
                sap.m.MessageToast.show("Lütfen bir Partner No giriniz.");
                return;
            } 
            var sDomesticLanguageInfoPath = oModel.createKey("/DomesticLanguageSchoolInformationSet", { Pernr: sPernr, Partner: sPartner });
        
            oModel.read(sDomesticLanguageInfoPath, {
                success: function (oData) {
                    // Veriyi modele yazın
                    oViewModel.setProperty("/financialEmployee", oData);
                    sap.m.MessageToast.show("Veri başarıyla alındı.");
                },
                error: function () {
                    sap.m.MessageToast.show("Genel harcama bilgileri alınamadı.");
                }
            });
        },
        onForeignButtonPress:function(oEvent){
            var that = this;
            var oModel = this.getModel(); 
            var oViewModel = this.getView().getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"); 
            var sPartner = oViewModel.getProperty("/abroadEmployee/Partner");
            if (!sPartner) {
                sap.m.MessageToast.show("Lütfen bir Partner No giriniz.");
                return;
            } 
            var sForeignInfoPath = oModel.createKey("/LanguageSchoolAbroadSet", { Pernr: sPernr, Partner: sPartner });
        
            oModel.read(sForeignInfoPath, {
                success: function (oData) {
                    // Veriyi modele yazın
                    oViewModel.setProperty("/abroadEmployee", oData);
                    sap.m.MessageToast.show("Veri başarıyla alındı.");
                },
                error: function () {
                    sap.m.MessageToast.show("Yurt dışı dil okul bilgileri alınamadı.");
                }
            });
        },
        onForeignSavePress:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oFinEntry = oViewModel.getProperty('/abroadEmployee');
             // Genel bilgiler sekmesi seçiliyse
            // Yurtiçi dil okul bilgiler sekmesi seçiliyse
            if (this.byId("TabBarFinancial").getSelectedKey() === "LanguageSchool") {
                oModel.create("/LanguageSchoolAbroadSet", oFinEntry, {
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
        },
        onFinancialSavePress:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oFinEntry = oViewModel.getProperty('/financialEmployee');
             // Genel bilgiler sekmesi seçiliyse
            // Yurtiçi dil okul bilgiler sekmesi seçiliyse
            if (this.byId("TabBarFinancial").getSelectedKey() === "LanguageSchool") {
                oModel.create("/DomesticLanguageSchoolInformationSet", oFinEntry, {
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
        },
        onMasterButtonPress:function(){
            debugger;
            var that = this;
            var oModel = this.getModel(); 
            var oViewModel = this.getView().getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"); 
            var sPartner = oViewModel.getProperty("/masterEmployee/Partner");
            if (!sPartner) {
                sap.m.MessageToast.show("Lütfen bir Partner No giriniz.");
                return;
            } 
            var sForeignInfoPath = oModel.createKey("/MasterSchoolInformationSet", { Pernr: sPernr, Partner: sPartner });
        
            oModel.read(sForeignInfoPath, {
                success: function (oData) {
                    // Veriyi modele yazın
                    oViewModel.setProperty("/masterEmployee", oData);
                    sap.m.MessageToast.show("Veri başarıyla alındı.");
                },
                error: function () {
                    sap.m.MessageToast.show("Yurt dışı dil okul bilgileri alınamadı.");
                }
            });
        },
        // burada sadece pernr
        onPaynoButtonPress: function () {
            debugger;
            var that = this;
            var oModel = this.getModel();
            var oViewModel = this.getView().getModel("requestListModel");
            this._openBusyFragment("READ_EXPEND_INFO", []);
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
      
            var aFilters = [];
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))
          
        
            oModel.read("/GeneralExpenditureInformationSet", {
                filters: aFilters,
                success: function (oData) {
                    oViewModel.setProperty("/expendInfoList", oData.results);
              
                    console.log("genel harcama bilgileri dataa:", oData);
                    that._closeBusyFragment();
                },
                error: function () {
                    sap.m.MessageToast.show("Genel harcama bilgileri alınamadı.");
                }
            });
        },
        onSchoolFeeButtonPress:function(oEvent){
            debugger;
            var that = this;
            var oModel = this.getModel();
            var oViewModel = this.getView().getModel("requestListModel");
            this._openBusyFragment("READ_SCHOOL_FEE", []);
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
      
            var aFilters = [];
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))
          
        
            oModel.read("/SchoolWageInformationSet", {
                filters: aFilters,
                success: function (oData) {
                    oViewModel.setProperty("/schoolFeeList", oData.results);
                    that._closeBusyFragment();
                    console.log("okul ücret bilgileri dataa:", oData);
                },
                error: function () {
                    sap.m.MessageToast.show("Okul ücret bilgileri alınamadı.");
                }
            });
        },
        
        onGuarantorButtonPress:function(oEvent){
            debugger;
            var that = this;
            var oModel = this.getModel();
            var oViewModel = this.getView().getModel("requestListModel");
            this._openBusyFragment("READ_GUARANTOR_FEE", []);
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
      
            var aFilters = [];
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))
          
        
            oModel.read("/GuarantorInformationSet", {
                filters: aFilters,
                success: function (oData) {
                    oViewModel.setProperty("/guarantorList", oData.results);
                    that._closeBusyFragment();
                    console.log("Kefil bilgileri dataa:", oData);
                },
                error: function () {
                    sap.m.MessageToast.show("Diğer bilgiler de Kefil bilgileri alınamadı.");
                }
            });
        },
       
        onSearchStudentPress: function (oEvent) {
            debugger;
            var that = this;
            var oModel = this.getModel();
            var sPernr = this.getView().getModel("requestListModel").getProperty("/newNumberRequest/Pernr");

            var aFilters = [];
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))
            // var sPayno = this.getView().getModel("requestListModel").getProperty("/expendInfoList/Payno");

            // if (!sPayno) {
            //     this._sweetAlert(this.getText("INVOICE_NUMBER_REQUIRED"), "W");
            //     return;
            // }
        
            if (!sPernr) {
                this._sweetAlert(this.getText("STUDENT_NUMBER_REQUIRED"), "W");
                return;
            }
            function readData(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    filters: aFilters,
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
            // var sLanguageSchoolInfoPath = oModel.createKey("/DomesticLanguageSchoolInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            // readData(sLanguageSchoolInfoPath, "/financialEmployee", "Dil okul bilgileri alınamadı.");

             // Mali / YurtDışı Dil bilgileri al
            //  var sAbroadInfoPath = oModel.createKey("/LanguageSchoolAbroadSet", { Pernr: sPernr, Partner:"ASD123"});
            //  readData(sAbroadInfoPath, "/abroadEmployee", "Yurt dışı dil bilgileri alınamadı.");

            // Master Okul bilgileri al
            // var sMasterInfoPath = oModel.createKey("/MasterSchoolInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            // readData(sMasterInfoPath, "/masterEmployee", "Master okul bilgileri alınamadı.");

            // Öğrenci Yurt içi Döviz Hesap bilgileri al
            var sDomesticAccountInfoPath = oModel.createKey("/ForeignCurrencyAccountSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sDomesticAccountInfoPath, "/domesticAccount", "Yurt içi Döviz Hesap bilgileri alınamadı.");

            // Diğer Hesap bilgileri al
            var sotherAccountInfoPath = oModel.createKey("/OtherAccountInformationSet", { Pernr: sPernr, Partner:"ASD123"});
            readData(sotherAccountInfoPath, "/otherAccount", "Diğer Hesap bilgileri alınamadı.");

            // Okul Ücret bilgileri al BAK
            // var sSchoolWageInfoPath = oModel.createKey("/SchoolWageInformationSet", { Pernr: sPernr});
            // readData(sSchoolWageInfoPath, "/schoolFeeList", "Okul ücret bilgileri alınamadı.");

            // Genel Harcama bilgilerini al
            // var sGeneralExpendInfoPath = oModel.createKey("/GeneralExpenditureInformationSet", { Pernr: sPernr });
            // readData(sGeneralExpendInfoPath, "/expendInfoList", "Genel Harcama bilgileri alınamadı.");

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
        onSchoolFeeNavigationDialog:function(oEvent){
            debugger;
            var oSource = oEvent.getSource(),
            oViewModel = this.getModel("requestListModel")
            var schoolInfoList = oSource.getBindingContext("requestListModel").getObject();
            this._getSchoolList(schoolInfoList);
        },
        _getSchoolList:function(schoolInfoList){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            // var sPath = "/GeneralExpenditureInformation(Pernr='" + expendInfoList.Pernr + "',Payno='" + expendInfoList.Payno + "')";
            var sPath = oModel.createKey("/SchoolWageInformationSet", {
                "Pernr": schoolInfoList.Pernr,
                "Wagpe": schoolInfoList.Wagpe,
                "Kamno": schoolInfoList.Kamno,
            });
            this._openBusyFragment();
        
            oModel.read(sPath, {
                // filters: aFilters,
                success: (oData) => {
                    debugger;
                    oViewModel.setProperty("/schoolInfoDialogRequest", oData);
                    this._closeBusyFragment();
                    if (!this._oSchoolInfoDialog) {
                        this._oSchoolInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.SchoolFeeNavigationDialog", this);
                        this.getView().addDependent(this._oSchoolInfoDialog);
                    } else {
                        this._oSchoolInfoDialog.close();
                    }
                    this._oSchoolInfoDialog.open();
                 
                },
                
                error: (oError) => {
                    this._closeBusyFragment();
                    sap.m.MessageToast.show("Veri alınırken hata oluştu.");
                }
            });
        },
        onSchoolCancelButtonPress:function(oEvent){
            if (this._oSchoolInfoDialog) {
                this._oSchoolInfoDialog.close();
            }
        },
        onExpendInfoNavigationDialog:function(oEvent){
        debugger
        var oSource = oEvent.getSource(),
        oViewModel = this.getModel("requestListModel")
        var expendInfoList = oSource.getBindingContext("requestListModel").getObject();

        // oViewModel.setProperty("/expendInfoList", expendInfoList)
        this._getExpendList(expendInfoList);
        },
        _getExpendList: function (expendInfoList) {
            debugger;
            // var aFilters = [];
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            // var sPath = "/GeneralExpenditureInformation(Pernr='" + expendInfoList.Pernr + "',Payno='" + expendInfoList.Payno + "')";
            var sPath = oModel.createKey("/GeneralExpenditureInformationSet", {
                "Pernr": expendInfoList.Pernr,
                "Payno": expendInfoList.Payno
            });
            // var aFilters = [];
            // aFilters.push(new Filter("Pernr", FilterOperator.EQ, expendInfoList.Pernr));
            // aFilters.push(new Filter("Payno", FilterOperator.EQ, expendInfoList.Payno));
        
            this._openBusyFragment();
        
            oModel.read(sPath, {
                // filters: aFilters,
                success: (oData) => {
                    debugger;
                    oViewModel.setProperty("/expendInfoDialogRequest", oData);
                    this._closeBusyFragment();
                    if (!this._oExpendInfoDialog) {
                        this._oExpendInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.ExpendInfoNavigationDialog", this);
                        this.getView().addDependent(this._oExpendInfoDialog);
                    } else {
                        this._oExpendInfoDialog.close();
                    }
                    this._oExpendInfoDialog.open();
                 
                },
                
                error: (oError) => {
                    this._closeBusyFragment();
                    sap.m.MessageToast.show("Veri alınırken hata oluştu.");
                }
            });
        },
        // _clearRequest: function () {
        //     var table = sap.ui.getCore().byId("idSuggestionEmployeeTable"),
        //         oViewModel = this.getModel("trainingDetailListModel");
        //     oViewModel.setProperty("/selectedSuggestion/employeeRequest", {});
        //     table.removeSelections();
        // },
        onSendExpendButtonPress:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oSource = oEvent.getSource();
            // oViewModel = this.getModel("requestListModel")
            var expendInfoList = oSource.getBindingContext("requestListModel").getObject();
            var oUrlParameters = {
                "Pernr": expendInfoList.Pernr,
                "Payno": expendInfoList.Payno
            };
 
            this._openBusyFragment("TRAINING_PARTICIPANT_SAVE_OPERATION", []);
            oModel.callFunction("/SetApproved", {
                method: "POST",
                urlParameters: oUrlParameters,
                success: function (oData, oResponse) {
                    // that.getModel("requestListModel").setProperty("/expendInfoList");
                    this._sweetAlert(this.getText("SAVE_SUCCESSFUL"), "S");
                    this._closeBusyFragment();
                }.bind(this),
                error: function (oError) {
                    debugger;
                }.bind(this)
            });
        },
        onSendSchoolFeeButtonPress:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oSource = oEvent.getSource();
            // oViewModel = this.getModel("requestListModel")
            var expendInfoList = oSource.getBindingContext("requestListModel").getObject();
            var oUrlParameters = {
                "Pernr": expendInfoList.Pernr,
                "Kamno": expendInfoList.Kamno,
                "Wagpe": expendInfoList.Wagpe
            };
 
            this._openBusyFragment("TRAINING_PARTICIPANT_SAVE_OPERATION", []);
            oModel.callFunction("/SentPayEducation", {
                method: "POST",
                urlParameters: oUrlParameters,
                success: function (oData, oResponse) {
                    // that.getModel("requestListModel").setProperty("/expendInfoList");
                    this._sweetAlert(this.getText("SAVE_SUCCESSFUL"), "S");
                    this._closeBusyFragment();
                }.bind(this),
                error: function (oError) {
                    debugger;
                }.bind(this)
            }); 
        },
        clearFormDialog: function () {
            var oViewModel = this.getModel("requestListModel");
            oViewModel.setProperty("/expendInfoDialogRequest", {});
        },
        onExpendInfoAddDialog:function(){

            this.clearFormDialog();
            if (!this._oExpendInfoDialog) {
                this._oExpendInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.ExpendInfoNavigationDialog", this);
                this.getView().addDependent(this._oExpendInfoDialog);
            } else {
                this._oExpendInfoDialog.close();
            }
            this._oExpendInfoDialog.open();
        },
        onSchollInfoAddDialog:function(){
            if (!this._oSchoolInfoDialog) {
                this._oSchoolInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.SchoolFeeNavigationDialog", this);
                this.getView().addDependent(this._oSchoolInfoDialog);
            } else {
                this._oSchoolInfoDialog.close();
            }
            this._oSchoolInfoDialog.open();
        },
        onSaveExpendDialogButtonPress: function (oEvent) {
            debugger;
            var that = this;
            var oModel = this.getModel(),
            oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            var oRequets = oViewModel.getProperty("/expendInfoDialogRequest");
            oRequets.Pernr = sPernr

            oModel.create("/GeneralExpenditureInformationSet", oRequets, {
                success: function (oData, oResponse) {
                    that._sweetAlert(that.getText("SAVE_SUCCESSFUL"), "S");
                    that._oExpendInfoDialog.close();
                    that.clearFormDialog();
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    this._sweetAlert(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                }.bind(this)
            });
        },
        onSaveSchoolDialogButtonPress:function(oEvent){
            debugger;
            var that = this;
            var oModel = this.getModel(),
            oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            var oSchoolRequets = oViewModel.getProperty("/schoolInfoDialogRequest");
            oSchoolRequets.Pernr = sPernr

            oModel.create("/SchoolWageInformationSet", oSchoolRequets, {
                success: function (oData, oResponse) {
                    that._sweetAlert(that.getText("SAVE_SUCCESSFUL"), "S");
                    that._oExpendInfoDialog.close();
                    that.clearFormDialog();
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    this._sweetAlert(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                }.bind(this)
            }); 
        },
        onAttachmentUploadComplete: function (oEvent) {
			var oFileUploader = sap.ui.getCore().byId("idAttachmentFileUploader");
			oFileUploader.destroyHeaderParameters();
			oFileUploader.clear();

			var sStatus = oEvent.getParameter("status");
			var sResponse = oEvent.getParameter("response");
			this._closeBusyFragment();

			if (sStatus == "201" || sStatus == "200") {
				this._sweetAlert(this.getText("FILE_UPLOAD_SUCCESS"), "S");
				this._oUploadAttachmentDialog.close();
			} else {
				this._sweetAlert(this.getText("FILE_UPLOAD_ERROR"), "E");
			}
			this.getModel().refresh(true);
		},
        onFileSizeExceed: function (oEvent) {
			Swal.fire({
				position: "bottom-center",
				icon: "warning",
				title: this.getText("FILE_SIZE_EXCEEDED", [oEvent.getSource().getMaximumFileSize()]),
				showConfirmButton: false,
				timer: 2500
			});
		},
        onExpendCancelButtonPress:function(){
            if (this._oExpendInfoDialog) {
                this._oExpendInfoDialog.close();
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
            debugger;
            // var oSource = oEvent.getSource(),
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var sPernr = this.getView().getModel("requestListModel").getProperty("/newNumberRequest/Pernr");
            // var eGuarantorInfoList = oSource.getBindingContext("requestListModel").getObject();
            this._getGuarantorList(sPernr);
            if (!this._oGuarantorDialog) {
                this._oGuarantorDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorDocumentDialog", this);
                this.getView().addDependent(this._oGuarantorDialog);
            } else {
                this._oGuarantorDialog.close();
            }
            this._oGuarantorDialog.open();
         },
         _getGuarantorList:function(sPernr){
            debugger;
            var that = this;
            var sServiceUrl = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/";
            var oModel = this.getModel(sServiceUrl);
            var aFilters = [];
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr", sPernr);
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("ObjectId", FilterOperator.EQ, sObject));
            aFilters.push(new Filter("ArcDocId", FilterOperator.EQ, sArcDoc));

            // aFilters.push(new Filter("Dotyp", FilterOperator.EQ, '1'));

            // var sPath = "/GeneralExpenditureInformation(Pernr='" + expendInfoList.Pernr + "',Payno='" + expendInfoList.Payno + "')";
            // var sPath = oModel.createKey("/GuarantorInformationSet", {
            //     "Pernr": eGuarantorInfoList.Pernr
            // });
            // var sPath = "/GuarantorAdditionalSet"
            // var aFilters = [];
            // aFilters.push(new Filter("Pernr", FilterOperator.EQ, eGuarantorInfoList.Pernr));
            // aFilters.push(new Filter("Sirno", FilterOperator.EQ, eGuarantorInfoList.Sirno));

            oModel.read("/GuarantorAdditionalSet", {
                filters: aFilters,
                success: (oData, oResponse) => {
                    debugger;
                    that.getModel("requestListModel").setProperty("/attachmentGuarantorList", oData.results);
                },
                error: (oError) => {
                    that.getModel("requestListModel").setProperty("/busy", false);
                }
            });
           
         },

         onAttachmentGuarantorUploadPress: function (oEvent) {
            debugger;
            var oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"); 
            var oFileUploader = sap.ui.getCore().byId("idGuarantorFileUploader");
        
            if (!oFileUploader.getValue()) {
                this._sweetAlert(this.getText("FILE_SELECTION_REQUIRED"), "W");
                return;
            }
        
            if (!sPernr) {
                this._sweetAlert(this.getText("NUMBER_REQUIRED"), "W");
                return;
            }
        
            var oModel = this.getModel();
            oFileUploader.destroyHeaderParameters();
            oModel.refreshSecurityToken();
            oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                name: "x-csrf-token",
                value: oModel.getSecurityToken()
            }));
        
            var sFileName = oFileUploader.getValue();
            sFileName = encodeURIComponent(sFileName);
            oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                name: "content-disposition",
                value: "inline; filename='" + sFileName + "'"
            }));
        
            var sPath = oModel.sServiceUrl + "/GuarantorAttachmentOperationSet(Pernr='" + sPernr + "',Sirno='" + "01" + "',Ptype='" + 'LMSABR' + "',Dotyp='" +
							'1' + "')/PersonnelAttachmentSet";
            oFileUploader.setUploadUrl(sPath);
        
            this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
            oFileUploader.upload();
            sap.m.MessageToast.show("Başarılı");
            this._closeBusyFragment("ATTACHMENT_UPLOADED");
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
        },
        calculationButtonPress: function() {
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oEntry = oViewModel.getProperty('/generalEmployee');
            
      
            var Opera = "1";
        
           
            oEntry.Opera = Opera;
        
            var that = this;
            if (Opera === "1") {
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
            }
        }
        
        
     
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