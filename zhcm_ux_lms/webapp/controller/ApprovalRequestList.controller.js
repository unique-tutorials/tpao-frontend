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
    return BaseController.extend("zhcm_ux_lms_abr.controller.ApprovalRequestList", {
        formatter: formatter,
        statusFilters: [],
        allStatusFilters: {
            Statuses: [
              {
                Status: "ALL",
                Label: "REQUEST_SEARCH_APPROVAL_LIST",
                DefaultStatus: ["ALL"],
              },
              {
                Status: "APP",
                Label: "REQUEST_SEARCH_APPROVED_LIST",
                DefaultStatus: ["APP"],
              },
            ],
            DefaultFilters: [
              new Filter("Lmsap", FilterOperator.EQ, "REQUESTS_APPROVED"),
              new Filter("Lmssf", FilterOperator.EQ, "APP"),
              // new Filter("Lmsrf", FilterOperator.EQ, "APM")
            ],
        },
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "approvalRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("ApprovalRequestList").attachPatternMatched(this._onApprovalRequestListMatched, this);
        },
        onNavBack: function () {
          // this.goBack(History);
          this.getRouter().navTo("appdispatcher", {}, true);
        },
        _onApprovalRequestListMatched: function (oEvent) {
            this.statusFilters = this.allStatusFilters.Statuses;
            var that = this;
            var timerInterval;
            Swal.fire({
              title: that.getText("DATA_IS_LOADING"),
              html: that.getText("CLOSE_LOADING"),
              timer: 1000,
              timerProgressBar: true,
              didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                  timer.textContent = `${Swal.getTimerLeft()}`;
                }, 100);
              },
              willClose: () => {
                clearInterval(timerInterval);
              },
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === Swal.DismissReason.timer) {
                console.log("I was closed by the timer");
              }
            });
            setTimeout(function () {
              that.onRefresh();
            }, 1000);
        },
        onRefresh: function () {
            var oTable = this.byId("idApprovalRequestTable");
            oTable.getBinding("items").refresh();
        },
        onUpdateFinished: function (oEvent) {
            // update the requestList's object counter after the table update
            var sTitle,
              oViewModel = this.getModel("approvalRequestListModel"),
              oIconTabBar = this.byId("idIconTabBar"),
              oModel = this.getModel();
    
            oViewModel.setProperty("/busy", false);
            // only update the counter if the length is final and
            // the table is not empty
    
            var aActiveFilter = [];
    
            aActiveFilter = _.filter(this.statusFilters, [
              "Status",
              oIconTabBar.getSelectedKey(),
            ]);
    
            if (!aActiveFilter[0]) {
              aActiveFilter = _.take(this.statusFilters, 1);
            }
    
            if (aActiveFilter[0]) {
              sTitle = this.getText(aActiveFilter[0].Label);
              this.getModel("approvalRequestListModel").setProperty(
                "/requestListTableTitle",
                sTitle
              );
            }
    
            //Refresh filter statistics async
            this._updateFilterCounts(oModel);
          },
          onUpdateStarted: function (oEvent) {
            // update the requestList's object counter after the table update
            var oViewModel = this.getModel("approvalRequestListModel");
            oViewModel.setProperty("/busy", true);
          },
          _updateFilterCounts: function (oModel) {
            var oViewModel = this.getModel("approvalRequestListModel");
            var aFilters = [];
            $.each(this.statusFilters, function (sIndex, oFilter) {
              aFilters = [
                new Filter("Lmsap", FilterOperator.EQ, "REQUESTS_ON_ME"),
                new Filter("Lmssf", FilterOperator.EQ, oFilter.Status),
              ];
              oModel.read("/ScholarshipStudentRequestSet/$count", {
                filters: aFilters,
                success: function (oData, oResponse) {
                  oViewModel.setProperty(
                    "/searchResults/" + oFilter.Status,
                    oResponse.body
                  );
                },
                error: function (oError) {
                  oViewModel.setProperty("/searchResults/" + oFilter.Status, 0);
                },
              });
            });
          },
        _initiateModel: function () {
            var oViewModel = this.getModel("approvalRequestListModel");
            oViewModel.setData({
              formActions: [],
              request: {},
              Sprad: false,
              tableNoDataText: this.getText("EMPTY_REQUEST_LIST"),
              selectedKey: "ALL",
              sKey: "ALL",
              searchResults: {
                ALL: 0,
                APP: 0,
              },
              statusFilters: [
                {
                  Lmssf: "ALL", //Tüm talepler
                  Lmssx: "Taslak",
                  Selected: false,
                },
                {
                  Lmssf: "APP", //Onayladığım talepler
                  Lmssx: "Onaylandı",
                  Selected: false,
                },
              ],
              selectedRequest: {},
              evaluationRequest: {},
              aplicationSetting: {
                enabled: true,
                visible: true,
                approveEnabled: false,
              },
              currentRequest: {},
            });
        },
        onAvailableRequestActions: function (oEvent) {
            var oSource = oEvent.getSource();
            var oData = this.getModel().getProperty(
              oSource.getParent().getBindingContextPath()
            );
            if (!oData) {
              var oData = {};
            }
            this._openRequestActions(oData, oSource);
        },

        _openRequestActions: function (oData, oSource) {
            var CurrentUser = SharedData.getCurrentUser(),
              oViewModel = this.getModel("approvalRequestListModel");
            SharedData.setCurrentRequest(oData);
            if (oData.Lmssf === "ALL" && CurrentUser.Sprad) {
              oViewModel.setProperty("/Sprad", true);
            }else{
              oViewModel.setProperty("/Sprad", false);
            }
            if (!this._requestActions) {
              this._requestActions = sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.ApprovalRequestList.ApprovalRequestActions",
                this
              );
              this.getView().addDependent(this._requestActions);
            }
            this._requestActions.data("formData", oData);
            this._requestActions.openBy(oSource);
        },
        onSetting: function (oEvent) {
            var oSource = oEvent.getSource(),
              sAction = oSource.data("Type"),
              oViewModel = this.getModel("approvalRequestListModel"),
              oData = SharedData.getCurrentRequest();
            oViewModel.setProperty("/request", oData);
            oViewModel.setProperty("/currentRequest", oData);
            switch (sAction) {
              case "Display":
                oViewModel.setProperty("/aplicationSetting/enabled", false);
                this._getFormActions(oData.Lmsid);
                this.onDisplayRequestDetail();
                break;
              case "Edit":
                oViewModel.setProperty("/aplicationSetting/enabled", true);
                this._getFormActions(oData.Lmsid);
                this.onDisplayRequestDetail();
                break;
              case "History":
                this._getFormHistory(oData);
                break;
              default:
                break;
            }
        },
        _getFormActions: function (sLmsid) {
            var oButton =
              this.byId("idFormActionsButton") ||
              sap.ui.getCore().byId("idFormActionsButton");
            var oModel = this.getModel();
            var oViewModel = this.getModel("approvalRequestListModel");
            var sPath = "/FormActionsSet";
            var oSettings = SharedData.getApplicationSettings();
            var aFilters = [];
            aFilters = [new Filter("Lmsid", FilterOperator.EQ, sLmsid)];
            // if (oButton) {
            //     oButton.setBusy(true);
            //     oButton.setVisible(false);
            //     oButton.getParent().setVisible(false);
            oViewModel.setProperty("/formActions", []);
    
            oModel.read(sPath, {
              filters: aFilters,
              method: "GET",
              success: function (oData, oResponse) {
                // oButton.setBusy(false);
                // var aActions = [];
                // aActions = oSettings.Edit
                //   ? oData.results
                //   : _.remove(oData.results, function (oLine) {
                //       return oLine.Erfbs !== "S";
                //     });
    
                // if (aActions.length > 0) {
                //   oButton.setVisible(true);
                //   oButton.getParent().setVisible(true);
                // }
                oViewModel.setProperty("/formActions", oData.results);
              },
              error: function (oError) {
                // oButton.setBusy(false);
              },
            });
            // }
        },
        _getFormHistory: function (oFormData) {
        var oModel = this.getModel();
        var oViewModel = this.getModel("approvalRequestListModel");
        oViewModel.setProperty("/formHistory", []);
        var aFilters = [];
        aFilters.push(new Filter("Lmsid", FilterOperator.EQ, oFormData.Lmsid));
        this._openBusyFragment("READ_FORM_HISTORY");
            oModel.read("/TrainingRequestHistorySet", {
                filters: aFilters,
                success: function (oData, oResponse) {
                oViewModel.setProperty("/formHistory", oData.results);
                this._closeBusyFragment();
                this._callHistoryDialog();
                }.bind(this),

                error: function (oError) {
                jQuery.sap.log.error("Form history could not be fetched");
                },
            });
        },
        onStatusChangeConfirmed: function (oEvent) {
          var that = this;
          var oViewModel = this.getModel("approvalRequestListModel");
          var oFormData = oViewModel.getProperty("/request");
          var oStatusChange = oViewModel.getProperty("/statusChangeDialog");
  
          this._statusChangeDialog.close();
          oFormData.Stcnt = oStatusChange.statusChangeNote;
          this._updateRequest(oFormData, this._sNewRequest, true);
        },
        _updateRequest: function (oFormData, sNewRequest, StatusChange) {
          var oModel = this.getModel();
          if (StatusChange) {
            this._openBusyFragment("FORM_STATUS_BEING_CHANGED");
          } else {
            this._openBusyFragment("FORM_BEING_SAVED");
          }
          if (sNewRequest) {
            oModel.create("/ScholarshipStudentRequestSet", oFormData, {
              success: function (oData, oResponse) {
                this._closeBusyFragment();
                if (StatusChange) {
                  this._sweetToast(this.getText("FORM_STATUS_CHANGE_SUCCESSFUL"), "S");
                } else {
                  this._sweetToast(this.getText("FORM_SAVE_SUCCESSFUL"), "S");
                }
                this._oRequestDisplayDialog.close();
              }.bind(this),
              error: function (oError) {
                this._closeBusyFragment();
                this._oRequestDisplayDialog.close();
              }.bind(this),
            });
          } else {
            var sPath = oModel.createKey("/ScholarshipStudentRequestSet", {
              Lmsid: oFormData.Lmsid,
            });
            oModel.update(sPath, oFormData, {
              success: function (oData, oResponse) {
                this._closeBusyFragment();
                if (StatusChange) {
                  this._sweetToast(this.getText("FORM_STATUS_CHANGE_SUCCESSFUL"), "S");
                } else {
                  this._sweetToast(this.getText("FORM_SAVE_SUCCESSFUL"), "S");
                }
                this._oRequestDisplayDialog.close();
              }.bind(this),
              error: function (oError) {
                this._closeBusyFragment();
                this._oRequestDisplayDialog.close();
              }.bind(this),
            });
          }
        },
        onStatusChangeCancelled: function (oEvent) {
          // var oViewModel = this.getModel("approvalRequestListModel");
          // var oFormData = oViewModel.getProperty("/request");
  
          // if (oFormData.Erfed.includes(',')) {
          //     oFormData.Erfed = oFormData.Erfed.split(',');
          // }
          // if (oFormData.Adpid.includes(',')) {
          //     oFormData.Adpid = oFormData.Adpid.split(',');
          // }
          // if (oFormData.Adgid.includes(',')) {
          //     oFormData.Adgid = oFormData.Adgid.split(',');
          // }
          // oViewModel.setProperty("/request", oFormData);
  
          this._statusChangeDialog.close();
        },
        onFormActionSelected: function (oEvent) {
          debugger;
          var oSource = oEvent.getSource();
          var oViewModel = this.getModel("approvalRequestListModel");
          var oFormData = oViewModel.getProperty("/request");
          var aFormActions = oViewModel.getProperty("/formActions");
          var sButtonId = oSource.data("buttonId");
          var aButtonProp = _.filter(aFormActions, {
            Lmsbt: sButtonId,
          });
          var sStatusChange = false;
          var oStatusChange = {};
  
          try {
            oFormData.Actio = aButtonProp[0].Lmsbt;
            oFormData.LmsstN = aButtonProp[0].LmsstN;
            oFormData.LmsssN = aButtonProp[0].LmsssN;
            oViewModel.setProperty("/request", oFormData);
            if (!this._validateForm()) {
              return;
            }
            switch (aButtonProp[0].Lmsbs) {
              case "S": //Save
                //   this._updateRequest(
                //     oFormData,
                //     this._sNewRequest,
                //     false
                //   );
                return;
              case "A": //Approve
                oStatusChange.statusChangeNoteRequired = false;
                oStatusChange.statusChangePlaceholder = this.getText(
                  "ENTER_STATUS_CHANGE_REASON"
                );
                sStatusChange = true;
                break;
              case "B": //Back
              // oStatusChange.statusChangeNoteRequired = true;
              // oStatusChange.statusChangePlaceholder = this.getText("ENTER_REVISION_REASON");
              // sStatusChange = true;
              // break;
              case "R": //Reject
                oStatusChange.statusChangeNoteRequired = true;
                oStatusChange.statusChangePlaceholder = this.getText(
                  "ENTER_REJECTION_REASON"
                );
                sStatusChange = true;
                break;
              default:
                return;
            }
  
            if (sStatusChange) {
              oStatusChange.statusChangeNote = "";
              oStatusChange.beginButtonText = aButtonProp[0].Lmsbx;
              oStatusChange.beginButtonType = aButtonProp[0].Lmsbs;
              oStatusChange.beginButtonIcon = aButtonProp[0].Lmsbi;
              if (this._sNewRequest) {
                oStatusChange.informationNote = this.getText(
                  "NEW_EMPLOYEE_REQUEST_INFORMATION_NOTE"
                );
              } else {
                oStatusChange.informationNote = this.getText(
                  "STATUS_CHANGE_NOTE",
                  aButtonProp[0].LmssyN === ""
                    ? aButtonProp[0].LmssxN
                    : aButtonProp[0].LmssxN + "-" + aButtonProp[0].LmssyN
                );
              }
  
              oViewModel.setProperty("/statusChangeDialog", oStatusChange);
  
              if (
                !this._statusChangeDialog ||
                this._statusChangeDialog.bIsDestroyed
              ) {
                this._statusChangeDialog = sap.ui.xmlfragment(
                  "zhcm_ux_lms_abr.fragment.ApprovalRequestList.StatusChange",
                  this
                );
                this.getView().addDependent(this._statusChangeDialog, this);
              }
              this._statusChangeDialog.open();
            }
          } catch (oErr) {
            jQuery.sap.log.error("Form action failed!");
          }
        },
        onOpenFormActions: function (oEvent) {
          var oSource = oEvent.getSource();
          if (!this._formActions) {
            this._formActions = sap.ui.xmlfragment(
              "zhcm_ux_lms_abr.fragment.ApprovalRequestList.FormActions",
              this
            );
            this.getView().addDependent(this._formActions);
          }
          this._formActions.openBy(oSource);
        },
        onDisplayRequestDetail: function () {
            var oViewModel = this.getModel("approvalRequestListModel");
            if (!this._oRequestDisplayDialog) {
            this._oRequestDisplayDialog = new sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.ApprovalRequestList.ApprovalRequestFormDialog",
                this
            );
            this.getView().addDependent(this._oRequestDisplayDialog);
            }
            this._oRequestDisplayDialog.open();
        },
        onCancel: function () {
          this._oRequestDisplayDialog.close();
        },
        onIconFilterSelect: function (oEvent) {
            var oTable = this.byId("idApprovalRequestTable"),
              sKey = oEvent.getParameter("key"),
              aFilters = this._getActiveFilters(sKey),
              oViewModel = this.getModel("approvalRequestListModel");
            oViewModel.setProperty("/sKey", sKey);
            oTable.getBinding("items").filter(aFilters, "Application");
        },
        _getActiveFilters: function (sKey) {
            var aFilters = [];
            aFilters = [
              new Filter("Lmsap", FilterOperator.EQ, "REQUESTS_ON_ME"),
              new Filter("Lmssf", FilterOperator.EQ, sKey),
            ];
            return aFilters;
         },
        onOpenFormActions: function (oEvent) {
            var oSource = oEvent.getSource();
            if (!this._formActions) {
              this._formActions = sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.ApprovalRequestList.FormActions",
                this
              );
              this.getView().addDependent(this._formActions);
            }
            this._formActions.openBy(oSource);
        },
        onNavBack: function () {
            this.statusFilters = [];
            this.getRouter().navTo("appdispatcher", {}, true);
          },
        onSaveRequest: function () {
            var oModel = this.getModel(),
              oViewModel = this.getModel("approvalRequestListModel"),
              oFormData = oViewModel.getProperty("/currentRequest");
            this._openBusyFragment("FORM_BEING_SAVED");
            oModel.create("/ScholarshipStudentRequestSet", oFormData, {
              success: function (oData, oResponse) {
                this._closeBusyFragment();
                this._sweetAlert(this.getText("FORM_SAVE_SUCCESSFUL"), "S");
              }.bind(this),
              error: function (oError) {
                this._closeBusyFragment();
              }.bind(this),
            });
          },
          onSendRequest: function (oEvent) {
            var oModel = this.getModel(),
              oSource = oEvent.getSource(),
              sType = oSource.data("type"),
              oViewModel = this.getModel("approvalRequestListModel");
            var oFormData = oViewModel.getProperty("/currentRequest"),
              sMessage = "",
              that = this;
            switch (sType) {
              case "SAPP":
                sMessage = "APPROVE_THE_REQUEST";
                break;
              case "SREJ":
                sMessage = "REJECT_THE_REQUEST";
                break;
              case "MAPP":
                sMessage = "APPROVE_THE_REQUESTS";
                break;
              case "MREJ":
                sMessage = "REJECT_THE_REQUESTS";
                break;
              default:
                break;
            }
            Swal.fire({
              title: this.getText("ARE_YOU_SURE"),
              text: this.getText(sMessage),
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: this.getText("YES"),
              cancelButtonText: this.getText("NO"),
            }).then((result) => {
              if (result.isConfirmed) {
                that._saveRequest(oFormData, oModel, sType);
              }
            });
        },
        _getRequestList: function (oEvent) {

        },
      //   onDisplayRequestDetail: function (oEvent) {
      //       if (!this._oRequestDisplayDialog) {
			// 	this._oRequestDisplayDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.ApprovalRequestFormDialog", this);
			// 	this.getView().addDependent(this._oRequestDisplayDialog);
			// }
			// this._oRequestDisplayDialog.open();
      //   },
        onEvaluationDialogButton: function (oEvent) {
            // Dialogu kontrol edin ve açın
            if (!this._oEvaluationDisplayDialog) {
                this._oEvaluationDisplayDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.ApprovalRequestList.EvaluationDialog", this);
                this.getView().addDependent(this._oEvaluationDisplayDialog);
            }
            this._oEvaluationDisplayDialog.open();
        },
      
      //   onEvaluationDialogButton: function (oEvent) {
      //     debugger;
      //     var oModel = this.getModel(),
      //     oViewModel = this.getModel("approvalRequestListModel");
          
      //     this._openBusyFragment();
          
      //     oModel.read("/EvaluationCriteriaSet", {
      //         success: function (oData) {
      //             oViewModel.setProperty("/evaluationRequest", oData);
      //             this._closeBusyFragment();
                  
      //             if (!this._oEvaluationDisplayDialog) {
      //                 this._oEvaluationDisplayDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.ApprovalRequestList.EvaluationDialog", this);
      //                 this.getView().addDependent(this._oEvaluationDisplayDialog);
      //             }
                  
      //             this._oEvaluationDisplayDialog.open();
      //         }.bind(this), // 'this' bağlamını burada bağlıyoruz
      //         error: function () {
      //             this._closeBusyFragment();
      //         }.bind(this) // 'this' bağlamını burada da bağlıyoruz
      //     });
      // },
      
        
        onEvaluationCancelButtonPress:function(oEvent){
            if (this._oEvaluationDisplayDialog) {
                this._oEvaluationDisplayDialog.close();
            }
        },
        onSelectionChange: function (oEvent) {
            var oSource = oEvent.getSource(),
                oViewModel = this.getModel("approvalRequestListModel"),
                aSelectedContexts = oSource.getSelectedContexts(),
                oSelectedContext = oSource.getSelectedContexts()[0],
                oSelectedItems = oSource.getSelectedContexts().length,
                oData = {};
            if (oSelectedContext) {
                oData = oSelectedContext.getObject();
            }
            // var oData = this.getModel().getProperty(oSource.getParent().getBindingContextPath());
            oViewModel.setProperty("/currentRequest", oData);
            if (oSelectedItems >= 1) {
                var aReqno = [];
                aSelectedContexts.forEach(element => {
                    var item = element.getObject();
                    aReqno.push(item.Reqno);
                });
                oViewModel.setProperty("/currentRequest/Reqno", aReqno.toString());
                oViewModel.setProperty("/aplicationSetting/approveEnabled", true);
            } else {
                oViewModel.setProperty("/aplicationSetting/approveEnabled", false);
            }
        },
    });
});