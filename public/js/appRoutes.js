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

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'MainController'
		})

		.when('/nerds', {
			templateUrl: 'views/nerd.html',
			controller: 'NerdController'
		})

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

		.when('/geeks', {
			templateUrl: 'views/geek.html',
			controller: 'GeekController'	
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

		.otherwise({
			templateUrl: 'views/home.html',
			controller: 'MainController'
		});
	$locationProvider.html5Mode(true);

}]);