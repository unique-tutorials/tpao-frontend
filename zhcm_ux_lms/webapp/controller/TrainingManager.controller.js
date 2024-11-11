sap.ui.define([
	"zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function(
	BaseController, JSONModel, History, formatter, Filter, FilterOperator
) {
	"use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.TrainingManager", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "trainingManagerListModel");
            this._initiateModel();
            this.getRouter().getRoute("TrainingManager").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("trainingManagerListModel");
            oViewModel.setData({
                requestListTableTitle: "",
                managerSearchRequest:{},
                requestList: [],
                managerList:{},
                selectedRequest: {},
                currentRequest: {},
                RequestList:[
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
                selectedAbr: null,
                // abrActionData:{
                //     displayEnabled: false
                // }
            });
        },
        _getRequestList: function (oEvent) { 

        },
        onSearch: function(oEvent) {
            debugger;
            // Get the model to fetch the data
            var oViewModel = this.getModel('trainingManagerListModel');
            var oFilter = oViewModel.getProperty('/managerSearchRequest'); 
            var aFilters = this._getFilters(oFilter);
        
        },
        
        _getFilters: function(oFilter) {
            var aFilters = [];

        },
        
        getRecruiterList: function () {
            debugger;
			var oModel = this.getModel();
            var oViewModel = this.getView().getModel("trainingManagerListModel");
			oViewModel.setProperty("/managerList", []);
			oViewModel.setProperty("/busy", true);
			var aFilters = [
				new Filter("Lmsap", FilterOperator.EQ, 'ALL_APPROVED'),
				new Filter("Lmssf", FilterOperator.EQ, "DRF")
			];
			oModel.read("/ScholarshipStudentRequestSet", {
				filters: aFilters,
				success: function (oData, oResponse) {
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/managerList", oData.results);
				},
				error: function (oError) {
					oViewModel.setProperty("/busy", false);
					MessageBox.warning("İşe alım uzmanları okunamadı");
				}
			});

		},
        
           
        onDataExportToExcel: function(oEvent) {
            debugger;
            var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
            var sHeader = 'YLSY - İHTİYAÇ BİLDİRME FORMU';
            // if (sCurrentLocale === 'en' || sCurrentLocale === 'EN') {
            //     sHeader = 'YLSY - REQUIREMENT FORM';
            // }
        
            const wb = XLSX.utils.book_new();
            var aHeaderColumns = this._addHeaderColumns();
            var aContent = this._addBodyColums();
            var aDownload = [];
            aDownload.push(aHeaderColumns);
            for (var i = 0; i < aContent.length; i++) {
                aDownload.push(aContent[i]);
            }
        
            const ws = XLSX.utils.aoa_to_sheet(aDownload);
            ws['!cols'] = this._setColumnSizes();
            ws['!rows'] = [{ 'hpt': 50 }];
        
            XLSX.utils.book_append_sheet(wb, ws, sHeader.substring(0, 31));
        
            XLSX.writeFile(wb, sHeader + ".xlsx");
        },
        
        _setColumnSizes: function(ws) {
			var aWscols = [{
				wch: 20
			}, {
				wch: 20
			}, {
				wch: 20
			}, {
				wch: 20
			}, {
				wch: 20
			}, {
				wch: 20
			}, {
				wch: 20
			}, {
				wch: 25
			}, {
				wch: 13
			}, {
				wch: 25
			}, {
				wch: 25
			}];

			return aWscols;
		},
        _addHeaderColumns: function() {
            var aRows = [];
            var sInstitutionName = 'Adına Öğrenim Görülecek Kurum';
            var sUnitDirectorate = '*Adına Öğrenim Görülecek Birim/Genel Müdürlük';

            // var sUndergraduateField = '**Yurt Dışında Öğrenim Görülecek Alan';
            // var sMasterFieldTr = 'Alan Bazlı Kontenjan Sayısı';
            // var sMasterFieldEn = '***Başvurabilecek Lisans Mezuniyet Programları';
            // var sSubjectTr = '****Tamamlanması İstenilen Öğrenim Seviyesi';
            // var sSubjectEn = '*****Öğrenimi Tamamlandıktan Sonra Öğrencilerin Atanacağı Kadrolar';
            // var sPreferredCountry = '*****Öğrenim Görülebilecek Ülkeler';
            // var sQuota = '******1.Öğrenim Görülebilecek Ülke ve Bu Ülkedeki Üniversiteler';
            // var sUnit = '*******2.Öğrenim Görülebilecek Ülke ve Bu Ülkedeki Üniversiteler';

            var sUndergraduateField = 'Li̇sans Mezuni̇yet Alanı / Alanları';
            var sMasterFieldTr = 'Öğreni̇m Göreceği̇ Yüksek Li̇sans Alanı (Türkçe)';
            var sMasterFieldEn = 'Öğreni̇m Göreceği̇ Yüksek Li̇sans Alanı (İngi̇li̇zce)';
            var sSubjectTr = 'Öğreni̇m Göreceği̇ Yüksek Li̇sans Konusu (Türkçe)';
            var sSubjectEn = 'Öğreni̇m Göreceği̇ Yüksek Li̇sans Konusu (İngi̇li̇zce)';

            var sQuota = 'Kontenjan Sayısı';
            var sUnit = 'Öğrenci̇ni̇n Dönüşte İsti̇hdam Edi̇leceği̇ Üni̇te Ve Müdürlük';
            var sJustification = 'Bu Alanda Yurt Dışında Burslu Öğrenci̇ Okutma Gerekçesi̇';
        
            aRows.push(this._getHeaderColumn(sInstitutionName));
            aRows.push(this._getHeaderColumn(sUnitDirectorate));
            aRows.push(this._getHeaderColumn(sUndergraduateField));
            aRows.push(this._getHeaderColumn(sMasterFieldTr));
            aRows.push(this._getHeaderColumn(sMasterFieldEn));
            aRows.push(this._getHeaderColumn(sSubjectTr));
            aRows.push(this._getHeaderColumn(sSubjectEn));
            aRows.push(this._getHeaderColumn(sQuota));
            aRows.push(this._getHeaderColumn(sUnit));
            aRows.push(this._getHeaderColumn(sJustification));
        
            return aRows;
        },        
        
        _addBodyColums: function() {
            var oControlModel = this.getModel("trainingManagerListModel");
            var aPlanningData = oControlModel.getProperty("/managerList");
        
            var aBodyRows = []; 
            for (var i = 0; i < aPlanningData.length; i++) {
                var aColumns = [
                    "Tpao",
                    "Tpao Genel Müdürlük",
                    aPlanningData[i].Ftext,
                    aPlanningData[i].Ftext1,
                    aPlanningData[i].Ftext2,
                    aPlanningData[i].Ylskt,
                    aPlanningData[i].Ylski,
                    aPlanningData[i].Kntjs,
                    aPlanningData[i].Orgex,
                    aPlanningData[i].Okugr
                ];
                aBodyRows.push(aColumns);
            }
        
            return aBodyRows;
        },
        _addBodyColumn: function(sValue, sFillColor, sBorderBottomColor) {
			sFillColor = sFillColor ? sFillColor : 'ffffff';
			sBorderBottomColor = sBorderBottomColor ? sBorderBottomColor : 'f1f1f1';

			var oBodyObj = {
				v: sValue,
				t: "s",
				s: {
					alignment: {
						vertical: "center",
						horizontal: "center",
						wrapText: true
					},
					font: {
						sz: 14,
					},
					border: {
						bottom: {
							sytle: "solid",
							color: {
								rgb: sBorderBottomColor
							}
						},
						left: {
							sytle: "solid",
							color: {
								rgb: 'f1f1f1'
							}
						},
						right: {
							sytle: "solid",
							color: {
								rgb: 'f1f1f1'
							}
						}
					},
					fill: {
						fgColor: {
							rgb: sFillColor
						}
					}
				}
			};

			return oBodyObj;
		},
        _getHeaderColumn: function(sColumnName) {
			var oHeaderObj = {
				v: sColumnName,
				t: "s",
				s: {
					alignment: {
						vertical: "center",
						horizontal: "center",
						wrapText: true
					},
					border: {
						top: {
							sytle: "solid",
							color: {
								rgb: "ff0000"
							}
						},
						right: {
							sytle: "solid",
							color: {
								rgb: "ff0000"
							}
						},
						left: {
							sytle: "solid",
							color: {
								rgb: "ff0000"
							}
						},
						bottom: {
							sytle: "solid",
							color: {
								rgb: "ff0000"
							}
						}

					},
					font: {
						sz: 9,
						bold: true,
						color: {
							rgb: "ff0000"
						}
					},
					fill: {
						fgColor: {
							rgb: "ffffff"
						}
					},
					width: {

					}
				}
			};

			return oHeaderObj;
		}

    });
});