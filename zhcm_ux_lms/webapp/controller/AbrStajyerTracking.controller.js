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
    "zhcm_ux_lms_abr/controller/SharedData",
    "sap/m/Dialog",
    "sap/tnt/InfoLabel",
    "sap/ui/model/odata/ODataModel" 
], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageBox, MessageToast, Dialog, SharedData, InfoLabel,ODataModel) {
    "use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.AbrStajyerTracking", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "requestStajyerListModel");
            this._initiateModel();
            this.getRouter().getRoute("AbrTracking").attachPatternMatched(this._onRequestListMatched, this);
           
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("requestStajyerListModel");
            oViewModel.setData({
                busy: false,
				delay: 0,
                requestList: [],
                selectedRequest: {},
                SelectedEmployee:{},
                currentRequest: {},
                searchStajyerParameter:{},
                SelectedStajyer:{},
                newNumberStajyerRequest:{
                    Pernr:null,
                    Ename:""                 
                },
             
            });
          
        },
        _getRequestList: function () { 

        },
        onCreateAttachmentButtonPress: function (oEvent) {
			var textPath = oEvent.getSource().data("mdl");
			var oViewModel = this.getModel("requestStajyerListModel");
			if (textPath.includes("attachment")) {
				var sInfoLabel = this._i18n("UploadInfo");
				oViewModel.setProperty("/infoLabel", sInfoLabel);
			}
			else {
				var sInfoLabel = this._i18n("MustUpload");
				oViewModel.setProperty("/infoLabel", sInfoLabel);
			}
			oViewModel.refresh(true);
			var oDialog = this._getAttDialog();
			oDialog.open();
		},
		onUpdloadAttAfterClose: function () {
			if (this._oUploadAttachmentDialog) {
				this._oUploadAttachmentDialog.destroy();
				this._oUploadAttachmentDialog = null;
			}
		},
		_getAttDialog: function () {
			if (!this._oUploadAttachmentDialog) {
				this._oUploadAttachmentDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrStajyerTracking.UploadAttachments", this);
				this.getView().addDependent(this._oUploadAttachmentDialog);
			}
			return this._oUploadAttachmentDialog;
		},
        onCloseUploadDialog: function () {
			// this._sweetAlert(this.getText("FILE_UPLOAD_CANCELLED"), "S");
            if (this._oUploadAttachmentDialog) {
                this._oUploadAttachmentDialog.close();
            }
		},
        _i18n: function (e) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(e)
		},
        onAttachmentListButtonPress: function (oEvent) {
			var oViewModel = this.getModel("requestStajyerListModel");
			var sPernr = oViewModel.getProperty("/Pernr");
			this._getAttachmentList(sPernr);
			if (!this._oUploadAttachmentListDialog) {
				this._oUploadAttachmentListDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrStajyerTracking.AttachmentList", this);
				this.getView().addDependent(this._oUploadAttachmentListDialog);
			}
			this._oUploadAttachmentListDialog.open();
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
        onAttachDownload: function (oEvent) {
			var sAttid = oEvent.getSource().getBindingContext("requestStajyerListModel").getObject("Attid")
			var oModel = this.getModel();
			var oUrlPath = oModel.sServiceUrl + "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')/$value";
			window.open(oUrlPath);
		},
        _onRequestMatched: function (oEvent) {
			var that = this;
			var oViewModel = this.getModel("requestStajyerListModel");
			var sPernr = oEvent.getParameter("arguments").Pernr;
			oViewModel.setProperty("/Pernr", sPernr);
			var TabContainerStajyer = this.byId("TabContainerStajyer");
			this._readQualificationList();
			if (sPernr) {

				var oPromise = new Promise(
					function (resolve, reject) {
						that._readEvaluationData(sPernr, resolve, reject);
					}
				);

				oPromise.then(function (aResults) {
					var sEvlty = that.getModel("requestStajyerListModel").getProperty("/evaluationType");
					if (sEvlty == "1") {
						that._readQualificationsAssesmentType(sPernr, null, TabContainerStajyer, null);
					} else if (sEvlty == "2") {
						that._readQualificationsQuestionBankType(sPernr, null, TabContainerStajyer, null)
					}
					that._readTrainingsList(sPernr);
				}).catch(function (resolve, reject) {
				});
			}
		},
        _readTrainingsList: function (sPernr) {
			var that = this;
			var oViewModel = this.getModel("requestStajyerListModel");
			var sServiceUrl = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/";
			var oModel = new ODataModel(sServiceUrl);
			var aFilters = []
			var oModel = this.getModel();
			aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
			oModel.read("/EvaluationRequiredTrainingsSet", {
				filters: aFilters,
				success: function (oData, oResponse) {
					oViewModel.setProperty("/busy", true);
					if (oData.length >= 1) {
						that.getModel("requestStajyerListModel").setProperty("/showTrainingButton", true);
					}
					that.getModel("requestStajyerListModel").setProperty("/trainingList", oData.results);
				},
				error: function (oError) {
					oViewModel.setProperty("/busy", false);
				}
			});
		},
        onAttachmentUploadPress: function (oEvent) {
            var oViewModel = this.getModel("requestStajyerListModel");
            var sPernr = oViewModel.getProperty("/newNumberStajyerRequest/Pernr"); 
            var oFileUploader = sap.ui.getCore().byId("idAttachmentFileUploader");
        
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
        
            var sPath = oModel.sServiceUrl + "/PersonnelAttachmentOperationSet(Pernr='" + sPernr + "',Ptype='" +
							'LMSABR' + "')/PersonnelAttachmentSet";
            oFileUploader.setUploadUrl(sPath);
        
            this._openBusyFragment("ATTACHMENT_BEING_UPLOADED");
            oFileUploader.upload();
            sap.m.MessageToast.show("Başarılı");
            this._closeBusyFragment("ATTACHMENT_UPLOADED");
        },
        
        _getAttachmentList: function (sPernr) {
            var that = this;
            var sServiceUrl = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/";
            var oModel = new ODataModel(sServiceUrl);
            var aFilters = [];
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestStajyerListModel");
            var sPernr = oViewModel.getProperty("/newNumberStajyerRequest/Pernr", sPernr);
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Ptype", FilterOperator.EQ, 'LMSABR'));
        
            oModel.read("/PersonnelAttachmentSet", {
                filters: aFilters,
                success: function (oData, oResponse) {
                    that.getModel("requestStajyerListModel").setProperty("/attachmentList", oData.results);
                },
                error: function (oError) {
                    that.getModel("requestStajyerListModel").setProperty("/busy", false);
                }
            });
        },
        onDeleteAttachment: function (oEvent) {
			var that = this;
			var oModel = this.getModel();
			var oViewModel = this.getModel("requestStajyerListModel");
			var sAttid = oEvent.getSource().getBindingContext("requestStajyerListModel").getObject("Attid")
			var sPath = "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')";
			var _doDeleteAttachment = function () {
				oViewModel.setProperty("/busy", true);

				oModel.remove(sPath, {
					success: function (oData, oResponse) {
						if (oResponse["headers"]["message"]) {
							that._sweetAlert(that.getText("ERROR_WHILE_DELETING_DOCUMENTS"), "E");
						} else {
							that._sweetAlert(that.getText("DOCUMENTS_WERE_SUCCESSFULLY_DELETED"), "S");
							window.location.reload();
						}
						oViewModel.setProperty("/busy", false);
					},
					error: function (oError) {

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
        onCloseDialog: function () {
			if (this._oUploadAttachmentListDialog) {
				this._oUploadAttachmentListDialog.close();
				this._oUploadAttachmentListDialog.destroy();
				this._oUploadAttachmentListDialog = null;
			} if (this._oEvaluationTrainings) {
				this._oEvaluationTrainings.close();
			}
		},
        onNewTrainingRequest: function (oEvent) {
            if (!this._oNewRequestDialog) {
				this._oNewRequestDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrRequestList.TrainingRequestFormDialog", this);
				this.getView().addDependent(this._oNewRequestDialog);
			}
			this._oNewRequestDialog.open();
         },
         onShowStajyerSearchHelp:function(oEvent){
            if (!this._oStajyerSearchHelpDialog) {
                this._oStajyerSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrStajyerTracking.StajyerSearchHelpDialog", this);
                this.getView().addDependent(this._oStajyerSearchHelpDialog);
            } else {
                this._oStajyerSearchHelpDialog.close();
            }
            this._oStajyerSearchHelpDialog.open();
         },
         onCancelSearchStajyerDialog:function(oEvent){
           if (this._oStajyerSearchHelpDialog) {
            this._oStajyerSearchHelpDialog.close();
           }
         },
         onStajyerSearch:function(){
            debugger;
            var oViewModel = this.getModel('requestStajyerListModel');
            var oFilter = oViewModel.getProperty('/searchStajyerParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('stajyerTable') || sap.ui.getCore().byId('stajyerTable');
            oTable.getBinding('items').filter(aFilters,"Application");
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
        onItemStajyerSelected:function(oEvent){
            debugger;
            var oSelectedStajyerItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('requestStajyerListModel');
            oViewModel.setProperty("/newNumberStajyerRequest/Pernr", oSelectedStajyerItem.Pernr); 
            oViewModel.setProperty("/newNumberStajyerRequest/Ename", oSelectedStajyerItem.Vorna +' '+ oSelectedStajyerItem.Nachn ); 
        
            if (this._oStajyerSearchHelpDialog) {
                this._oStajyerSearchHelpDialog.close();
            }
        },
        onSearchStajyerPress: function (oEvent) {
            var that = this;
            var oModel = this.getModel();
            var sPernr = this.getView().getModel("requestStajyerListModel").getProperty("/newNumberStajyerRequest/Pernr");
        
            if (!sPernr) {
                this._sweetAlert(this.getText("NUMBER_REQUIRED"), "W");
                return;
            }
            function readData(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    success: function (oData) {
                        var oViewModel = that.getModel("requestStajyerListModel");
                        oViewModel.setProperty(sModelProperty, oData);
                        console.log(oData);
                    },
                    error: function () {
                        sap.m.MessageToast.show(errorMessage);
                    }
                });
            }
            // Stajyer bilgileri al
            var sStajyerPath = oModel.createKey("/IntershipStudentSet", { Pernr: sPernr });
            readData(sStajyerPath, "/SelectedStajyer", "Stajyer bilgisi alınamadı.");
        },
        onSavePress:function(oEvent){
            var oModel = this.getModel();
            var oViewModel = this.getModel("requestStajyerListModel");
            var oEntry = oViewModel.getProperty('/SelectedStajyer');
            var that = this;
            if (this.byId("TabContainerStajyer").getSelectedKey() === "stajyerInfo") {
                oModel.create("/IntershipStudentSet", oEntry, {
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
        onMentorValueHelpRequest:function(oEvent){
            if (!this._oMentorSearchHelpDialog) {
                this._oMentorSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrStajyerTracking.MentorSearchHelpDialog", this);
                this.getView().addDependent(this._oMentorSearchHelpDialog);
            } else {
                this._oMentorSearchHelpDialog.close();
            }
            this._oMentorSearchHelpDialog.open();
        },
        onCancelMentorButtonPress:function(oEvent){
            if (this._oMentorSearchHelpDialog) {
                this._oMentorSearchHelpDialog.close();
            }
        },
        onShowUnitStajyerSearchHelp:function(oEvent){
            if (!this._oUnitStajyerSearchHelpDialog) {
                this._oUnitStajyerSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrStajyerTracking.UnitStajyerSearchHelpDialog", this);
                this.getView().addDependent(this._oUnitStajyerSearchHelpDialog);
            } else {
                this._oUnitStajyerSearchHelpDialog.close();
            }
            this._oUnitStajyerSearchHelpDialog.open();
        },
        onCancelUnitStajyerButtonPress:function(oEvent){
            if (this._oUnitStajyerSearchHelpDialog) {
                this._oUnitStajyerSearchHelpDialog.close();
            }
        },
        onUnitStajyerSelected:function(oEvent){
            debugger;
            var oSelectedUnitItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('requestStajyerListModel');
            oViewModel.setProperty("/SelectedEmployee/Unicd", oSelectedUnitItem.Orgeh); 
            oViewModel.setProperty("/SelectedEmployee/Orgtx", oSelectedUnitItem.Orgtx ); 

            if (this._oUnitStajyerSearchHelpDialog) {
                this._oUnitStajyerSearchHelpDialog.close();
            }
        }
	});
});