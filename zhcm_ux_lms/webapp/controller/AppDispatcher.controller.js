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

    return BaseController.extend("zhcm_ux_lms_abr.controller.AppDispatcher", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel;
            oViewModel = new JSONModel({
                busy: false,
                requestCounts: {},
                appList: [{
                    "appName": "AbrRequestList",
                    "visible": true,
                    "title": 'Yurt Dışı Burslu Öğrenci Talep',
                    "icon": "sap-icon://request"
                },
                {
                    "appName": "ApprovalRequestList",
                    "visible": true,
                    "title": 'Yurt Dışı Burslu Öğrenci Talepleri Onay',
                    "icon": "sap-icon://hr-approval"
                },
                {
                    "appName": "AbrTracking",
                    "visible": true,
                    "title": 'Burslu Öğrenci Takibi',
                    "icon": "sap-icon://time-account"
                },
                {
                    "appName": "TrplsApp",
                    "visible": true,
                    "title": 'Burslu Öğrenci Seyahat ',
                    "icon": "sap-icon://suitcase"
                },
                {
                    "appName": "TrpolApp",
                    "visible": true,
                    "title": 'Personel Seyahat Rezervasyon Talebi (Sorgu)',
                    "icon": "sap-icon://travel-request"
                },
                {
                    "appName": "AbrAccountTracking",
                    "visible": true,
                    "title": 'Burslu Öğrenci Takibi (Muhasebe)',
                    "icon": "sap-icon://collections-management"
                },
                {
                    "appName": "AbrFileUpload",
                    "visible": true,
                    "title": 'Yurt Dışı eğitim – Burslu Öğrenci Maaşları',
                    "icon": "sap-icon://customer-financial-fact-sheet"
                },
                {
                    "appName": "AbrStajyerTracking",
                    "visible": true,
                    "title": 'Staj/Beceri Eğitimi',
                    "icon": "sap-icon://group"
                },
                {
                    "appName": "TrpolApp",
                    "visible": false,
                    "title": 'Staj Eğitimi',
                    "icon": "sap-icon://group"
                },
                {
                    "appName": "TrpolApp",
                    "visible": false,
                    "title": 'Beceri Eğitimi',
                    "icon": "sap-icon://group"
                },
                {
                    "appName": "CareerInterns",
                    "visible": false,
                    "title": 'Biz Bize Kariyer Stajyerler',
                    "icon": "sap-icon://group"
                },
                {
                    "appName": "CareerInternContn",
                    "visible": true,
                    "title": 'Stajyer Öğrenci Devamsızlık Onayı',
                    "icon": "sap-icon://approvals"
                },
                {
                    "appName": "TrainingManager",
                    "visible": true,
                    "title": 'Eğitim Yöneticisi',
                    "icon": "sap-icon://employee"
                },
                {
                    "appName": "InternStudentTracking",
                    "visible": true,
                    "title": 'Stajyer Öğrenci Takibi',
                    "icon": "sap-icon://employee"
                }
            ],
                appAuthorization: {
                    ReqcrApp: false,
                    ReqapApp: false,
                    TrplnApp: false,
                    TrplsApp: false,
                    TrpolApp: false
                }
            });
            this.setModel(oViewModel, "appDispatcherView");

            this.addHistoryEntry({
                title: this.getText("LMS_APPLICATIONS"),
                icon: "sap-icon://employee-lookup",
                intent: "#RecruitmentApp-display"
            }, true);

            var oModel = this.getOwnerComponent().getModel();
            oModel.metadataLoaded().then(function () {
                SharedData.setRootLoaded();
            });

            this.getRouter().getRoute("appdispatcher").attachPatternMatched(this._onAppDispatcherMatched, this);
        },
        _onAppDispatcherMatched: function (oEvent) {
            var oModel = this.getModel();
            var oViewModel = this.getModel("appDispatcherView");
            var aAppList = oViewModel.getProperty("/appList");
            var oThis = this;
            var oPage = this.byId("idAppDispatcherPage");

            oPage.removeContent();
            oViewModel.setProperty("/busy", true);
            SharedData.setApplicationAuth(null);

            oThis._addTiles();


            oModel.metadataLoaded().then(function () {
                SharedData.setCurrentUser({});
                oModel.read("/UserSet('ME')", {
                    success: function (oData, oResponse) {
                        SharedData.setCurrentUser(oData);
                    },
                    error: function (oError) { }
                });

                var sPath = oModel.createKey("/ApplicationAuthorizationSet", {
                    Uname: "ME"
                });

                oModel.read(sPath, {
                    success: function (oData) {
                        SharedData.setApplicationAuth(oData);
                        $.each(aAppList, function (sIndex, oApp) {
                            oApp.visible = oData.hasOwnProperty(oApp.appName) ? oData[oApp.appName] : false;
                        });

                        oViewModel.setProperty("/appList", aAppList);

                        //Get authorization for new request
                        // oThis.onRefreshRequestCounts(); açılacak

                        oThis._addTiles();
                    },
                    error: function () {

                    }
                });

            });
        },
        // onRefreshRequestCounts: function () {
        //     var oModel = this.getModel();
        //     var oViewModel = this.getModel("appDispatcherView");
        //     var aAppList = oViewModel.getProperty("/appList");
        //     $.each(aAppList, function (sIndex, oApp) {
        //         if (oApp.visible) {
        //             oModel.read("/" + oApp.entitySet + "/$count", {
        //                 filters: oApp.filters,
        //                 success: function (oData, oResponse) {
        //                     oApp.count = oResponse.body;
        //                     oViewModel.setProperty("/appList/" + sIndex, oApp);
        //                 },
        //                 error: function (oError) {
        //                     oApp.count = 0;
        //                     oViewModel.setProperty("/appList/" + sIndex, oApp);
        //                 }
        //             });
        //         } else {
        //             oApp.count = 0;
        //         }
        //     });
        // },
        _addTiles:function(oEvent){
            var oViewModel = this.getModel("appDispatcherView");
            var oThis = this;
            var oPage = this.byId("idAppDispatcherPage");

            var oTileTemplate = new sap.m.GenericTile({
                header: "{appDispatcherView>title}",
                press: oThis.onAppClickHandler.bind(oThis),
                tileContent: [
                    new sap.m.TileContent({
                        content: new sap.m.NumericContent({
                            value: "{appDispatcherView>count}",
                            icon: "{appDispatcherView>icon}"
                        })
                    })
                ],
                visible: "{appDispatcherView>visible}"
            }).addStyleClass("sapUiSmallMargin");
            var oDataTemplate = new sap.ui.core.CustomData({
                key: "targetApp"
            });
            oDataTemplate.bindProperty("value", "appDispatcherView>appName");
            oTileTemplate.addCustomData(oDataTemplate);

            oPage.bindAggregation("content", {
                path: "appDispatcherView>/appList",
                template: oTileTemplate
            });

            oViewModel.setProperty("/busy", false);
        },
        onAppClickHandler: function (oEvent) {
			var sApp = oEvent.getSource().data("targetApp");
			var oThis = this;
			try {
				if (sApp) {
					var oViewModel = this.getModel("appDispatcherView");
					var aAppList = oViewModel.getProperty("/appList");
					var aTargetApp = _.filter(aAppList, ['appName', sApp]);
					if (aTargetApp[0]) {
                        oThis.onNavtoTile(aTargetApp[0]);
						//var oFunc = jQuery.proxy(oThis, aTargetApp[0].pressed);
						//oFunc.call(aTargetApp[0]);
					}
				}
			} catch (oEx) {
				jQuery.sap.log.error("App click handler failed");
			}
		},
        onNavtoTile:function(oTarget){
            this.getRouter().navTo(oTarget.appName);
            debugger;
        },
        onTrainerPoolPage: function (oTarget) {
			this.getRouter().navTo("trainerpool");
		},
        onMyTrainingRequestPage: function (oTarget) {
            debugger;
			this.getRouter().navTo("trainingRequestList");
		},
        onApproveTrainingRequestPage: function (oTarget) {
			this.getRouter().navTo("approvalRequestList");
		},
        onCollectivePlanningPage: function (oTarget) {
			this.getRouter().navTo("collectivePlanning");
		},
    });
});
