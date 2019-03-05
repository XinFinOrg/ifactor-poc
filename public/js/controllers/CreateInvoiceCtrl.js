angular.module('CreateInvoiceCtrl', []).directive('date', function (dateFilter) {
    return {
        require:'ngModel',
        link:function (scope, elm, attrs, ctrl) {

            var dateFormat = attrs['date'] || 'yyyy-MM-dd';
           
            ctrl.$formatters.unshift(function (modelValue) {
                return dateFilter(modelValue, dateFormat);
            });
        }
    };
}).controller('CreateInvoiceController',['$scope', '$rootScope',
 '$location', '$timeout', 'GetPost', 'Helper', 'Upload', '$window',  function($scope, $rootScope,  
 	$location, $timeout, GetPost, Helper, Upload, $window) {

	GetPost.get({ url : '/startApp' }, function(err, res) {
		if (!res.status) {
			$rootScope.isLoggedIn = false;
			$scope.showHeaderOptions = false;
			$rootScope.isMainLoader = true;
			Helper.createToast(res.error.message, 'warning');
			$timeout(() => {
				$window.location.href = '/login';
			}, 1000);
		} else {
			$rootScope.isLoggedIn = true;
			$rootScope.isMainLoader = false;
			$scope.showHeaderOptions = true;
			$scope.showToggle = false;
			$scope.dropdownMenuStyle = {'display':'none'};
			$rootScope.userType = res.data.userType;
			$rootScope.name = res.data.name;

			if ($rootScope.balance == undefined){
				GetPost.get({ url : '/getBalance' }, function(err, res) {
					if (res.status) {
						$rootScope.balance = res.data.balance;
					}
				});
			}

			GetPost.get({url : '/getBuyerList'}, function(err, docs) {
				$scope.buyerList = docs.data;
			});
		}
	});

	$scope.logOut = function () {
		$scope.showHeaderOptions = false;
		var data = { url : '/logout' };
		GetPost.get(data, function(err, res) {
			$rootScope.isMainLoader = true;
			if(res.status){
				Helper.showAlert('logged_out');
			} else {
				Helper.showAlert('error500');
			}
			$timeout(() => {
				$window.location.href = '/login';
			}, 1000);
	});
	}

	$scope.date = new Date();
	$scope.eventSources = [];
	$scope.buyerList = [];
 	$scope.companyTypeOptions = Helper.companyTypeOptions();
	$scope.companyNameData = {};
	$scope.minPayableDate = new Date().toDateString();

    $scope.input = {
    	companyName : "",
		companyType : "",
		buyerEmail : "",
		buyerAddress : "",
		contactName : "",
		companyPhone : "",
		companyEmail : "",
		purchaseTitle : "",
		purchaseNo : "",
		purchaseDate : "",
		purchaseAmount :"" ,
		purchaseDocs : "",
		payableDate : "",
		invoiceNo : "",
		invoiceDate : "",
		invoiceAmount : "",
		invoiceDocs : "",
		grnNo : "",
		grnDate : "",	
		grnDocs : "",
		state : "",
		grnAmount : 0
		//buyerId
		//supplierId
    };

    $scope.getBuyerData = function(input) {
		input.buyerEmail = $scope.companyNameData.email;
		input.buyerAddress = $scope.companyNameData.address;
		input.companyName = $scope.companyNameData.firstName;
    	return input;
    };

	var getArrIndexByVal = function(arr, key, val) {
		for (var i in arr) {
			if (arr[i][key] == val) {
				return i;
			}
		}
		return -1;
	}

	var setCompanyData = function() {
		var input = $scope.input;
		console.log('$scope.buyerList')
		var index = getArrIndexByVal($scope.buyerList, 'email', input.buyerEmail);
		console.log('buyer', input.buyerEmail, 'index', index, 'buyers', $scope.buyerList)
		$scope.companyNameData = index >= 0 ? $scope.buyerList[index] : {};
	}

    $scope.getDatesDiff = function(date) {
    	var date1 = date;
    	var date2 = new Date();
	    var diff = (Math.ceil((date1.getTime() - date2.getTime()) /
	            (1000 * 3600 * 24))/365).toFixed(2);
	    if (diff >= 0) {
	    	return diff;
	    }
	    if (!diff) {
	    	return 'N.A';
	    }
	};

	$scope.dashboardData = [];
    $scope.getInvoices = function () {
    	var data = {
			url : '/getSupplierDashboard'
		}
    	GetPost.get(data, function(err, docs) {
    		console.log(docs);
			$scope.input = docs.data[$rootScope.mainInvoiceIndex];
			setCompanyData();
	    });
    }

    if ($rootScope.fromDashboard) {
    	$scope.getInvoices();
    	$rootScope.fromDashboard = false;
    }
    
    //upload file
    $scope.poDocs = null;
    $scope.grnDocs  = null;
    $scope.invoiceDocs = null;

    $scope.submitInvoice = function (input, type) {
		$rootScope.isMainLoader = true;
		$scope.showHeaderOptions = false;
		$scope.isSubmitNowButtonDisabled = true;
    	$scope.input.state = type;
    	$scope.input = $scope.getBuyerData(input);
    	// if (!validateInvoice()) {
		// 	$scope.isSubmitNowButtonDisabled = false;
    	// 	return;
    	// }

	    Upload.upload({
	        url: '/createInvoice',
            method : 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            arrayKey : '',
	        data : {
	        	input : $scope.input,
	        	poDocs : $scope.poDocs,
	        	invoiceDocs : $scope.invoiceDocs,
	        	grnDocs : $scope.grnDocs
	        }
		})
		.then(res => {
			if(res.status){
				if (type == 'draft') {
					Helper.showAlert('save_invoice');
				} else {
					Helper.showAlert('submit_invoice');
				}
			} else { 
				Helper.createToast(res.error.msg, 'danger');
			}
			$location.path('/dashboard');
	    }).catch(err => {
	        Helper.showAlert('error500');
	    });
	};

	// var validateInvoice = function() {
	// 	var invoice = $scope.input;
	// 	var errors = 0;
	// 	(!$scope.companyNameData || !$scope.companyNameData.email) ?
	// 		(Helper.showAlert('invoice_buyer'), errors++) : undefined;
	// 	!invoice.payableDate ? (errors++, Helper.showAlert('invoice_payableDate')) : undefined;
	// 	!invoice.invoiceNo ? (Helper.showAlert('invoiceNo'), errors++) : undefined;
	// 	!invoice.invoiceAmount ? (Helper.showAlert('invoiceAmount'), errors++) : undefined;
	// 	return !errors;
	// }

	$scope.uploadImages = function (file) {
	    Upload.upload({
	        url: '/upload',
            method : 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            arrayKey : '',
	        data:{file:file}
	    }).then(function (res) {
	    	console.log(res);
	    }, function (res) {
	        console.log('Error status: ' + res.status);
	    }, function (evt) { 
	        console.log(evt);
	        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
	        $scope.vm.progress = 'progress: ' + progressPercentage + '% ';
	    });
	};
	
}]);