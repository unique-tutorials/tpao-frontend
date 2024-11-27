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
                searchValue:{},
                requestList: [],
                managerList:{},
                selectedRequest: {},
                currentRequest: {},
                selectedAbr: null,
                // abrActionData:{
                //     displayEnabled: false
                // }
            });
        },
        _getRequestList: function (oEvent) { 

        },
        onNavBack: function () {
            // this.goBack(History);
            this.getRouter().navTo("appdispatcher", {}, true);
        },
		
		onSearch: function () {
			debugger;
			var oFilterBar = this.byId("TrainingFilter");
			var aFilterGroupItems = oFilterBar.getFilterGroupItems();
			var oModel = this.getView().getModel("trainingManagerListModel");
			var aOriginalData = oModel.getProperty("/managerList"); 
		
			var aFilters = [];
		
			aFilterGroupItems.forEach(function (oGroupItem) {
				var oControl = oGroupItem.getControl();
				var sValue = "";
				var sPath = "";
		
				if (oControl instanceof sap.m.ComboBox) {
					sValue = oControl.getSelectedKey();
					sPath = oControl.getBindingInfo("selectedKey").parts[0].path.replace("searchValue/", "").replace("/", "");
				} else if (oControl instanceof sap.m.Input) {
					sValue = oControl.getValue();
					sPath = oControl.getBindingInfo("value").parts[0].path.replace("searchValue/", "").replace("/", "");
				}
		
				if (sValue && sPath) {
					aFilters.push({
						path: sPath,
						value: sValue
					});
				}

				// if (sValue && sPath) {
				
				// 	aFilters.push(new Filter(sPath, FilterOperator.Contains, sValue));
				// }
		
			});
		
			var aFilteredData = aOriginalData.filter(function (oItem) {
				return aFilters.every(function (oFilter) {
					return oItem[oFilter.path] && oItem[oFilter.path].toString() === oFilter.value;
				});
			});
		
			oModel.setProperty("/managerList", aFilteredData);
		
			var oTable = this.byId("idPendingTable") || sap.ui.getCore().byId('idPendingTable');
			oTable.getBinding("items").refresh();
		
			console.log("Applied Filters:", aFilters);
			console.log("Filtered Data:", aFilteredData);
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
                    "Türkiye Petrolleri Anonim Ortaklığı",
                    "Bilişim Teknolojileri Daire Başkanlığı",
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