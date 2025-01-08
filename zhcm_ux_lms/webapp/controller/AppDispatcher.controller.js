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
                    "appName": "Inscr",
                    "visible": false,
                    "title": 'Yurt Dışı Burslu Öğrenci Talep',
                    "entitySet": "ScholarshipStudentRequestSet",
                    "filters": [
                        new Filter("Lmsap", FilterOperator.EQ, "MY_REQUESTS"),
                        new Filter("Lmssf", FilterOperator.EQ, "DRF")
                    ],
                    "pressed": "onAbrRequestListModelPage",
                    "count": 0,
                    "icon": "sap-icon://request"
                },
                {
                    "appName": "Insra",
                    "visible": false,
                    "title": 'Yurt Dışı Burslu Öğrenci Talepleri Onay',
                    "pressed": "onApprovalRequestListPage",
                    "count": 0,
                    "icon": "sap-icon://hr-approval"
                },
                {
                    "appName": "Instr",
                    "visible": false,
                    "title": 'Burslu Öğrenci Takibi',
                    "pressed": "onAbrTrackingPage",
                    "count": 0,
                    "icon": "sap-icon://time-account"
                },
                {
                    "appName": "Instc",
                    "visible": false,
                    "title": 'Burslu Öğrenci Seyahat',
                    "pressed": "onTrplsAppPage",
                    "count": 0,
                    "icon": "sap-icon://suitcase"
                },
                {
                    "appName": "Insti",
                    "visible": false,
                    "title": 'Personel Seyahat Rezervasyon Talebi (Sorgu)',
                    "pressed": "onTrpolAppPage",
                    "count": 0,
                    "icon": "sap-icon://travel-request"
                },
                {
                    "appName": "Insfi",
                    "visible": false,
                    "title": 'Burslu Öğrenci Takibi (Muhasebe)',
                    "pressed": "onAbrAccountTrackingPage",
                    "count": 0,
                    "icon": "sap-icon://collections-management"
                },
                {
                    "appName": "Inssl",
                    "visible": false,
                    "title": 'Yurt Dışı eğitim – Burslu Öğrenci Maaşları',
                    "pressed": "onAbrFileUploadPage",
                    "count": 0,
                    "icon": "sap-icon://customer-financial-fact-sheet"
                },
                {
                    "appName": "Edumn",
                    "visible": false,
                    "title": 'Eğitim Yöneticisi',
                    "pressed": "onTrainingManagerPage",
                    "count": 0,
                    "icon": "sap-icon://employee"
                }
            ],
                appAuthorization: {
                    Inscr: false,
                    Insra: false,
                    Instr: false,
                    Instc: false,
                    Insti: false,
                    Insfi: false,
                    Inssl: false,
                    Edumn: false
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
        
            oModel.metadataLoaded().then(function () {
                SharedData.setCurrentUser({});
                oModel.read("/UserSet('ME')", {
                    success: function (oData, oResponse) {
                        SharedData.setCurrentUser(oData);
                    },
                    error: function (oError) {}
                });
        
                var sPath = oModel.createKey("/AuthorizationSet", { Uname: "ME" });
        
                oModel.read(sPath, {
                    success: function (oData) {
                        SharedData.setApplicationAuth(oData);
        
       
                        $.each(aAppList, function (sIndex, oApp) {
                            if (oApp.appName === "ExpayApp") {
                                oApp.visible = true;
                            } else {
                                oApp.visible = oData.hasOwnProperty(oApp.appName) ? oData[oApp.appName] : false;
                            }
                        });
        
                        oViewModel.setProperty("/appList", aAppList);
        
                        // Get authorization for new request
                        oThis.onRefreshRequestCounts();
        
                        // Tile şablonu
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
                        }).addStyleClass("sapUiSmallMargin myTile");
        
                        var oDataTemplate = new sap.ui.core.CustomData({ key: "targetApp" });
                        oDataTemplate.bindProperty("value", "appDispatcherView>appName");
                        oTileTemplate.addCustomData(oDataTemplate);
        
                        oPage.bindAggregation("content", {
                            path: "appDispatcherView>/appList",
                            template: oTileTemplate
                        });
        
                        oViewModel.setProperty("/busy", false);
                    },
                    error: function () {}
                });
            });
        },
        onRefreshRequestCounts: function () {
            var oModel = this.getModel();
            var oViewModel = this.getModel("appDispatcherView");
            var aAppList = oViewModel.getProperty("/appList");
            $.each(aAppList, function (sIndex, oApp) {
                if (oApp.visible) {
                    oModel.read("/" + oApp.entitySet + "/$count", {
                        filters: oApp.filters,
                        success: function (oData, oResponse) {
                            oApp.count = oResponse.body;
                            oViewModel.setProperty("/appList/" + sIndex, oApp);
                        },
                        error: function (oError) {
                            oApp.count = 0;
                            oViewModel.setProperty("/appList/" + sIndex, oApp);
                        }
                    });
                } else {
                    oApp.count = 0;
                }
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
						var oFunc = jQuery.proxy(oThis, aTargetApp[0].pressed);
						oFunc.call();
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
        onAbrRequestListModelPage: function (oTarget) {
            debugger;
			this.getRouter().navTo("AbrRequestList");
		},
        onApprovalRequestListPage: function (oTarget) {
			this.getRouter().navTo("ApprovalRequestList");
		},
        onAbrTrackingPage: function (oTarget) {
			this.getRouter().navTo("AbrTracking");
		},
        onTrplsAppPage: function (oTarget) {
			this.getRouter().navTo("TrplsApp");
		},
        onTrpolAppPage: function (oTarget) {
			this.getRouter().navTo("TrpolApp");
		},
        onAbrAccountTrackingPage: function (oTarget) {
			this.getRouter().navTo("AbrAccountTracking");
		},
        onAbrFileUploadPage: function (oTarget) {
			this.getRouter().navTo("AbrFileUpload");
		},
        onAbrStajyerTrackingPage: function (oTarget) {
			this.getRouter().navTo("AbrStajyerTracking");
		},
        onCareerInternContnPage: function (oTarget) {
			this.getRouter().navTo("CareerInternContn");
		},
        onTrainingManagerPage: function (oTarget) {
			this.getRouter().navTo("TrainingManager");
		},
        onInternStudentTrackingPage: function (oTarget) {
			this.getRouter().navTo("InternStudentTracking");
		},
    });
});
