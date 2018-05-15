angular.module('CreateInvoiceCtrl', []).controller('CreateInvoiceController',['$scope', '$rootScope',
 '$http', '$location', 'GetPost', 'Helper', 'Upload',  function($scope, $rootScope,  
 	$http, $location, GetPost, Helper, Upload) {

	var stateMap = Helper.stateMap;

	$scope.urlMap = function(type) {

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

	$scope.urlMap('supplier');

	$scope.createRequest = function (argument) {
		// body...
	}

	$scope.date = new Date();
	$scope.eventSources = [];
	$scope.companyOptions = [];
 	$scope.companyTypeOptions = Helper.companyTypeOptions();

	GetPost.get({url : '/getBuyerList'}, function(err, docs) {
		console.log(docs);
		$scope.companyOptions = docs.data;
    });

	$scope.companyNameData = {};
	$scope.minPayableDate = new Date().toDateString();

    $scope.input = {
    	companyName : "Company Name",
		companyType : "Company Type",
		buyerEmail : '',
		buyerAddress : '',
		contactName : "",
		companyPhone : "",
		companyEmail : "",
		purchaseTitle : "",
		purchaseNo : "",
		purchaseDate : "",
		purchaseAmount : "",
		purchaseDocs : "",
		payableDate : "",
		invoiceNo : "",
		invoiceDate : "",
		invoiceAmount : "",
		invoiceDocs : "",
		grnNo : "",
		grnDate : "",
		grnDocs : "",
		state : "invoice_created",
		grnAmount : ""
		//buyerId
		//supplierId
    };

    $scope.getBuyerData = function(input) {
    	
		input.buyerEmail = $scope.companyNameData.email;
		input.buyerAddress = $scope.companyNameData.address;
		input.companyName = $scope.companyNameData.firstName;
    		
    	return input;
    };

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
    	$scope.input.state = type;
    	$scope.input = $scope.getBuyerData(input);
    	console.log(input);
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
	    }).then(function (resp) {
	    	console.log(resp);
	    	if (type == 'draft') {
				Helper.showAlert('save_invoice');
	    	} else {
				Helper.showAlert('submit_invoice');
	    	}
			$location.path('/dashboard');
	    }, function (resp) {
	        console.log('Error status: ' + resp.status);
	    }, function (evt) { 
	        console.log(evt);
	        /*var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
	        $scope.vm.progress = 'progress: ' + progressPercentage + '% ';*/
	    });
	};

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