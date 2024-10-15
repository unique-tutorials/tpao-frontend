sap.ui.define([
	"zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/tnt/InfoLabel",
    "sap/ui/model/odata/ODataModel" 
], function(
	BaseController, JSONModel, History, formatter, Filter, FilterOperator, Dialog, InfoLabel,ODataModel
) {
	"use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.CareerInterns", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "careerInternListModel");
            this._initiateModel();
            this.getRouter().getRoute("CareerInterns").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("careerInternListModel");
            oViewModel.setData({
                busy: false,
				delay: 0,
                requestList: [],
                selectedRequest: {},
                SelectedEmployee:{},
                currentRequest: {},
                searchCareerParameter:{},
                selectedCareer:{},
                newNumberCareerRequest:{
                    Pernr:null,
                    Ename:""                 
                },
            });
        },
        _getRequestList: function (oEvent) { 

        },
        onCreateCareerAttachment:function(oEvent){
            var textPath = oEvent.getSource().data("mdl");
			var oViewModel = this.getModel("careerInternListModel");
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
        _getAttDialog: function (oEvent) {
			if (!this._oUploadAttachmentDialog) {
				this._oUploadAttachmentDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInterns.UploadAttachments", this);
				this.getView().addDependent(this._oUploadAttachmentDialog);
			}
			return this._oUploadAttachmentDialog;
		},
        onCloseUploadDialog: function (oEvent) {
			// this._sweetAlert(this.getText("FILE_UPLOAD_CANCELLED"), "S");
            if (this._oUploadAttachmentDialog) {
                this._oUploadAttachmentDialog.close();
            }
		},
        _i18n: function (e) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(e)
		},
        onCareertAttachmentList:function(oEvent){
            var oViewModel = this.getModel("careerInternListModel");
			var sPernr = oViewModel.getProperty("/Pernr");
			this._getAttachmentList(sPernr);
			if (!this._oUploadCareerAttachmentListDialog) {
				this._oUploadCareerAttachmentListDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInterns.AttachmentList", this);
				this.getView().addDependent(this._oUploadCareerAttachmentListDialog);
			}
			this._oUploadCareerAttachmentListDialog.open();
        },
        onUpdloadAttAfterClose: function (oEvent) {
			if (this._oUploadAttachmentDialog) {
				this._oUploadAttachmentDialog.destroy();
				this._oUploadAttachmentDialog = null;
			}
		},
        onCareerAttachmentUploadPress:function(oEvent){
            var oViewModel = this.getModel("careerInternListModel");
            var sPernr = oViewModel.getProperty("/newNumberCareerRequest/Pernr"); 
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
        onFileSizeExceed: function (oEvent) {
			Swal.fire({
				position: "bottom-center",
				icon: "warning",
				title: this.getText("FILE_SIZE_EXCEEDED", [oEvent.getSource().getMaximumFileSize()]),
				showConfirmButton: false,
				timer: 2500
			});
		},
        onDeleteAttachment: function (oEvent) {
			var that = this;
			var oModel = this.getModel();
			var oViewModel = this.getModel("careerInternListModel");
			var sAttid = oEvent.getSource().getBindingContext("careerInternListModel").getObject("Attid")
			var sPath = "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')";
			var _doDeleteAttachment = function () {
				oViewModel.setProperty("/busy", true);

				oModel.remove(sPath, {
					success: function (oData, oResponse) {
						if (oResponse["headers"]["message"]) {
							that._sweetAlert(that.getText("ERROR_WHILE_DELETING_DOCUMENTS"), "E");
						} else {
							that._sweetAlert(that.getText("DOCUMENTS_WERE_SUCCESSFULLY_DELETED"), "S");
							// window.location.reload();
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
        onAttachDownload: function (oEvent) {
			var sAttid = oEvent.getSource().getBindingContext("careerInternListModel").getObject("Attid")
			var oModel = this.getModel();
			var oUrlPath = oModel.sServiceUrl + "/PersonnelAttachmentSet(Attid=guid'" + sAttid + "')/$value";
			window.open(oUrlPath);
		},
        onCloseDialog: function (oEvent) {
			if (this._oUploadCareerAttachmentListDialog) {
				this._oUploadCareerAttachmentListDialog.close();
				this._oUploadCareerAttachmentListDialog.destroy();
				this._oUploadCareerAttachmentListDialog = null;
			} if (this._oEvaluationTrainings) {
				this._oEvaluationTrainings.close();
			}
		},
        onAttachmentUploadComplete:function(oEvent){
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
        onCareerSearch:function(oEvent){
            debugger;
            var oViewModel = this.getModel('careerInternListModel');
            var oFilter = oViewModel.getProperty('/searchCareerParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('careerTable') || sap.ui.getCore().byId('careerTable');
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
        onShowCareerSearchHelp:function(oEvent){
            if (!this._oCareerSearchHelpDialog) {
                this._oCareerSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInterns.CareerSearchHelpDialog", this);
                this.getView().addDependent(this._oCareerSearchHelpDialog);
            } else {
                this._oCareerSearchHelpDialog.close();
            }
            this._oCareerSearchHelpDialog.open();
        },
        onCancelSearchCareerDialog:function(oEvent){
            if (this._oCareerSearchHelpDialog) {
                this._oCareerSearchHelpDialog.close();
            }
        },
        _getAttachmentList: function (sPernr) {
            var that = this;
            var sServiceUrl = "/sap/opu/odata/sap/ZHCM_UX_LMS_ABR_SRV/";
            var oModel = new ODataModel(sServiceUrl);
            var aFilters = [];
            var oModel = this.getModel();
            var oViewModel = this.getModel("careerInternListModel");
            var sPernr = oViewModel.getProperty("/newNumberCareerRequest/Pernr", sPernr);
            aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));
            aFilters.push(new Filter("Ptype", FilterOperator.EQ, 'LMSABR'));
        
            oModel.read("/PersonnelAttachmentSet", {
                filters: aFilters,
                success: function (oData, oResponse) {
                    that.getModel("careerInternListModel").setProperty("/attachmentList", oData.results);
                },
                error: function (oError) {
                    that.getModel("careerInternListModel").setProperty("/busy", false);
                }
            });
        },
        onItemCareerSelected:function(oEvent){
            debugger;
            var oSelectedCareerItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('careerInternListModel');
            oViewModel.setProperty("/newNumberCareerRequest/Pernr", oSelectedCareerItem.Pernr); 
            oViewModel.setProperty("/newNumberCareerRequest/Ename", oSelectedCareerItem.Vorna +' '+ oSelectedCareerItem.Nachn ); 
        
            if (this._oCareerSearchHelpDialog) {
                this._oCareerSearchHelpDialog.close();
            }
        },
        onSearchCareerPress:function(oEvent){
            var that = this;
            var oModel = this.getModel();
            var sPernr = this.getView().getModel("careerInternListModel").getProperty("/newNumberCareerRequest/Pernr");
        
            if (!sPernr) {
                this._sweetAlert(this.getText("NUMBER_REQUIRED"), "W");
                return;
            }
            function readData(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    success: function (oData) {
                        var oViewModel = that.getModel("careerInternListModel");
                        oViewModel.setProperty(sModelProperty, oData);
                        console.log(oData);
                    },
                    error: function () {
                        sap.m.MessageToast.show(errorMessage);
                    }
                });
            }
            // Stajyer bilgileri al
            var sCareerPath = oModel.createKey("/CareerIntershipSet", { Pernr: sPernr });
            readData(sCareerPath, "/SelectedCareer", "Kariyer stajyerler bilgisi alınamadı.");
        },
        onShowUnitCareerSearchHelp:function(oEvent){
            if (!this._oUnitCareerSearchHelpDialog) {
                this._oUnitCareerSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInterns.UnitCareerSearchHelpDialog", this);
                this.getView().addDependent(this._oUnitCareerSearchHelpDialog);
            } else {
                this._oUnitCareerSearchHelpDialog.close();
            }
            this._oUnitCareerSearchHelpDialog.open();
        },
        onCancelUnitCareerButtonPress:function(oEvent){
            if (this._oUnitCareerSearchHelpDialog) {
                this._oUnitCareerSearchHelpDialog.close();
            }
        },
        onUnitCareerSelected:function(oEvent){
            debugger;
            var oSelectedUnitItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('careerInternListModel');
            oViewModel.setProperty("/SelectedEmployee/Unicd", oSelectedUnitItem.Orgeh); 
            oViewModel.setProperty("/SelectedEmployee/Orgtx", oSelectedUnitItem.Orgtx ); 

            if (this._oUnitCareerSearchHelpDialog) {
                this._oUnitCareerSearchHelpDialog.close();
            }
        },
        onShowDateSearchHelp:function(oEvent){
            debugger;
            if (!this._oDateSearchHelpDialog) {
                this._oDateSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.CareerInterns.DateSearchHelpDialog", this);
                this.getView().addDependent(this._oDateSearchHelpDialog);
            } else {
                this._oDateSearchHelpDialog.close();
            }
            this._oDateSearchHelpDialog.open();
        },
        onDateCancelButtonPress:function(oEvent){
            if (this._oDateSearchHelpDialog) {
                this._oDateSearchHelpDialog.close();
            }
        }
    });
});