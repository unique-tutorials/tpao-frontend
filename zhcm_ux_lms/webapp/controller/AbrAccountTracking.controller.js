/*global location history */
/*global _*/
sap.ui.define(
  [
    "zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zhcm_ux_lms_abr/controller/SharedData",
  ],
  function (
    BaseController,
    JSONModel,
    History,
    formatter,
    Filter,
    FilterOperator,
    SharedData
  ) {
    "use strict";

    return BaseController.extend(
      "zhcm_ux_lms_abr.controller.AbrAccountTracking",
      {
        formatter: formatter,
        onInit: function (oEvent) {
          var oViewModel = new JSONModel();
          this.setModel(oViewModel, "abrAccountListModel");
          this._initiateModel();
          this.getRouter()
            .getRoute("AbrAccountTracking")
            .attachPatternMatched(this._onRequestListMatched, this);
        },
        
        _onRequestListMatched: function (oEvent) {
          this._getRequestList();
        },
        _initiateModel: function (oEvent) {
          var oViewModel = this.getModel("abrAccountListModel");
          oViewModel.setData({
            paymentPlanList: [
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Eylul 2021",
                Payam: "$8,000.00",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Aralik 2021",
                Payam: "$8,000.00",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Mart 2022",
                Payam: "$5,000.00",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Haziran 2022",
                Payam: "$5,038.08",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL SONU",
                Paydt: "",
                Payam: "$23,038.08",
                Payat: "",
                Perc$: "21.32%",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Eylul 2022",
                Payam: "$4,000.00",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Aralik 2022",
                Payam: "$4,000.00",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Mart 2023",
                Payam: "$4,000.00",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Haziran 2023",
                Payam: "$6,825.00",
                Payat: "23.418,54 TL",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL SONU",
                Paydt: "",
                Payam: "$18,825.00",
                Payat: "23.418,54 TL",
                Perc$: "17.42%",
              },

            ],
            paymentPlanRequested: [
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Haziran 2023",
                Payam: "$4,562.50",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Eylul 2023",
                Payam: "$4,562.50",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Aralik 2023",
                Payam: "$4,562.50",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL 2021-2022",
                Paydt: "30 Mart 2024",
                Payam: "$4,562.50",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "1. YIL SONU",
                Paydt: "",
                Payam: "$18,250.00",
                Payat: "",
                Perc$: "25.00%",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Haziran 2024",
                Payam: "$4,562.50",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Eylul 2024",
                Payam: "$4,562.50",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Aralik 2024",
                Payam: "$4,562.50",
                Payat: "",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL 2022-2023",
                Paydt: "30 Mart 2025",
                Payam: "$4,562.50",
                Payat: "23.418,54 TL",
                Perc$: "",
              },
              {
                Pytrm: "2. YIL SONU",
                Paydt: "",
                Payam: "$18,825.00",
                Payat: "23.418,54 TL",
                Perc$: "25.00%",
              },
            ],
            selectedRequest: {},
            currentRequest: {},
            searchAccountParameter: {},
            domesticEmployee: {},
            financialEmployee:{},
            abroadEmployee:{},
            abroadOtherEmployee: {},
            masterEmployee:{},
            accountEmployee: {},
            domesticAccountEmployee: {},
            newAccountNumberRequest: {
              Pernr: null,
              Ename: "",
            },
            selectedGuarantor:{},
            guarantorList:[],
            attachmentGuarantorList:[],
            offsetInformationList:[],
            selectedDate:""
          });
        },
        onNavBack: function () {
          var oModel = this.getView().getModel("abrAccountListModel");
          var aPaths = [
            "/newAccountNumberRequest",
            "/searchAccountParameter",
            "/domesticEmployee",
            "/accountEmployee",
            "/generalEmployee",
            "/schoolEmployee",
            "/abroadOtherEmployee",
            "/financialEmployee",
            "/abroadEmployee",
            "/masterEmployee",
            "/guarantorList",
            "/offsetInformationList"
          ];
          aPaths.forEach(function (sPath){
            oModel.setProperty(sPath, {});
          });
          // this.goBack(History);
          this.getRouter().navTo("appdispatcher", {}, true);
        },
        onDatePickerChange:function(){
            debugger;
            var oViewModel = this.getModel("abrAccountListModel"),
                 sSelectedDate = oViewModel.getProperty("/selectedDate");
            this._getOffsetInformationList(sSelectedDate);
        },
        _getOffsetInformationList:function(sSelectedDate){
            var oViewModel = this.getModel("abrAccountListModel"),
            sPernr = oViewModel.getProperty("/newAccountNumberRequest/Pernr");
            var oModel = this.getModel();
            var aFilters = [];
            var that = this;
            var oViewModel = this.getModel("abrAccountListModel");
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Wagpe", FilterOperator.EQ, sSelectedDate));
            this._openBusyFragment("READ_DATA");
            oModel.read("/OffsetInformationSet", {
                filters: aFilters,
                success: (oData, oResponse) => {
                    that._closeBusyFragment();
                    oViewModel.setProperty("/offsetInformationList", oData.results);
                },
                error: (oError) => {
                    that._closeBusyFragment();
                    oViewModel.setProperty("/busy", false);
                }
            });
        },
        _getRequestList: function (oEvent) {},
        openGuarantorIdentityDialog:function(oEvent){
            var oViewModel = this.getModel("abrAccountListModel"),
                 sPernr = oViewModel.getProperty("/newAccountNumberRequest/Pernr"),
                 oSource = oEvent.getSource(),
                 oObject = oSource.getBindingContext("abrAccountListModel").getObject();
                 oViewModel.setProperty("/selectedGuarantor", oObject);
            // this._getGuarantorIdentityList(sPernr,oObject.Sirno);
            if (!this._oGuarantorIdentityDialog) {
                this._oGuarantorIdentityDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrAccountTracking.GuarantorIdentityDialog", this);
                this.getView().addDependent(this._oGuarantorIdentityDialog);
            } else {
                this._oGuarantorIdentityDialog.close();
            }
            this._oGuarantorIdentityDialog.open();
          
         },
         _getGuarantorIdentityList:function(sPernr,sSirno){
            debugger;
            var that = this;
            var oModel = this.getModel();
            var aFilters = [];
            var oViewModel = this.getModel("abrAccountListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr", sPernr);
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Sirno", FilterOperator.EQ, sSirno));
            this._openBusyFragment("READ_DATA");
            oModel.read("/GuarantorInformationSet", {
                filters: aFilters,
                success: (oData, oResponse) => {
                    that._closeBusyFragment();
                    that.getModel("abrAccountListModel").setProperty("/guarantorIdentityList", oData.results);
                    if (!that._oGuarantorIdentityDialog) {
                        that._oGuarantorIdentityDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrAccountTracking.GuarantorIdentityDialog", that);
                        that.getView().addDependent(that._oGuarantorIdentityDialog);
                    } else {
                        that._oGuarantorIdentityDialog.close();
                    }
                    that._oGuarantorIdentityDialog.open();
                },
                error: (oError) => {
                    that._closeBusyFragment();
                    that.getModel("abrAccountListModel").setProperty("/busy", false);
                }
            });
         },
         onCancelGuarantorIdentity:function(){
            if (this._oGuarantorIdentityDialog) {
                this._oGuarantorIdentityDialog.close();
            }
         },
         openGuarantorContactDialog:function(oEvent){
          debugger;
          var oSource = oEvent.getSource(),
          oViewModel = this.getModel("abrAccountListModel"),
          oObject = oSource.getBindingContext("abrAccountListModel").getObject();
          this._getGuarantorContactList(oObject);
       },
      
       _getGuarantorContactList:function(oObject){
          debugger;
          var that = this;
          var oModel = this.getModel();
          var oViewModel = this.getModel("abrAccountListModel");
          var aFilters = [];
          var sPath = oModel.createKey("/GuarantorInformationSet", {
              "Pernr": oObject.Pernr,
              "Sirno": oObject.Sirno,
          });
          // aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
          // aFilters.push(new Filter("Sirno", FilterOperator.EQ, sSirno));
          this._openBusyFragment("READ_DATA");
          oModel.read(sPath, {
              // filters: aFilters,
              success: (oData, oResponse) => {
                  that._closeBusyFragment();
                  // oViewModel.setProperty("/guarantorContactList", oData);
                  that.getModel("abrAccountListModel").setProperty("/guarantorContactList", oData);
                  // that.getModel("requestListModel").setProperty("/guarantorContactList", oData);
                  if (!that._oGuarantorAbrContactDialog) {
                      that._oGuarantorAbrContactDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrAccountTracking.GuarantorContactDialog", that);
                      that.getView().addDependent(that._oGuarantorAbrContactDialog);
                  } else {
                      that._oGuarantorAbrContactDialog.close();
                  }
                  that._oGuarantorAbrContactDialog.open();
              },
              error: (oError) => {
                  that._closeBusyFragment();
                  that.getModel("abrAccountListModel").setProperty("/busy", false);
              }
          });
       },
        // openGuarantorContactDialog:function(oEvent){
        //     var oSource = oEvent.getSource(),
        //      oViewModel = this.getModel("abrAccountListModel"),
        //      sPernr = oViewModel.getProperty("/newAccountNumberRequest/Pernr"),
        //      oObject = oSource.getBindingContext("abrAccountListModel").getObject();
        //     this._getGuarantorContactList(sPernr,oObject.Sirno);
        //  },
        //  _getGuarantorContactList:function(sPernr,sSirno){
        //     var that = this;
        //     var oModel = this.getModel();
        //     var aFilters = [];
        //     aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
        //     aFilters.push(new Filter("Sirno", FilterOperator.EQ, sSirno));
        //     this._openBusyFragment("READ_DATA");
        //     oModel.read("/GuarantorInformationSet", {
        //         filters: aFilters,
        //         success: (oData, oResponse) => {
        //             that._closeBusyFragment();
        //             that.getModel("abrAccountListModel").setProperty("/guarantorContactList", oData.results);
        //             if (!that._oGuarantorContactDialog) {
        //                 that._oGuarantorContactDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrAccountTracking.GuarantorContactDialog", that);
        //                 that.getView().addDependent(that._oGuarantorContactDialog);
        //             } else {
        //                 that._oGuarantorContactDialog.close();
        //             }
        //             that._oGuarantorContactDialog.open();
        //         },
        //         error: (oError) => {
        //             that._closeBusyFragment();
        //             that.getModel("abrAccountListModel").setProperty("/busy", false);
        //         }
        //     });
        //  },
         onCancelGuarantorContact:function(){
            if (this._oGuarantorContactDialog) {
                this._oGuarantorContactDialog.close();
            }
         },
        openGuarantorDialog:function(oEvent){
            var oSource = oEvent.getSource(),
            oObject = oSource.getBindingContext("abrAccountListModel").getObject(),
             oViewModel = this.getModel("abrAccountListModel"),
             sPernr = oViewModel.getProperty("/newAccountNumberRequest/Pernr");
            this._getGuarantorList(sPernr,oObject.Sirno);
         },
         onCancelGuarantorDialog:function(){
            if(this._oGuarantorDialog) {
                this._oGuarantorDialog.close();
            }
         },
         _getGuarantorList: function (sPernr,sSirno) {
            var that = this;
            var oModel = this.getModel();
            var aFilters = [];
            var oModel = this.getModel();
            var oViewModel = this.getModel("abrAccountListModel");
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Ptype", FilterOperator.EQ, 'LMSABR'));
            aFilters.push(new Filter("Dotyp", FilterOperator.EQ, '1'));
            aFilters.push(new Filter("Sirno", FilterOperator.EQ, sSirno));
            this._openBusyFragment("READ_DATA");
            oModel.read("/PersonnelAttachmentSet", {
                filters: aFilters,
                success: (oData, oResponse) => {
                    that._closeBusyFragment();
                    oViewModel.setProperty("/attachmentGuarantorList", oData.results);
                    if (!that._oGuarantorDialog) {
                        that._oGuarantorDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrAccountTracking.GuarantorDocumentDialog", that);
                        this.getView().addDependent(that._oGuarantorDialog);
                    } else {
                        that._oGuarantorDialog.close();
                    }
                    that._oGuarantorDialog.open();
                },
                error: (oError) => {
                    that._closeBusyFragment();
                    that.getModel("requestListModel").setProperty("/busy", false);
                }
            });
        },
        onShowAccountSearchHelp: function (oEvent) {
          if (!this._oAccountSearchHelp) {
            this._oAccountSearchHelp = new sap.ui.xmlfragment(
              "zhcm_ux_lms_abr.fragment.AbrAccountTracking.ShowAccountSearchHelp",
              this
            );
            this.getView().addDependent(this._oAccountSearchHelp);
          }
          this._oAccountSearchHelp.open();
        },
        onCancelAccountSearchDialog: function (oEvent) {
          if (this._oAccountSearchHelp) {
            this._oAccountSearchHelp.close();
          }
        },
        onSearch: function (oEvent) {
          var oViewModel = this.getModel("abrAccountListModel");
          var oFilter = oViewModel.getProperty("/searchAccountParameter");
          var aFilters = this._getFilters(oFilter);
          var oTable =
            this.getView().byId("studentTableAccount") ||
            sap.ui.getCore().byId("studentTableAccount");
          oTable.getBinding("items").filter(aFilters, "Application");
        },
        _getFilters: function (oFilter) {
          var aFilters = [];
          var aKeys = Object.keys(oFilter);
          for (var i = 0; i < aKeys.length; i++) {
            var sVal = oFilter[aKeys[i]].toString();
            if (sVal) {
              var oFilterElement = new Filter(
                aKeys[i],
                FilterOperator.EQ,
                sVal
              );
              aFilters.push(oFilterElement);
            }
          }
          return aFilters;
        },
        onItemSelected: function (oEvent) {
          var oSelectedItem = oEvent
            .getSource()
            .getBindingContext()
            .getObject();
          var oViewModel = this.getModel("abrAccountListModel");
          oViewModel.setProperty(
            "/newAccountNumberRequest/Pernr",
            oSelectedItem.Pernr
          );
          oViewModel.setProperty(
            "/newAccountNumberRequest/Ename",
            oSelectedItem.Vorna + " " + oSelectedItem.Nachn
          );
          if (this._oAccountSearchHelp) {
            this._oAccountSearchHelp.close();
          }
        },

        onAccountSearchButtonPress: function (oEvent) {
          debugger;
          var that = this;
          var oModel = this.getModel();
          var sPernr = this.getView()
            .getModel("abrAccountListModel")
            .getProperty("/newAccountNumberRequest/Pernr");

          var aFilters = [];
          aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
          if (!sPernr) {
            this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "E");
            return;
          }
          function readData(sPath, sModelProperty, errorMessage) {
            that._openBusyFragment("READ_DATA");
            oModel.read(sPath, {
              filters: aFilters,
              success: function (oData, oResponse) {
                var oViewModel = that.getModel("abrAccountListModel");
                oViewModel.setProperty(sModelProperty, oData);
                console.log(oData);
                that._closeBusyFragment();
              },
              error: function () {
                sap.m.MessageToast.show(errorMessage);
                that._closeBusyFragment();
              },
            });
          }

          function readDataList(sPath, sModelProperty, errorMessage) {
            that._openBusyFragment("READ_DATA");
            oModel.read(sPath, {
              filters: aFilters,
              success: function (oData) {
                var oViewModel = that.getModel("abrAccountListModel");
                oViewModel.setProperty(sModelProperty, oData.results);
                console.log(oData);
                that._closeBusyFragment();
              },
              error: function () {
                sap.m.MessageToast.show(errorMessage);
                that._closeBusyFragment();
              },
            });
          }

          this._sweetToast(this.getText("EMPLOYEE_READ_SUCCESS"), "S");


          // Kefil bilgileri al
          var sGuarantorPath = "/GuarantorInformationSet";
          
          readDataList(
            sGuarantorPath,
            "/guarantorList",
            "Kefil bilgisi alınamadı"
          );

        //   // Mahsup Bilgileri
        //   var sOffsetPath = "/OffsetInformationSet";
        //   readDataList(
        //     sOffsetPath,
        //     "/offsetInformationList",
        //     "Mahsup bilgisi alınamadı"
        //   );

          // Okul bilgilerini al
          var sSchoolInfoPath = oModel.createKey("/SchoolInformationSet", {
            Pernr: sPernr,
          });
          readData(
            sSchoolInfoPath,
            "/schoolEmployee",
            "Okul bilgileri alınamadı."
          );

          // Öğrenci bilgileri al
          var sScholarshipPath = oModel.createKey(
            "/ScholarShipstudentAbroadSet",
            { Pernr: sPernr }
          );
          readData(
            sScholarshipPath,
            "/accountEmployee",
            "Öğrenci bilgisi alınamadı."
          );

          // Genel bilgileri al
          var sGeneralInfoPath = oModel.createKey("/GeneralInformationSet", {
            Pernr: sPernr,
          });
          readData(
            sGeneralInfoPath,
            "/generalEmployee",
            "Genel bilgiler alınamadı."
          );

          // Mali / Yurtiçi Dil bilgileri al
          var sLanguageSchoolInfoPath = oModel.createKey(
            "/DomesticLanguageSchoolInformationSet",
            { Pernr: sPernr, Partner: "PARTNER01" }
          );
          readData(
            sLanguageSchoolInfoPath,
            "/financialEmployee",
            "Dil okul bilgileri alınamadı."
          );

          //  Mali / YurtDışı Dil bilgileri al
          var sAbroadInfoPath = oModel.createKey("/LanguageSchoolAbroadSet", {
            Pernr: sPernr,
            Partner: "PARTNER01",
          });
          readData(
            sAbroadInfoPath,
            "/abroadEmployee",
            "Yurt dışı dil bilgileri alınamadı."
          );

          // Master Okul bilgileri al
          var sMasterInfoPath = oModel.createKey(
            "/MasterSchoolInformationSet",
            { Pernr: sPernr, Partner: "PARTNER01" }
          );
          readData(
            sMasterInfoPath,
            "/masterEmployee",
            "Master okul bilgileri alınamadı."
          );

          // Öğrenci Yurt içi Hesap bilgileri al
          var sDomesticEmployeeInfoPath = oModel.createKey(
            "/StudentDomesticAccountInformationSet",
            { Pernr: sPernr, Partner: "PARTNER01" }
          );
          readData(
            sDomesticEmployeeInfoPath,
            "/domesticEmployee",
            "Öğrenci Yurt içi bilgileri alınamadı."
          );

          // Öğrenci Yurt dışı Hesap bilgileri al
          var sAbroadOtherEmployeeInfoPath = oModel.createKey(
            "/AbroadOtherAccountInformationSet",
            { Pernr: sPernr, Partner: "PARTNER01" }
          );
          readData(
            sAbroadOtherEmployeeInfoPath,
            "/abroadOtherEmployee",
            "Öğrenci Yurt dışı bilgileri alınamadı."
          );
        },

        _GenericPartner: function (sPartner, sPath, sTpye) {
          var oModel = this.getModel(),
            oViewModel = this.getModel("abrAccountListModel");
          if (!sPartner) {
            sap.m.MessageToast.show("Lütfen bir Partner No giriniz.");
            return;
          }
          oModel.read(sPath, {
            success: function (oData) {
              // Veriyi modele yazın
              switch (sTpye) {
                case "DOMESTIC":
                  oViewModel.setProperty("/domesticEmployee", oData);
                  break;
                 case "ABROAD":
                    oViewModel.setProperty("/abroadOtherEmployee", oData);
                    break;
                    case "ABROADEMPLOYEE":
                  oViewModel.setProperty("/abroadEmployee", oData);
                  break;
                 case "FINANCE":
                    oViewModel.setProperty("/financialEmployee", oData);
                    break;
                    case "MASTER":
                    oViewModel.setProperty("/masterEmployee", oData);
                    break;
                default:
                  break;
              }
              this._sweetToast(this.getText("READ_SECCSESS"), "S");
            }.bind(this),
            error: function () {
                this._sweetToast(this.getText("ERROR"), "E");
            }.bind(this),
          });
        },
        onPartnerButtonPress: function (oEvent) {
          var sType = oEvent.getSource().data("type"),
            oModel = this.getModel(),
            oViewModel = this.getView().getModel("abrAccountListModel"),
            sPartner = "",
            sPernr = oViewModel.getProperty("/newAccountNumberRequest/Pernr"),
            sPath = "";
          if (!sPernr) {
            this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "E");
            return;
          }
          switch (sType) {
            case "DOMESTIC":
              sPartner = oViewModel.getProperty("/domesticEmployee/Partner");
              if (!sPartner) {
                this._sweetToast(this.getText("WHITE_PARTNER"), "E");
                return;
              }
              sPath = oModel.createKey(
                "/StudentDomesticAccountInformationSet",
                { Pernr: sPernr, Partner: sPartner }
              );
              break;
            case "ABROAD":
              sPartner = oViewModel.getProperty("/abroadOtherEmployee/Partner");
              if (!sPartner) {
                this._sweetToast(this.getText("WHITE_PARTNER"), "E");
                return;
              }
              sPath = oModel.createKey(
                "/AbroadOtherAccountInformationSet",
                { Pernr: sPernr, Partner: sPartner }
              );
              break;
             case"ABROADEMPLOYEE":
             sPartner = oViewModel.getProperty("/abroadEmployee/Partner");
             if (!sPartner) {
               this._sweetToast(this.getText("WHITE_PARTNER"), "E");
               return;
             }
             sPath = oModel.createKey(
               "/LanguageSchoolAbroadSet",
               { Pernr: sPernr, Partner: sPartner }
             );
             break;
             case "FINANCE":
                sPartner = oViewModel.getProperty("/financialEmployee/Partner");
                if (!sPartner) {
                  this._sweetToast(this.getText("WHITE_PARTNER"), "E");
                  return;
                }
                sPath = oModel.createKey(
                  "/StudentDomesticAccountInformationSet",
                  { Pernr: sPernr, Partner: sPartner }
                );
                break;   
                case "MASTER":
                    sPartner = oViewModel.getProperty("/masterEmployee/Partner");
                    if (!sPartner) {
                      this._sweetToast(this.getText("WHITE_PARTNER"), "E");
                      return;
                    }
                    sPath = oModel.createKey(
                      "/MasterSchoolInformationSet",
                      { Pernr: sPernr, Partner: sPartner }
                    );
                    break; 
            default:
              break;
          }
          this._GenericPartner(sPartner, sPath, sType);
        },
      }
    );
  }
);
