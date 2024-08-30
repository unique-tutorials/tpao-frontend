/*global QUnit*/

sap.ui.define([
	"zhcm_ux_lms/zhcm_ux_lms/controller/AppDispatcher.controller"
], function (Controller) {
	"use strict";

	QUnit.module("AppDispatcher Controller");

	QUnit.test("I should test the AppDispatcher controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
