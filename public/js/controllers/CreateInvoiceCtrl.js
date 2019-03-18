const CreateInvoiceModule = angular.module('CreateInvoiceCtrl', []);
CreateInvoiceModule.directive('isNumber', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attrs, ngModel) {	
    	element.bind("keydown keypress", function (event) {
          if(event.which === 32) {
            event.returnValue = false;
            return false;
          }
       }); 
			scope.$watch(attrs.ngModel, function(newValue,oldValue) {
                var arr = String(newValue).split("");
                if (arr.length === 0) return;
                if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return;
                if (arr.length === 2 && newValue === '-.') return;
                if (isNaN(newValue)) {
                    //scope.wks.number = oldValue;
                    ngModel.$setViewValue(oldValue);
    								ngModel.$render();
                }
            });
          
		}
	};
});

CreateInvoiceModule.directive('date', function (dateFilter) {
    return {
        require:'ngModel',
        link:function (scope, elm, attrs, ctrl) {

            var dateFormat = attrs['date'] || 'yyyy-MM-dd';
           
            ctrl.$formatters.unshift(function (modelValue) {
                return dateFilter(modelValue, dateFormat);
            });
        }
    };
});
CreateInvoiceModule.controller('CreateInvoiceController',['$scope', '$rootScope',
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

			if ($rootScope.fromDashboard) {
				$scope.getInvoice($rootScope.invoiceId);
				$rootScope.fromDashboard = false;
			}
			
			//upload file
			$scope.poDocs = null;
			$scope.grnDocs  = null;
			$scope.invoiceDocs = null;
			$scope.date = new Date();
			$scope.eventSources = [];
			$scope.buyerList = [];
			$scope.companyTypeOptions = Helper.companyTypeOptions();
			$scope.companyNameData = {};
			$scope.minPayableDate = new Date().toDateString();
			$scope.dashboardData = [];
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
			};
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

	$scope.toggleDropdown = function() {
		$scope.showToggle = !$scope.showToggle;	
		$scope.dropdownMenuStyle = $scope.showToggle ? {'display':'block'} : {'display':'none'};
	}

    var getBuyerData = function(input) {
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

    // $scope.getInvoices = function () {
    // 	var data = {
	// 		url : '/getSupplierDashboard'
	// 	}
    // 	GetPost.get(data, function(err, docs) {
    // 		console.log(docs);
	// 		$scope.input = docs.data[$rootScope.mainInvoiceIndex];
	// 		setCompanyData();
	//     });
	// }
	
	$scope.getInvoice = function (invoiceId) {
    	var data = {
			url : '/getInvoice',
			invoiceId: invoiceId
		}
    	GetPost.post(data, function(err, doc) {
    		console.log('target',doc);
			// $scope.input = doc.data[$rootScope.mainInvoiceIndex];
			$scope.input = doc;
			setCompanyData();
	    });
    }

    $scope.submitInvoice = function (type) {
		$rootScope.isMainLoader = true;
		$scope.showHeaderOptions = false;
		$scope.isSubmitNowButtonDisabled = true;
		$scope.input.state = type;
		$scope.input = getBuyerData($scope.input);
		
    	// if (!validateInvoice()) {
		// 	$scope.isSubmitNowButtonDisabled = false;
    	// 	return;
    	// }

		$timeout(()=>{
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
		}, 1000);
	    
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