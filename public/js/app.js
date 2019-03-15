var app = angular.module('sampleApp', ['ui.bootstrap', 'ngToast', 'ngAnimate', 'rzModule', 'jkAngularRatingStars', 'ngRoute',
'appRoutes', '720kb.datepicker', 'ngFileUpload', 'ForgotPasswordCtrl', 'MainCtrl',
'SignUpCtrl', 'LoginCtrl', 'CredsCtrl', 'InvoiceDetailsCtrl',	'DashboardCtrl', 'CreateInvoiceCtrl',
'ResetPasswordCtrl', 'ProfileCtrl', 'GetPostService', 'HelperService']);

app.config(['ngToastProvider', function(ngToast) {
	ngToast.configure({
		animation: 'slide',
		verticalPosition: 'bottom',
		horizontalPosition: 'right',
		maxNumber: 1,
		combineDuplications: false,
	});
}]);


app.directive('ngCompare', function () {
	return {
		require: 'ngModel',
		link: function (scope, currentEl, attrs, ctrl) {
			var comparefield = document.getElementsByName(attrs.ngCompare)[0]; //getting first element
			compareEl = angular.element(comparefield);
			
			//current field key up
			currentEl.on('keyup', function () {
				if (compareEl.val() != "") {
					var isMatch = currentEl.val() === compareEl.val();
					ctrl.$setValidity('compare', isMatch);
					scope.$digest();
				}
			});
			
			//Element to compare field key up
			compareEl.on('keyup', function () {
				if (currentEl.val() != "") {
					var isMatch = currentEl.val() === compareEl.val();
					ctrl.$setValidity('compare', isMatch);
					scope.$digest();
				}
			});
		}
	}
});