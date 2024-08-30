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
        onInit: function () {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "approvalRequestListModel");
            //this._initiateModel();
            //this.getRouter().getRoute("approvalRequestList").attachPatternMatched(this._onApprovalRequestListMatched, this);
        },
        _onApprovalRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function () {
            var oViewModel = this.getModel("approvalRequestListModel");
            oViewModel.setData({
                requestList: [
                    {
                        Reqno: "1",
                        Trnam: "Değerler Eğitimi",
                        Trtyp: "Sınıf Eğitimi",
                        Trcnt: "15",
                        Trnqp: "Personel Uzmanı",
                        Trnqn: "Yetkinlik 1"

                    },
                    {
                        Reqno: "2",
                        Trnam: "İşe Alım Eğitimi",
                        Trtyp: "Çevrim Dışı",
                        Trcnt: "30",
                        Trnqp: "Özlük Uzmanı",
                        Trnqn: "Yetkinlik 2"

                    }
                ],
                selectedRequest: {},
                currentRequest: {
                    Reqno: "2",
                    Trnam: "İşe Alım Eğitimi",
                    Trtyp: "Çevrim Dışı",
                    Trcnt: "30",
                    Trnqp: "Özlük Uzmanı",
                    Trnqn: "Yetkinlik 2"

                }

            });
        },
        _getRequestList: function () {

        },
        onDisplayRequestDetail: function () {
            if (!this._oRequestDisplayDialog) {
				this._oRequestDisplayDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.ApprovalRequestFormDialog", this);
				this.getView().addDependent(this._oRequestDisplayDialog);
			}
			this._oRequestDisplayDialog.open();
        }
    });
});