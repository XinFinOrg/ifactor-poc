angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', 'ngToastProvider', function(
	$routeProvider, $locationProvider, ngToast, ngToastProvider) {

    ngToast.configure({
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      maxNumber: 4,
      combineDuplications: true,
      newestOnTop: true,
      animation: 'fade'
		});
		
		$locationProvider.html5Mode(true);

	$routeProvider

		// home page
		// .when('/', {
		// 	templateUrl: 'views/home.html',
		// 	controller: 'MainController'
		// })

		.when('/signup', {
			templateUrl: 'views/signup.html',
			controller: 'SignUpController'
		})
		
		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'LoginController'
		})

		.when('/creds',{
			templateUrl: 'views/creds.html',
			controller: 'CredentialsController'
		})

		.when('/profile',{
			templateUrl: 'views/profile.html',
			controller: 'ProfileController'
		})

		.when('/forgot-password',{
			templateUrl: 'views/forgot-password.html',
			controller: 'ForgotPasswordController'
		})

		.when('/reset-password',{
			templateUrl: 'views/reset-password.html',
			controller: 'ResetPasswordController'
		})

		.when('/dashboard', {
			templateUrl: 'views/dashboard.html',
			controller: 'DashboardController'	
		})

		.when('/invoice-details/:invoiceId', {
			templateUrl: 'views/invoiceDetails.html',
			controller: 'InvoiceDetailsController'	
		})

		.when('/create-invoice', {
			templateUrl: 'views/createInvoice.html',
			controller: 'CreateInvoiceController'	
		})

		.when('/quickbook/connect', {
			templateUrl: 'views/home.html',
			controller: 'QuickbookConnectController'
		})

		.otherwise({
			templateUrl: 'views/home.html',
			controller: 'MainController'
		});
	

}]);