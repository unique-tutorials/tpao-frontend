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

    return BaseController.extend("zhcm_ux_lms_abr.controller.AbrFileUpload", {
      formatter: formatter,
      onInit: function () {
        var oViewModel = new JSONModel();
        this.setModel(oViewModel, "wageRequestListModel");
        this._initiateModel();
        this.getRouter()
          .getRoute("AbrFileUpload")
          .attachPatternMatched(this._onRequestListMatched, this);
      },
      _onRequestListMatched: function (oEvent) {
        this._getRequestList();
      },
      _initiateModel: function () {
        var oViewModel = this.getModel("wageRequestListModel");
        oViewModel.setData({
          requestList: [],
          selectedRequest: {},
          currentRequest: {},
          wageSearchRequest: {},
          salaryCreateList: {},
          request: {
            isSent: false,
          },
          aplicationSetting: {
            enabled: false,
          },
          isAccountVisibless: false,
          isAccountVisible: true,
          isSellerVisible: false,
        });
      },
      onNavBack: function () {
        var oModel = this.getView().getModel("wageRequestListModel");
        var aPaths = [];
        aPaths.forEach(function (sPath) {
          oModel.setProperty(sPath, {});
        });
        this.getRouter().navTo("appdispatcher", {}, true);
      },
      _getRequestList: function () {},
      onShowWageSearchHelp: function (oEvent) {
        if (!this._oNewWageSearchHelpDialog) {
          this._oNewWageSearchHelpDialog = new sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrFileUpload.WageSearchHelpDialog",
            this
          );
          this.getView().addDependent(this._oNewWageSearchHelpDialog);
        }
        this._oNewWageSearchHelpDialog.open();
      },
      onCancelWageButtonPress: function (oEvent) {
        if (this._oNewWageSearchHelpDialog) {
          this._oNewWageSearchHelpDialog.close();
        }
      },

      onSearch: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("wageRequestListModel");
        var oFilter = oViewModel.getProperty("/wageSearchRequest");

        // var sDateValue = oFilter.Wagpe;
        // if (sDateValue) {

        //     var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM-y" }).parse(sDateValue);
        //     var sFormattedDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyymm" }).format(dateFormat);
        //     oFilter.Wagpe = sFormattedDate;
        // }

        oFilter.Prope = "1";

        var aFilters = this._getFilters(oFilter);

        var oTable =
          this.getView().byId("idSalariesSetTable") ||
          sap.ui.getCore().byId("idSalariesSetTable");
        oTable.getBinding("items").filter(aFilters, "Application");
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
      onSendSalariesButtonPress: function (oFormData) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("wageRequestListModel");
        // oViewModel = this.getModel("requestListModel")
        // var salaryInfoList = oSource.getBindingContext().getObject();
        var oUrlParameters = {
          Pernr: oFormData.Pernr,
          Wagpe: oFormData.Wagpe,
          Totwg: oFormData.Totwg,
          Waers: oFormData.Waers,
          Wacst: oFormData.Wacst,
          Paytt: oFormData.Paytt,
          // "Consa": salaryInfoList.Consa,
        };

        this._openBusyFragment("PLEASE_WAIT", []);
        oModel.callFunction("/SentSalary", {
          method: "POST",
          urlParameters: oUrlParameters,
          success: function (oData, oResponse) {
            // that.getModel("wageRequestListModel").setProperty("/expendInfoList");
            this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
            this._closeBusyFragment();
          }.bind(this),
          error: function (oError) {
            debugger;
          }.bind(this),
        });
      },
      // onSalariesCreateDialog:function(oEvent){
      //     var oViewModel = this.getModel("wageRequestListModel"),
      //     // sPernr = oViewModel.getProperty("/newNumberRequest/Pernr"),
      //     oSource = oEvent.getSource(),
      //     oObject = oSource.getBindingContext("wageRequestListModel").getObject();
      //     oViewModel.setProperty("/salaryCreateList", oObject);
      //     debugger;
      //     if (!this._oSalariesCreateDialog) {
      // 		this._oSalariesCreateDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrFileUpload.SalariesCreateDialog", this);
      // 		this.getView().addDependent(this._oSalariesCreateDialog);
      // 	}
      // 	this._oSalariesCreateDialog.open();
      // },
      onSalariesCreateDialog: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("wageRequestListModel");
        oViewModel.setProperty("/aplicationSetting/enabled", true);
        oViewModel.setProperty("/salaryCreateList", {});
        if (!this._oSalariesCreateDialog) {
          this._oSalariesCreateDialog = sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrFileUpload.SalariesCreateDialog",
            this
          );
          this.getView().addDependent(this._oSalariesCreateDialog);
        } else {
          this._oSalariesCreateDialog.close();
        }
        this._oSalariesCreateDialog.open();
      },
      onCancelSalaryButtonPress: function () {
        if (this._oSalariesCreateDialog) {
          this._oSalariesCreateDialog.close();
        }
      },
      clearFormDialog: function () {
        var oViewModel = this.getModel("wageRequestListModel");
        oViewModel.setProperty("/salaryCreateList", {});
      },
      onSaveSalaryButtonPress: function () {
        debugger;
        var that = this;
        var oModel = this.getModel(),
          oViewModel = this.getModel("wageRequestListModel");
        // var sPernr = oViewModel.getProperty("/newNumberRequest/Pernr");
        // var sPrope = "2";
        var sWagpe = oViewModel.getProperty("/salaryCreateList/Wagpe");
        var oRequets = oViewModel.getProperty("/salaryCreateList");

        var sPernr = oViewModel.getProperty("/salaryCreateList/Pernr");
        (oRequets.Pernr = sPernr),
          // oRequets.Prope = "2",
          (oRequets.Wagpe = sWagpe);

        oModel.create("/StudentSalariesSet", oRequets, {
          success: function (oData, oResponse) {
            // that.onAttachmentPaymentUploadPress();
            that._sweetToast(that.getText("SAVED_SUCCESSFULLY"), "S");
            that._oSalariesCreateDialog.close();
            that.clearFormDialog();
            that._closeBusyFragment();
          },
          error: function (oError) {
            this._sweetToast(this.getText("SAVE_ERROR"), "E");
            this._closeBusyFragment();
          }.bind(this),
        });
      },
      onSearchSalariesButton: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("wageRequestListModel");
        var oFilter = oViewModel.getProperty("/wageSearchRequest");

        // var sDateValue = oFilter.Wagpe;
        // if (sDateValue) {

        //     var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MM-y" }).parse(sDateValue);
        //     var sFormattedDate = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyymm" }).format(dateFormat);
        //     oFilter.Wagpe = sFormattedDate;
        // }

        oFilter.Prope = "";

        var aFilters = this._getFilters(oFilter);

        var oTable =
          this.getView().byId("idSalariesSetTable") ||
          sap.ui.getCore().byId("idSalariesSetTable");
        oTable.getBinding("items").filter(aFilters, "Application");
      },
      onSalariesActions: function (oEvent) {
        debugger;
        var oViewModel = this.getModel("wageRequestListModel");
        var oSource = oEvent.getSource();
        var oData = oSource
          .getBindingContext()
          .getObject();

        oViewModel.setProperty("/request/isSent", oData.Sent ? true : false);
        if (!this._oSalariesActionDialog) {
          this._oSalariesActionDialog = new sap.ui.xmlfragment(
            "zhcm_ux_lms_abr.fragment.AbrFileUpload.SalariesActions",
            this
          );
          this.getView().addDependent(this._oSalariesActionDialog);
        }
        this._oSalariesActionDialog.data("formData", oData);
        this._oSalariesActionDialog.openBy(oSource);
      },
      onActionSelected: function (oEvent) {
        debugger;
        var oModel = this.getModel(),
          oViewModel = this.getModel("wageRequestListModel"),
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
            var oViewModel = this.getModel("wageRequestListModel");
            switch (sAction) {
              case "Send":
                debugger;
                Swal.fire({
                  title: this.getText("ARE_YOU_SURE"),
                  text: this.getText("YOU_WONT_BE_ABLE_TO_REVERT_THIS"),
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: this.getText("YES"),
                  cancelButtonText: this.getText("NO"),
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.onSendSalariesButtonPress(oFormData);
                  }
                });
                break;
              case "Display":
                this.onSalariesCreateDialog();
                oViewModel.setProperty("/aplicationSetting/enabled", false);
                oViewModel.setProperty("/salaryCreateList", oFormData);
                oViewModel.setProperty("/busy", true);
                break;

              case "Edit":
                this.onSalariesCreateDialog();
                // oViewModel.setProperty("/aplicationSetting/enabled", true);

                oViewModel.setProperty("/salaryCreateList", oFormData);
                oViewModel.setProperty("/busy", true);
                break;
              default:
            }
            resolve();
          }.bind(this)
        );
      },
      onWageTypeChange: function(oEvent){
        debugger;
        var oComboBox = oEvent.getSource(); 
        var sSelectedKey = oComboBox.getSelectedKey(); 
        var oModel = this.getView().getModel("wageRequestListModel");
        var sQuery = oComboBox.getSelectedItem().getProperty("additionalText");
        
        if (sQuery === "X") {
            oModel.setProperty("/isAccountVisible", false);
            oModel.setProperty("/isSellerVisible", true);
            oModel.setProperty("/isAccountVisibless", true);
            oModel.setProperty("/expendInfoDialogRequest/Whiac", "2");
            oModel.setProperty("/expendInfoDialogRequest/Wacst", "");
        }
        if (sQuery === "") {
          oModel.setProperty("/isAccountVisible", true);
          oModel.setProperty("/isSellerVisible", false);
          oModel.setProperty("/isAccountVisibless", false);
          oModel.setProperty("/expendInfoDialogRequest/Whiac", "2");
          oModel.setProperty("/expendInfoDialogRequest/Wacst", "");
      }
      }
    });
  }
);
