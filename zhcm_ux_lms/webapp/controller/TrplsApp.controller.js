sap.ui.define([
    "zhcm_ux_lms_abr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "zhcm_ux_lms_abr/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zhcm_ux_lms_abr/controller/SharedData"
], function(
	BaseController, JSONModel, History, formatter, Filter, FilterOperator, SharedData
) {
	"use strict";

	return BaseController.extend("zhcm_ux_lms_abr.controller.TrplsApp", {
        formatter: formatter,
        onInit: function (oEvent) {
            var oViewModel = new JSONModel();
            this.setModel(oViewModel, "trplsRequestListModel");
            this._initiateModel();
            this.getRouter().getRoute("TrplsApp").attachPatternMatched(this._onRequestListMatched, this);
        },
        _onRequestListMatched: function (oEvent) {
            this._getRequestList();
        },
        _initiateModel: function (oEvent) {
            var oViewModel = this.getModel("trplsRequestListModel");
            var today = new Date();
            oViewModel.setData({
                requestList: [],
                selectedRequest: {},
                currentRequest: {},
                reserSearchParameter: {},
                reservationRequest: {},
                reservationEmployee:{},
                newNumberReserRequest:{
                    Rezno:null,
                    Ename:""                 
                },
                absenceFilter : { 
                    begda: new Date(today.getFullYear(), today.getMonth(), 1),
                    endda: new Date(today.getFullYear(), today.getMonth() + 1, 0)
                },
                reservationList:{},
                aplicationSetting: {
                    enabled: true,
                },
            });
        },
        onNavBack: function () {
            var oModel = this.getView().getModel("trplsRequestListModel");
            var aPaths = [
                "/newNumberReserRequest",
                "/reservationEmployee"
            ];
            aPaths.forEach(function (sPath){
                oModel.setProperty(sPath, {});
            });
      
            this.getRouter().navTo("appdispatcher", {}, true);
        },
        _getRequestList: function (oEvent) { 

        },
        onTypeChange:function(oEvent){
            debugger;
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var oCityComboBox = this.byId("idCityComboBox");

            if (oCityComboBox) {
                var aFilters = [];
                aFilters.push(new Filter("Group", FilterOperator.EQ, sSelectedKey));
        
                var oBinding = oCityComboBox.getBinding("items");
                oBinding.filter(aFilters);
            }
        },
        onSearch:function(){
            debugger;
            var oModel = this.getModel(),
            oViewModel = this.getModel("trplsRequestListModel"),
            sBegda = oViewModel.getProperty("/absenceFilter/begda"),
            sEndda =  oViewModel.getProperty("/absenceFilter/endda"),
            oFilter = oViewModel.getProperty('/reserSearchParameter'),
            aFilters = [];
            if(oFilter.Pernr) aFilters.push(new Filter("Pernr", FilterOperator.EQ, oFilter.Pernr));
           
             aFilters.push(new Filter("Vorna", FilterOperator.EQ, oFilter.Vorna));
             aFilters.push(new Filter("Nachn", FilterOperator.EQ, oFilter.Nachn));
            aFilters.push(new Filter("Rered", FilterOperator.BT, sBegda,sEndda));

            oModel.read("/TravelReservationSet", {
                filters: aFilters,
                success: function (oData) {
                    this._sweetToast(this.getText("ABSENCE_CONFIRMATION"), "S");
                    oViewModel.setProperty("/reservationList", oData.results);
                }.bind(this),
                error: function () {
                }.bind(this)
            });
        },

        onSearchs:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("trplsRequestListModel");
            var oFilter = oViewModel.getProperty('/reserSearchParameter');
            var aFilters = this._getFilters(oFilter);

            var oTable = this.getView().byId('reservationTable') || sap.ui.getCore().byId('reservationTable');
            oTable.getBinding('items').filter(aFilters,"Application");
           

            // aFilters.push(new Filter("Rered", FilterOperator.BT, oFilter.beginDate, oFilter.endDate));
            // var oTable = this.getView().byId('reservationTable') || sap.ui.getCore().byId('reservationTable');
            // oTable.getBinding('items').filter(aFilters,"Application");
            
            // oModel.read(sPath, {
            //     filters: aFilters,
            //     success: function(oData) {
                   
            //         console.log(oData);
            //     },
            //     error: function(oError) {
            //         sap.m.MessageToast.show("Veri yüklenirken hata oluştu.");
            //     }
            // });
            
        },
        _getFilters: function (oFilter) {
            var aFilters = [];
            var aKeys = Object.keys(oFilter);
            for (var i = 0; i < aKeys.length; i++) {
                var sVal = oFilter[aKeys[i]].toString();
                if(sVal){
                    var oFilterElement = new Filter(aKeys[i],FilterOperator.EQ , sVal);
                    aFilters.push(oFilterElement);
                }
            }
            return aFilters;
        },
        onItemSelected: function(oEvent) {
            debugger;
            var oSelectedItem = oEvent.getSource().getBindingContext('trplsRequestListModel').getObject();
        
            var oViewModel = this.getModel('trplsRequestListModel');
            oViewModel.setProperty("/newNumberReserRequest/Rezno", oSelectedItem.Rezno); 
            oViewModel.setProperty("/newNumberReserRequest/Pernr", oSelectedItem.Pernr); 
            oViewModel.setProperty("/newNumberReserRequest/Ename", oSelectedItem.Vorna +' '+ oSelectedItem.Nachn ); 
        
            if (this._oReserSearchHelpDialog) {
                this._oReserSearchHelpDialog.close();
            }
        }, 
        onShowReservationSearchHelp: function(oEvent) {
            if (!this._oReserSearchHelpDialog) {
                this._oReserSearchHelpDialog = sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.TrplsApp.ReservationSearchHelpDialog", this);
                this.getView().addDependent(this._oReserSearchHelpDialog);
            } else {
                this._oReserSearchHelpDialog.close();
            }
            this._oReserSearchHelpDialog.open();
        },
        onCancelReservationDialog:function(oEvent){
            if (this._oReserSearchHelpDialog) {
                this._oReserSearchHelpDialog.close(); 
            }
        },
        onNewTrainingRequest: function (oEvent) {
            if (!this._oNewRequestDialog) {
				this._oNewRequestDialog = new sap.ui.xmlfragment("zhcm_ux_lms_abr.fragment.AbrRequestList.TrainingRequestFormDialog", this);
				this.getView().addDependent(this._oNewRequestDialog);
			}
			this._oNewRequestDialog.open();
         },

        //  onSearchReservationPress: function (oEvent) {
        //     debugger;
        //     var that = this;
        //     var oModel = this.getModel();
        //     var sRezno = this.getView().getModel("trplsRequestListModel").getProperty("/newNumberReserRequest/Rezno");

        //     function readData(sPath, sModelProperty, errorMessage) {
        //         oModel.read(sPath, {
                   
        //             success: function (oData) {
        //                 var oViewModel = that.getModel("trplsRequestListModel");
        //                 oViewModel.setProperty(sModelProperty, oData);
        //                 console.log(oData);
        //             },
        //             error: function () {
        //                 sap.m.MessageToast.show(errorMessage);
        //             }
        //         });
        //     }
          
        //     var sReservationPath = oModel.createKey("/TravelReservationSet", { Rezno: sRezno });
        //     readData(sReservationPath, "/reservationEmployee", "Rezervasyon bilgileri alınamadı.");
        
        // },
        onSearchReservationPress: function (oEvent) {
            debugger;
            var that = this;
            var oModel = this.getModel();
            var oViewModel = this.getView().getModel("trplsRequestListModel");
            var sRezno = oViewModel.getProperty("/newNumberReserRequest/Rezno");
            var sPernr = oViewModel.getProperty("/newNumberReserRequest/Pernr")

            // var aFilters = [];
            // aFilters.push(new Filter("Rezno", FilterOperator.EQ, sRezno))
            var sTravelInfoPath = oModel.createKey("/TravelReservationSet", { Rezno: sRezno, Pernr: sPernr });
        
            oModel.read( sTravelInfoPath, {
                // filters: aFilters,
                success: function (oData) {
                    oViewModel.setProperty("/reservationEmployee", oData);

                    if (oData.Resma === true) {
                        oViewModel.setProperty("/aplicationSetting/enabled", false);
                    } else {
                        oViewModel.setProperty("/aplicationSetting/enabled", true);
                    }
                    that._sweetToast(that.getText("RESERVATION_SUCCESSFULLY"), "S");
                    console.log("Rezervasyon bilgileri dataa:", oData);
                },
                error: function () {
                    sap.m.MessageToast.show("Rezervasyon bilgileri alınamadı.");
                }
            });
        },
        onReservationSaveButton: function(oEvent) {
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("trplsRequestListModel");
            var oReservationEntry = oViewModel.getProperty('/reservationEmployee');
        
            // if (oReservationEntry.Rezno === null) {
            //     delete oReservationEntry.Rezno;
            // }

            oModel.create("/TravelReservationSet", oReservationEntry, {
                success: function(oData, oResponse) {
                    debugger;
                    this._sweetToast(this.getText("RESERVATION_CREATE_SUCCESS"), "S");
                }.bind(this),
                error: function() {
                    debugger;
                }
            });
        },
        onReservationSendMailButton:function(oEvent){
        debugger;
        var oModel = this.getModel();
        var oViewModel = this.getModel("trplsRequestListModel");
        var sPernr = oViewModel.getProperty("/reservationEmployee/Pernr"),
            sCity = oViewModel.getProperty("/reservationEmployee/Citys"),
            sConry = oViewModel.getProperty("/reservationEmployee/Conry"),
            sDepda = oViewModel.getProperty("/reservationEmployee/Depda"),
            sNachn = oViewModel.getProperty("/reservationEmployee/Nachn"),
            sRetda = oViewModel.getProperty("/reservationEmployee/Retda"),
            sRezno = oViewModel.getProperty("/newNumberReserRequest/Rezno"),
            sVorna = oViewModel.getProperty("/reservationEmployee/Vorna"),
            sRered = oViewModel.getProperty("/reservationEmployee/Rered")
            

        var oUrlParameters = {
            Pernr: sPernr,
            City: sCity,
            Conry: sConry,
            Depda: sDepda,
            Nachn: sNachn,
            Retda: sRetda,
            Rezno: sRezno,
            Vorna: sVorna,
            Rered: sRered,
            };

            this._openBusyFragment("PLEASE_WAIT", []);
            oModel.callFunction("/SendTravel", {
                method: "POST",
                urlParameters: oUrlParameters,
                success: function (oData, oResponse) {
                    this._sweetToast(this.getText("RESERVATION_INFO_EMAIL"), "S");
                    this._closeBusyFragment();
                  }.bind(this),
                  error: function (oError) {
                    debugger;
                  }.bind(this),
                });
        }
	});
});