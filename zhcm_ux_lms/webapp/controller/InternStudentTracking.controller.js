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
        _initiateModel: function () {
            var oViewModel = this.getModel("internStudentListModel");
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
				technicalEvaluation: [
					{
						"SupplierName": "08.10.2024 - 14.10.2024",
						"WorkDescription": "Veritabanı tasarımı ve ilişkiler oluşturma",
						"BeforeSkillLevel": "Başlangıç (1)",
						"AfterSkillLevel": "Temel (2)",
						"Comments": "İlk kez veritabanı tasarımı yaptı."
					},
					{
						"SupplierName": "15.10.2024 - 21.10.2024",
						"WorkDescription": "UI geliştirme ve kullanıcı testleri",
						"BeforeSkillLevel": "Temel (2)",
						"AfterSkillLevel": "Uygulama (3)",
						"Comments": "UI bileşenlerinde çok gelişme gösterdi."
					},
					{
						"SupplierName": "22.10.2024 - 28.10.2024",
						"WorkDescription": "API entegrasyonu ve hata yönetimi",
						"BeforeSkillLevel": "Uygulama (3)",
						"AfterSkillLevel": "Uzman (4)",
						"Comments": "API entegrasyonlarında iyi ilerleme kaydetti."
					},
					{
						"SupplierName": "29.10.2024 - 04.11.2024",
						"WorkDescription": "Performans optimizasyonu",
						"BeforeSkillLevel": "Uzman (4)",
						"AfterSkillLevel": "Yetkin (5)",
						"Comments": "Optimizasyon tekniklerinde yetkin hale geldi."
					}
				],
				productCollection:[
					{
						title: "Başlangıç (1)",
						description: "Aday mühendis konu hakkında hiçbir bilgiye sahip değildir."
					},
					{
						title: "Temel (2)",
						description: "Aday mühendis konu hakkında teorik bilgi sahibidir fakat herhangi bir uygulamada bulunamaz."
					},
					{
						title: "Uygulama (3)",
						description: "Aday mühendis konu hakkında bir gözetmen / danışman eşliğinde veya gözetiminde uygulama yapabilir."
					},
					{
						title: "Uzman (4)",
						description: "Aday mühendis konu hakkında yalnız çalışma yapabilir ve başka bir kişiye bilgisini aktarabilir verebilir."
					},
					{
						title: "Yetkin (5)",
						description: "Aday mühendis konu hakkında değerlendirme yapabilir ve proje geliştirebilir."
					}
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
         }
	});
});