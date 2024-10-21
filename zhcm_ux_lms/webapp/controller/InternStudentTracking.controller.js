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
				suggestionActionData: {
                    deleteEnabled: false,
                    displayEnabled: false,
                    priorityEditable: false,
                    priorityDisplay: true
                },
				ratingScaleList:[
					{
						titles:"1 Puan =",
						desc:"Kesinlikle Katılmıyorum / Çok Düşük",
					},
					{
						titles:"2 Puan =",
						desc:"Katılmıyorum / Düşük",
					},
					{
						titles:"3 Puan =",
						desc:"Kararsızım / Orta",
					},
					{
						titles:"4 Puan =",
						desc:"Katılıyorum / Yüksek",
					},
					{
						titles:"5 Puan =",
						desc:"Kesinlikle Katılıyorum / Çok Yüksek olarak değerlendirilmiştir.",
					},
				],
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
				levelDescriptionList:[
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
				],
				evaluationQuestionsList : [
					{
						numb:"1",
						Ques:"Öğrenci işi öğrenmek için heveslidir, mesleki konulara karşı sorgular",
						Point:null
					},
					{
						numb:"2",
						Ques:"Öğrenci önceden belirttiği zaman planında şirkete düzenli olarak gelir.",
						Point:null
					},
					{
						numb:"3",
						Ques:"Öğrenci yerine getirmesi gereken yükümlülükleri, zamanında ve eksiklik olarak yapar.",
						Point:null
					},{
						numb:"4",
						Ques:"Öğrenci öğrendiklerinin kalıcı olmasını sağlamaya çalışır.(Notlar alır, uygulama ve/veya pratik yapmayı dener.)",
						Point:null
					},{
						numb:"5",
						Ques:"Öğrenci iş ilişkisinde bulunduğu her seviyedeki kişilerle yapıcı ilişkiler kurar, yöneticilerine ve çalışma arkadaşlarına karşı saygılı davranır.",
						Point:null
					},{
						numb:"6",
						Ques:"Öğrenci görüş ve düşüncelerini açık ve net olarak ifade eder.",
						Point:null
					},{
						numb:"7",
						Ques:"Öğrenci işle ilgili detayları doğru bir şekilde ele alır, bütüne bakarken detayları gözden kaçırmaz ve sorumluluk gösterir.",
						Point:null
					},{
						numb:"8",
						Ques:"Öğrenci yaptığı çalışmalarda durum ve olayların neden-sonuç ilişkilerini dikkate alarak değerlendirir.",
						Point:null
					},{
						numb:"9",
						Ques:"Görüş ve Öneriler",
						Point:null
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
         },
		 onEditPress: function () {
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
		}
	});
});