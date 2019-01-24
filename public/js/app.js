angular.module('sampleApp', ['ui.bootstrap', 'ngToast', 'rzModule', 'jkAngularRatingStars', 'ngRoute', 'appRoutes', '720kb.datepicker', 'ngFileUpload',
	'ForgotPasswordCtrl', 'MainCtrl', 'NerdCtrl', 'SignUpCtrl', 'LoginCtrl', 'CredsCtrl', 'InvoiceDetailsCtrl',
	'DashboardCtrl', 'CreateInvoiceCtrl', 'NerdService', 'GeekCtrl', 'GeekService',
	'GetPostService', 'HelperService']).
	config(['ngToastProvider', function(ngToast) {
		ngToast.configure({
		  verticalPosition: 'bottom',
		  horizontalPosition: 'center',
		  maxNumber: 3
		});
	  }]);
