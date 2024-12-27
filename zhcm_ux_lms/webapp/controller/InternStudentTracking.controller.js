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

    return BaseController.extend(
      "zhcm_ux_lms_abr.controller.InternStudentTracking",
      {
        formatter: formatter,
        onInit: function () {
          var oViewModel = new JSONModel();
          this.setModel(oViewModel, "internStudentListModel");
          this._initiateModel();
          this.getRouter()
            .getRoute("InternStudentTracking")
            .attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
          this._getRequestList();
        },
        onNavBack: function () {
          var oModel = this.getView().getModel("internStudentListModel");
          var aPaths = [
            "/newInternNumberRequest",
            "/selectedInternEmployee",
            "/evaluationHighList/evaluationData",
            "/evaluationPointsList",
          ];
          aPaths.forEach(function (sPath) {
            oModel.setProperty(sPath, {});
          });

          this.getRouter().navTo("appdispatcher", {}, true);
        },
        _initiateModel: function () {
          var oViewModel = this.getModel("internStudentListModel");
          oViewModel.setData({
            requestList: [],
            selectedRequest: {},
            currentRequest: {},
            searchTrackingParameter: {},
            selectedInternEmployee: {},
            evaluationHighList: {
              evaluationData: [],
            },
            evaluationPointsList: {},
            suggestionActionData: {
              deleteEnabled: false,
              displayEnabled: false,
              priorityEditable: false,
              priorityDisplay: true,
            },
            scoreScaleList: {},
            evaluationQuestionsList: {},
            newInternNumberRequest: {
              Pernr: null,
              Ename: "",
            },
            aplicationSetting: {
              enabled: true,
            },
            internTechnicalRequest: {},
            addTechnicalRequest: {},
            request: {
              isSent: false,
            },
          });
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
        onShowStudentTrackingSearchHelp: function (oEvent) {
          if (!this._oNewStudentTrackingSearchHelpDialog) {
            this._oNewStudentTrackingSearchHelpDialog = new sap.ui.xmlfragment(
              "zhcm_ux_lms_abr.fragment.InternStudentTracking.StudentTrackingSearchHelpDialog",
              this
            );
            this.getView().addDependent(
              this._oNewStudentTrackingSearchHelpDialog
            );
          }
          this._oNewStudentTrackingSearchHelpDialog.open();
        },
        onCancelStudentTrackingButtonPress: function (oEvent) {
          if (this._oNewStudentTrackingSearchHelpDialog) {
            this._oNewStudentTrackingSearchHelpDialog.close();
          }
        },
        onSearch: function (oEvent) {
          debugger;
          var oViewModel = this.getModel("internStudentListModel");
          var oFilter = oViewModel.getProperty("/searchTrackingParameter");
          var aFilters = this._getFilters(oFilter);

          var oTable =
            this.getView().byId("studentTrackingTable") ||
            sap.ui.getCore().byId("studentTrackingTable");
          oTable.getBinding("items").filter(aFilters, "Application");
        },
        _getFilters: function (oFilter) {
          var aFilters = [];
          var aKeys = Object.keys(oFilter);
          for (var i = 0; i < aKeys.length; i++) {
            var sVal = oFilter[aKeys[i]].toString();
            if (sVal) {
              var oFilterElement = new Filter(
                aKeys[i],
                FilterOperator.EQ,
                sVal
              );
              aFilters.push(oFilterElement);
            }
          }
          return aFilters;
        },
        onItemSelected: function (oEvent) {
          debugger;
          var oSelectedItem = oEvent
            .getSource()
            .getBindingContext()
            .getObject();
          console.log("data:", oSelectedItem);
          var oViewModel = this.getModel("internStudentListModel");
          oViewModel.setProperty(
            "/newInternNumberRequest/Pernr",
            oSelectedItem.Pernr
          );
          oViewModel.setProperty(
            "/newInternNumberRequest/Mento",
            oSelectedItem.Mento
          );
          oViewModel.setProperty(
            "/newInternNumberRequest/Ename",
            oSelectedItem.Vorna + " " + oSelectedItem.Nachn
          );
          oViewModel.setProperty("/evaluationHighList/evaluationData", []);
          if (this._oNewStudentTrackingSearchHelpDialog) {
            this._oNewStudentTrackingSearchHelpDialog.close();
          }
        },
        onSearchTrackingPress: function (oEvent) {
          debugger;
          var that = this;
          var oModel = this.getModel();
          var oViewModel = this.getModel("internStudentListModel");
          var sPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
          var sMento = oViewModel.getProperty("/newInternNumberRequest/Mento");
          var aFilters = [];
          aFilters.push(new Filter("Pernr", FilterOperator.EQ, sPernr));

          if (!sPernr) {
            this._sweetToast(this.getText("STUDENT_NUMBER_REQUIRED"), "W");
            return;
          }

          function readData(sPath, sModelProperty, errorMessage) {
            oModel.read(sPath, {
              filters: aFilters,
              success: function (oData, oResponse) {
                var oViewModel = that.getModel("internStudentListModel");
                oViewModel.setProperty(sModelProperty, oData);
                console.log(oData);
              },
              error: function () {
                sap.m.MessageToast.show(errorMessage);
              },
            });
          }
          var sExpand = "EvaluationAnswersSet";
          function readDataList(sPath, sModelProperty, errorMessage) {
            oModel.read(sPath, {
              urlParameters: {
                $expand: sExpand,
              },
              success: function (oData, oResponse) {
                oViewModel.setProperty(
                  sModelProperty,
                  _.cloneDeep(oData.EvaluationAnswersSet.results)
                );
              }.bind(this),
              error: function (oError) {
                sap.m.MessageToast.show(errorMessage);
              }.bind(this),
            });
          }
          function readDataScores(sPath, sModelProperty, errorMessage) {
            oModel.read(sPath, {
              urlParameters: {
                $expand: sExpand,
              },
              success: function (oData, oResponse) {
                oViewModel.setProperty(sModelProperty, oData);
              }.bind(this),
              error: function (oError) {
                sap.m.MessageToast.show(errorMessage);
              }.bind(this),
            });
          }

          // Öğrenci bilgileri al
          var sScholarshipPath = oModel.createKey("/IntershipStudentSet", {
            Pernr: sPernr,
          });
          readData(
            sScholarshipPath,
            "/selectedInternEmployee",
            "Stajyer Öğrenci bilgisi alınamadı."
          );

          // Teknik Değerlendirme bilgilerini al
          // var sInternTechnicalPath = oModel.createKey("/InternTechnicalEvaluationSet", { Pernr: sPernr, Mento: sMento, Begdt:"", Findt:""});
          // readData(sInternTechnicalPath, "/internTechnicalRequest", "Teknik değerlendirme bilgisi alınamadı.");

          // Değerlendirme Anket bilgilerini al
          var sEvaluationInfoPath = oModel.createKey(
            "/IntershipEvaluationSet",
            { Pernr: sPernr, Mento: sMento }
          );
          readDataList(
            sEvaluationInfoPath,
            "/evaluationHighList/evaluationData",
            "Form bilgileri alınamadı."
          );

          //Puan bilgilerini al
          var sEvaluationScoresInfoPath = oModel.createKey(
            "/IntershipEvaluationSet",
            { Pernr: sPernr, Mento: sMento }
          );
          readDataScores(
            sEvaluationScoresInfoPath,
            "/evaluationPointsList",
            "Puan bilgileri alınamadı."
          );
        },
        getTechnicalList: function () {
          debugger;
          var that = this;
          var oModel = this.getModel();
          var oViewModel = this.getModel("internStudentListModel");
          var sPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
          var sMento = oViewModel.getProperty("/newInternNumberRequest/Mento");
          var aFilters = [
            new Filter("Pernr", FilterOperator.EQ, sPernr),
            new Filter("Mento", FilterOperator.EQ, sMento),
          ];

          this._openBusyFragment("READ_DATA");

          oModel.read("/InternTechnicalEvaluationSet", {
            filters: aFilters,
            success: (oData, oResponse) => {
              that._closeBusyFragment();
              console.log("Success: ", oData.results);

              oViewModel.setProperty("/internTechnicalRequest", oData.results);

              var oTable = that.byId("idProductsTable");
              if (oTable) {
                oTable.getBinding("items").refresh();
              }
            },
            error: (oError) => {
              that._closeBusyFragment();
              console.error("Error: ", oError);
              oViewModel.setProperty("/busy", false);
            },
          });
        },
        onAddTechnicalDialog: function (oEvent) {
          var oViewModel = this.getModel("internStudentListModel");
          oViewModel.setProperty("/aplicationSetting/enabled", true);
          oViewModel.setProperty("/addTechnicalRequest", {});
          if (!this._oAddTechnicalDialog) {
            this._oAddTechnicalDialog = new sap.ui.xmlfragment(
              "zhcm_ux_lms_abr.fragment.InternStudentTracking.AddTechnicalDialog",
              this
            );
            this.getView().addDependent(this._oAddTechnicalDialog);
          }
          this._oAddTechnicalDialog.open();
        },

        onSaveTechnicalButtonPress: function (oEvent) {
          debugger;
          var that = this;
          var oModel = this.getModel(),
            oViewModel = this.getModel("internStudentListModel");
          var sPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
          var sMento = oViewModel.getProperty("/newInternNumberRequest/Mento");
          var oRequets = oViewModel.getProperty("/addTechnicalRequest");
          oRequets.Pernr = sPernr;
          oRequets.Mento = sMento;

          oModel.create("/InternTechnicalEvaluationSet", oRequets, {
            success: function (oData, oResponse) {
              console.log("Success:", oData);
              that._sweetToast(that.getText("SAVE_SUCCESSFUL"), "S");
              that._closeBusyFragment();
            },
            error: function (oError) {
              this._sweetToast(this.getText("SAVE_ERROR"), "E");
              this._closeBusyFragment();
            }.bind(this),
          });
        },
        onCancelTechnicalButtonPress: function (oEvent) {
          if (this._oAddTechnicalDialog) {
            this._oAddTechnicalDialog.close();
          }
        },
        onCheckBoxSelect: function (oEvent) {
          debugger;
          var oViewModel = this.getModel("internStudentListModel"),
            oSource = oEvent.getSource(),
            sValue = oSource.data("value"),
            sSelect = oSource.getSelected(),
            sPath = oSource
              .getBindingContext("internStudentListModel")
              .getPath();
          if (sSelect) {
            oViewModel.setProperty(sPath + "/Answe", sValue);
          } else {
            oViewModel.setProperty(sPath + "/Answe", "");
          }
        },

        // onIntershipButtonPress:function(oEvent){
        //     debugger;

        //     var oModel = this.getModel();
        //     var oViewModel = this.getModel("internStudentListModel");
        //     var oPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
        //     var sMento = oViewModel.getProperty("/selectedInternEmployee/Mento");
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
        //     var sMento = oViewModel.getProperty("/selectedInternEmployee/Mento");
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
        onEditScoresPress: function (oEvent) {
          var oViewModel = this.getModel("internStudentListModel"),
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
            oViewModel.setProperty(
              "/suggestionActionData/priorityDisplay",
              true
            );
          }
        },
        onDescButtonPress: function (oEvent) {
          debugger;
          var oModel = this.getModel();
          var oViewModel = this.getModel("internStudentListModel");
          var sPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
          var sMento = oViewModel.getProperty("/selectedInternEmployee/Mento");
          var aEvaluationDescSet = oViewModel.getProperty(
            "/evaluationPointsList"
          );
          var sDescp = aEvaluationDescSet.Descp;
          var oUrlParameters = {
            Pernr: sPernr,
            Mento: sMento,
            Descp: sDescp,
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
            }.bind(this),
          });
        },

        onSaveFormButtonPress: function (oEvent) {
          debugger;
          var oModel = this.getModel();
          var oViewModel = this.getModel("internStudentListModel");
          var sPernr = oViewModel.getProperty("/newInternNumberRequest/Pernr");
          var sMento = oViewModel.getProperty("/selectedInternEmployee/Mento");
          var aEvaluationAnswersSet = oViewModel.getProperty(
            "/evaluationHighList/evaluationData"
          );
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
            }.bind(this),
          });
        },
        onEvaluationExportButton: function (oEvent) {
          debugger;
          var sCurrentLocale = sap.ui
            .getCore()
            .getConfiguration()
            .getLanguage();
          var sHeader = "DEĞERLENDİRME FORMU";
          const wb = XLSX.utils.book_new();
          var aHeaderColumns = this._addHeaderColumns();
          var aContent = this._addBodyColums();
          var aDownload = [];
          aDownload.push(aHeaderColumns);
          for (var i = 0; i < aContent.length; i++) {
            aDownload.push(aContent[i]);
          }

          const ws = XLSX.utils.aoa_to_sheet(aDownload);
          ws["!cols"] = this._setColumnSizes();
          ws["!rows"] = [{ hpt: 50 }];

          XLSX.utils.book_append_sheet(wb, ws, sHeader.substring(0, 31));

          // İkinci tablo
          var aHeaderColumnsSecond = this._addHeaderColumnsSecondTable();
          var aContentSecond = this._addBodyColumnsSecondTable();
          var aDownloadSecond = [];
          aDownloadSecond.push(aHeaderColumnsSecond);
          for (var i = 0; i < aContentSecond.length; i++) {
            aDownloadSecond.push(aContentSecond[i]);
          }

          const wsSecond = XLSX.utils.aoa_to_sheet(aDownloadSecond);
          wsSecond["!cols"] = this._setColumnSizes();
          XLSX.utils.book_append_sheet(wb, wsSecond, "Puan");

          XLSX.writeFile(wb, sHeader + ".xlsx");
        },
        _addBodyColums: function () {
          var oControlModel = this.getModel("internStudentListModel");
          var aEvaluationData = oControlModel.getProperty(
            "/evaluationHighList/evaluationData"
          );

          var aBodyRows = [];
          for (var i = 0; i < aEvaluationData.length; i++) {
            var aColumns = [
              aEvaluationData[i].Quenm,
              aEvaluationData[i].Quetx,
              aEvaluationData[i].Answe === "1",
              aEvaluationData[i].Answe === "2",
              aEvaluationData[i].Answe === "3",
              aEvaluationData[i].Answe === "4",
              aEvaluationData[i].Answe === "5",
              aEvaluationData[i].Answe === "6",
              aEvaluationData[i].Answe === "7",
              aEvaluationData[i].Answe === "8",
            ];
            aBodyRows.push(aColumns);
          }

          return aBodyRows;
        },
        _setColumnSizes: function (ws) {
          var aWscols = [
            {
              wch: 10,
            },
            {
              wch: 100,
            },
            {
              wch: 20,
            },
            {
              wch: 20,
            },
            {
              wch: 20,
            },
            {
              wch: 20,
            },
            {
              wch: 20,
            },
            {
              wch: 20,
            },
            {
              wch: 20,
            },
            {
              wch: 20,
            },
          ];

          return aWscols;
        },

        _addHeaderColumns: function () {
          var aRows = [];
          var sOrderNumber = "Soru Sıra No";
          var sEvaluationQuestions = "Değerlendirme Soruları";
          var sIFinallyAgree = "Kesinlikle Katılıyorum";
          var sIAgree = "Katılıyorum";
          var sPartiallyAgree = "Kısmen Katılıyorum";
          var sIMUndecided = "Kararsızım";
          var sSomewhatDisagree = "Kısmen Katılmıyorum";
          var sIDisagree = "Katılmıyorum";
          var sStronglyDiagree = "Kesinlikle Katılmıyorum";
          var sNoIdea = "Fikrim Yok";

          aRows.push(this._getHeaderColumn(sOrderNumber));
          aRows.push(this._getHeaderColumn(sEvaluationQuestions));
          aRows.push(this._getHeaderColumn(sIFinallyAgree));
          aRows.push(this._getHeaderColumn(sIAgree));
          aRows.push(this._getHeaderColumn(sPartiallyAgree));
          aRows.push(this._getHeaderColumn(sIMUndecided));
          aRows.push(this._getHeaderColumn(sSomewhatDisagree));
          aRows.push(this._getHeaderColumn(sIDisagree));
          aRows.push(this._getHeaderColumn(sStronglyDiagree));
          aRows.push(this._getHeaderColumn(sNoIdea));

          return aRows;
        },

        _getHeaderColumn: function (sColumnName) {
          var oHeaderObj = {
            v: sColumnName,
            t: "s",
            s: {
              alignment: {
                vertical: "center",
                horizontal: "center",
                wrapText: true,
              },
              border: {
                top: {
                  sytle: "solid",
                  color: {
                    rgb: "ff0000",
                  },
                },
                right: {
                  sytle: "solid",
                  color: {
                    rgb: "ff0000",
                  },
                },
                left: {
                  sytle: "solid",
                  color: {
                    rgb: "ff0000",
                  },
                },
                bottom: {
                  sytle: "solid",
                  color: {
                    rgb: "ff0000",
                  },
                },
              },
              font: {
                sz: 9,
                bold: true,
                color: {
                  rgb: "ff0000",
                },
              },
              fill: {
                fgColor: {
                  rgb: "ffffff",
                },
              },
              width: {},
            },
          };

          return oHeaderObj;
        },
        _addBodyColumnsSecondTable: function () {
          var oControlModel = this.getModel("internStudentListModel");
          var aSecondTableData = oControlModel.getProperty(
            "/evaluationPointsList"
          );

          var aBodyRows = [];
          for (var i = 0; i < aSecondTableData.length; i++) {
            var aColumns = [
              aSecondTableData[i].Descp,
              aSecondTableData[i].Tosoc,
            ];
            aBodyRows.push(aColumns);
          }
          return aBodyRows;
        },

        _addHeaderColumnsSecondTable: function () {
          var aRows = [];
          var sStdCmtAbt = "Öğrenci hakkında yorumlarınız";
          var sPoint = "Puan";
          aRows.push(this._getHeaderColumn(sStdCmtAbt));
          aRows.push(this._getHeaderColumn(sPoint));
          return aRows;
        },
        onInternActions: function (oEvent) {
          debugger;
          var oViewModel = this.getModel("internStudentListModel");
          var oSource = oEvent.getSource();
          var oData = oSource
            .getBindingContext("internStudentListModel")
            .getObject();

          if (!this._oInternActionDialog) {
            this._oInternActionDialog = new sap.ui.xmlfragment(
              "zhcm_ux_lms_abr.fragment.InternStudentTracking.InternActions",
              this
            );
            this.getView().addDependent(this._oInternActionDialog);
          }
          this._oInternActionDialog.data("formData", oData);
          this._oInternActionDialog.openBy(oSource);
        },
        onActionSelected: function (oEvent) {
          debugger;
          var oModel = this.getModel(),
            oViewModel = this.getModel("internStudentListModel"),
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
              var oViewModel = this.getModel("internStudentListModel");
              var sTitle = this.getText("NEW_PAYMENT_REQUEST");
              switch (sAction) {
                case "Display":
                  this.onAddTechnicalDialog();
                  oViewModel.setProperty("/aplicationSetting/enabled", false);
                  oViewModel.setProperty("/addTechnicalRequest", oFormData);
                  oViewModel.setProperty("/busy", true);
                  break;

                case "Edit":
                  this.onAddTechnicalDialog();
                  oViewModel.setProperty("/aplicationSetting/enabled", true);
                  oViewModel.setProperty("/addTechnicalRequest", oFormData);
                  oViewModel.setProperty("/busy", true);
                  break;
                default:
              }
              resolve();
            }.bind(this)
          );
        },
      }
    );
  }
);
