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
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "zhcm_ux_lms_abr/controller/SharedData",
  ],
  function (
    BaseController,
    JSONModel,
    History,
    formatter,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    SharedData
  ) {
    "use strict";

    return BaseController.extend("zhcm_ux_lms_abr.controller.AbrTracking", {
      formatter: formatter,
      onInit: function (oEvent) {
        var oViewModel = new JSONModel();
        this.setModel(oViewModel, "requestListModel");
        this._initiateModel();
        this.getRouter()
          .getRoute("AbrTracking")
          .attachPatternMatched(this._onRequestListMatched, this);
      },

      _initiateModel: function (oEvent) {
        var oViewModel = this.getModel("requestListModel");
        oViewModel.setData({
          requestList: [],
          schoolFeeList: {},
          expendInfoList: {},
          selectedRequest: {},
          currentRequest: {},
          searchParameter: {},
          selectedEmployee: {},
          generalEmployee: {},
          schoolEmployee: {},
          financialEmployee: {},
          abroadEmployee: {},
          domesticAccount: {},
          otherAccount: {},
          domesticEmployee: {},
          abroadOtherEmployee: {},
          identityEmployee: {},
          masterEmployee: {},
          contactEmployee: {},
          expendInfoDialogRequest: {},
          schoolInfoDialogRequest: {},
          addGuarantorRequest: {},
          guarantorList: {},
          attachmentGuarantorList: [],
          guarantorListRequest: {},
          guarantorContactList: {},
          guarantorIdentityList: {},
          documentList: {},
          suggestionActionData: {
            deleteEnabled: false,
            displayEnabled: false,
            priorityEditable: false,
            priorityDisplay: true,
          },
          newNumberRequest: {
            Pernr: null,
            Ename: "",
          },
          aplicationSetting: {
            enabled: true,
          },
          request: {
            isSent: true,
          },
          approvalExpendList: {},
          attachmentList: [],
          isAccountVisible: false,
          isSellerVisible: false,
          paidVisible: true,
          isGuarantorActive: false,
        });
      },
      onNavBack: function () {
        var oModel = this.getView().getModel("requestListModel");
        var aPaths = [
          "/newNumberRequest",
          "/selectedEmployee",
          "/generalEmployee",
          "/schoolEmployee",
          "/financialEmployee",
          "/abroadEmployee",
          "/masterEmployee",
          "/domesticAccount",
          "/otherAccount",
          "/schoolFeeList",
          "/expendInfoList",
          "/domesticEmployee",
          "/abroadOtherEmployee",
          "/guarantorList",
          "/contactEmployee",
          "/identityEmployee",
        ];
        aPaths.forEach(function (sPath) {
          oModel.setProperty(sPath, {});
        });

        this.getRouter().navTo("appdispatcher", {}, true);
      },
      onItemSelected: function (oEvent) {
        var oSelectedItem = oEvent.getSource().getBindingContext().getObject();

        var oViewModel = this.getModel("requestListModel");
        oViewModel.setProperty("/newNumberRequest/Pernr", oSelectedItem.Pernr);
        oViewModel.setProperty(
          "/newNumberRequest/Ename",
          oSelectedItem.Vorna + " " + oSelectedItem.Nachn
        );
        this._getAttachmentList(oSelectedItem.Pernr);
        if (this._oSearchHelpDialog) {
          this._oSearchHelpDialog.close();
        }
      },
      onShowAtt: function () {
        debugger;
        var oViewModel = this.getModel("requestListModel"),
          sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        if (!sPernr) {
          this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "E");
          return;
        }
        if (!this._oAttachmentDialog) {
          this._oAttachmentDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.AttachmentList",
            this
          );
          this.getView().addDependent(this._oAttachmentDialog);
        } else {
          this._oAttachmentDialog.close();
        }
        this._oAttachmentDialog.open();
      },
      onPaymentTypeChange: function (oEvent) {
        debugger;
        var oComboBox = oEvent.getSource();
        var sSelectedKey = oComboBox.getSelectedKey();
        var oModel = this.getView().getModel("requestListModel");
        var sQuery = oComboBox.getSelectedItem().getProperty("additionalText");

        if (sQuery === "2") {
          oModel.setProperty("/isAccountVisible", false);
          oModel.setProperty("/isSellerVisible", true);
          oModel.setProperty("/expendInfoDialogRequest/Whiac", "2");
          oModel.setProperty("/expendInfoDialogRequest/Wacst", "");
        }

        if (sQuery === "1") {
          oModel.setProperty("/isSellerVisible", false);
          oModel.setProperty("/isAccountVisible", true);
          oModel.setProperty("/expendInfoDialogRequest/Whiac", "1");
        }
      },

      onCloseDialog: function () {
        if (this._oAttachmentDialog) this._oAttachmentDialog.close();
      },
      _getAttachmentList: function (sPernr) {
        var that = this;
        var oModel = this.getModel();
        var aFilters = [];
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
        aFilters.push(new Filter("Ptype", FilterOperator.EQ, "LMSABR"));
        aFilters.push(new Filter("Dotyp", FilterOperator.EQ, "4"));
        // aFilters.push(new Filter("Sirno", FilterOperator.EQ, sSirno));
        this._openBusyFragment("READ_DATA");
        oModel.read("/PersonnelAttachmentSet", {
          filters: aFilters,
          success: (oData, oResponse) => {
            that._closeBusyFragment();
            oViewModel.setProperty("/attachmentList", oData.results);
          },
          error: (oError) => {
            that._closeBusyFragment();
            that.getModel("requestListModel").setProperty("/busy", false);
          },
        });
      },
      onAttachmentAdd: function () {
        if (!this._oUploadAttachmentDialog) {
          this._oUploadAttachmentDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.UploadAttachments",
            this
          );
          this.getView().addDependent(this._oUploadAttachmentDialog);
        } else {
          this._oUploadAttachmentDialog.close();
        }
        this._oUploadAttachmentDialog.open();
      },
      onCloseUploadDialog: function () {
        this._oUploadAttachmentDialog.close();
      },
      onAttachmentUploadPress: function () {
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var oFileUploader = sap.ui.getCore().byId("idAttachmentFileUploader");

        if (!oFileUploader.getValue()) {
          this._sweetToast(this.getText("FILE_SELECTION_REQUIRED"), "W");
          return;
        }

        var oModel = this.getModel();
        oFileUploader.destroyHeaderParameters();
        oModel.refreshSecurityToken();
        oFileUploader.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "x-csrf-token",
            value: oModel.getSecurityToken(),
          })
        );

        var sFileName = oFileUploader.getValue();
        sFileName = encodeURIComponent(sFileName);
        oFileUploader.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "content-disposition",
            value: "inline; filename='" + sFileName + "'",
          })
        );

        var sPath =
          oModel.sServiceUrl +
          "/PersonnelAttachmentOperationSet(Pernr='" +
          sPernr +
          "',Dotyp='" +
          "4" +
          "',Ptype='" +
          "LMSABR" +
          "')/PersonnelAttachmentSet";
        oFileUploader.setUploadUrl(sPath);

        this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
        oFileUploader.upload();
      },
      onSearch: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("requestListModel");
        var oFilter = oViewModel.getProperty("/searchParameter");
        var aFilters = this._getFilters(oFilter);

        var oTable =
          this.getView().byId("studentTable") ||
          sap.ui.getCore().byId("studentTable");
        oTable.getBinding("items").filter(aFilters, "Application");
      },
      // onPartnerButtonPress: function () {
      //   debugger;
      //   var that = this;
      //   var oModel = this.getModel();
      //   var oViewModel = this.getView().getModel("requestListModel");
      //   var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
      //   var sDomesticLanguageInfoPath = oModel.createKey(
      //     "/DomesticLanguageSchoolInformationSet",
      //     { Pernr: sPernr }
      //   );

      //   oModel.read(sDomesticLanguageInfoPath, {
      //     success: function (oData) {
      //       // Veriyi modele yazın
      //       oViewModel.setProperty("/financialEmployee", oData);
      //       sap.m.MessageToast.show("Veri başarıyla alındı.");
      //     },
      //     error: function () {
      //       sap.m.MessageToast.show("Genel harcama bilgileri alınamadı.");
      //     },
      //   });
      // },
      onFinancialSavePress: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oFinEntry = oViewModel.getProperty("/financialEmployee");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oFinEntry.Pernr = sPernr;

        if (
          this.byId("TabBarFinancial").getSelectedKey() === "LanguageSchool"
        ) {
          if (!oFinEntry.Descp2 || oFinEntry.Descp2.trim() === "") {
            if (!this._oDescFinEntryDialog) {
              this._oDescFinEntryDialog = new sap.m.Dialog({
                title: "Dil Okul Bilgisi İçin Açıklama Girin",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("finEntryTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oFinEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescFinEntryDialog.close();
                    oModel.create(
                      "/DomesticLanguageSchoolInformationSet",
                      oFinEntry,
                      {
                        success: function (oData, oResponse) {
                          debugger;
                          that._sweetToast(
                            that.getText("SAVED_SUCCESSFULLY"),
                            "S"
                          );
                        },
                        error: function () {
                          debugger;
                        },
                      }
                    );
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescFinEntryDialog.close();
                  },
                }),
              });
            }

            this._oDescFinEntryDialog.open();
          }
        }
      },
      onForeignSavePress: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oForeignEntry = oViewModel.getProperty("/abroadEmployee");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oForeignEntry.Pernr = sPernr;
        // Genel bilgiler sekmesi seçiliyse
        // Yurtiçi dil okul bilgiler sekmesi seçiliyse
        if (
          this.byId("TabBarFinancial").getSelectedKey() === "LanguageSchool"
        ) {
          if (!oForeignEntry.Descp2 || oForeignEntry.Descp2.trim() === "") {
            if (!this._oDescForeignEntryDialog) {
              this._oDescForeignEntryDialog = new sap.m.Dialog({
                title: "Yurt Dışı Dil Okulu İçin Açıklama Girin",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("descForeignEntryTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oForeignEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescForeignEntryDialog.close();
                    oModel.create("/LanguageSchoolAbroadSet", oForeignEntry, {
                      success: function (oData, oResponse) {
                        debugger;
                        that._sweetToast(
                          that.getText("SAVED_SUCCESSFULLY"),
                          "S"
                        );
                      },
                      error: function () {
                        debugger;
                      },
                    });
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescForeignEntryDialog.close();
                  },
                }),
              });
            }

            this._oDescForeignEntryDialog.open();
          }
        }
      },
      onMasterSavePress: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oMasterEntry = oViewModel.getProperty("/masterEmployee");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oMasterEntry.Pernr = sPernr;
        if (this.byId("TabBarFinancial").getSelectedKey() === "MasterSchool") {
          if (!oMasterEntry.Descp2 || oMasterEntry.Descp2.trim() === "") {
            if (!this._oDescMasterDialog) {
              this._oDescMasterDialog = new sap.m.Dialog({
                title: "Master Okulu İçin Açıklama Girin",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("descMasterTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oMasterEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescMasterDialog.close();
                    oModel.create("/MasterSchoolInformationSet", oMasterEntry, {
                      success: function (oData, oResponse) {
                        debugger;
                        that._sweetToast(
                          that.getText("SAVED_SUCCESSFULLY"),
                          "S"
                        );
                      },
                      error: function () {
                        debugger;
                      },
                    });
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescMasterDialog.close();
                  },
                }),
              });
            }

            this._oDescMasterDialog.open();
          }
        }
      },
      onDomesticSavePress: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oDomesticEntry = oViewModel.getProperty("/domesticAccount");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oDomesticEntry.Pernr = sPernr;
        if (
          this.byId("TabBarFinancial").getSelectedKey() === "ForeignCurrency"
        ) {
          if (!oDomesticEntry.Descp2 || oDomesticEntry.Descp2.trim() === "") {
            if (!this._oDescDomesticDialog) {
              this._oDescDomesticDialog = new sap.m.Dialog({
                title: "Öğrenci Yurt içi Döviz Hesabı İçin Açıklama Girin",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("descDomesticTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oDomesticEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescDomesticDialog.close();
                    oModel.create(
                      "/ForeignCurrencyAccountSet",
                      oDomesticEntry,
                      {
                        success: function (oData, oResponse) {
                          debugger;
                          that._sweetToast(
                            that.getText("SAVED_SUCCESSFULLY"),
                            "S"
                          );
                        },
                        error: function () {
                          debugger;
                        },
                      }
                    );
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescDomesticDialog.close();
                  },
                }),
              });
            }

            this._oDescDomesticDialog.open();
          }
        }
      },
      onOtherSavePress: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oOtherEntry = oViewModel.getProperty("/otherAccount");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oOtherEntry.Pernr = sPernr;
        if (
          this.byId("TabBarFinancial").getSelectedKey() === "ForeignCurrency"
        ) {
          if (!oOtherEntry.Descp2 || oOtherEntry.Descp2.trim() === "") {
            if (!this._oDescOtherDialog) {
              this._oDescOtherDialog = new sap.m.Dialog({
                title: "Diğer Hesap Bilgileri İçin Açıklama Girin",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("descOtherTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oOtherEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescOtherDialog.close();
                    oModel.create("/OtherAccountInformationSet", oOtherEntry, {
                      success: function (oData, oResponse) {
                        debugger;
                        that._sweetToast(
                          that.getText("SAVED_SUCCESSFULLY"),
                          "S"
                        );
                      },
                      error: function () {
                        debugger;
                      },
                    });
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescOtherDialog.close();
                  },
                }),
              });
            }

            this._oDescOtherDialog.open();
          }
        }
      },
      onStnAccountSavePress: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oDomesticEntry = oViewModel.getProperty("/domesticEmployee");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oDomesticEntry.Pernr = sPernr;
        if (
          this.byId("TabBarFinancial").getSelectedKey() === "StudentAccountInfo"
        ) {
          if (!oDomesticEntry.Descp2 || oDomesticEntry.Descp2.trim() === "") {
            if (!this._oDescAccountDialog) {
              this._oDescAccountDialog = new sap.m.Dialog({
                title: "Öğrenci Yurt içi Hesap İçin Açıklama Girin",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("descAccountTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oDomesticEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescAccountDialog.close();
                    oModel.create(
                      "/StudentDomesticAccountInformationSet",
                      oDomesticEntry,
                      {
                        success: function (oData, oResponse) {
                          debugger;
                          that._sweetToast(
                            that.getText("SAVED_SUCCESSFULLY"),
                            "S"
                          );
                        },
                        error: function () {
                          debugger;
                        },
                      }
                    );
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescAccountDialog.close();
                  },
                }),
              });
            }

            this._oDescAccountDialog.open();
          }
        }
      },
      onAbroadOtherSavePress: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oAbroadOtherEntry = oViewModel.getProperty("/abroadOtherEmployee");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oAbroadOtherEntry.Pernr = sPernr;
        if (
          this.byId("TabBarFinancial").getSelectedKey() === "StudentAccountInfo"
        ) {
          if (
            !oAbroadOtherEntry.Descp2 ||
            oAbroadOtherEntry.Descp2.trim() === ""
          ) {
            if (!this._oDescAbroadOtherDialog) {
              this._oDescAbroadOtherDialog = new sap.m.Dialog({
                title: "Öğrenci Yurt Dışı Hesap İçin Açıklama Girin",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("descAbroadTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oAbroadOtherEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescAbroadOtherDialog.close();
                    oModel.create(
                      "/AbroadOtherAccountInformationSet",
                      oAbroadOtherEntry,
                      {
                        success: function (oData, oResponse) {
                          debugger;
                          that._sweetToast(
                            that.getText("SAVED_SUCCESSFULLY"),
                            "S"
                          );
                        },
                        error: function () {
                          debugger;
                        },
                      }
                    );
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescAbroadOtherDialog.close();
                  },
                }),
              });
            }

            this._oDescAbroadOtherDialog.open();
          }
        }
      },
      onAttachmentPaymentUploadPress: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var oFileUploader = sap.ui
          .getCore()
          .byId("idAttachmentFileUploaderPayment");

        if (!oFileUploader.getValue()) {
          this._sweetToast(this.getText("FILE_SELECTION_REQUIRED"), "W");
          return;
        }

        if (!sPernr) {
          this._sweetToast(this.getText("NUMBER_REQUIRED"), "W");
          return;
        }

        var oModel = this.getModel();
        oFileUploader.destroyHeaderParameters();
        oModel.refreshSecurityToken();
        oFileUploader.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "x-csrf-token",
            value: oModel.getSecurityToken(),
          })
        );

        var sFileName = oFileUploader.getValue();
        sFileName = encodeURIComponent(sFileName);
        oFileUploader.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "content-disposition",
            value: "inline; filename='" + sFileName + "'",
          })
        );

        var oCurrentDocParams = oViewModel.getProperty(
          "/expendInfoDialogRequest"
        );
        var sPath =
          "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/GeneralExpenditureAttachmentSet(Pernr='" +
          sPernr +
          "',Payno='" +
          oCurrentDocParams.Payno +
          "',Ptype='LMSABR',Dotyp='3')/PersonnelAttachmentSet";
        oFileUploader.setUploadUrl(sPath);

        this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
        oFileUploader.upload();
        sap.m.MessageToast.show("Başarılı");
        this._closeBusyFragment("ATTACHMENT_UPLOADED");
      },
      onSearchStudentPress: function () {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var sPernr = this.getView()
          .getModel("requestListModel")
          .getProperty("/newNumberRequest/Pernr");

        var aFilters = [];
        aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
        // var sPayno = this.getView().getModel("requestListModel").getProperty("/expendInfoList/Payno");

        if (!sPernr) {
          this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "W");
          return;
        }
        function readData(sPath, sModelProperty, errorMessage) {
          oModel.read(sPath, {
            filters: aFilters,
            success: function (oData) {
              debugger;
              var oViewModel = that.getModel("requestListModel");
              oViewModel.setProperty(sModelProperty, oData);
              if (
                sModelProperty === "/generalEmployee" &&
                oData.Prope === "2"
              ) {
                oViewModel.setProperty("/paidVisible", false);
              } else if (
                sModelProperty === "/generalEmployee" &&
                oData.Prope === "1"
              ) {
                oViewModel.setProperty("/paidVisible", true);
              }
            },
            error: function () {
              sap.m.MessageToast.show(errorMessage);
            },
          });
        }
        function readDataList(sPath, sModelProperty, errorMessage) {
          that._openBusyFragment("READ_DATA");
          oModel.read(sPath, {
            filters: aFilters,
            success: function (oData) {
              var oViewModel = that.getModel("requestListModel");
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
        // Kefil bilgileri al
        var sGuarantorPath = "/GuarantorInformationSet";
        readDataList(
          sGuarantorPath,
          "/guarantorList",
          "Kefil bilgisi alınamadı"
        );
        // Okul ücret bilgileri al
        var sSchoolWagePath = "/SchoolWageInformationSet";
        readDataList(
          sSchoolWagePath,
          "/schoolFeeList",
          "Okul ücret bilgileri alınamadı"
        );
        // Genel harcama bilgileri al
        var sGeneralExpenditurePath = "/GeneralExpenditureInformationSet";
        readDataList(
          sGeneralExpenditurePath,
          "/expendInfoList",
          "Genel harcama bilgileri alınamadı"
        );
        // Öğrenci bilgileri al
        var sScholarshipPath = oModel.createKey(
          "/ScholarShipstudentAbroadSet",
          { Pernr: sPernr }
        );
        readData(
          sScholarshipPath,
          "/selectedEmployee",
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

        // Okul bilgilerini al
        var sSchoolInfoPath = oModel.createKey("/SchoolInformationSet", {
          Pernr: sPernr,
        });
        readData(
          sSchoolInfoPath,
          "/schoolEmployee",
          "Okul bilgileri alınamadı."
        );

        // Mali / Yurtiçi Dil bilgileri al
        var sLanguageSchoolInfoPath = oModel.createKey(
          "/DomesticLanguageSchoolInformationSet",
          { Pernr: sPernr }
        );
        readData(
          sLanguageSchoolInfoPath,
          "/financialEmployee",
          "Dil okul bilgileri alınamadı."
        );

        // Mali / YurtDışı Dil bilgileri al
        var sAbroadInfoPath = oModel.createKey("/LanguageSchoolAbroadSet", {
          Pernr: sPernr,
        });
        readData(
          sAbroadInfoPath,
          "/abroadEmployee",
          "Yurt dışı dil bilgileri alınamadı."
        );

        // Master Okul bilgileri al
        var sMasterInfoPath = oModel.createKey("/MasterSchoolInformationSet", {
          Pernr: sPernr,
        });
        readData(
          sMasterInfoPath,
          "/masterEmployee",
          "Master okul bilgileri alınamadı."
        );

        // Öğrenci Yurt içi Döviz Hesap bilgileri al
        var sDomesticAccountInfoPath = oModel.createKey(
          "/ForeignCurrencyAccountSet",
          { Pernr: sPernr }
        );
        readData(
          sDomesticAccountInfoPath,
          "/domesticAccount",
          "Yurt içi Döviz Hesap bilgileri alınamadı."
        );

        // Diğer Hesap bilgileri al
        var sotherAccountInfoPath = oModel.createKey(
          "/OtherAccountInformationSet",
          { Pernr: sPernr }
        );
        readData(
          sotherAccountInfoPath,
          "/otherAccount",
          "Diğer Hesap bilgileri alınamadı."
        );

        // Öğrenci Yurt içi Hesap bilgileri al
        var sDomesticEmployeeInfoPath = oModel.createKey(
          "/StudentDomesticAccountInformationSet",
          { Pernr: sPernr }
        );
        readData(
          sDomesticEmployeeInfoPath,
          "/domesticEmployee",
          "Öğrenci Yurt içi bilgileri alınamadı."
        );

        // Öğrenci Yurt dışı Hesap bilgileri al
        var sAbroadOtherEmployeeInfoPath = oModel.createKey(
          "/AbroadOtherAccountInformationSet",
          { Pernr: sPernr }
        );
        readData(
          sAbroadOtherEmployeeInfoPath,
          "/abroadOtherEmployee",
          "Öğrenci Yurt dışı bilgileri alınamadı."
        );

        // Kimlik bilgilerini al
        var sIdentityInfoPath = oModel.createKey("/IdentityInformationSet", {
          Pernr: sPernr,
        });
        readData(
          sIdentityInfoPath,
          "/identityEmployee",
          "Kimlik bilgileri alınamadı."
        );

        // İletişim bilgilerini al
        var sContactInfoPath = oModel.createKey("/ContactInformationSet", {
          Pernr: sPernr,
        });
        readData(
          sContactInfoPath,
          "/contactEmployee",
          "İletişim bilgileri alınamadı."
        );
        this._sweetToast(this.getText("EMPLOYEE_READ_SUCCESS"), "S");
      },

      onSave: function (oEvent) {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oEntry = oViewModel.getProperty("/generalEmployee");
        var oIdEntry = oViewModel.getProperty("/identityEmployee");
        var oShlEntry = oViewModel.getProperty("/schoolEmployee");

        var that = this;

        // Genel bilgiler sekmesi seçiliyse
        if (this.byId("TabContainer").getSelectedKey() === "General") {
          if (!oEntry.Descp2 || oEntry.Descp2.trim() === "") {
            if (!this._oDescDialog) {
              this._oDescDialog = new sap.m.Dialog({
                title: "Genel Bilgiler Açıklama Girişi",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("desc2TextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oEntry.Descp2 = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oDescDialog.close();
                    oModel.create("/GeneralInformationSet", oEntry, {
                      success: function (oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S") {
                          that._sweetToast(
                            that.getText("EDU_TASK_SAVED_SUCCESSFUL"),
                            "S"
                          );
                        } else if (oData.Mesty === "E") {
                          MessageToast.show(oData.Messg || "Bir hata oluştu");
                        }
                      },
                      error: function () {
                        MessageToast.show("Veri kaydedilirken bir hata oluştu");
                      },
                    });
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oDescDialog.close();
                  },
                }),
              });
            }

            this._oDescDialog.open();
          } else {
            oModel.create("/GeneralInformationSet", oEntry, {
              success: function (oData, oResponse) {
                debugger;
                if (oData.Mesty === "S") {
                  that._sweetToast(
                    that.getText("EDU_TASK_SAVED_SUCCESSFUL"),
                    "S"
                  );
                } else if (oData.Mesty === "E") {
                  MessageToast.show(oData.Messg || "Bir hata oluştu");
                }
              },
              error: function () {
                MessageToast.show("Veri kaydedilirken bir hata oluştu");
              },
            });
          }
        } else if (this.byId("TabContainer").getSelectedKey() === "School") {
          if (!oShlEntry.Descp || oShlEntry.Descp.trim() === "") {
            if (!this._oSchoolDescDialog) {
              this._oSchoolDescDialog = new sap.m.Dialog({
                title: "Öğrenim Bilgileri Açıklama Girişi",
                contentWidth: "40%",
                content: [
                  new sap.m.VBox({
                    items: [
                      new sap.m.Text({ text: "Lütfen bir açıklama giriniz:" }),
                      new sap.m.TextArea("schoolDescTextArea", {
                        width: "100%",
                        placeholder: "Açıklama giriniz...",
                        liveChange: function (oEvent) {
                          var sValue = oEvent.getParameter("value");
                          oShlEntry.Descp = sValue;
                        },
                        layoutData: new sap.ui.layout.GridData({
                          span: "L12 M12 S12",
                          margin: true,
                        }),
                      }).addStyleClass("sapUiTinyMarginTop"),
                    ],
                  }).addStyleClass("sapUiSmallMargin"),
                ],
                beginButton: new sap.m.Button({
                  text: "Kaydet",
                  icon: "sap-icon://save",
                  type: "Accept",
                  press: function () {
                    that._oSchoolDescDialog.close();
                    oModel.create("/SchoolInformationSet", oShlEntry, {
                      success: function (oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "") {
                          that._sweetToast(
                            that.getText("SCHOOL_INFORMATION_SAVED_SUCCESSFUL"),
                            "S"
                          );
                        } else if (oData.Mesty === "E") {
                          MessageToast.show(oData.Messg || "Bir hata oluştu.");
                        }
                      },
                      error: function () {
                        MessageToast.show("Veri kaydedilirken bir hata oluştu");
                      },
                    });
                  },
                }),
                endButton: new sap.m.Button({
                  text: "İptal",
                  press: function () {
                    that._oSchoolDescDialog.close();
                  },
                }),
              });
            }

            this._oSchoolDescDialog.open();
          } else {
            oModel.create("/SchoolInformationSet", oShlEntry, {
              success: function (oData, oResponse) {
                debugger;
                if (oData.Mesty === "") {
                  that._sweetToast(
                    that.getText("SCHOOL_INFORMATION_SAVED_SUCCESSFUL"),
                    "S"
                  );
                } else if (oData.Mesty === "E") {
                  MessageToast.show(oData.Messg || "Bir hata oluştu.");
                }
              },
              error: function () {
                debugger;
              },
            });
          }
        } else if (this.byId("TabContainer").getSelectedKey() === "Identity") {
          oModel.create("/IdentityInformationSet", oIdEntry, {
            success: function (oData, oResponse) {
              debugger;
              if (oData.Mesty === "S") {
                Swal.fire({
                  position: "center",
                  icon: "success",
                  title: that.getText("IDENTITY_INFORMATION_SAVED_SUCCESSFUL"),
                  showConfirmButton: false,
                  timer: 1500,
                });
              } else if (oData.Mesty === "E") {
                MessageToast.show(oData.Messg || "Bir hata oluştu.");
              }
            },
            error: function () {
              debugger;
            },
          });
        }
      },

      // onSchoolFeeNavigationDialog: function (oEvent) {
      //     debugger;
      //     var oSource = oEvent.getSource(),
      //         oViewModel = this.getModel("requestListModel")
      //     var schoolInfoList = oSource.getBindingContext("requestListModel").getObject();
      //     this._getSchoolList(schoolInfoList);
      // },
      // _getSchoolList: function (schoolInfoList) {
      //     debugger;
      //     var oModel = this.getModel();
      //     var oViewModel = this.getModel("requestListModel");
      //     var sPath = "/GeneralExpenditureInformation(Pernr='" + expendInfoList.Pernr + "',Payno='" + expendInfoList.Payno + "')";
      //     var sPath = oModel.createKey("/SchoolWageInformationSet", {
      //         "Pernr": schoolInfoList.Pernr,
      //         "Wagpe": schoolInfoList.Wagpe,
      //         "Kamno": schoolInfoList.Kamno,
      //     });
      //     this._openBusyFragment();

      //     oModel.read(sPath, {
      //         filters: aFilters,
      //         success: (oData) => {
      //             debugger;
      //             oViewModel.setProperty("/schoolInfoDialogRequest", oData);
      //             this._closeBusyFragment();
      //             if (!this._oSchoolInfoDialog) {
      //                 this._oSchoolInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.SchoolFeeNavigationDialog", this);
      //                 this.getView().addDependent(this._oSchoolInfoDialog);
      //             } else {
      //                 this._oSchoolInfoDialog.close();
      //             }
      //             this._oSchoolInfoDialog.open();

      //         },

      //         error: (oError) => {
      //             this._closeBusyFragment();
      //             sap.m.MessageToast.show("Veri alınırken hata oluştu.");
      //         }
      //     });
      // },
      onSchoolCancelButtonPress: function (oEvent) {
        if (this._oSchoolInfoDialog) {
          this._oSchoolInfoDialog.close();
        }
      },
      // onExpendInfoNavigationDialog: function (oEvent) {
      //     debugger
      //     var oSource = oEvent.getSource(),
      //         oViewModel = this.getModel("requestListModel")
      //     var expendInfoList = oSource.getBindingContext("requestListModel").getObject();

      //     // oViewModel.setProperty("/expendInfoList", expendInfoList)
      //     this._getExpendList(expendInfoList);
      // },
      onDeleteAttachment: function (oEvent) {
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sAttid = oEvent
          .getSource()
          .getBindingContext("requestListModel")
          .getObject("Attid");
        var sPath = "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')";
        var oViewModel = this.getModel("requestListModel"),
          sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var _doDeleteAttachment = function () {
          oViewModel.setProperty("/busy", true);
          that._openBusyFragment();
          oModel.remove(sPath, {
            success: function (oData, oResponse) {
              if (oResponse["headers"]["message"]) {
                that._sweetToast(
                  that.getText("ERROR_WHILE_DELETING_DOCUMENTS"),
                  "E"
                );
              } else {
                that._sweetToast(
                  that.getText("DOCUMENTS_WERE_SUCCESSFULLY_DELETED"),
                  "S"
                );
                that._getAttachmentList(sPernr);
              }
              that._closeBusyFragment();
              oViewModel.setProperty("/busy", false);
            },
            error: function (oError) {
              that._closeBusyFragment();
            },
          });
        };
        var oBeginButtonProp = {
          text: this.getText("DELETE_ACTION"),
          type: "Reject",
          icon: "sap-icon://delete",
          onPressed: _doDeleteAttachment,
        };
        this._callConfirmDialog(
          this.getText("CONFIRMATION_REQUIRED"),
          "Message",
          "Warning",
          this.getText("CONFIRM_DELETION"),
          oBeginButtonProp,
          null
        ).open();
      },
      onAttachDownload: function (oEvent) {
        var sAttid = oEvent
          .getSource()
          .getBindingContext("requestListModel")
          .getObject("Attid");
        var oModel = this.getModel();
        var oUrlPath =
          oModel.sServiceUrl +
          "/PersonnelAttachmentSet(Attid=guid'" +
          sAttid +
          "')/$value";
        window.open(oUrlPath);
      },

      // _getExpendList: function (expendInfoList) {
      //     debugger;
      //     var aFilters = [];
      //     var oModel = this.getModel();
      //     var oViewModel = this.getModel("requestListModel");
      //     var sPath = "/GeneralExpenditureInformation(Pernr='" + expendInfoList.Pernr + "',Payno='" + expendInfoList.Payno + "')";
      //     var sPath = oModel.createKey("/GeneralExpenditureInformationSet", {
      //         "Pernr": expendInfoList.Pernr,
      //         "Payno": expendInfoList.Payno
      //     });
      //     var aFilters = [];
      //     aFilters.push(new Filter("Pernr", FilterOperator.EQ, expendInfoList.Pernr));
      //     aFilters.push(new Filter("Payno", FilterOperator.EQ, expendInfoList.Payno));

      //     this._openBusyFragment();

      //     oModel.read(sPath, {
      //         // filters: aFilters,
      //         success: (oData) => {
      //             debugger;
      //             oViewModel.setProperty("/expendInfoDialogRequest", oData);
      //             this._closeBusyFragment();
      //             if (!this._oExpendInfoDialog) {
      //                 this._oExpendInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.ExpendInfoNavigationDialog", this);
      //                 this.getView().addDependent(this._oExpendInfoDialog);
      //             } else {
      //                 this._oExpendInfoDialog.close();
      //             }
      //             this._oExpendInfoDialog.open();
      //         },

      //         error: (oError) => {
      //             this._closeBusyFragment();
      //             sap.m.MessageToast.show("Veri alınırken hata oluştu.");
      //         }
      //     });
      // },

      // _clearRequest: function () {
      //     var table = sap.ui.getCore().byId("idSuggestionEmployeeTable"),
      //         oViewModel = this.getModel("trainingDetailListModel");
      //     oViewModel.setProperty("/selectedSuggestion/employeeRequest", {});
      //     table.removeSelections();
      // },
      expendApprovalDialog: function (oFormDataExpend) {
        this._oFormData = oFormDataExpend;
        if (!this._oExpendApprovalDialog) {
          this._oExpendApprovalDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.ExpendApprovalDialog",
            this
          );
          this.getView().addDependent(this._oExpendApprovalDialog);
        }
        this._oExpendApprovalDialog.open();
      },
      onApprovalCancelButtonPress: function (oEvent) {
        if (this._oExpendApprovalDialog) {
          this._oExpendApprovalDialog.close();
        }
      },
      onApprovalSaveButtonPress: function () {
        var oViewModel = this.getModel("requestListModel");
        var sSelectedApprover = oViewModel.getProperty(
          "/approvalExpendList/Whoap"
        );
        var oFormToValidate =
            sap.ui.getCore().byId("idExpendApproverForm") ||
            this.byId("idExpendApproverForm"),
          oViewModel = this.getModel("requestListModel"),
          oModel = this.getModel();
        if (!this._validateForm(oFormToValidate)) {
          this._sweetToast(this.getText("FILL_IN_ALL_REQUIRED_FIELDS"), "W");
          return;
        }

        this.onSendSalariesButtonPress({
          ...this._oFormData,
          Whoap: sSelectedApprover,
        });

        this._oExpendApprovalDialog.close();
      },

      onSendSalariesButtonPress: function (oFormData) {
        debugger;
        var oModel = this.getModel();
        // var oSource = oEvent.getSource();
        // var expendInfoList = oSource
        //   .getBindingContext("requestListModel")
        //   .getObject();

        // var oComboBox = sap.ui.getCore().byId("approvalComboBox");
        // var selectedWhoap = oComboBox.getSelectedKey();

        var oUrlParameters = {
          Pernr: oFormData.Pernr,
          Payno: oFormData.Payno,
          Paydt: oFormData.Paydt,
          Paytp: oFormData.Paytp,
          Waers: oFormData.Waers,
          Mwskz: oFormData.Mwskz,
          Parno: oFormData.Parno,
          Descp: oFormData.Descp,
          Payam: oFormData.Payam,
          Whiac: oFormData.Whiac,
          Wacst: oFormData.Wacst,
          Whoap: oFormData.Whoap,
        };

        this._openBusyFragment("TRAINING_PARTICIPANT_SAVE_OPERATION", []);
        oModel.callFunction("/SetApproved", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            console.error("Error:", oError);
            this._closeBusyFragment();
          }.bind(this),
        });
      },

      onSendSchoolFeeButtonPress: function (oEvent) {
        var oModel = this.getModel();
        var oSource = oEvent.getSource();
        var schoolInfoList = oSource
          .getBindingContext("requestListModel")
          .getObject();

        var oUrlParameters = {
          Pernr: schoolInfoList.Pernr,
          Kamno: schoolInfoList.Kamno,
          Wagpe: schoolInfoList.Wagpe,
        };

        Swal.fire({
          title: this.getText("ARE_YOU_SURE"),
          text: this.getText("DO_YOU_CONFIRM_THIS_ACTION"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: this.getText("YES"),
          cancelButtonText: this.getText("NO"),
        }).then((result) => {
          if (result.isConfirmed) {
            this._openBusyFragment("TRAINING_PARTICIPANT_SAVE_OPERATION", []);
            oModel.callFunction("/SentPayEducation", {
              method: "POST",
              urlParameters: oUrlParameters,
              success: function (oData, oResponse) {
                this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
                this._closeBusyFragment();
              }.bind(this),
              error: function (oError) {
                debugger;
                this._closeBusyFragment();
              }.bind(this),
            });
          } else {
            this._sweetToast(this.getText("ACTION_CANCELLED"), "I");
          }
        });
      },
      clearFormDialog: function () {
        var oViewModel = this.getModel("requestListModel");
        oViewModel.setProperty("/expendInfoDialogRequest", {});
      },
      onExpendInfoAddDialog: function () {
        var oViewModel = this.getModel("requestListModel"),
          sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        this._getExpendTypeList(sPernr);
        oViewModel.setProperty("/expendInfoDialogRequest", {});
        oViewModel.setProperty("/aplicationSetting/enabled", true);
      },
      _getExpendTypeList: function (sPernr) {
        if (!sPernr) {
          this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "E");
          return;
        }

        if (!this._oExpendInfoDialog) {
          this._oExpendInfoDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.ExpendInfoNavigationDialog",
            this
          );
          this.getView().addDependent(this._oExpendInfoDialog);
        }

        if (!this._oExpendInfoDialog.isOpen()) {
          this._oExpendInfoDialog.open();
        }
      },

      onSchollInfoAddDialog: function () {
        var oViewModel = this.getModel("requestListModel");
        oViewModel.setProperty("/schoolInfoDialogRequest", {});
        if (!this._oSchoolInfoDialog) {
          this._oSchoolInfoDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.SchoolFeeNavigationDialog",
            this
          );
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
        oRequets.Pernr = sPernr;
        delete oRequets.Kostl;
        var oFormToValidate =
            sap.ui.getCore().byId("idExpendForm") || this.byId("idExpendForm"),
          oViewModel = this.getModel("requestListModel"),
          oModel = this.getModel();
        if (!this._validateForm(oFormToValidate)) {
          this._sweetToast(this.getText("FILL_IN_ALL_REQUIRED_FIELDS"), "W");
          return;
        }
        oModel.create("/GeneralExpenditureInformationSet", oRequets, {
          success: function (oData, oResponse) {
            debugger;
            this.onAttachmentPaymentUploadPress();
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            this._closeBusyFragment();
            this._oExpendInfoDialog.close();
            this.clearFormDialog();
            var oViewModel = this.getModel("requestListModel");
            var aExpendInfoList =
              oViewModel.getProperty("/expendInfoList") || [];
            aExpendInfoList.push(oData);
            oViewModel.setProperty("/expendInfoList", aExpendInfoList);
          }.bind(this),
          error: function (oError) {
            this._sweetToast(this.getText("SAVE_ERROR"), "E");
            this._closeBusyFragment();
          }.bind(this),
        });
      },
      onSaveSchoolDialogButtonPress: function (oEvent) {
        var that = this;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var oSchoolRequets = oViewModel.getProperty("/schoolInfoDialogRequest");
        oSchoolRequets.Pernr = sPernr;
        var oFormToValidate =
            sap.ui.getCore().byId("idSchoolForm") || this.byId("idSchoolForm"),
          oViewModel = this.getModel("requestListModel"),
          oModel = this.getModel();
        if (!this._validateForm(oFormToValidate)) {
          this._sweetToast(this.getText("FILL_IN_ALL_REQUIRED_FIELDS"), "W");
          return;
        }

        oModel.create("/SchoolWageInformationSet", oSchoolRequets, {
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            this._closeBusyFragment();
            this._oSchoolInfoDialog.close();
            this.clearFormDialog();
            var oViewModel = this.getModel("requestListModel");
            var aSchoolFeeList = oViewModel.getProperty("/schoolFeeList") || [];
            aSchoolFeeList.push(oData);
            oViewModel.setProperty("/schoolFeeList", aSchoolFeeList);
          }.bind(this),
          error: function (oError) {
            this._sweetToast(this.getText("SAVE_ERROR"), "E");
            this._closeBusyFragment();
          }.bind(this),
        });
      },
      onAttachmentUploadComplete: function (oEvent) {
        debugger;
        var oFileUploader = sap.ui
          .getCore()
          .byId("idAttachmentFileUploaderPayment");
        oFileUploader.destroyHeaderParameters();
        oFileUploader.clear();
        var oViewModel = this.getModel("requestListModel"),
          sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var sStatus = oEvent.getParameter("status");
        var sResponse = oEvent.getParameter("response");
        this._closeBusyFragment();

        if (sStatus == "201" || sStatus == "200") {
          this._sweetToast(this.getText("FILE_UPLOAD_SUCCESS"), "S");
          this._oUploadAttachmentDialog.close();
          this._getAttachmentList(sPernr);
        } else {
          this._sweetToast(this.getText("FILE_UPLOAD_ERROR"), "E");
        }
        this.getModel().refresh(true);
      },
      onFileSizeExceed: function (oEvent) {
        Swal.fire({
          position: "bottom-center",
          icon: "warning",
          title: this.getText("FILE_SIZE_EXCEEDED", [
            oEvent.getSource().getMaximumFileSize(),
          ]),
          showConfirmButton: false,
          timer: 2500,
        });
      },
      onExpendCancelButtonPress: function () {
        if (this._oExpendInfoDialog) {
          this._oExpendInfoDialog.close();
        }
      },

      genderFormatter: function (sGesch) {
        if (sGesch === "1") {
          return "Erkek";
        } else if (sGesch === "2") {
          return "Kadın";
        } else {
          return "";
        }
      },
      // onVendorNumberChange: function (oEvent) {
      //     var sValue = oEvent.getParameter("value");

      //     if (sValue.length < 10) {
      //         sValue = sValue.padStart(10, "0");
      //         oEvent.getSource().setValue(sValue);
      //     }
      // },

      openGuarantorDialog: function (oGuarandorFormData) {
        debugger;
        var oViewModel = this.getModel("requestListModel"),
          sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        // var eGuarantorInfoList = oSource.getBindingContext("requestListModel").getObject();
        this._getGuarantorList(sPernr, oGuarandorFormData.Sirno);
      },
      onSaveGuarantorContact: function (oEvent) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel");
        // sEntitySet = "/GuarantorInformationSet";
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var sSirno = oViewModel.getProperty("/guarantorContactList/Sirno");
        var oSchoolRequets = oViewModel.getProperty("/guarantorContactList");
        (oSchoolRequets.Pernr = sPernr), (oSchoolRequets.Sirno = sSirno);

        oModel.create("/GuarantorInformationSet", oSchoolRequets, {
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            // that._oExpendInfoDialog.close();
            this.clearFormDialog();
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            this._sweetToast(this.getText("SAVE_ERROR"), "E");
            this._closeBusyFragment();
          }.bind(this),
        });
      },
      _getGuarantorList: function (sPernr, Sirno) {
        debugger;
        var that = this;
        var sServiceUrl = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/";
        var oModel = this.getModel(sServiceUrl);
        var aFilters = [];
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr", sPernr);
        aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
        aFilters.push(new Filter("Ptype", FilterOperator.EQ, "LMSABR"));
        aFilters.push(new Filter("Dotyp", FilterOperator.EQ, "1"));
        aFilters.push(new Filter("Sirno", FilterOperator.EQ, Sirno));

        oModel.read("/PersonnelAttachmentSet", {
          filters: aFilters,
          success: (oData, oResponse) => {
            debugger;
            that
              .getModel("requestListModel")
              .setProperty("/attachmentGuarantorList", oData.results);
            if (!that._oGuarantorDialog) {
              that._oGuarantorDialog = sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorDocumentDialog",
                that
              );
              that.getView().addDependent(that._oGuarantorDialog);
            } else {
              that._oGuarantorDialog.close();
            }
            that._oGuarantorDialog.open();
          },
          error: (oError) => {
            that.getModel("requestListModel").setProperty("/busy", false);
          },
        });
      },
      onSaveAddGuarantorDialog: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var sSirno = oViewModel.getProperty("/addGuarantorRequest/Sirno");
        var oRequets = oViewModel.getProperty("/addGuarantorRequest");
        (oRequets.Pernr = sPernr), (oRequets.Sirno = sSirno);

        oModel.create("/GuarantorInformationSet", oRequets, {
          success: function (oData, oResponse) {
            // that.onAttachmentPaymentUploadPress();
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            this._closeBusyFragment();
            this._oAddGuarantorDialog.close();
            this.clearFormDialog();
            var oViewModel = this.getModel("requestListModel");
            var aGuarantorList = oViewModel.getProperty("/guarantorList") || [];
            aGuarantorList.push(oData);
            oViewModel.setProperty("/guarantorList", aGuarantorList);
          }.bind(this),
          error: function (oError) {
            this._sweetToast(this.getText("SAVE_ERROR"), "E");
            this._closeBusyFragment();
          }.bind(this),
        });
      },
      onAddGuarantorCancelDialog: function (oEvent) {
        if (this._oAddGuarantorDialog) {
          this._oAddGuarantorDialog.close();
        }
      },
      onAddGuarantor: function () {
        debugger;
        if (!this._oAddGuarantorDialog) {
          this._oAddGuarantorDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.AddGuarantorDialog",
            this
          );
          this.getView().addDependent(this._oAddGuarantorDialog);
        } else {
          this._oAddGuarantorDialog.close();
        }
        this._oAddGuarantorDialog.open();
      },
      onAttachmentGuarantorUploadPress: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var oFileUploader = sap.ui.getCore().byId("idGuarantorFileUploader");

        if (!oFileUploader.getValue()) {
          this._sweetToast(this.getText("FILE_SELECTION_REQUIRED"), "W");
          return;
        }

        if (!sPernr) {
          this._sweetToast(this.getText("NUMBER_REQUIRED"), "W");
          return;
        }

        var oModel = this.getModel();
        oFileUploader.destroyHeaderParameters();
        oModel.refreshSecurityToken();
        oFileUploader.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "x-csrf-token",
            value: oModel.getSecurityToken(),
          })
        );

        var sFileName = oFileUploader.getValue();
        sFileName = encodeURIComponent(sFileName);
        oFileUploader.addHeaderParameter(
          new sap.ui.unified.FileUploaderParameter({
            name: "content-disposition",
            value: "inline; filename='" + sFileName + "'",
          })
        );

        var oCurrentDocParams = oViewModel.getProperty("/documentList");
        var sSirno = this._selectedSirno;
        var sEntty = oModel.createKey("/GuarantorAttachmentOperationSet", {
          Pernr: sPernr,
          Firdt: oCurrentDocParams.Firdt,
          Sirno: sSirno, //Sıra no tablodaki sıra no alanından alınmalı
          Ptype: "LMSABR",
          Dotyp: "1",
          Docnm: oCurrentDocParams.Docnm,
          Doctp: oCurrentDocParams.Doctp,
          Descp: oCurrentDocParams.Descp,
          Firdt: oCurrentDocParams.Firdt,
          Lasdt: oCurrentDocParams.Lasdt,
        });
        var sPath =
          "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV" +
          sEntty +
          "/PersonnelAttachmentSet";

        oFileUploader.setUploadUrl(sPath);

        this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
        oFileUploader.upload();
      },
      // onSchoolFeeNavigationDialog: function (oEvent) {
      //     debugger;
      //     var oSource = oEvent.getSource(),
      //         oViewModel = this.getModel("requestListModel")
      //     var schoolInfoList = oSource.getBindingContext("requestListModel").getObject();
      //     this._getSchoolList(schoolInfoList);
      // },
      // _getSchoolList: function (schoolInfoList) {
      //     debugger;
      //     var oModel = this.getModel();
      //     var oViewModel = this.getModel("requestListModel");
      //     // var sPath = "/GeneralExpenditureInformation(Pernr='" + expendInfoList.Pernr + "',Payno='" + expendInfoList.Payno + "')";
      //     var sPath = oModel.createKey("/SchoolWageInformationSet", {
      //         "Pernr": schoolInfoList.Pernr,
      //         "Wagpe": schoolInfoList.Wagpe,
      //         "Kamno": schoolInfoList.Kamno,
      //     });
      //     this._openBusyFragment();

      //     oModel.read(sPath, {
      //         // filters: aFilters,
      //         success: (oData) => {
      //             debugger;
      //             oViewModel.setProperty("/schoolInfoDialogRequest", oData);
      //             this._closeBusyFragment();
      //             if (!this._oSchoolInfoDialog) {
      //                 this._oSchoolInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.SchoolFeeNavigationDialog", this);
      //                 this.getView().addDependent(this._oSchoolInfoDialog);
      //             } else {
      //                 this._oSchoolInfoDialog.close();
      //             }
      //             this._oSchoolInfoDialog.open();

      //         },

      //         error: (oError) => {
      //             this._closeBusyFragment();
      //             sap.m.MessageToast.show("Veri alınırken hata oluştu.");
      //         }
      //     });
      // },

      openGuarantorContactDialog: function (oGuarandorFormData) {
        debugger;
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        this._getGuarantorContactList(oGuarandorFormData);
      },

      _getGuarantorContactList: function (oGuarandorFormData) {
        debugger;
        var that = this;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var aFilters = [];
        var sPath = oModel.createKey("/GuarantorInformationSet", {
          Pernr: oGuarandorFormData.Pernr,
          Sirno: oGuarandorFormData.Sirno,
        });
        // aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
        // aFilters.push(new Filter("Sirno", FilterOperator.EQ, sSirno));
        this._openBusyFragment("READ_DATA");
        oModel.read(sPath, {
          // filters: aFilters,
          success: (oData, oResponse) => {
            that._closeBusyFragment();
            // oViewModel.setProperty("/guarantorContactList", oData);
            that
              .getModel("requestListModel")
              .setProperty("/guarantorContactList", oData);
            // that.getModel("requestListModel").setProperty("/guarantorContactList", oData);
            if (!that._oGuarantorContactDialog) {
              that._oGuarantorContactDialog = sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorContactDialog",
                that
              );
              that.getView().addDependent(that._oGuarantorContactDialog);
            } else {
              that._oGuarantorContactDialog.close();
            }
            that._oGuarantorContactDialog.open();
          },
          error: (oError) => {
            that._closeBusyFragment();
            that.getModel("abrAccountListModel").setProperty("/busy", false);
          },
        });
      },

      onAttachDownload: function (oEvent) {
        var sAttid = oEvent
          .getSource()
          .getBindingContext("requestListModel")
          .getObject("Attid");
        var oModel = this.getModel();
        var oUrlPath =
          oModel.sServiceUrl +
          "/PersonnelAttachmentSet(Attid=guid'" +
          sAttid +
          "')/$value";
        window.open(oUrlPath);
      },
      onEditPress: function () {
        var oViewModel = this.getModel("requestListModel"),
          sVisible = oViewModel.getProperty(
            "/suggestionActionData/priorityEditable"
          );
        if (!sVisible) {
          oViewModel.setProperty(
            "/suggestionActionData/priorityEditable",
            true
          );
          oViewModel.setProperty(
            "/suggestionActionData/priorityDisplay",
            false
          );
        } else {
          oViewModel.setProperty(
            "/suggestionActionData/priorityEditable",
            false
          );
          oViewModel.setProperty("/suggestionActionData/priorityDisplay", true);
        }
      },
      onTableSelectionChange: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("listItem");
        var oBindingContext =
          oSelectedItem.getBindingContext("requestListModel");

        var sSirno = oBindingContext.getProperty("Sirno");
        this._selectedSirno = sSirno; 
        var oViewModel = this.getModel("requestListModel");
        var bIsGuarantorActive = !!sSirno;
        oViewModel.setProperty("/isGuarantorActive", bIsGuarantorActive);
      },

      openGuarantorIdentityDialog: function (oGuarandorFormData) {
        var oViewModel = this.getModel("requestListModel"),
          sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        oViewModel.setProperty("/guarantorIdentityList", oGuarandorFormData);
        // this._getGuarantorIdentityList(sPernr,oObject.Sirno);
        if (!this._oGuarantorIdentityDialog) {
          this._oGuarantorIdentityDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorIdentityDialog",
            this
          );
          this.getView().addDependent(this._oGuarantorIdentityDialog);
        } else {
          this._oGuarantorIdentityDialog.close();
        }
        this._oGuarantorIdentityDialog.open();
      },

      onSaveGuarantorIdentity: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        var oRequets = oViewModel.getProperty("/guarantorIdentityList");
        var sSirno = oViewModel.getProperty("/guarantorIdentityList/Sirno");
        (oRequets.Pernr = sPernr), (oRequets.Sirno = sSirno);
        // delete oRequets.Kostl

        oModel.create("/GuarantorInformationSet", oRequets, {
          success: function (oData, oResponse) {
            // that.onAttachmentPaymentUploadPress();
            that._sweetToast(that.getText("SAVE_SUCCESSFUL"), "S");
            that._oExpendInfoDialog.close();
            that.clearFormDialog();
            that._closeBusyFragment();
          },
          error: function (oError) {
            this._sweetToast(this.getText("SAVE_ERROR"), "E");
            this._closeBusyFragment();
          }.bind(this),
        });
      },

      onShowPersonSearchHelp: function (oEvent) {
        if (!this._oSearchHelpDialog) {
          this._oSearchHelpDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.StudentSearchHelpDialog",
            this
          );
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
          if (sVal) {
            var oFilterElement = new Filter(aKeys[i], FilterOperator.EQ, sVal);
            aFilters.push(oFilterElement);
          }
        }
        return aFilters;
      },
      _getRequestList: function (oEvent) {},
      onCancelSearchStudentDialog: function (oEvent) {
        if (this._oSearchHelpDialog) {
          this._oSearchHelpDialog.close();
        }
      },
      onCancelGuarantorDialog: function (oEvent) {
        if (this._oGuarantorDialog) {
          this._oGuarantorDialog.close();
        }
      },
      onCancelGuarantorContact: function (oEvent) {
        if (this._oGuarantorContactDialog) {
          this._oGuarantorContactDialog.close();
        }
      },
      onCancelGuarantorIdentity: function (oEvent) {
        if (this._oGuarantorIdentityDialog) {
          this._oGuarantorIdentityDialog.close();
        }
      },
      onShowUnitSearchHelp: function (oEvent) {
        if (!this._oUnitSearchHelpDialog) {
          this._oUnitSearchHelpDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.UnitSearchHelpDialog",
            this
          );
          this.getView().addDependent(this._oUnitSearchHelpDialog);
        } else {
          this._oUnitSearchHelpDialog.close();
        }
        this._oUnitSearchHelpDialog.open();
      },
      onUnitSelected: function (oEvent) {
        debugger;
        var oSelectedUnitItem = oEvent
          .getSource()
          .getBindingContext()
          .getObject();

        var oViewModel = this.getModel("requestListModel");
        oViewModel.setProperty(
          "/selectedEmployee/Unicd",
          oSelectedUnitItem.Orgeh
        );
        oViewModel.setProperty(
          "/selectedEmployee/Orgtx",
          oSelectedUnitItem.Orgtx
        );

        if (this._oUnitSearchHelpDialog) {
          this._oUnitSearchHelpDialog.close();
        }
      },
      onCancelUnitButtonPress: function (oEvent) {
        if (this._oUnitSearchHelpDialog) {
          this._oUnitSearchHelpDialog.close();
        }
      },
      calculationButtonPress: function () {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var oEntry = oViewModel.getProperty("/generalEmployee");

        var Opera = "1";

        oEntry.Opera = Opera;

        if (Opera === "1") {
          if (this.byId("TabContainer").getSelectedKey() === "General") {
            oModel.create("/GeneralInformationSet", oEntry, {
              success: function (oData, oResponse) {
                debugger;
                if (oData.Mesty === "S") {
                  this._sweetToast(this.getText("DATA_SUCCESSFULLY"), "S");
                }
              }.bind(this),
              error: function (oError) {
                debugger;
              },
            });
          }
        }
      },

      onFinancialSendPress: function (oEvent) {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
          sNameFirst = oViewModel.getProperty("/financialEmployee/NameFirst"),
          sBankl = oViewModel.getProperty("/financialEmployee/Bankl"),
          sBankn = oViewModel.getProperty("/financialEmployee/Bankn"),
          sIban00 = oViewModel.getProperty("/financialEmployee/Iban00");

        var oUrlParameters = {
          Pernr: sPernr,
          Name_First: sNameFirst,
          Which: "1",
          Bankn: sBankn,
          Bankl: sBankl,
          Iban00: sIban00,
          Abano: "",
          Swift: "",
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SendAccount", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("ACC_SENT_BY_E_MAIL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onForeignSendPress: function (oEvent) {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
          sNameFirst = oViewModel.getProperty("/abroadEmployee/NameFirst"),
          sBankl = oViewModel.getProperty("/abroadEmployee/Bankl"),
          sBankn = oViewModel.getProperty("/abroadEmployee/Bankn"),
          sIban00 = oViewModel.getProperty("/abroadEmployee/Iban00"),
          sAbano = oViewModel.getProperty("/abroadEmployee/Abano"),
          sSwift = oViewModel.getProperty("/abroadEmployee/Swift");
        var oUrlParameters = {
          Pernr: sPernr,
          Name_First: sNameFirst,
          Which: "2",
          Bankl: sBankl,
          Bankn: sBankn,
          Iban00: sIban00,
          Abano: sAbano,
          Swift: sSwift,
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SendAccount", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("ACC_SENT_BY_E_MAIL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onMasterSendPress: function (oEvent) {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
          sNameFirst = oViewModel.getProperty("/masterEmployee/NameFirst"),
          sBankl = oViewModel.getProperty("/masterEmployee/Bankl"),
          sBankn = oViewModel.getProperty("/masterEmployee/Bankn"),
          sIban00 = oViewModel.getProperty("/masterEmployee/Iban00"),
          sAbano = oViewModel.getProperty("/masterEmployee/Abano"),
          sSwift = oViewModel.getProperty("/masterEmployee/Swift");
        var oUrlParameters = {
          Pernr: sPernr,
          Name_First: sNameFirst,
          Which: "3",
          Bankl: sBankl,
          Bankn: sBankn,
          Iban00: sIban00,
          Abano: sAbano,
          Swift: sSwift,
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SendAccount", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("ACC_SENT_BY_E_MAIL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onDomesticSendPress: function () {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
          sNameFirst = oViewModel.getProperty("/domesticAccount/NameFirst"),
          sBankl = oViewModel.getProperty("/domesticAccount/Bankl"),
          sBankn = oViewModel.getProperty("/domesticAccount/Bankn"),
          sIban00 = oViewModel.getProperty("/domesticAccount/Iban00");
        var oUrlParameters = {
          Pernr: sPernr,
          Name_First: sNameFirst,
          Which: "4",
          Bankl: sBankl,
          Bankn: sBankn,
          Iban00: sIban00,
          Abano: "",
          Swift: "",
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SendAccount", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("ACC_SENT_BY_E_MAIL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onOtherSendPress: function (oEvent) {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
          sNameFirst = oViewModel.getProperty("/otherAccount/NameFirst"),
          sBankl = oViewModel.getProperty("/otherAccount/Bankl"),
          sBankn = oViewModel.getProperty("/otherAccount/Bankn"),
          sIban00 = oViewModel.getProperty("/otherAccount/Iban00");

        var oUrlParameters = {
          Pernr: sPernr,
          Name_First: sNameFirst,
          Which: "5",
          Bankl: sBankl,
          Bankn: sBankn,
          Iban00: sIban00,
          Abano: "",
          Swift: "",
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SendAccount", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("ACC_SENT_BY_E_MAIL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onStnAccountSendPress: function () {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
          sNameFirst = oViewModel.getProperty("/domesticEmployee/NameFirst"),
          sBankl = oViewModel.getProperty("/domesticEmployee/Bankl"),
          sBankn = oViewModel.getProperty("/domesticEmployee/Bankn"),
          sIban00 = oViewModel.getProperty("/domesticEmployee/Iban00");

        var oUrlParameters = {
          Pernr: sPernr,
          Name_First: sNameFirst,
          Which: "6",
          Bankl: sBankl,
          Bankn: sBankn,
          Iban00: sIban00,
          Abano: "",
          Swift: "",
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SendAccount", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("ACC_SENT_BY_E_MAIL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onAbroadOtherSendPress: function (oEvent) {
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("requestListModel");
        var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
          sNameFirst = oViewModel.getProperty("/abroadOtherEmployee/NameFirst"),
          sBankl = oViewModel.getProperty("/abroadOtherEmployee/Bankl"),
          sBankn = oViewModel.getProperty("/abroadOtherEmployee/Bankn"),
          sIban00 = oViewModel.getProperty("/abroadOtherEmployee/Iban00"),
          sAbano = oViewModel.getProperty("/abroadOtherEmployee/Abano"),
          sSwift = oViewModel.getProperty("/abroadOtherEmployee/Swift");

        var oUrlParameters = {
          Pernr: sPernr,
          Name_First: sNameFirst,
          Which: "7",
          Bankl: sBankl,
          Bankn: sBankn,
          Iban00: sIban00,
          Abano: sAbano,
          Swift: sSwift,
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SendAccount", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            this._sweetToast(this.getText("ACC_SENT_BY_E_MAIL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onExpendActions: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("requestListModel");
        var oSource = oEvent.getSource();
        var oData = oSource.getBindingContext("requestListModel").getObject();

        oViewModel.setProperty("/request/isSent", oData.Sent ? true : false);
        if (!this._oExpendActionDialog) {
          this._oExpendActionDialog = new sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.ExpendActions",
            this
          );
          this.getView().addDependent(this._oExpendActionDialog);
        }
        this._oExpendActionDialog.data("formData", oData);
        this._oExpendActionDialog.openBy(oSource);
      },
      onGuarantorActions: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("requestListModel");
        var oSource = oEvent.getSource();
        var oData = oSource.getBindingContext("requestListModel").getObject();

        if (!this._oGuarandorActionDialog) {
          this._oGuarandorActionDialog = new sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.GuarandorActions",
            this
          );
          this.getView().addDependent(this._oGuarandorActionDialog);
        }
        this._oGuarandorActionDialog.data("formData", oData);
        this._oGuarandorActionDialog.openBy(oSource);
      },
      onGuarandorActionSelected: function (oEvent) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel"),
          oSource = oEvent.getSource(),
          sGuarandorAction = oSource.data("actionId"),
          oGuarandorFormData = oSource.getParent().data("formData");
        switch (sGuarandorAction) {
          default:
            this._getGuarandorObject(oGuarandorFormData, sGuarandorAction);
            break;
        }
      },
      _getGuarandorObject: function (oGuarandorFormData, sGuarandorAction) {
        debugger;
        return new Promise(
          function (resolve, reject) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            switch (sGuarandorAction) {
              case "Guarandor":
                this.openGuarantorDialog(oGuarandorFormData);
                oViewModel.setProperty("/busy", true);
                break;
              case "Contact":
                this.openGuarantorContactDialog(oGuarandorFormData);
                oViewModel.setProperty("/busy", true);
                break;

              case "Identity":
                this.openGuarantorIdentityDialog(oGuarandorFormData);
                oViewModel.setProperty("/busy", true);
                break;
              default:
            }
            resolve();
          }.bind(this)
        );
      },
      onSchoolActions: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("requestListModel");
        var oSource = oEvent.getSource();
        var oData = oSource.getBindingContext("requestListModel").getObject();

        oViewModel.setProperty("/request/isSent", oData.Sent ? true : false);
        if (!this._oSchoolActionDialog) {
          this._oSchoolActionDialog = new sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrTracking.SchoolActions",
            this
          );
          this.getView().addDependent(this._oSchoolActionDialog);
        }
        this._oSchoolActionDialog.data("formData", oData);
        this._oSchoolActionDialog.openBy(oSource);
      },
      onActionExpendSelected: function (oEvent) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel"),
          oSource = oEvent.getSource(),
          sActionExpend = oSource.data("actionId"),
          oFormDataExpend = oSource.getParent().data("formData");
        switch (sActionExpend) {
          default:
            this._getObjectExpend(oFormDataExpend, sActionExpend);
            break;
        }
      },
      _getObjectExpend: function (oFormDataExpend, sActionExpend) {
        debugger;
        return new Promise(
          function (resolve, reject) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");

            var sTitle = this.getText("NEW_PAYMENT_REQUEST");
            switch (sActionExpend) {
              case "SendExpend":
                this.expendApprovalDialog(oFormDataExpend);
                //   Swal.fire({
                //     title: this.getText("ARE_YOU_SURE"),
                //     text: this.getText("YOU_WONT_BE_ABLE_TO_REVERT_THIS"),
                //     icon: "warning",
                //     showCancelButton: true,
                //     confirmButtonColor: "#3085d6",
                //     cancelButtonColor: "#d33",
                //     confirmButtonText: this.getText("YES"),
                //     cancelButtonText: this.getText("NO"),
                //   }).then((result) => {
                //     if (result.isConfirmed) {
                //       this.changeRequestExpend(oFormDataExpend);
                //     }
                //   });
                break;
              case "DisplayExpend":
                this.onExpendInfoAddDialog();
                oViewModel.setProperty("/aplicationSetting/enabled", false);
                if (oFormDataExpend.Whiac === "1") {
                  oViewModel.setProperty("/isSellerVisible", false);
                  oViewModel.setProperty("/isAccountVisible", true);
                } else if (oFormDataExpend.Whiac === "2") {
                  oViewModel.setProperty("/isAccountVisible", false);
                  oViewModel.setProperty("/isSellerVisible", true);
                }
                oViewModel.setProperty("/busy", true);
                oViewModel.setProperty(
                  "/expendInfoDialogRequest",
                  oFormDataExpend
                );

                break;

              case "EditExpend":
                this.onExpendInfoAddDialog();
                oViewModel.setProperty("/aplicationSetting/enabled", true);
                if (oFormDataExpend.Whiac === "1") {
                  oViewModel.setProperty("/isSellerVisible", false);
                  oViewModel.setProperty("/isAccountVisible", true);
                } else if (oFormDataExpend.Whiac === "2") {
                  oViewModel.setProperty("/isAccountVisible", false);
                  oViewModel.setProperty("/isSellerVisible", true);
                }
                oViewModel.setProperty(
                  "/expendInfoDialogRequest",
                  oFormDataExpend
                );
                oViewModel.setProperty("/busy", true);
                break;
              default:
            }
            resolve();
          }.bind(this)
        );
      },
      changeRequestExpend: function (oFormDataExpend) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel");
        var oUrlParameters = {
          Pernr: oFormDataExpend.Pernr,
          Payno: oFormDataExpend.Payno,
          Paydt: oFormDataExpend.Paydt,
          Paytp: oFormDataExpend.Paytp,
          Waers: oFormDataExpend.Waers,
          Mwskz: oFormDataExpend.Mwskz,
          Parno: oFormDataExpend.Parno,
          Descp: oFormDataExpend.Descp,
          Payam: oFormDataExpend.Payam,
          Whiac: oFormDataExpend.Whiac,
          Wacst: oFormDataExpend.Wacst,
        };

        this._openBusyFragment("TRAINING_PARTICIPANT_SAVE_OPERATION", []);
        oModel.callFunction("/SetApproved", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            // that.getModel("requestListModel").setProperty("/expendInfoList");
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      onActionSelected: function (oEvent) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel"),
          oSource = oEvent.getSource(),
          sAction = oSource.data("actionId"),
          oFormData = oSource.getParent().data("formData");
        switch (sAction) {
          default:
            this._getObject(oFormData, sAction);
            break;
        }
      },
      _getObject: function (oFormData, sAction) {
        debugger;
        return new Promise(
          function (resolve, reject) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var sTitle = this.getText("NEW_PAYMENT_REQUEST");
            switch (sAction) {
              //   case "Send":
              //     Swal.fire({
              //       title: this.getText("ARE_YOU_SURE"),
              //       text: this.getText("YOU_WONT_BE_ABLE_TO_REVERT_THIS"),
              //       icon: "warning",
              //       showCancelButton: true,
              //       confirmButtonColor: "#3085d6",
              //       cancelButtonColor: "#d33",
              //       confirmButtonText: this.getText("YES"),
              //       cancelButtonText: this.getText("NO"),
              //     }).then((result) => {
              //       if (result.isConfirmed) {
              //         this.changeRequest(oFormData);
              //       }
              //     });
              //     break;
              case "Display":
                this.onSchollInfoAddDialog();
                oViewModel.setProperty("/aplicationSetting/enabled", false);
                oViewModel.setProperty("/schoolInfoDialogRequest", oFormData);
                oViewModel.setProperty("/busy", true);
                break;

              case "Edit":
                this.onSchollInfoAddDialog();
                oViewModel.setProperty("/aplicationSetting/enabled", true);

                oViewModel.setProperty("/schoolInfoDialogRequest", oFormData);
                oViewModel.setProperty("/busy", true);
                break;
              default:
            }
            resolve();
          }.bind(this)
        );
      },
      changeRequest: function (oFormData) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("requestListModel");
        var oUrlParameters = {
          Pernr: oFormData.Pernr,
          Kamno: oFormData.Kamno,
          Wagpe: oFormData.Wagpe,
        };

        this._openBusyFragment("TRAINING_PARTICIPANT_SAVE_OPERATION", []);
        oModel.callFunction("/SentPayEducation", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            // that.getModel("requestListModel").setProperty("/expendInfoList");
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
    });
  }
);
