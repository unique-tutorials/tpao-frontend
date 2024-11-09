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
             
            });
        },
        _getRequestList: function (oEvent) { 

        },
        onSearch:function(oEvent){
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
            var oSelectedItem = oEvent.getSource().getBindingContext().getObject();
        
            var oViewModel = this.getModel('trplsRequestListModel');
            oViewModel.setProperty("/newNumberReserRequest/Rezno", oSelectedItem.Rezno); 
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

            var aFilters = [];
            aFilters.push(new Filter("Rezno", FilterOperator.EQ, sRezno))
        
            // $filter parametresi ile sRezno'yu istek URL'sine ekleyin
            oModel.read("/TravelReservationSet", {
                filters: aFilters,
                success: function (oData) {
                    oViewModel.setProperty("/reservationEmployee", oData.results[0]);
                    sap.m.MessageToast.show("Rezervasyon bilgileri alındı.");
                    console.log("Rezervasyon bilgileri dataa:", oData);
                },
                error: function () {
                    sap.m.MessageToast.show("Rezervasyon bilgileri alınamadı.");
                }
            });
        },
        onReservationSaveButton:function(oEvent){
            debugger;
            var oModel = this.getModel();
            var oViewModel = this.getModel("trplsRequestListModel");
            var oReservationEntry = oViewModel.getProperty('/reservationEmployee');
             // Genel bilgiler sekmesi seçiliyse
            // Yurtiçi dil okul bilgiler sekmesi seçiliyse
                oModel.create("/TravelReservationSet", oReservationEntry, {
                    success: function(oData, oResponse) {
                        debugger;
                        if (oData.Mesty === "S") {
                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: that.getText("EDU_TASK_SAVED_SUCCESSFUL"),
                                showConfirmButton: false,
                                timer: 1500
                                });
                        }
                    },
                    error: function() {
                        debugger;
                    }
                });
        }
        
	});
});