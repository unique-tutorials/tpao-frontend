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
                addGuarantorRequest:{},
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
                    priorityDisplay: true
                },
                newNumberRequest: {
                    Pernr: null,
                    Ename: ""
                },
                attachmentList: []
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
                "/identityEmployee"
            ];
            aPaths.forEach(function (sPath) {
                oModel.setProperty(sPath, {});
            });
        
            this.getRouter().navTo("appdispatcher", {}, true);
        },
        onItemSelected: function (oEvent) {
            var oSelectedItem = oEvent.getSource().getBindingContext().getObject();

            var oViewModel = this.getModel('requestListModel');
            oViewModel.setProperty("/newNumberRequest/Pernr", oSelectedItem.Pernr);
            oViewModel.setProperty("/newNumberRequest/Ename", oSelectedItem.Vorna + ' ' + oSelectedItem.Nachn);
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
                this._oAttachmentDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.AttachmentList", this);
                this.getView().addDependent(this._oAttachmentDialog);
            } else {
                this._oAttachmentDialog.close();
            }
            this._oAttachmentDialog.open();
        },
        onCloseDialog:function(){
            if (this._oAttachmentDialog) this._oAttachmentDialog.close();
        },
        _getAttachmentList:function(sPernr){
            var that = this;
            var oModel = this.getModel();
            var aFilters = [];
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Ptype", FilterOperator.EQ, 'LMSABR'));
            aFilters.push(new Filter("Dotyp", FilterOperator.EQ, '4'));
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
                }
            });
        },
        onAttachmentAdd: function () {
            if (!this._oUploadAttachmentDialog) {
                this._oUploadAttachmentDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.UploadAttachments", this);
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
            //TODO
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

            var sPath = oModel.sServiceUrl + "/PersonnelAttachmentOperationSet(Pernr='" + sPernr + "',Dotyp='" + '4' + "',Ptype='" +
                'LMSABR' + "')/PersonnelAttachmentSet";
            oFileUploader.setUploadUrl(sPath);

            this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
            oFileUploader.upload();
        },
        onSearch: function (oEvent) {
            debugger;
            var oViewModel = this.getModel('requestListModel');
            var oFilter = oViewModel.getProperty('/searchParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('studentTable') || sap.ui.getCore().byId('studentTable');
            oTable.getBinding('items').filter(aFilters, "Application");
        },
        onPartnerButtonPress: function () {
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
        onForeignButtonPress: function (oEvent) {
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
        onFinancialSavePress: function (oEvent) {
            debugger;
            var that = this
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oFinEntry = oViewModel.getProperty('/financialEmployee');

            if (this.byId("TabBarFinancial").getSelectedKey() === "LanguageSchool") {
                if (!oFinEntry.Descp2 || oFinEntry.Descp2.trim() === "") {
                    if (!this._oDescDialog) {
                        this._oDescDialog = new sap.m.Dialog({
                            title: "Dil Okul Bilgisi İçin Açıklama Girin",
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
                                                oFinEntry.Descp2 = sValue;
                                            },
                                            layoutData: new sap.ui.layout.GridData({
                                                span: "L12 M12 S12",
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ],
                            beginButton: new sap.m.Button({
                                text: "Kaydet",
                                icon: "sap-icon://save",
                                type: "Accept",
                                press: function () {
                                    that._oDescDialog.close();
                                    oModel.create("/DomesticLanguageSchoolInformationSet", oFinEntry, {
                                        success: function (oData, oResponse) {
                                            debugger;
                                            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                }
            }
        },
        onForeignSavePress: function (oEvent) {
            debugger;
            var that = this
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oForeignEntry = oViewModel.getProperty('/abroadEmployee');
            // Genel bilgiler sekmesi seçiliyse
            // Yurtiçi dil okul bilgiler sekmesi seçiliyse
            if (this.byId("TabBarFinancial").getSelectedKey() === "LanguageSchool") {
                if (!oForeignEntry.Descp2 || oForeignEntry.Descp2.trim() === "") {
                    if (!this._oDescDialog) {
                        this._oDescDialog = new sap.m.Dialog({
                            title: "Yurt Dışı Dil Okulu İçin Açıklama Girin",
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
                                                oForeignEntry.Descp2 = sValue;
                                            },
                                            layoutData: new sap.ui.layout.GridData({
                                                span: "L12 M12 S12",
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ],
                            beginButton: new sap.m.Button({
                                text: "Kaydet",
                                icon: "sap-icon://save",
                                type: "Accept",
                                press: function () {
                                    that._oDescDialog.close();
                                    oModel.create("/LanguageSchoolAbroadSet", oForeignEntry, {
                                        success: function (oData, oResponse) {
                                            debugger;
                                            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                }
            }
        },
        onMasterSavePress: function (oEvent) {
            debugger;
            var that = this
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oMasterEntry = oViewModel.getProperty('/masterEmployee');
            if (this.byId("TabBarFinancial").getSelectedKey() === "MasterSchool") {
                if (!oMasterEntry.Descp2 || oMasterEntry.Descp2.trim() === "") {
                    if (!this._oDescDialog) {
                        this._oDescDialog = new sap.m.Dialog({
                            title: "Master Okulu İçin Açıklama Girin",
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
                                                oMasterEntry.Descp2 = sValue;
                                            },
                                            layoutData: new sap.ui.layout.GridData({
                                                span: "L12 M12 S12",
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ],
                            beginButton: new sap.m.Button({
                                text: "Kaydet",
                                icon: "sap-icon://save",
                                type: "Accept",
                                press: function () {
                                    that._oDescDialog.close();
                                    oModel.create("/MasterSchoolInformationSet", oMasterEntry, {
                                        success: function (oData, oResponse) {
                                            debugger;
                                            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                }
            }
        },
        onDomesticSavePress: function (oEvent) {
            debugger;
            var that = this
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oDomesticEntry = oViewModel.getProperty('/domesticAccount');
            if (this.byId("TabBarFinancial").getSelectedKey() === "ForeignCurrency") {
                if (!oDomesticEntry.Descp2 || oDomesticEntry.Descp2.trim() === "") {
                    if (!this._oDescDialog) {
                        this._oDescDialog = new sap.m.Dialog({
                            title: "Öğrenci Yurt içi Döviz Hesabı İçin Açıklama Girin",
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
                                                oDomesticEntry.Descp2 = sValue;
                                            },
                                            layoutData: new sap.ui.layout.GridData({
                                                span: "L12 M12 S12",
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ],
                            beginButton: new sap.m.Button({
                                text: "Kaydet",
                                icon: "sap-icon://save",
                                type: "Accept",
                                press: function () {
                                    that._oDescDialog.close();
                                    oModel.create("/ForeignCurrencyAccountSet", oDomesticEntry, {
                                        success: function (oData, oResponse) {
                                            debugger;
                                            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                }
            }
        },
        onOtherSavePress: function (oEvent) {
            debugger;
            var that = this
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oOtherEntry = oViewModel.getProperty('/otherAccount');
            if (this.byId("TabBarFinancial").getSelectedKey() === "ForeignCurrency") {
                if (!oOtherEntry.Descp2 || oOtherEntry.Descp2.trim() === "") {
                    if (!this._oDescDialog) {
                        this._oDescDialog = new sap.m.Dialog({
                            title: "Diğer Hesap Bilgileri İçin Açıklama Girin",
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
                                                oOtherEntry.Descp2 = sValue;
                                            },
                                            layoutData: new sap.ui.layout.GridData({
                                                span: "L12 M12 S12",
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ],
                            beginButton: new sap.m.Button({
                                text: "Kaydet",
                                icon: "sap-icon://save",
                                type: "Accept",
                                press: function () {
                                    that._oDescDialog.close();
                                    oModel.create("/OtherAccountInformationSet", oOtherEntry, {
                                        success: function (oData, oResponse) {
                                            debugger;
                                            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                }
            }
        },
        onStnAccountSavePress: function (oEvent) {
            debugger;
            var that = this
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oDomesticEntry = oViewModel.getProperty('/domesticEmployee');
            if (this.byId("TabBarFinancial").getSelectedKey() === "StudentAccountInfo") {
                if (!oDomesticEntry.Descp2 || oDomesticEntry.Descp2.trim() === "") {
                    if (!this._oDescDialog) {
                        this._oDescDialog = new sap.m.Dialog({
                            title: "Öğrenci Yurt içi Hesap İçin Açıklama Girin",
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
                                                oDomesticEntry.Descp2 = sValue;
                                            },
                                            layoutData: new sap.ui.layout.GridData({
                                                span: "L12 M12 S12",
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ],
                            beginButton: new sap.m.Button({
                                text: "Kaydet",
                                icon: "sap-icon://save",
                                type: "Accept",
                                press: function () {
                                    that._oDescDialog.close();
                                    oModel.create("/StudentDomesticAccountInformationSet", oDomesticEntry, {
                                        success: function (oData, oResponse) {
                                            debugger;
                                            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                }
            }
        },
        onAbroadOtherSavePress: function (oEvent) {
            debugger;
            var that = this
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oAbroadOtherEntry = oViewModel.getProperty('/abroadOtherEmployee');
            if (this.byId("TabBarFinancial").getSelectedKey() === "StudentAccountInfo") {
                if (!oAbroadOtherEntry.Descp2 || oAbroadOtherEntry.Descp2.trim() === "") {
                    if (!this._oDescDialog) {
                        this._oDescDialog = new sap.m.Dialog({
                            title: "Öğrenci Yurt Dışı Hesap İçin Açıklama Girin",
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
                                                oAbroadOtherEntry.Descp2 = sValue;
                                            },
                                            layoutData: new sap.ui.layout.GridData({
                                                span: "L12 M12 S12",
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
                            ],
                            beginButton: new sap.m.Button({
                                text: "Kaydet",
                                icon: "sap-icon://save",
                                type: "Accept",
                                press: function () {
                                    that._oDescDialog.close();
                                    oModel.create("/AbroadOtherAccountInformationSet", oAbroadOtherEntry, {
                                        success: function (oData, oResponse) {
                                            debugger;
                                            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
                                        },
                                        error: function () {
                                            debugger;
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                }
            }
        },
        onMasterButtonPress: function () {
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
        onAttachmentPaymentUploadPress: function (oEvent) {
            debugger;
            var oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            var oFileUploader = sap.ui.getCore().byId("idAttachmentFileUploaderPayment");

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


            var oCurrentDocParams = oViewModel.getProperty('/expendInfoDialogRequest');
            var sPath = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/GeneralExpenditureAttachmentSet(Pernr='" + sPernr + "',Payno='" + oCurrentDocParams.Payno + "',Ptype='LMSABR',Dotyp='3')/PersonnelAttachmentSet";
            oFileUploader.setUploadUrl(sPath);

            this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
            oFileUploader.upload();
            sap.m.MessageToast.show("Başarılı");
            this._closeBusyFragment("ATTACHMENT_UPLOADED");
        },

        // onGuarantorButtonPress: function (oEvent) {
        //     debugger;
        //     var that = this;
        //     var oModel = this.getModel();
        //     var oViewModel = this.getView().getModel("requestListModel");
        //     this._openBusyFragment("READ_GUARANTOR_FEE", []);
        //     var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        //     if (!sPernr) {
        //         this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED", ), "E");
        //     }
        //     var aFilters = [];
        //     aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))


        //     oModel.read("/GuarantorInformationSet", {
        //         filters: aFilters,
        //         success: function (oData) {
        //             oViewModel.setProperty("/guarantorList", oData.results);
        //             that._closeBusyFragment();
        //             console.log("Kefil bilgileri dataa:", oData);
        //         },
        //         error: function () {
        //             sap.m.MessageToast.show("Diğer bilgiler de Kefil bilgileri alınamadı.");
        //         }
        //     });
        // },

        onSearchStudentPress: function (oEvent) {
            debugger;
            var that = this;
            var oModel = this.getModel();
            var sPernr = this.getView().getModel("requestListModel").getProperty("/newNumberRequest/Pernr");

            var aFilters = [];
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))
            // var sPayno = this.getView().getModel("requestListModel").getProperty("/expendInfoList/Payno");

            if (!sPernr) {
                this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "W");
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
            )
            // Genel harcama bilgileri al
            var sGeneralExpenditurePath = "/GeneralExpenditureInformationSet";
            readDataList(
                sGeneralExpenditurePath,
                "/expendInfoList",
                "Genel harcama bilgileri alınamadı"
            )
            // Öğrenci bilgileri al
            var sScholarshipPath = oModel.createKey("/ScholarShipstudentAbroadSet", { Pernr: sPernr });
            readData(sScholarshipPath, "/selectedEmployee", "Öğrenci bilgisi alınamadı.");

            // Genel bilgileri al
            var sGeneralInfoPath = oModel.createKey("/GeneralInformationSet", { Pernr: sPernr });
            readData(sGeneralInfoPath, "/generalEmployee", "Genel bilgiler alınamadı.");

            // Okul bilgilerini al
            var sSchoolInfoPath = oModel.createKey("/SchoolInformationSet", { Pernr: sPernr });
            readData(sSchoolInfoPath, "/schoolEmployee", "Okul bilgileri alınamadı.");

            // Mali / Yurtiçi Dil bilgileri al
            var sLanguageSchoolInfoPath = oModel.createKey("/DomesticLanguageSchoolInformationSet", { Pernr: sPernr, Partner: "PARTNER01" });
            readData(sLanguageSchoolInfoPath, "/financialEmployee", "Dil okul bilgileri alınamadı.");

            // Mali / YurtDışı Dil bilgileri al
            var sAbroadInfoPath = oModel.createKey("/LanguageSchoolAbroadSet", { Pernr: sPernr, Partner: "PARTNER01" });
            readData(sAbroadInfoPath, "/abroadEmployee", "Yurt dışı dil bilgileri alınamadı.");

            // Master Okul bilgileri al
            var sMasterInfoPath = oModel.createKey("/MasterSchoolInformationSet", { Pernr: sPernr, Partner: "PARTNER01" });
            readData(sMasterInfoPath, "/masterEmployee", "Master okul bilgileri alınamadı.");

            // Öğrenci Yurt içi Döviz Hesap bilgileri al
            var sDomesticAccountInfoPath = oModel.createKey("/ForeignCurrencyAccountSet", { Pernr: sPernr, Partner: "PARTNER01" });
            readData(sDomesticAccountInfoPath, "/domesticAccount", "Yurt içi Döviz Hesap bilgileri alınamadı.");

            // Diğer Hesap bilgileri al
            var sotherAccountInfoPath = oModel.createKey("/OtherAccountInformationSet", { Pernr: sPernr, Partner: "PARTNER01" });
            readData(sotherAccountInfoPath, "/otherAccount", "Diğer Hesap bilgileri alınamadı.");

            // Okul Ücret bilgileri al BAK
            // var sSchoolWageInfoPath = oModel.createKey("/SchoolWageInformationSet", { Pernr: sPernr});
            // readData(sSchoolWageInfoPath, "/schoolFeeList", "Okul ücret bilgileri alınamadı.");

            // Genel Harcama bilgilerini al
            // var sGeneralExpendInfoPath = oModel.createKey("/GeneralExpenditureInformationSet", { Pernr: sPernr });
            // readData(sGeneralExpendInfoPath, "/expendInfoList", "Genel Harcama bilgileri alınamadı.");

            // Öğrenci Yurt içi Hesap bilgileri al
            var sDomesticEmployeeInfoPath = oModel.createKey("/StudentDomesticAccountInformationSet", { Pernr: sPernr, Partner: "PARTNER01" });
            readData(sDomesticEmployeeInfoPath, "/domesticEmployee", "Öğrenci Yurt içi bilgileri alınamadı.");

            // Öğrenci Yurt dışı Hesap bilgileri al
            var sAbroadOtherEmployeeInfoPath = oModel.createKey("/AbroadOtherAccountInformationSet", { Pernr: sPernr, Partner: "PARTNER01" });
            readData(sAbroadOtherEmployeeInfoPath, "/abroadOtherEmployee", "Öğrenci Yurt dışı bilgileri alınamadı.");

            // Kimlik bilgilerini al
            var sIdentityInfoPath = oModel.createKey("/IdentityInformationSet", { Pernr: sPernr });
            readData(sIdentityInfoPath, "/identityEmployee", "Kimlik bilgileri alınamadı.");

            // İletişim bilgilerini al
            var sContactInfoPath = oModel.createKey("/ContactInformationSet", { Pernr: sPernr });
            readData(sContactInfoPath, "/contactEmployee", "İletişim bilgileri alınamadı.");
            this._sweetToast(this.getText("EMPLOYEE_READ_SUCCESS"), "S");

        },

        onSave: function (oEvent) {
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var oEntry = oViewModel.getProperty('/generalEmployee');
            var oIdEntry = oViewModel.getProperty('/identityEmployee');
            var oShlEntry = oViewModel.getProperty('/schoolEmployee');

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
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
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
                                                that._sweetToast(that.getText("EDU_TASK_SAVED_SUCCESSFUL"), "S");
                                            } else if (oData.Mesty === "E") {
                                                MessageToast.show(oData.Messg || "Bir hata oluştu");
                                            }
                                        },
                                        error: function () {
                                            MessageToast.show("Veri kaydedilirken bir hata oluştu");
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oDescDialog.open();
                } else {
                    oModel.create("/GeneralInformationSet", oEntry, {
                        success: function (oData, oResponse) {
                            debugger;
                            if (oData.Mesty === "S") {
                                that._sweetToast(that.getText("EDU_TASK_SAVED_SUCCESSFUL"), "S");
                            } else if (oData.Mesty === "E") {
                                MessageToast.show(oData.Messg || "Bir hata oluştu");
                            }
                        },
                        error: function () {
                            MessageToast.show("Veri kaydedilirken bir hata oluştu");
                        }
                    });
                }
            }

            else if (this.byId("TabContainer").getSelectedKey() === "School") {
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
                                                margin: true
                                            })
                                        }).addStyleClass("sapUiTinyMarginTop")
                                    ]
                                }).addStyleClass("sapUiSmallMargin")
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
                                                that._sweetToast(that.getText("SCHOOL_INFORMATION_SAVED_SUCCESSFUL"), "S");
                                            } else if (oData.Mesty === "E") {
                                                MessageToast.show(oData.Messg || "Bir hata oluştu.");
                                            }
                                        },
                                        error: function () {
                                            MessageToast.show("Veri kaydedilirken bir hata oluştu");
                                        }
                                    });
                                }
                            }),
                            endButton: new sap.m.Button({
                                text: "İptal",
                                press: function () {
                                    that._oSchoolDescDialog.close();
                                }
                            })
                        });
                    }

                    this._oSchoolDescDialog.open();
                } else {
                    oModel.create("/SchoolInformationSet", oShlEntry, {
                        success: function (oData, oResponse) {
                            debugger;
                            if (oData.Mesty === "") {
                                that._sweetToast(that.getText("SCHOOL_INFORMATION_SAVED_SUCCESSFUL"), "S");
                            } else if (oData.Mesty === "E") {
                                MessageToast.show(oData.Messg || "Bir hata oluştu.");
                            }
                        },
                        error: function () {
                            debugger;
                        }
                    });
                }
            }

            else if (this.byId("TabContainer").getSelectedKey() === "Identity") {
                oModel.create("/IdentityInformationSet", oIdEntry, {
                    success: function (oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S" ) {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: that.getText("IDENTITY_INFORMATION_SAVED_SUCCESSFUL"),
                                showConfirmButton: false,
                                timer: 1500
                            });
                        } else if (oData.Mesty === "E") {
                            MessageToast.show(oData.Messg || "Bir hata oluştu.");
                        }
                    },
                    error: function () {
                        debugger;
                    }
                });
            }
        },

        onSchoolFeeNavigationDialog: function (oEvent) {
            debugger;
            var oSource = oEvent.getSource(),
                oViewModel = this.getModel("requestListModel")
            var schoolInfoList = oSource.getBindingContext("requestListModel").getObject();
            this._getSchoolList(schoolInfoList);
        },
        _getSchoolList: function (schoolInfoList) {
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
        onSchoolCancelButtonPress: function (oEvent) {
            if (this._oSchoolInfoDialog) {
                this._oSchoolInfoDialog.close();
            }
        },
        onExpendInfoNavigationDialog: function (oEvent) {
            debugger
            var oSource = oEvent.getSource(),
                oViewModel = this.getModel("requestListModel")
            var expendInfoList = oSource.getBindingContext("requestListModel").getObject();

            // oViewModel.setProperty("/expendInfoList", expendInfoList)
            this._getExpendList(expendInfoList);
        },
        onDeleteAttachment:function(oEvent){
            var that = this;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var sAttid = oEvent.getSource().getBindingContext("requestListModel").getObject("Attid")
            var sPath = "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')";
            var oViewModel = this.getModel("requestListModel"),
            sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            var _doDeleteAttachment = function () {
                oViewModel.setProperty("/busy", true);
                that._openBusyFragment();
                oModel.remove(sPath, {
                    success: function (oData, oResponse) {
                        if (oResponse["headers"]["message"]) {
                            that._sweetToast(that.getText("ERROR_WHILE_DELETING_DOCUMENTS"), "E");
                        } else {
                            that._sweetToast(that.getText("DOCUMENTS_WERE_SUCCESSFULLY_DELETED"), "S");
                            that._getAttachmentList(sPernr);
                        }
                        that._closeBusyFragment();
                        oViewModel.setProperty("/busy", false);
                    },
                    error: function (oError) {
                        that._closeBusyFragment();
                    }
                });
            };
            var oBeginButtonProp = {
                text: this.getText("DELETE_ACTION"),
                type: "Reject",
                icon: "sap-icon://delete",
                onPressed: _doDeleteAttachment

            };
            this._callConfirmDialog(this.getText("CONFIRMATION_REQUIRED"), "Message", "Warning", this.getText("CONFIRM_DELETION"),
                oBeginButtonProp, null).open();
        },
        onAttachDownload: function (oEvent) {
            var sAttid = oEvent.getSource().getBindingContext("requestListModel").getObject("Attid")
            var oModel = this.getModel();
            var oUrlPath = oModel.sServiceUrl + "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')/$value";
            window.open(oUrlPath);
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
        onSendExpendButtonPress: function (oEvent) {
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
                    this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
                    this._closeBusyFragment();
                }.bind(this),
                error: function (oError) {
                    debugger;
                }.bind(this)
            });
        },
        onSendSchoolFeeButtonPress: function (oEvent) {
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
                    this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
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
        onExpendInfoAddDialog: function () {

            this.clearFormDialog();
            if (!this._oExpendInfoDialog) {
                this._oExpendInfoDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.ExpendInfoNavigationDialog", this);
                this.getView().addDependent(this._oExpendInfoDialog);
            } else {
                this._oExpendInfoDialog.close();
            }
            this._oExpendInfoDialog.open();
        },
        onSchollInfoAddDialog: function () {
            var oViewModel = this.getModel("requestListModel");
            oViewModel.setProperty("/schoolInfoDialogRequest", {});
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
            delete oRequets.Kostl

            oModel.create("/GeneralExpenditureInformationSet", oRequets, {
                success: function (oData, oResponse) {
                    that.onAttachmentPaymentUploadPress();
                    that._sweetToast(that.getText("SAVE_SUCCESSFUL"), "S");
                    that._oExpendInfoDialog.close();
                    that.clearFormDialog();
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    this._sweetToast(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                }.bind(this)
            });
        },
        onSaveSchoolDialogButtonPress: function (oEvent) {
            var that = this;
            var oModel = this.getModel(),
                oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            var oSchoolRequets = oViewModel.getProperty("/schoolInfoDialogRequest");
            oSchoolRequets.Pernr = sPernr

            oModel.create("/SchoolWageInformationSet", oSchoolRequets, {
                success: function (oData, oResponse) {
                    that._sweetToast(that.getText("SAVE_SUCCESSFUL"), "S");
                    that._oExpendInfoDialog.close();
                    that.clearFormDialog();
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    this._sweetToast(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                }.bind(this)
            });
        },
        onAttachmentUploadComplete: function (oEvent) {
            var oFileUploader = sap.ui.getCore().byId("idAttachmentFileUploader");
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
                title: this.getText("FILE_SIZE_EXCEEDED", [oEvent.getSource().getMaximumFileSize()]),
                showConfirmButton: false,
                timer: 2500
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
        openGuarantorDialog: function (oEvent) {
            debugger;
            var oSource = oEvent.getSource(),
            oObject = oSource.getBindingContext("requestListModel").getObject();
            var oViewModel = this.getModel("requestListModel"),
            sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            // var eGuarantorInfoList = oSource.getBindingContext("requestListModel").getObject();
            this._getGuarantorList(sPernr,oObject.Sirno);
           
        },
        onSaveGuarantorContact: function () {
            var oModel = this.getModel(),
                oViewModel = this.getModel("requestListModel");
            // sEntitySet = "/GuarantorInformationSet";
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            var oSchoolRequets = oViewModel.getProperty("/guarantorContactList");
            oSchoolRequets.Pernr = sPernr,
                oSchoolRequets.Sirno = "01"

            oModel.create("/GuarantorInformationSet", oSchoolRequets, {
                success: function (oData, oResponse) {
                    that._sweetToast(that.getText("SAVE_SUCCESSFUL"), "S");
                    // that._oExpendInfoDialog.close();
                    that.clearFormDialog();
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    this._sweetToast(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                }.bind(this)
            });
        },
        _getGuarantorList: function (sPernr,sSirno) {
            debugger;
            var that = this;
            var sServiceUrl = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/";
            var oModel = this.getModel(sServiceUrl);
            var aFilters = [];
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr", sPernr);
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Ptype", FilterOperator.EQ, 'LMSABR'));
            aFilters.push(new Filter("Dotyp", FilterOperator.EQ, '1'));
            aFilters.push(new Filter("Sirno", FilterOperator.EQ, sSirno));

            oModel.read("/PersonnelAttachmentSet", {
                filters: aFilters,
                success: (oData, oResponse) => {
                    debugger;
                    that.getModel("requestListModel").setProperty("/attachmentGuarantorList", oData.results);
                    if (!that._oGuarantorDialog) {
                        that._oGuarantorDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorDocumentDialog", that);
                        that.getView().addDependent(that._oGuarantorDialog);
                    } else {
                        that._oGuarantorDialog.close();
                    }
                    that._oGuarantorDialog.open();
                },
                error: (oError) => {
                    that.getModel("requestListModel").setProperty("/busy", false);
                }
            });
        },
        onSaveAddGuarantorDialog:function(oEvent){
            debugger;
            var that = this;
            var oModel = this.getModel(),
            oViewModel = this.getModel("requestListModel");
            var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
            var sSirno = oViewModel.getProperty("/addGuarantorRequest/Sirno");
            var oRequets = oViewModel.getProperty("/addGuarantorRequest");
            oRequets.Pernr = sPernr,
            oRequets.Sirno = sSirno

            oModel.create("/GuarantorInformationSet", oRequets, {
                success: function (oData, oResponse) {
                    // that.onAttachmentPaymentUploadPress();
                    that._sweetToast(that.getText("SAVE_SUCCESSFUL"), "S");
                    // that._oExpendInfoDialog.close();
                    that.clearFormDialog();
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    this._sweetToast(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                }.bind(this)
            });
        },
        onAddGuarantorCancelDialog:function(oEvent){
            if (this._oAddGuarantorDialog) {
                this._oAddGuarantorDialog.close();
            }
        },
        onAddGuarantor: function () {
            debugger;
            if (!this._oAddGuarantorDialog) {
                this._oAddGuarantorDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.AddGuarantorDialog", this);
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

            var oCurrentDocParams = oViewModel.getProperty('/documentList');
            var sEntty = oModel.createKey('/GuarantorAttachmentOperationSet', {
                Pernr: sPernr,
                Firdt: oCurrentDocParams.Firdt,
                Sirno: '01',//Sıra no tablodaki sıra no alanından alınmalı
                Ptype: 'LMSABR',
                Dotyp: '1',
                Docnm: oCurrentDocParams.Docnm,
                Doctp: oCurrentDocParams.Doctp,
                Descp: oCurrentDocParams.Descp,
                Firdt: oCurrentDocParams.Firdt,
                Lasdt: oCurrentDocParams.Lasdt
            });
            var sPath = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV" + sEntty + '/PersonnelAttachmentSet';
            //var sPath = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/GuarantorAttachmentOperationSet(Pernr='"+sPernr+"',Sirno='01',Ptype='LMSABR',Dotyp='1',Docnm='"+oCurrentDocParams.Docnm+"',Doctp='"+oCurrentDocParams.Doctp+"',Descp='"+oCurrentDocParams.Descp+"',Firdt=datetime'2024-11-11T08%3A37%3A34.221',Lasdt=datetime'2024-11-11T08%3A37%3A34.221')/PersonnelAttachmentSet";


            oFileUploader.setUploadUrl(sPath);

            this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
            oFileUploader.upload();
        },
        onSchoolFeeNavigationDialog: function (oEvent) {
            debugger;
            var oSource = oEvent.getSource(),
                oViewModel = this.getModel("requestListModel")
            var schoolInfoList = oSource.getBindingContext("requestListModel").getObject();
            this._getSchoolList(schoolInfoList);
        },
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

        openGuarantorContactDialog:function(oEvent){
            debugger;
            var oSource = oEvent.getSource(),
            oViewModel = this.getModel("requestListModel"),
            sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
            oObject = oSource.getBindingContext("requestListModel").getObject();
            this._getGuarantorContactList(oObject);
         },
        
         _getGuarantorContactList:function(oObject){
            debugger;
            var that = this;
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestListModel");
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
                    that.getModel("requestListModel").setProperty("/guarantorContactList", oData);
                    // that.getModel("requestListModel").setProperty("/guarantorContactList", oData);
                    if (!that._oGuarantorContactDialog) {
                        that._oGuarantorContactDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorContactDialog", that);
                        that.getView().addDependent(that._oGuarantorContactDialog);
                    } else {
                        that._oGuarantorContactDialog.close();
                    }
                    that._oGuarantorContactDialog.open();
                },
                error: (oError) => {
                    that._closeBusyFragment();
                    that.getModel("abrAccountListModel").setProperty("/busy", false);
                }
            });
         },

        onAttachDownload: function (oEvent) {
            var sAttid = oEvent.getSource().getBindingContext("requestListModel").getObject("Attid")
            var oModel = this.getModel();
            var oUrlPath = oModel.sServiceUrl + "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')/$value";
            window.open(oUrlPath);
        },
        onEditPress: function () {
            var oViewModel = this.getModel("requestListModel"),
                sVisible = oViewModel.getProperty("/suggestionActionData/priorityEditable");
            if (!sVisible) {
                oViewModel.setProperty("/suggestionActionData/priorityEditable", true);
                oViewModel.setProperty("/suggestionActionData/priorityDisplay", false);
            } else {
                oViewModel.setProperty("/suggestionActionData/priorityEditable", false);
                oViewModel.setProperty("/suggestionActionData/priorityDisplay", true);
            }
        },

        openGuarantorIdentityDialog:function(oEvent){
            var oViewModel = this.getModel("requestListModel"),
                 sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
                 oSource = oEvent.getSource(),
                 oObject = oSource.getBindingContext("requestListModel").getObject();
                 oViewModel.setProperty("/guarantorIdentityList", oObject);
            // this._getGuarantorIdentityList(sPernr,oObject.Sirno);
            if (!this._oGuarantorIdentityDialog) {
                this._oGuarantorIdentityDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.GuarantorIdentityDialog", this);
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
            oRequets.Pernr = sPernr
            oRequets.Sirno = "01"
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
                }.bind(this)
            });

        },

        onShowPersonSearchHelp: function (oEvent) {
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
                if (sVal) {
                    var oFilterElement = new Filter(aKeys[i], FilterOperator.EQ, sVal);
                    aFilters.push(oFilterElement);
                }
            }
            return aFilters;
        },
        _getRequestList: function (oEvent) {

        },
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
                this._oUnitSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrTracking.UnitSearchHelpDialog", this);
                this.getView().addDependent(this._oUnitSearchHelpDialog);
            } else {
                this._oUnitSearchHelpDialog.close();
            }
            this._oUnitSearchHelpDialog.open();
        },
        onUnitSelected: function (oEvent) {
            debugger;
            var oSelectedUnitItem = oEvent.getSource().getBindingContext().getObject();

            var oViewModel = this.getModel('requestListModel');
            oViewModel.setProperty("/selectedEmployee/Unicd", oSelectedUnitItem.Orgeh);
            oViewModel.setProperty("/selectedEmployee/Orgtx", oSelectedUnitItem.Orgtx);

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
            var oEntry = oViewModel.getProperty('/generalEmployee');

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