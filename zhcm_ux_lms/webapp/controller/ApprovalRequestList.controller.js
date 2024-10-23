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
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "approvalRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("ApprovalRequestList").attachPatternMatched(this._onApprovalRequestListMatched, this);
        },
        _onApprovalRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("approvalRequestListModel");
            oViewModel.setData({
                approvalList:[
                    {
                        "Under": "Bilecik Şeyh Edebali Üniversitesi",
                        "Maste": "Bilgisayar Mühendisliği",
                        "Masten": "Computer Engineering",
                        "Subjet": "Bilgisayar Ağları ve Güvenliği",
                        "Subjen": "Computer Networks and Security",
                        "Count": "Almanya",
                        "Quqta": "23",
                        "Direc": "Ünite Müdürlüğü",
                        "Reaso": "Yüksek Lisans"
                    },
                    {
                        "Under": "Düzce Üniversitesi",
                        "Maste": "Elektronik Mühendisliği",
                        "Masten": "Electronics Engineering",
                        "Subjet": "Nesnelerin İnterneti",
                        "Subjen": "Internet of Things (IoT)",
                        "Count": "Fransa",
                        "Quqta": "30",
                        "Direc": "Ünite Müdürlüğü",
                        "Reaso": "Yüksek Lisans"
                    },
                    {
                        "Under": "İstanbul Teknik Üniversitesi",
                        "Maste": "Makine Mühendisliği",
                        "Masten": "Mechanical Engineering",
                        "Subjet": "Enerji Sistemleri",
                        "Subjen": "Energy Systems",
                        "Count": "İsveç",
                        "Quqta": "15",
                        "Direc": "Teknoloji Geliştirme Müdürlüğü",
                        "Reaso": "Doktora"
                    },
                    {
                        "Under": "Boğaziçi Üniversitesi",
                        "Maste": "Endüstri Mühendisliği",
                        "Masten": "Industrial Engineering",
                        "Subjet": "Operasyonel Araştırmalar",
                        "Subjen": "Operational Research",
                        "Count": "İngiltere",
                        "Quqta": "20",
                        "Direc": "Araştırma Geliştirme Müdürlüğü",
                        "Reaso": "Yüksek Lisans"
                    },
                    {
                        "Under": "Orta Doğu Teknik Üniversitesi",
                        "Maste": "Havacılık ve Uzay Mühendisliği",
                        "Masten": "Aerospace Engineering",
                        "Subjet": "Uçak Tasarımı",
                        "Subjen": "Aircraft Design",
                        "Count": "ABD",
                        "Quqta": "10",
                        "Direc": "Savunma Sanayi Müdürlüğü",
                        "Reaso": "Doktora"
                    }
                ],
                selectedRequest: {},
                aplicationSetting: {
                    enabled: true,
                    visible: true,
                    approveEnabled: false
                },
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
        _getRequestList: function (oEvent) {

        },
        onDisplayRequestDetail: function (oEvent) {
            if (!this._oRequestDisplayDialog) {
				this._oRequestDisplayDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.ApprovalRequestFormDialog", this);
				this.getView().addDependent(this._oRequestDisplayDialog);
			}
			this._oRequestDisplayDialog.open();
        },
        onEvaluationDialogButton:function(oEvent){
            if (!this._oEvaluationDisplayDialog) {
				this._oEvaluationDisplayDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.ApprovalRequestList.EvaluationDialog", this);
				this.getView().addDependent(this._oEvaluationDisplayDialog);
			}
			this._oEvaluationDisplayDialog.open();
        },
        onEvaluationCancelButtonPress:function(oEvent){
            if (this._oEvaluationDisplayDialog) {
                this._oEvaluationDisplayDialog.close();
            }
        },
        onSelectionChange: function (oEvent) {
            var oSource = oEvent.getSource(),
                oViewModel = this.getModel("approvalRequestListModel"),
                aSelectedContexts = oSource.getSelectedContexts(),
                oSelectedContext = oSource.getSelectedContexts()[0],
                oSelectedItems = oSource.getSelectedContexts().length,
                oData = {};
            if (oSelectedContext) {
                oData = oSelectedContext.getObject();
            }
            // var oData = this.getModel().getProperty(oSource.getParent().getBindingContextPath());
            oViewModel.setProperty("/currentRequest", oData);
            if (oSelectedItems >= 1) {
                var aReqno = [];
                aSelectedContexts.forEach(element => {
                    var item = element.getObject();
                    aReqno.push(item.Reqno);
                });
                oViewModel.setProperty("/currentRequest/Reqno", aReqno.toString());
                oViewModel.setProperty("/aplicationSetting/approveEnabled", true);
            } else {
                oViewModel.setProperty("/aplicationSetting/approveEnabled", false);
            }
        },
    });
});