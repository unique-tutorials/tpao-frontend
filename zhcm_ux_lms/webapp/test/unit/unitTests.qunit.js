/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"zhcm_ux_lms/zhcm_ux_lms/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
