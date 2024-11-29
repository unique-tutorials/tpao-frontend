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

	return BaseController.extend("zhcm_ux_lms_abr.controller.InternStudentTracking", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "internStudentListModel");
            this._initiateModel();
            this.getRouter().getRoute("InternStudentTracking").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
		onNavBack: function () {
            // this.goBack(History);
            this.getRouter().navTo("appdispatcher", {}, true);
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("internStudentListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
				searchTrackingParameter:{},
                evaluationHighList:{
                    evaluationData:[]
                },
                evaluationPointsList:{},
				suggestionActionData: {
                    deleteEnabled: false,
                    displayEnabled: false,
                    priorityEditable: false,
                    priorityDisplay: true
                },
				scoreScaleList: {},
				evaluationQuestionsList : {},
				newInternNumberRequest: {
                    Pernr: null,
                    Ename: ""
                },
                levelDescriptionList:[
                    {
                        title: "Başlangıç (1): Aday mühendis konu hakkında hiçbir bilgiye sahip değildir."
                    },
                    {
                        title: "Temel (2): Aday mühendis konu hakkında teorik bilgi sahibidir fakat herhangi bir uygulamada bulunamaz."
                    },
                    {
                        title: "Uygulama (3): Aday mühendis konu hakkında bir gözetmen/danışman eşliğinde veya gözetiminde uygulama yapabilir."
                    },
                    {
                        title: "Uzman (4): Aday mühendis konu hakkında yanlız çalışma yapabilir ve başka bir kişiye bilgisini aktarabilir verebilir."
                    },
                    {
                        title: "Yetkin (5): Aday mühendis konu hakkında değerlendirme yapabilir ve proje geliştirebilir."
                    },
                ]
            });
        },
        _getRequestList: function () { 

        },
        onShowWageSearchHelp: function (oEvent) {
            if (!this._oNewWageSearchHelpDialog) {
				this._oNewWageSearchHelpDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrFileUpload.WageSearchHelpDialog", this);
				this.getView().addDependent(this._oNewWageSearchHelpDialog);
			}
			this._oNewWageSearchHelpDialog.open();
         },
        onCancelWageButtonPress:function(oEvent){
            if (this._oNewWageSearchHelpDialog) {
                this._oNewWageSearchHelpDialog.close();
            }
         },
		//  onEditPress: function () {
        //     var oViewModel = this.getModel("internStudentListModel"),
        //         sVisible = oViewModel.getProperty("/suggestionActionData/priorityEditable");
        //     if (!sVisible) {
        //         oViewModel.setProperty("/suggestionActionData/priorityEditable", true);
        //         oViewModel.setProperty("/suggestionActionData/priorityDisplay", false);
        //     } else {
        //         oViewModel.setProperty("/suggestionActionData/priorityEditable", false);
        //         oViewModel.setProperty("/suggestionActionData/priorityDisplay", true);
        //     }
        // },
		onShowStudentTrackingSearchHelp: function(oEvent){
			if (!this._oNewStudentTrackingSearchHelpDialog) {
				this._oNewStudentTrackingSearchHelpDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.InternStudentTracking.StudentTrackingSearchHelpDialog", this);
				this.getView().addDependent(this._oNewStudentTrackingSearchHelpDialog);
			}
			this._oNewStudentTrackingSearchHelpDialog.open();
		},
		onCancelStudentTrackingButtonPress:function(oEvent){
			if (this._oNewStudentTrackingSearchHelpDialog) {
				this._oNewStudentTrackingSearchHelpDialog.close();
			}
		},
		onSearch:function(oEvent){
			debugger;
			var oViewModel = this.getModel('internStudentListModel');
            var oFilter = oViewModel.getProperty('/searchTrackingParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('studentTrackingTable') || sap.ui.getCore().byId('studentTrackingTable');
            oTable.getBinding('items').filter(aFilters, "Application");
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
		onItemSelected: function (oEvent) {
			debugger;
			var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
            console.log("data:" , oSelectedItem);
            var oViewModel = this.getModel('internStudentListModel');
            oViewModel.setProperty("/newInternNumberRequest/Pernr", oSelectedItem.Pernr); 
            oViewModel.setProperty("/newInternNumberRequest/Mento", oSelectedItem.Mento);
            oViewModel.setProperty("/newInternNumberRequest/Ename", oSelectedItem.Vorna +' '+ oSelectedItem.Nachn ); 
            oViewModel.setProperty("/evaluationHighList/evaluationData",[]);
            if (this._oNewStudentTrackingSearchHelpDialog) {
                this._oNewStudentTrackingSearchHelpDialog.close();
            }
        },
		onSearchTrackingPress:function(oEvent){
			debugger;
			var that = this;
			var oModel = this.getModel();
            var oViewModel = this.getModel("internStudentListModel");
			var sPernr= oViewModel.getProperty("/newInternNumberRequest/Pernr");
            var sMento = oViewModel.getProperty("/newInternNumberRequest/Mento");
			var aFilters = [];
			aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr))

			if (!sPernr) {
				this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "W");
				return;
			}
        
			function readData(sPath, sModelProperty, errorMessage) {
				oModel.read(sPath, {
					filters: aFilters,
					success: function (oData,oResponse) {
						var oViewModel = that.getModel("internStudentListModel");
						oViewModel.setProperty(sModelProperty, oData);
						console.log(oData);
					},
					error: function () {
						sap.m.MessageToast.show(errorMessage);
					}
				});
			}
            var sExpand = "EvaluationAnswersSet"
            function readDataList(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    urlParameters: {
                        "$expand": sExpand
                    },
                    success: function (oData, oResponse) {
                        oViewModel.setProperty(sModelProperty, _.cloneDeep(oData.EvaluationAnswersSet.results));
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageToast.show(errorMessage);
                    }.bind(this)
                });
            }
            function readDataScores(sPath, sModelProperty, errorMessage) {
                oModel.read(sPath, {
                    urlParameters: {
                        "$expand": sExpand
                    },
                    success: function (oData, oResponse) {
                        oViewModel.setProperty(sModelProperty, oData);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageToast.show(errorMessage);
                    }.bind(this)
                });
            }

            // Öğrenci bilgileri al
			var sScholarshipPath = oModel.createKey("/IntershipStudentSet", { Pernr: sPernr });
			readData(sScholarshipPath, "/SelectedInternEmployee", "Stajyer Öğrenci bilgisi alınamadı.");
            
            // Değerlendirme Anket bilgilerini al
            var sEvaluationInfoPath = oModel.createKey("/IntershipEvaluationSet", { Pernr: sPernr, Mento: sMento });
            readDataList(sEvaluationInfoPath, "/evaluationHighList/evaluationData", "Form bilgileri alınamadı.");

            //Puan bilgilerini al
            var sEvaluationScoresInfoPath = oModel.createKey("/IntershipEvaluationSet", { Pernr: sPernr, Mento: sMento });
            readDataScores(sEvaluationScoresInfoPath, "/evaluationPointsList", "Puan bilgileri alınamadı.");
	
		},

        onCheckBoxSelect:function(oEvent){
            debugger;
            var oViewModel = this.getModel("internStudentListModel"),
                oSource = oEvent.getSource(),
                sValue = oSource.data("value"),
                sSelect = oSource.getSelected(),
                sPath = oSource.getBindingContext("internStudentListModel").getPath();
                if (sSelect) {
                    oViewModel.setProperty(sPath + "/Answe", sValue)  
                }else {
                    oViewModel.setProperty(sPath + "/Answe", "")
                }
        },

        // onIntershipButtonPress:function(oEvent){
        //     debugger;
          
        //     var oModel = this.getModel();
        //     var oViewModel = this.getModel("internStudentListModel");
        //     var oPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
        //     var sMento = oViewModel.getProperty("/SelectedInternEmployee/Mento");
        //     var sPath = oModel.createKey("/IntershipEvaluationSet", {
        //         "Pernr": oPernr,
        //         "Mento": sMento,
        //    });
        //     var sExpand = "EvaluationAnswersSet";
        //     function readData(sPath, sModelProperty, errorMessage) {

        //     oModel.read(sPath, {
        //         urlParameters: {
        //             "$expand": sExpand
        //         },
        //         success: function (oData, oResponse) {
        //             oViewModel.setProperty(sModelProperty, _.cloneDeep(oData.EvaluationAnswersSet.results));
        //             this._sweetToast(this.getText("SUCCESS_SURVEY_INFORMATION"), "S");
        //             this._closeBusyFragment();
        //         }.bind(this),
        //         error: function (oError) {
        //             sap.m.MessageToast.show(errorMessage);
        //             this._sweetToast(this.getText("FAIL_SURVEY_INFORMATION"), "E");
        //         }.bind(this)
        //     });
        // }
        //     var sEvaluationInfoPath = oModel.createKey("/IntershipEvaluationSet", { Pernr: oPernr, Mento: sMento });
        //     readData(sEvaluationInfoPath, "/evaluationHighList/evaluationData", "Form bilgileri alınamadı.");
        // },

        // onPointsButtonPress:function(oEvent){
        //     debugger;
        //     var oModel = this.getModel();
        //     var oViewModel = this.getModel("internStudentListModel");
        //     var oPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
        //     var sMento = oViewModel.getProperty("/SelectedInternEmployee/Mento");
        //     var sPath = oModel.createKey("/IntershipEvaluationSet", {
        //         "Pernr": oPernr,
        //         "Mento": sMento,
        //     });
        //     var sExpand = "EvaluationAnswersSet";
        //     oModel.read(sPath, {
        //         urlParameters: {
        //             "$expand": sExpand
        //         },
        //         success: function (oData, oResponse) {
        //             oViewModel.setProperty("/evaluationPointsList", oData);
        //             this._sweetToast(this.getText("SCORES_READ_SUCCESS"), "S");
        //             this._closeBusyFragment();
        //         }.bind(this),
        //         error: function (oError) {
        //             this._sweetToast(this.getText("SCORES_READ_FAIL"), "E");
        //         }.bind(this)
        //     });
        // },
        onEditScoresPress:function(oEvent){
            var oViewModel = this.getModel("internStudentListModel"),
            sVisible = oViewModel.getProperty("/suggestionActionData/priorityEditable");
            if (!sVisible) {
                oViewModel.setProperty("/suggestionActionData/priorityEditable", true);
                oViewModel.setProperty("/suggestionActionData/priorityDisplay", false);
            } else {
                oViewModel.setProperty("/suggestionActionData/priorityEditable", false);
                oViewModel.setProperty("/suggestionActionData/priorityDisplay", true);
            }
        },
        onDescButtonPress:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("internStudentListModel");
            var sPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
            var sMento = oViewModel.getProperty("/SelectedInternEmployee/Mento");
            var aEvaluationDescSet = oViewModel.getProperty("/evaluationPointsList");
            var sDescp = aEvaluationDescSet.Descp;
            var oUrlParameters = {
                "Pernr": sPernr,
                "Mento": sMento,
                "Descp": sDescp
            };
 
            this._openBusyFragment("PLEASE_WAIT", []);
            oModel.callFunction("/CreateExplanation", {
                method: "POST",
                urlParameters: oUrlParameters,
                success: function (oData, oResponse) {
                    // that.getModel("wageRequestListModel").setProperty("/expendInfoList");
                    this._sweetToast(this.getText("SAVE_SUCCESSFUL"), "S");
                    this._closeBusyFragment();
                }.bind(this),
                error: function (oError) {
                    debugger;
                }.bind(this)
            }); 
        },

        onSaveFormButtonPress:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("internStudentListModel");
            var sPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
            var sMento = oViewModel.getProperty("/SelectedInternEmployee/Mento");
            var aEvaluationAnswersSet = oViewModel.getProperty("/evaluationHighList/evaluationData");
            var sDescp = oViewModel.getProperty("/evaluationPointsList/Descp");
            var oEvaluationRequest = {};
            oEvaluationRequest.Pernr = sPernr;
            oEvaluationRequest.Mento = sMento;
            oEvaluationRequest.Descp = sDescp;
            oEvaluationRequest.EvaluationAnswersSet = aEvaluationAnswersSet;
            oModel.create("/IntershipEvaluationSet", oEvaluationRequest, {
                success: function (oData, oResponse) {
                    this._sweetToast(this.getText("FORM_SAVE_SUCCESSFUL"), "S");
                }.bind(this),
                error: function (oError) {
                    this._sweetToast(this.getText("FORM_SAVE_FAIL"), "E");
                }.bind(this)
            });
        }

	});
});