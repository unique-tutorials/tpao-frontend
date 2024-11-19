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

	return BaseController.extend("zhcm_ux_lms_abr.controller.AbrRequestList", {
        formatter: formatter,
        statusFilters: [],
        callerRole: null,
        saveType: "",
        allStatusFilters: {
            MANAGER: {
              Statuses: [
                {
                  Status: "DRF",
                  Label: "DRAFT_REQUESTS_HEADER",
                  AvailableActions: [
                    {
                      Text: "EDIT_ACTION",
                      Icon: "sap-icon://edit",
                      Action: "Edit",
                      Type: "Emphasized",
                    },
                    {
                      Text: "DISPLAY_ACTION",
                      Icon: "sap-icon://display",
                      Action: "Display",
                      Type: "Emphasized",
                    },
                    {
                      Text: "DELETE_ACTION",
                      Icon: "sap-icon://delete",
                      Action: "Delete",
                      Type: "Reject",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                    {
                      Text: "COPY_PTF_ACTION",
                      Icon: "sap-icon://copy",
                      Action: "Copy",
                      Type: "Default",
                    },
                  ],
                },
                {
                  Status: "PND",
                  Label: "PENDING_REQUESTS_HEADER",
                  AvailableActions: [
                    {
                      Text: "DISPLAY_ACTION",
                      Icon: "sap-icon://display",
                      Action: "Display",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                    {
                      Text: "COPY_PTF_ACTION",
                      Icon: "sap-icon://copy",
                      Action: "Copy",
                      Type: "Default",
                    },
                  ],
                },
                {
                  Status: "APP",
                  Label: "APPROVED_REQUESTS_HEADER",
                  AvailableActions: [
                    {
                      Text: "DISPLAY_ACTION",
                      Icon: "sap-icon://display",
                      Action: "Display",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                    {
                      Text: "COPY_PTF_ACTION",
                      Icon: "sap-icon://copy",
                      Action: "Copy",
                      Type: "Default",
                    },
                  ],
                },
                {
                  Status: "REJ",
                  Label: "REJECTED_REQUESTS_HEADER",
                  AvailableActions: [
                    {
                      Text: "DISPLAY_ACTION",
                      Icon: "sap-icon://display",
                      Action: "Display",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                    {
                      Text: "COPY_PTF_ACTION",
                      Icon: "sap-icon://copy",
                      Action: "Copy",
                      Type: "Default",
                    },
                  ],
                },
                {
                  Status: "ALL",
                  Label: "ALL_REQUESTS_HEADER",
                },
                {
                  Status: "MNG",
                  Label: "ALL_REQUESTS_MY_UNIT",
                  AvailableActions: [
                    {
                      Text: "DISPLAY_ACTION",
                      Icon: "sap-icon://display",
                      Action: "Display",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                  ],
                },
              ],
              DefaultFilters: [
                new Filter("Lmsap", FilterOperator.EQ, "MY_REQUESTS"),
                new Filter("Lmssf", FilterOperator.EQ, "DRF"),
              ],
            },
            RECRUITER: {
              Statuses: [
                {
                  Status: "APM",
                  Label: "APPROVED_REQUESTS_ME_HEADER",
                  DefaultStatus: ["APP"],
                  AvailableActions: [
                    {
                      Text: "EDIT_ACTION",
                      Icon: "sap-icon://edit",
                      Action: "Edit",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                    {
                      Text: "APPROVED_REQUESTS_ME_CLOESED",
                      Icon: "sap-icon://decline",
                      Action: "Close",
                      Type: "Reject",
                    },
                  ],
                },
                {
                  Status: "ACL",
                  Label: "APPROVED_REQUESTS_ME_HEADER",
                  DefaultStatus: ["APP"],
                  AvailableActions: [
                    {
                      Text: "EDIT_ACTION",
                      Icon: "sap-icon://edit",
                      Action: "Edit",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                    {
                      Text: "APPROVED_REQUESTS_ME_OPENED",
                      Icon: "sap-icon://open-command-field",
                      Action: "Open",
                      Type: "Accept",
                    },
                  ],
                },
                {
                  Status: "APF",
                  Label: "APPROVED_REQUESTS_FR_HEADER",
                  DefaultStatus: ["APP"],
                  AvailableActions: [
                    // {
                    // 	Text: "DISPLAY_ACTION",
                    // 	Icon: "sap-icon://display",
                    // 	Action: "Display",
                    // 	Type: "Emphasized"
                    // },
                    // }, {
                    // 	Text: "ASSIGN_ACTION",
                    // 	Icon: "sap-icon://activity-assigned-to-goal",
                    // 	Action: "Assign",
                    // 	Type: "Accept"
                    // }, {
                    {
                      Text: "EDIT_ACTION",
                      Icon: "sap-icon://edit",
                      Action: "Edit",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                    {
                      Text: "APPROVED_REQUESTS_ME_CLOESED",
                      Icon: "sap-icon://decline",
                      Action: "Close",
                      Type: "Reject",
                    },
                  ],
                },
                {
                  Status: "APO",
                  Label: "APPROVED_REQUESTS_OT_HEADER",
                  DefaultStatus: ["APP"],
                  AvailableActions: [
                    {
                      Text: "DISPLAY_ACTION",
                      Icon: "sap-icon://display",
                      Action: "Display",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                  ],
                },
                {
                  Status: "ALL",
                  Label: "ALL_REQUESTS_HEADER",
                  DefaultStatus: ["DRF", "PND", "APP", "REJ", "CMP"],
                  AvailableActions: [
                    {
                      Text: "DISPLAY_ACTION",
                      Icon: "sap-icon://display",
                      Action: "Display",
                      Type: "Emphasized",
                    },
                    {
                      Text: "PRINT_OUT_ACTION",
                      Icon: "sap-icon://pdf-attachment",
                      Action: "PrintOut",
                      Type: "Default",
                    },
                  ],
                },
              ],
              DefaultFilters: [
                new Filter("Lmsap", FilterOperator.EQ, "REQUESTS_APPROVED"),
                new Filter("Lmssf", FilterOperator.EQ, "APP"),
                // new Filter("Lmsrf", FilterOperator.EQ, "APM")
              ],
            },
          },

        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "abrRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrRequestList").attachPatternMatched(this._onRequestListMatched, this);
        },
        onNavBack:function(oEvent){
          this.getRouter().navTo("appdispatcher", {}, true);
        },
        _onRequestListMatched: function (oEvent) {
            this.statusFilters = this.allStatusFilters.MANAGER.Statuses;
            this.callerRole = "RECRUITER";
            this.onRefresh();
        },
        onRefresh: function () {
            var oTable = this.byId("idTrainingRequestTable");
            oTable.getBinding("items").refresh();
          },
        _initiateModel: function () {
            var oViewModel = this.getModel("abrRequestListModel");
            oViewModel.setData({
                requestListTableTitle: "",
                requestList: [],
                selectedRequest: {},
                tableBusyDelay: 0,
                tableNoDataText: this.getText("EMPTY_REQUEST_LIST"),
                currentRequest: {},
                aplicationSetting: {
                  enabled: true,
                  visible: true,
                },
                QualifacationList: [],
                selectedKey: "APF",
                sKey: "APF",
                filterText: "",
                searchResults: {
                  DRF: 0,
                  PND: 0,
                  APP: 0,
                  AOP: 0,
                  ACL: 0,
                  REJ: 0,
                  ALL: 0,
                  APM: 0,
                  APF: 0,
                  APO: 0,
                  MNG: 0,
                },
                statusFilters: [
                  {
                    Lmssf: "DRF",
                    Lmssx: "Taslak",
                    Selected: false,
                  },
                  {
                    Lmssf: "PND",
                    Lmssx: "Onay Devam Ediyor",
                    Selected: false,
                  },
                  {
                    Lmssf: "APP",
                    Lmssx: "Onaylandı",
                    Selected: false,
                  },
                  {
                    Lmssf: "REJ",
                    Lmssx: "Reddedildi",
                    Selected: false,
                  },
                  {
                    Lmssf: "CMP",
                    Lmssx: "Kapatıldı",
                    Selected: false,
                  },
                ],
                formHistory: [],
              });
        },
        _getRequestList: function (oEvent) { 

        },
        onIconFilterSelect: function (oEvent) {
            var oTable = this.byId("idTrainingRequestTable"),
              sKey = oEvent.getParameter("key"),
              aFilters = this._getActiveFilters(sKey),
              oViewModel = this.getModel("abrRequestListModel");
            oViewModel.setProperty("/sKey", sKey);
            oTable.getBinding("items").filter(aFilters, "Application");
        },
        _getActiveFilters: function (sKey) {
            var aFilters = [];
            aFilters = [
              new Filter("Lmsap", FilterOperator.EQ, "MY_REQUESTS"),
              new Filter("Lmssf", FilterOperator.EQ, sKey),
            ];
            return aFilters;
        },
        onUpdateFinished: function (oEvent) {
          // update the requestList's object counter after the table update
          var sTitle,
            oViewModel = this.getModel("abrRequestListModel"),
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
            this.getModel("abrRequestListModel").setProperty(
              "/requestListTableTitle",
              sTitle
            );
          }
  
          //Refresh filter statistics async
          this._updateFilterCounts(oModel);
        },
        _updateFilterCounts: function (oModel) {
          var oViewModel = this.getModel("abrRequestListModel");
          var aFilters = [];
          $.each(this.statusFilters, function (sIndex, oFilter) {
            aFilters = [
              new Filter("Lmsap", FilterOperator.EQ, "MY_REQUESTS"),
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

        onNewTrainingRequest:function(){
            var oViewModel = this.getModel("abrRequestListModel");
            oViewModel.setProperty("/aplicationSetting/enabled", true);
            oViewModel.setProperty("/currentRequest", {});
            this.saveType = "";
            if (!this._oNewRequestDialog) {
              this._oNewRequestDialog = new sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.AbrRequestList.TrainingRequestFormDialog",
                this
              );
              this.getView().addDependent(this._oNewRequestDialog);
            } else {
              this._oNewRequestDialog.close();
            }
            this._oNewRequestDialog.open();
        },
        _saveRequest: function (oEvent, sActionType) {
            debugger;
            var oModel = this.getModel(),
              oViewModel = this.getModel("abrRequestListModel");
            if (!sActionType) {
              sActionType = oEvent.getSource().data("actionType");
              oViewModel.setProperty("/currentRequest/Actio", sActionType);
            }
            var oFormData = oViewModel.getProperty("/currentRequest");
            this._openBusyFragment("FORM_BEING_SAVED");
            switch (this.saveType) {
              case "Update":
                var sPath = oModel.createKey("/ScholarshipStudentRequestSet", {
                  Lmsid: oFormData.Lmsid,
                });
                oModel.update(sPath, oFormData, {
                  success: function (oData, oResponse) {
                    this._closeBusyFragment();
                    this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
                    this._oNewRequestDialog.close();
                    this._initiateModel();
                  }.bind(this),
                  error: function (oError) {
                    this._sweetToast(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                    this._oNewRequestDialog.close();
                    this._initiateModel();
                  }.bind(this),
                });
                break;
              default:
                oModel.create("/ScholarshipStudentRequestSet", oFormData, {
                  success: function (oData, oResponse) {
                    this._closeBusyFragment();
                    this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
                    this._oNewRequestDialog.close();
                    this._initiateModel();
                  }.bind(this),
                  error: function (oError) {
                    this._sweetToast(this.getText("SAVE_ERROR"), "E");
                    this._closeBusyFragment();
                    this._oNewRequestDialog.close();
                    this._initiateModel();
                  }.bind(this),
                });
                break;
            }
          },
        onQualificationProfileSelect: function (oEvent) {
            var oSelectedObject = oEvent
              .getParameter("selectedContexts")[0]
              .getObject();
            var oViewModel = this.getModel("abrRequestListModel");
            oViewModel.setProperty("/currentRequest/Qprfl", oSelectedObject.Key);
            oViewModel.setProperty("/currentRequest/Madef", oSelectedObject.Value);
            oViewModel.setProperty("/currentRequest/Qlttx", "");
            oViewModel.setProperty("/currentRequest/Qualt", "");
            oEvent.getSource().getBinding("items").filter([]);
            oEvent.getSource().getBinding("items").refresh();
        },
        
        onQualificationValueHelpRequest: function (oEvent) {
            var oViewModel = this.getModel("abrRequestListModel"),
              sSourceField = oEvent.getSource().data("sourceField");
            if (!this._qualificationProfileValueHelpDialog) {
              this._qualificationProfileValueHelpDialog = sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.AbrRequestList.QualificationProfileSearch",
                this
              );
              this.getView().addDependent(
                this._qualificationProfileValueHelpDialog
              );
            }
            this._qualificationProfileValueHelpDialog.data(
              "sourceField",
              sSourceField
            );
            this._qualificationProfileValueHelpDialog.open();
        },

         onCancelCreatePage:function(oEvent){
            if (this._oNewRequestDialog) {
                this._oNewRequestDialog.close();
            }
         },
         onAddNewCountry: function (oEvent) {
            if (!this._oNewCountryDialog) {
				this._oNewCountryDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrRequestList.CountryNewTable", this);
				this.getView().addDependent(this._oNewCountryDialog);
			}
			this._oNewCountryDialog.open();
        },
        onCancelSearchStudentDialog:function(oEvent){
            if (this._oNewCountryDialog) {
               this._oNewCountryDialog.close();
            }
        },
        editDraftButtonPress: function(oEvent) {
            if (!this._oNewRequestDialog) {
                this._oNewRequestDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrRequestList.TrainingRequestFormDialog", this);
                this.getView().addDependent(this._oNewRequestDialog);
            }
            
            this._oNewRequestDialog.open();

            const oSelectedTodo = oEvent.getSource().getBindingContext("abrRequestListModel").getObject();
            console.log("seçilen öğe:" , oSelectedTodo);
            
            const oViewModel = this.getView().getModel("abrRequestListModel");
            if (oViewModel && oSelectedTodo) {
                oViewModel.setProperty("/TrainRequestList", { ...oSelectedTodo });
            } else {
                console.error("Model 'abrRequestListModel' bulunamadı veya oSelectedTodo boş.");
            }
        },
        onAvailableRequestActions:function(oEvent){
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
            var oViewModel = this.getModel("abrRequestListModel");
            if (oData.Lmssf === "DRF") {
              oViewModel.setProperty("/aplicationSetting/visible", true);
            } else {
              oViewModel.setProperty("/aplicationSetting/visible", false);
            }
            if (!this._requestActions) {
              this._requestActions = sap.ui.xmlfragment(
                "zhcm_ux_lms_abr.fragment.AbrRequestList.RequestActions",
                this
              );
              this.getView().addDependent(this._requestActions);
            }
            this._requestActions.data("formData", oData);
            this._requestActions.openBy(oSource);
          },
          
          onRequestActionSelected: function (oEvent) {
            var oSource = oEvent.getSource();
            var sAction = oSource.data("actionId");
            var sActionType = oSource.data("actionType");
            var oFormData = oSource.getParent().data("formData");
            var oThis = this;
            var oBeginButtonProp = {};
            var oApplicationSettings = {};
            var oViewModel = this.getModel("abrRequestListModel");
            oViewModel.setProperty("/currentRequest", oFormData);
            this.saveType = "";
            switch (sAction) {
              case "Edit":
                this.onNewTrainingRequest();
                oViewModel.setProperty("/aplicationSetting/enabled", true);
                SharedData.setCurrentRequest(_.cloneDeep(oFormData));
                oViewModel.setProperty("/busy", true);
                this.saveType = "Update";
                oViewModel.setProperty("/currentRequest", oFormData);x
                break;
              case "Display":
                this.onNewTrainingRequest();
                oViewModel.setProperty("/aplicationSetting/enabled", false);
                SharedData.setCurrentRequest(_.cloneDeep(oFormData));
                oViewModel.setProperty("/busy", true);
                oViewModel.setProperty("/currentRequest", oFormData);
                break;
              case "Delete":
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
                    oThis._deleteRequest(oFormData);
                  }
                });
                break;
              case "Aproved":
                Swal.fire({
                  title: this.getText("ARE_YOU_SURE"),
                  text: this.getText("SENT_FOR_APPROVED"),
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: this.getText("YES"),
                  cancelButtonText: this.getText("NO"),
                }).then((result) => {
                  if (result.isConfirmed) {
                    oViewModel.setProperty("/currentRequest/Actio", "SEND");
                    this.saveType = "Update";
                    this._saveRequest(oEvent, sActionType);
                  }
                });
                break;
              case "History":
                this._getFormHistory(oFormData);
            }
          },
          
          _deleteRequest: function (oFormData) {
			var oModel = this.getModel();
			var sPath = oModel.createKey("/ScholarshipStudentRequestSet", {
                Lmsid: oFormData.Lmsid,
                Lmsno: oFormData.Lmsno
            });
			this._openBusyFragment("FORM_BEING_DELETED");
			oModel.remove(sPath, {
				success: function () {
					this._closeBusyFragment();
					this._sweetToast(this.getText("FORM_DELETE_SUCCESSFUL"), "S");
					oModel.refresh();
				}.bind(this),
				error: function () {
					this._closeBusyFragment();
				}.bind(this)
			});
		},
	});
});