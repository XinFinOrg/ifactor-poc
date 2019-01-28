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
 '$http', '$location', 'GetPost', 'Helper', 'Upload',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper, Upload) {

	var stateMap = Helper.stateMap;

	/*$scope.urlMap = function(type) {

		if (type == 'createInvoice') {
			$location.path('/create-invoice');
		}
		$scope.dashboardUrl = {
			buyer : '/views/buyer-dashboard.html',
			financier : '/views/financier-dashboard.html',
			supplier : '/views/supplier-dashboard.html',
			supplierApproved : '/views/supplier-approved.html',
			createInvoice : '/views/createInvoice.html',
		};

		$scope.templateUrlDashboard = $scope.dashboardUrl[type];
	};

	$scope.urlMap('supplier');*/

	$scope.date = new Date();
	$scope.eventSources = [];
	$scope.companyOptions = [];
 	$scope.companyTypeOptions = Helper.companyTypeOptions();

	GetPost.get({url : '/getBuyerList'}, function(err, docs) {
		console.log(docs);
		$scope.companyOptions = docs.data;
		console.log('init : companyNameData', $scope.companyNameData)
		if (Helper.isObjEmpty($scope.companyNameData) && $scope.companyOptions &&
			$scope.companyOptions.length > 0) {
			$scope.companyNameData = $scope.companyOptions[0];
		}
    });

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
		console.log('$scope.companyOptions')
		var index = getArrIndexByVal($scope.companyOptions, 'email', input.buyerEmail);
		console.log('buyer', input.buyerEmail, 'index', index, 'buyers', $scope.companyOptions)
		$scope.companyNameData = index >= 0 ? $scope.companyOptions[index] : {};
	}

    $scope.submitInvoice2 = function (input, type) {
    	$scope.input.state = type;
    	$scope.input = $scope.getBuyerData(input);
    	console.log(input);

    	var data = {
			input : $scope.input,
			url : '/createInvoice'
		}

		GetPost.post(data, function(err, docs) {
			$location.path('/dashboard');
	    });

    };

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
		$scope.isSubmitNowButtonDisabled = true;
    	$scope.input.state = type;
    	$scope.input = $scope.getBuyerData(input);
    	if (!validateInvoice()) {
			$scope.isSubmitNowButtonDisabled = false;
    		return;
    	}

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
		.then(resp => {
	    	console.log('submit data',resp);
	    	if (type == 'draft') {
				Helper.showAlert('save_invoice');
	    	} else {
				Helper.showAlert('submit_invoice');
	    	}
			$location.path('/dashboard');
	    }).catch(err => { 
	        console.log(err);
	    });
	};

	var validateInvoice = function() {
		var invoice = $scope.input;
		var errors = 0;
		(!$scope.companyNameData || !$scope.companyNameData.email) ?
			(Helper.showAlert('invoice_buyer'), errors++) : undefined;
		!invoice.payableDate ? (errors++, Helper.showAlert('invoice_payableDate')) : undefined;
		!invoice.invoiceNo ? (Helper.showAlert('invoiceNo'), errors++) : undefined;
		!invoice.invoiceAmount ? (Helper.showAlert('invoiceAmount'), errors++) : undefined;
		return !errors;
	}

	$scope.uploadImages = function (file) {
	    Upload.upload({
	        url: '/upload',
            method : 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            arrayKey : '',
	        data:{file:file}
	    }).then(function (resp) {
	    	console.log(resp);
	    }, function (resp) {
	        console.log('Error status: ' + resp.status);
	    }, function (evt) { 
	        console.log(evt);
	        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
	        $scope.vm.progress = 'progress: ' + progressPercentage + '% ';
	    });
	};
	
}]);