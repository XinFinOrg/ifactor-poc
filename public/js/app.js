var app = angular.module('sampleApp', ['ui.bootstrap', 'ngToast', 'ngAnimate', 'rzModule', 'jkAngularRatingStars', 'ngRoute',
'appRoutes', '720kb.datepicker', 'ngFileUpload', 'ForgotPasswordCtrl', 'MainCtrl',
'SignUpCtrl', 'LoginCtrl', 'CredsCtrl', 'InvoiceDetailsCtrl',	'DashboardCtrl', 'CreateInvoiceCtrl',
'ResetPasswordCtrl', 'ProfileCtrl', 'QuickbookConnectCtrl', 'GetPostService', 'HelperService']).
	config(['ngToastProvider', function(ngToast) {
		ngToast.configure({
			animation: 'slide',
		  verticalPosition: 'bottom',
		  horizontalPosition: 'right',
			maxNumber: 1,
			combineDuplications: false,
		});
	  }]);
