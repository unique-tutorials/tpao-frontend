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

    return BaseController.extend("zhcm_ux_lms_abr.controller.TrainingCollectivePlanning", {
        formatter: formatter,
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "collectivePlanningModel");
            this._initiateModel();
            this.getRouter().getRoute("collectivePlanning").attachPatternMatched(this._onCollectivePlanningMatched, this);
        },
        _onCollectivePlanningMatched: function (oEvent) {

        },
        _initiateModel: function () {
            var oViewModel = this.getModel("collectivePlanningModel");
            oViewModel.setData({
                hierarchy: {
                    levels: [{
                        Otype: "L",
                        Stext: "TPAO Ana Eğitim Kataloğu",
                        Objid: "1",
                        levels: [
                            {
                                Otype: "L",
                                Stext: "Zorunlu Eğitimler",
                                Objid: "2",
                                levels: [
                                    {
                                        Otype: "L",
                                        Stext: "Teknik Eğitimler",
                                        Objid: "5",
                                        levels: [
                                            {
                                                Otype: "D",
                                                Stext: "Basen Analizi ve Petrol Sistemi",
                                                Objid: "7",
                                                levels: [
                                                    {
                                                        Otype: "E",
                                                        Stext: " 01.09.2024  -  02.09.2024",
                                                        Objid: "9",
                                                    },
                                                    {
                                                        Otype: "E",
                                                        Stext: " 01.12.2024  -  01.12.2024",
                                                        Objid: "10",
                                                    }
                                                ]
                                            },
                                            {
                                                Otype: "D",
                                                Stext: "Doğalgaz Arama",
                                                Objid: "8",
                                            }
                                        ]
                                    },
                                    {
                                        Otype: "L",
                                        Stext: "İdari Eğitimler",
                                        Objid: "6",
                                    }
                                ]
                            },
                            {
                                Otype: "L",
                                Stext: "Zorunlu Olmayan Eğitimler",
                                Objid: "3",
                                levels: [
                                    {
                                        Otype: "L",
                                        Stext: "Teknik Eğitimler",
                                        Objid: "7",
                                    },
                                    {
                                        Otype: "L",
                                        Stext: "İdari Eğitimler",
                                        Objid: "8",
                                    }
                                ]
                            },
                            {
                                Otype: "L",
                                Stext: "Online Eğitimler",
                                Objid: "4",
                            }
                        ]
                    }
                    ]
                }
            });
        },
    });
});