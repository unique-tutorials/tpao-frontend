/*global MaterialSnackbar*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"zhcm_ux_lms_abr/controller/SharedData",
	"zhcm_ux_lms_abr/utils/FormValidator",
	"zhcm_ux_lms_abr/utils/sweetalert"

], function (Controller, Dialog, MessageBox, MessageToast, SharedData, FormValidator,swalJs) {
	"use strict";

	return Controller.extend("zhcm_ux_lms_abr.controller.BaseController", {

		
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */

		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		_formatPernr: function (sPernr) {
			return parseInt(sPernr, 10).toString();
		},
		
		alertMessage: function(sType, sTitle, sMessage, aParam) {
			var sIcon = sap.m.MessageBox.Icon.NONE;
			switch (sType) {
				case "W":
					sIcon = MessageBox.Icon.WARNING;
					break;
				case "E":
					sIcon = MessageBox.Icon.ERROR;
					break;
				case "S":
					sIcon = MessageBox.Icon.SUCCESS;
					break;
				case "I":
					sIcon = MessageBox.Icon.INFORMATION;
					break;
				default:
					sIcon = MessageBox.Icon.NONE;
			}

			MessageBox.show(this.getText(sMessage, aParam), {
				icon: sIcon, // default
				title: this.getText(sTitle), // default
				actions: sap.m.MessageBox.Action.OK // default
			});
		},
		_sweetToast:function(sMessage, sMessageType){
			var sTitle,sText,sIcon;
			var sI18n = this.getView().getModel("i18n").getResourceBundle();
			switch (sMessageType) {
				case 'S':
				sTitle = sI18n.getText("SUCCESS_TEXT");
				sText = sMessage;
				sIcon = "success";
				break;
				case 'W':
				sTitle = sI18n.getText("WARNING_TEXT");
				sText = sMessage;
				sIcon = "warning";
				break;
				case 'E':
				sTitle = sI18n.getText("ERROR");
				sText = sMessage;
				sIcon = "error";
				break;
				case 'I':
				sTitle = sI18n.getText("INFO_TEXT");
				sText = sMessage;
				sIcon = "info";
				break;
				default:
				sText = sMessage;
				sIcon = "info";
			}
			var Toast = Swal.mixin({
				toast: true,
				position: "top-end",
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
				didOpen: (toast) => {
				  toast.onmouseenter = Swal.stopTimer;
				  toast.onmouseleave = Swal.resumeTimer;
				}
			  });
			  Toast.fire({
				icon: sIcon,
				title: sText
			  });
		},

		_sweetAlert: function (sMessage, sMessageType) {
			var sTitle, sText, sIcon;
			var sI18n = this.getView().getModel("i18n").getResourceBundle();
			switch (sMessageType) {
				case 'S':
					sTitle = sI18n.getText("SUCCESS_TEXT");
					sText = sMessage;
					sIcon = "success";
					break;
				case 'W':
					sTitle = sI18n.getText("WARNING_TEXT");
					sText = sMessage;
					sIcon = "warning";
					break;
				case 'E':
					sTitle = sI18n.getText("ERROR");
					sText = sMessage;
					sIcon = "error";
					break;
				case 'I':
					sTitle = sI18n.getText("INFO_TEXT");
					sText = sMessage;
					sIcon = "info";
					break;
				default:
					sText = sMessage;
					sIcon = "info";
			}
			Swal.fire({
				title: sTitle,
				text: sText,
				icon: sIcon,
				showConfirmButton: false,
				timer: 2000
			});
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		/**
		 * Generic method for navigating back
		 * @public
		 * @param {sap.ui.core.routing.History} History class
		 */
		goBack: function (History) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				jQuery.sap.log.error("Hash is not defined. Nav back failed");
			}
		},
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		initOperations: function () {
			var oThis = this;
			if (!SharedData.getRootLoaded()) {
				this.getRouter().navTo("appdispatcher", {}, true);
			}
			var oModel = this.getOwnerComponent().getModel();
			oModel.metadataLoaded().then(function () {
				oThis.readUpperLevelJob(oModel);
			});
		},
		readUpperLevelJob: function (oModel) {
			var sPath = "/UpperLevelJobSet";

			oModel.read(sPath, {
				method: "GET",
				success: function (oData, oResponse) {
					SharedData.setUpperLevelJobs(oData.results);
				},
				error: function (oError) {}
			});

		},
		getText: function (sTextCode, aParam) {
			var aTextParam = aParam;
			if (!aTextParam) {
				aTextParam = [];
			}
			return this.getResourceBundle().getText(sTextCode, aTextParam);
		},

		_openBusyFragment: function (sTextCode, aMessageParameters) {
			var oDialog = this._getBusyFragment();

			if (sTextCode) {
				oDialog.setText(this.getText(sTextCode, aMessageParameters));
			} else {
				oDialog.setText(this.getText("PLEASE_WAIT"));
			}

			oDialog.open();
		},

		_closeBusyFragment: function () {
			var oDialog = this._getBusyFragment();
			oDialog.close();
		},

		_getBusyFragment: function () {
			if (!this._oBusyDialog) {
				this._oBusyDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.GenericBusyDialog", this);
				this.getView().addDependent(this.oBusyDialog);
			} else {
				this._oBusyDialog.close();
			}

			return this._oBusyDialog;
		},
		_callConfirmDialog: function (sTitle, sDialogType, sState, sConfirmation, oBeginButtonProp, oEndButtonProp) {
			var oEndButton;
			var oBeginButton;
			var dialog;

			if (oEndButtonProp) {
				oEndButton = new sap.m.Button({
					text: oEndButtonProp.text,
					type: oEndButtonProp.type,
					icon: oEndButtonProp.icon
				});
				oEndButton.attachPress(function () {
					dialog.close();
					oEndButtonProp.onPressed();
				});
			} else {
				oEndButton = new sap.m.Button({
					text: "{i18n>CANCEL_ACTION}",
					press: function () {
						dialog.close();
					}
				});
			}

			oBeginButton = new sap.m.Button({
				text: oBeginButtonProp.text,
				type: oBeginButtonProp.type,
				icon: oBeginButtonProp.icon
			});

			oBeginButton.attachPress(function () {
				dialog.close();
				oBeginButtonProp.onPressed();
			});

			dialog = new Dialog({
				title: sTitle,
				type: sDialogType,
				state: sState,
				content: new sap.m.Text({
					text: sConfirmation
				}),
				beginButton: oBeginButton,
				endButton: oEndButton,
				afterClose: function () {
					dialog.destroy();
				},
				escapeHandler: function (oPromise) {
					oPromise.reject();
				}
			});
			this.getView().addDependent(dialog);
			return dialog;
		},
		_callPDFViewer: function (sPath, sTitle) {
			/*this._pdfViewerDialog = sap.ui.xmlfragment(
				"com.bmc.hcm.erf.fragment.PDFViewer",
				this
			);

			this._pdfViewerDialog.data("pdfPath", sPath);
			this.getView().addDependent(this._pdfViewerDialog);
			this._pdfViewerDialog.setTitle(sTitle);
			this._pdfViewerDialog.open();*/
			var oPDFViewer = new sap.m.PDFViewer();
			oPDFViewer.setSource(sPath);
			oPDFViewer.setTitle(sTitle);
			oPDFViewer.open();
		},
		_callMessageToast: function (sMessg, sMsgty) {
			var oElem = $(".mdl-js-snackbar")[0];
			if (oElem) {
				try {
					var oMS = new MaterialSnackbar(oElem);

					var data = {
						message: sMessg,
						messageType: sMsgty
					};

					oMS.showSnackbar(data);
				} catch (ex) {
					MessageToast.show(sMessg);
				}
			} else {
				MessageToast.show(sMessg);
			}
		},
		_deleteRequest: function (sErfid) {
			var oModel = this.getModel();
			var oThis = this;

			var sPath = oModel.createKey("/EmployeeRequestFormSet", {
				Erfid: sErfid
			});

			oThis._openBusyFragment("FORM_BEING_DELETED");

			oModel.remove(sPath, {
				success: function () {
					oThis._closeBusyFragment();
					oThis._callMessageToast(oThis.getText("FORM_DELETE_SUCCESSFUL"), "S");
					oModel.refresh();
				},
				error: function () {
					oThis._closeBusyFragment();
				}
			});
		},
		_updateRequest: function (oFormData, sNewRequest, sNavBack, sStatusChange, History, fnCallBack) {
			var oModel = this.getModel();
			var oThis = this;

			if (sStatusChange) {
				oThis._openBusyFragment("FORM_STATUS_BEING_CHANGED");
			} else {
				oThis._openBusyFragment("FORM_BEING_SAVED");
			}
			if (sNewRequest) {
				oModel.create("/EmployeeRequestFormSet", oFormData, {
					success: function (oData, oResponse) {
						oThis._closeBusyFragment();

						if (sStatusChange) {
							oThis._callMessageToast(oThis.getText("FORM_STATUS_CHANGE_SUCCESSFUL"), "S");
						} else {
							oThis._callMessageToast(oThis.getText("FORM_SAVE_SUCCESSFUL"), "S");
						}

						if (sNavBack) {
							oThis.goBack(History);
						} else {
							if (typeof fnCallBack === "function") {
								fnCallBack();
							}
						}
					},
					error: function (oError) {
						oThis._closeBusyFragment();
					}
				});
			} else {
				var sPath = oModel.createKey("/EmployeeRequestFormSet", {
					Erfid: oFormData.Erfid
				});
				oModel.update(sPath, oFormData, {
					success: function (oData, oResponse) {
						oThis._closeBusyFragment();
						if (sStatusChange) {
							oThis._callMessageToast(oThis.getText("FORM_STATUS_CHANGE_SUCCESSFUL"), "S");
						} else {
							oThis._callMessageToast(oThis.getText("FORM_SAVE_SUCCESSFUL"), "S");
						}
						if (sNavBack) {
							oThis.goBack(History);
						}
					},
					error: function (oError) {
						oThis._closeBusyFragment();
					}
				});
			}

		},
		_assignRequest: function (sErfid, sPernr, oSuccessCallback) {
			var oModel = this.getModel();
			var oThis = this;

			var oUrlParameters = {
				"Erfid": sErfid,
				"Pernr": sPernr
			};
			this._openBusyFragment(oThis.getText("FORM_BEING_ASSIGNED"));
			oModel.callFunction("/SetEmpReqRecruiter", {
				method: "POST",
				urlParameters: oUrlParameters,
				success: function (oData, oResponse) {
					oThis._closeBusyFragment();
					oThis._callMessageToast(oThis.getText("FORM_ASSIGN_SUCCESSFUL"), "S");
					oSuccessCallback.call();
				},
				error: function (oError) {
					oThis._closeBusyFragment();
				}
			});

		},
		onDownloadFile: function (sUrl) {

			$.fileDownload(sUrl)
				.done(function () {
					jQuery.sap.log.error("Dosya indirildi");
				})
				.fail(function () {
					jQuery.sap.log.error("Hata oluştu");
				});

		},

		_formatDate: function (sDate, sTime) {
			try {
				if (sTime) {
					sDate.setMilliseconds(sTime.ms);
				}
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: sTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy",
					UTC: true
				});

				return oDateFormat.format(sDate);

			} catch (ex) {
				return "";
			}
		},
		_validateForm: function (oForm) {
			var oValidator = new FormValidator(this);

			if (oForm) {
				oValidator.clearTraces(oForm);
				var sResult = oValidator.validate(oForm);
				return sResult;
			} else {
				return true;
			}
		},
		_clearValidationTraces: function (oForm) {
			var oValidator = new FormValidator(this);
			if (oForm) {
				oValidator.clearTraces(oForm);
			}
		},
		createGUID: function () {
			return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
					v = c === "x" ? r : (r & 0x3 | 0x8);
				return v.toString(16).toUpperCase();
			});
		},
		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			var aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (entry) {
					return entry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()
	});

});