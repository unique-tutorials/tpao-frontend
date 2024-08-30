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

    return BaseController.extend("zhcm_ux_lms_abr.controller.TrainerPool", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "trainerPoolModel");
            this._initiateModel();
            this.getRouter().getRoute("trainerpool").attachPatternMatched(this._onTrainerPoolMatched, this);
        },
        _onTrainerPoolMatched: function (oEvent) {
            var sSearch;
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var aIntraAction = oViewModel.getProperty("/intraActions");
            oViewModel.setProperty("/trainerActionSet", aIntraAction);
            this._getInternalTrainer(sSearch);


        },
        _initiateModel: function () {
            var oViewModel = this.getModel("trainerPoolModel");
            oViewModel.setData({
                selectedKey: "INT",
                sSelectedF4: "LAND1",
                internalTrainerSet: [],
                externalTrainerSet: [],
                valueHelpEmployeeSet: [],
                currentExternalTrainer: {},
                valueHelpSet: [],
                extraEditable: true,
                trainerActionSet: [],
                extraActions: [{
                    Text: "EDIT_ACTION",
                    Icon: "sap-icon://edit",
                    Action: "Edit",
                    Type: "Emphasized"
                }, {
                    Text: "DISPLAY_ACTION",
                    Icon: "sap-icon://display",
                    Action: "Display",
                    Type: "Emphasized"
                }, {
                    Text: "DELETE_ACTION",
                    Icon: "sap-icon://delete",
                    Action: "Delete",
                    Type: "Reject"
                }, {
                    Text: "TRAINER_PRINT_ACTION",
                    Icon: "sap-icon://pdf-attachment",
                    Action: "PrintOut",
                    Type: "Default"
                }],
                intraActions: [{
                    Text: "DELETE_ACTION",
                    Icon: "sap-icon://delete",
                    Action: "Delete",
                    Type: "Reject"
                }, {
                    Text: "TRAINER_PRINT_ACTION",
                    Icon: "sap-icon://pdf-attachment",
                    Action: "PrintOut",
                    Type: "Default"
                }],
            });
        },
        _getInternalTrainer: function (sSearch) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var aFilters = [];
            var sPath = "/InternalTrainerSet";
            var that = this;
            this._openBusyFragment("INTRA_DATA_BEING_FETCHED", []);
            oModel.read(sPath, {
                filters: aFilters,
                success: function (oData, oResponse) {
                    oViewModel.setProperty("/internalTrainerSet", _.cloneDeep(oData.results));
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    that._closeBusyFragment();
                }
            });
        },
        _getExternalTrainer: function (sSearch) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var aFilters = [];
            var sPath = "/ExternalTrainerSet";
            var that = this;
            this._openBusyFragment("EXTRA_DATA_BEING_FETCHED", []);
            oModel.read(sPath, {
                filters: aFilters,
                success: function (oData, oResponse) {
                    oViewModel.setProperty("/externalTrainerSet", _.cloneDeep(oData.results));
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    that._closeBusyFragment();
                }
            });
        },
        onIconFilterSelect: function (oEvent) {
            var sSearch;
            var sKey = oEvent.getParameter("key");
            if (sKey === 'INT') {
                this._getInternalTrainer(sSearch);
            } else if (sKey === 'EXT') {
                this._getExternalTrainer(sSearch);
            }
        },
        onNewInternalTrainer: function (oEvent) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var sPath = "/EmployeeSearchSet";
            var aFilters = [];
            var that = this;
            oViewModel.setProperty("/extraEditable", true);
            oViewModel.setProperty("/currentExternalTrainer", {});
            aFilters.push(new Filter("Srhtp", FilterOperator.EQ, "INTRA"));
            this._openBusyFragment("EMPLOYEE_DATA_BEING_FETCHED", []);
            oModel.read(sPath, {
                filters: aFilters,
                success: function (oData, oResponse) {
                    oViewModel.setProperty("/valueHelpEmployeeSet", _.cloneDeep(oData.results));
                    that._closeBusyFragment();
                    that._openEmployeeValueHelpDialog();
                },
                error: function (oError) {
                    that._closeBusyFragment();
                }
            });
        },
        onNewExternalTrainer: function (oEvent) {
            if (!this._oExtraOperationDialog) {
                this._oExtraOperationDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.ExternalTrainerOperationDialog", this);
                this.getView().addDependent(this._oExtraOperationDialog);
            }
            this._oExtraOperationDialog.open();
        },
        _openEmployeeValueHelpDialog: function () {
            if (!this._oIntraValueHelpDialog) {
                this._oIntraValueHelpDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.IntraValueHelpDialog", this);
                this.getView().addDependent(this._oIntraValueHelpDialog);
            }
            this._oIntraValueHelpDialog.open();
        },
        onCancelAddIntraDialog: function () {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var oTable = this._oIntraValueHelpDialog.getAggregation('content')[0];
            oTable.removeSelections();
            oViewModel.setProperty("/valueHelpEmployeeSet", []);
            this._oIntraValueHelpDialog.close();
        },
        onAddIntra: function () {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var oTable = this._oIntraValueHelpDialog.getAggregation('content')[0];
            var oSelectedItem = oTable.getSelectedItem();
            var sSearch;
            var oCurrentRequest = {};
            var that = this;

            this._openBusyFragment("SAVING_INTRA", []);
            var oItem = oSelectedItem.getBindingContext('trainerPoolModel').getObject();
            oCurrentRequest.Pernr = oItem.Pernr;
            oModel.create("/InternalTrainerSet", oCurrentRequest, {
                success: function (oData, oResponse) {
                    that.alertMessage("S", "MESSAGE_SUCCESSFUL", "SAVE_INTRA_SUCCESSFUL", []);
                    that._getInternalTrainer(sSearch);
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    that._closeBusyFragment();
                },

            });

            oTable.removeSelections();
            oViewModel.setProperty("/valueHelpEmployeeSet", []);
            this._oIntraValueHelpDialog.close();

        },
        onSaveExternalTrainer: function () {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var oCurrentExtra = oViewModel.getProperty("/currentExternalTrainer");
            var that = this;
            this._openBusyFragment("SAVING_EXTRA", []);
            oModel.create("/ExternalTrainerSet", oCurrentExtra, {
                success: function (oData, oResponse) {
                    that.alertMessage("S", "MESSAGE_SUCCESSFUL", "SAVE_EXTRA_SUCCESSFUL", []);
                    that._getExternalTrainer(sSearch);
                    that._closeBusyFragment();
                },
                error: function (oError) {
                    that._closeBusyFragment();
                },

            });

        },
        onValueHelpRequest: function (oEvent) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var that = this;
            var aFilters = [];
            var sId = oEvent.getSource().data().inputId;
            oViewModel.setProperty("/valueHelpSet", []);
            oViewModel.setProperty("/sSelectedF4", sId);
            aFilters.push(new Filter("Vhtyp", FilterOperator.EQ, sId));
            this._openBusyFragment("READING_DATA", []);
            oModel.read("/ValueHelpSet", {
                filters: aFilters,
                success: function (oData, oResponse) {
                    that._closeBusyFragment();
                    oViewModel.setProperty("/valueHelpSet", oData.results);
                    that._openGenericValueHelpDialog();
                },
                error: function (oError) {
                    that._closeBusyFragment();
                }
            });
        },
        _openGenericValueHelpDialog: function () {
            if (!this._oGenericValueHelpDialog) {
                this._oGenericValueHelpDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.GenericValueHelpDialog", this);
                this.getView().addDependent(this._oGenericValueHelpDialog);
            }
            this._oGenericValueHelpDialog.open();
        },
        onCancelGenericValueHelpDialog: function () {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var oTable = this._oGenericValueHelpDialog.getAggregation('content')[0];
            oTable.removeSelections();
            this._oGenericValueHelpDialog.close();
            oViewModel.setProperty("/valueHelpSet", []);

        },
        onGenericValueHelpSelection: function () {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var sSelectedF4 = oViewModel.getProperty("/sSelectedF4");
            var oTable = this._oGenericValueHelpDialog.getAggregation('content')[0];
            var oItem = oTable.getSelectedItem().getBindingContext('trainerPoolModel').getObject();
            if (sSelectedF4 === "LAND1") {
                oViewModel.setProperty("/currentExternalTrainer/Land1", oItem.Vhkey);
                oViewModel.setProperty("/currentExternalTrainer/Landx", oItem.Vhval);
            }
            else if (sSelectedF4 === "BUKRS") {
                oViewModel.setProperty("/currentExternalTrainer/Bukrs", oItem.Vhkey);
                oViewModel.setProperty("/currentExternalTrainer/Butxt", oItem.Vhval);
            }
            this._oGenericValueHelpDialog.close();
            oTable.removeSelections();
            oViewModel.setProperty("/valueHelpSet", []);
            oViewModel.setProperty("/sSelectedF4", "");
        },
        onInternalTrainerActions: function (oEvent) {
            var oViewModel = this.getModel("trainerPoolModel");
            var oSource = oEvent.getSource();
            var oData = oViewModel.getProperty(oSource.getParent().getBindingContextPath());
            var aIntraAction = oViewModel.getProperty("/intraActions");
            oViewModel.setProperty("/trainerActionSet", aIntraAction);

            if (!this._oTrainerActionDialog) {
                this._oTrainerActionDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.TrainerActions", this);
                this.getView().addDependent(this._oTrainerActionDialog);
            }
            this._oTrainerActionDialog.data("formData", oData);
            this._oTrainerActionDialog.openBy(oSource);
        },
        onExternalTrainerActions: function (oEvent) {
            var oViewModel = this.getModel("trainerPoolModel");
            var oSource = oEvent.getSource();
            var oData = oViewModel.getProperty(oSource.getParent().getBindingContextPath());
            var aExtraAction = oViewModel.getProperty("/extraActions");
            oViewModel.setProperty("/trainerActionSet", aExtraAction);

            if (!this._oTrainerActionDialog) {
                this._oTrainerActionDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.TrainerActions", this);
                this.getView().addDependent(this._oTrainerActionDialog);
            }
            this._oTrainerActionDialog.data("formData", oData);
            this._oTrainerActionDialog.openBy(oSource);
        },
        onGetText: function (sTextCode) {
            return this.getText(sTextCode);
        },
        onTrainerActionSelected: function (oEvent) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("trainerPoolModel");
            var oSource = oEvent.getSource();
            var sAction = oSource.data("actionId");
            var oFormData = oSource.getParent().data("formData");
            var sSelectedKey = oViewModel.getProperty("/selectedKey");
            var oThis = this;
            var oBeginButtonProp = {};
            var oApplicationSettings = {};
            switch (sAction) {
                case "Delete":
                    var _deleteConfirmed = function () {
                        if (sSelectedKey === "INT") {
                            oThis._deleteIntra(oFormData.Pernr);
                        }
                        else {
                            oThis._deleteExtra(oFormData.Objid);
                        }

                    };
                    oBeginButtonProp = {
                        text: this.getText("DELETE_ACTION"),
                        type: "Reject",
                        icon: "sap-icon://delete",
                        onPressed: _deleteConfirmed
                    };

                    this._callConfirmDialog(this.getText("CONFIRMATION_REQUIRED"), "Message", "Warning", this.getText("TRAINER_DELETE_CONFIRMATION"),
                        oBeginButtonProp, null).open();
                    break;
                case "Display":
                    oViewModel.setProperty("/currentExternalTrainer", oFormData);
                    oViewModel.setProperty("/extraEditable", false);
                    this.onNewExternalTrainer(oEvent);
                    break;
                case "Edit":
                    oViewModel.setProperty("/currentExternalTrainer", oFormData);
                    oViewModel.setProperty("/extraEditable", true);
                    this.onNewExternalTrainer(oEvent);
                    break;
            }

        },
        _deleteIntra: function (sPernr) {
            var oModel = this.getModel();
            var that = this;
            var sSearch;
            var sPath = oModel.createKey("/InternalTrainerSet", {
                Pernr: sPernr
            });
            this._openBusyFragment("INTRA_BEING_DELETED");
            oModel.remove(sPath, {
                success: function () {
                    that._closeBusyFragment();
                    that._getInternalTrainer(sSearch);
                    that._callMessageToast(that.getText("INTRA_DELETE_SUCCESSFUL"), "S");
                    oModel.refresh();
                },
                error: function () {
                    that._closeBusyFragment();
                }
            });
        },
        _deleteExtra: function (sPernr) {
            var oModel = this.getModel();
            var that = this;
            var sSearch;
            var sPath = oModel.createKey("/ExternalTrainerSet", {
                Objid: sPernr
            });
            this._openBusyFragment("EXTRA_BEING_DELETED");
            oModel.remove(sPath, {
                success: function () {
                    that._closeBusyFragment();
                    that._getExternalTrainer(sSearch);
                    that._callMessageToast(that.getText("EXTRA_DELETE_SUCCESSFUL"), "S");
                    oModel.refresh();
                },
                error: function () {
                    that._closeBusyFragment();
                }
            });
        },
    });
});