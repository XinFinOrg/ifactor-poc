angular.module('HelperService', []).factory('Helper', ['ngToast', '$rootScope', function(ngToast, $rootScope) {

    var invoiceStatusMap = {
        "Supplier": {
            "draft": "Draft",
            "invoice_created": "Approval Awaited",
            "invoice_rejected": "Rejected",
            "invoice_accepted": "Approved",
            "ifactor_request": "Factoring Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accepted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "In Progress",
            "completed": "Completed"
        },
        "Buyer": {
            "invoice_created": "Approval Awaited",
            "invoice_rejected": "Rejected",
            "invoice_accepted": "Approved",
            "ifactor_request": "Factoring Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accepted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "Payment completed",
            "completed": "Completed"
        },
        "Financer": {
            "invoice_created": "Approval Awaited",
            "invoice_rejected": "Rejected",
            "invoice_accepted": "Approved",
            "ifactor_request": "Factoring Requested",
            "ifactor_rejected": "Rejected",
            "ifactor_proposed": "Proposal Received",
            "ifactor_proposal_rejected": "Proposal Rejected",
            "ifactor_proposal_accepted": "Proposal Accepted",
            "ifactor_prepaid": "In Progress",
            "invoice_paid": "In Progress",
            "completed": "Completed"
        }
    };

    var stateOptions = [
            'draft',
            'invoice_created',
            'invoice_rejected',
            'invoice_accepted',
            'ifactor_request',
            'ifactor_rejected',
            'ifactor_proposed',
            'ifactor_proposal_accepted',
            'ifactor_proposal_rejected',
            'ifactor_prepaid',
            'invoice_paid',
            'completed'
        ];

    var statusClassMap = {
        'draft' : 'labelDraft',
        'invoice_created' : 'labelPending',
        'invoice_rejected' : 'labelRejected',
        'invoice_accepted' : 'labelApproved',
        'ifactor_request' : 'labelPending',
        'ifactor_rejected' : 'labelRejected',
        'ifactor_proposed' : 'labelPending',
        'ifactor_proposal_accepted' : 'labelApproved',
        'ifactor_proposal_rejected' : 'labelRejected',
        'ifactor_prepaid' : 'labelApproved',
        'invoice_paid' : 'labelApproved',
        'completed' : 'labelApproved'
    };

    var companyTypeOptions = function() {
        return [
            '',
            'Major Chemicals',
            'Agricultural Chemicals',
            'Steel/Iron Ore',
            'Textiles',
            'Aluminium',
            'Engineering & Construction',
            'Paints/Coatings',
            'Telecommunications Equipment',
            'Specialty Chemicals',
            'Package Goods/Cosmetics',
            'Mining & Quarrying of Nonmetallic Minerals (No Fuels)',
            'Environmental Services',
            'Paper',
            'Metal Fabrications',
            'Electric Utilities: Central',
            'Forest Products',
            'Water Supply',
            'Military/Government/Technical',
            'Homebuilding',
            'Home Furnishings',
            'General Bldg Contractors - Nonresidential Bldgs',
            'Aerospace',
            'Auto Parts:O.E.M.',
            'Containers/Packaging',
            'Industrial Machinery/Components',
            'Biotechnology: Laboratory Analytical Instruments',
            'Fluid Controls',
            'Electrical Products',
            'Building Products',
            'Wholesale Distributors',
            'Construction/Ag Equipment/Trucks',
            'Building Materials',
            'Pollution Control Equipment',
            'Auto Manufacturing',
            'Marine Transportation',
            'Automotive Aftermarket',
            'Railroads',
            'Industrial Specialties',
            'Ordnance And Accessories',
            'Tools/Hardware',
            'Publishing',
            'Miscellaneous manufacturing industries',
            'Office Equipment/Supplies/Services',
            'Consumer Electronics/Appliances',
            'Recreational Products/Toys',
            'Farming/Seeds/Milling',
            'Beverages (Production/Distribution)',
            'Packaged Foods',
            'Plastic Products',
            'Electronic Components',
            'Meat/Poultry/Fish',
            'Shoe Manufacturing',
            'Apparel',
            'Specialty Foods',
            'Food Distributors',
            'Food Chains',
            'Motor Vehicles',
            'Consumer Specialties',
            'Tobacco',
            'Services-Misc. Amusement & Recreation',
            'Newspapers/Magazines',
            'Clothing/Shoe/Accessory Stores',
            'Real Estate Investment Trusts',
            'Other Specialty Stores',
            'Other Consumer Services',
            'Diversified Commercial Services',
            'Television Services',
            'Movies/Entertainment',
            'Restaurants',
            'Professional Services',
            'RETAIL: Building Materials',
            'Miscellaneous',
            'Hotels/Resorts',
            'Consumer Electronics/Video Chains',
            'Department/Specialty Retail Stores',
            'Catalog/Specialty Distribution',
            'Building operators',
            'Broadcasting',
            'Advertising',
            'Consumer: Greeting Cards',
            'Rental/Leasing Companies',
            'Electronics Distribution',
            'Transportation Services',
            'Real Estate',
            'Books',
            'Oil & Gas Production',
            'Oil Refining/Marketing',
            'Integrated oil Companies',
            'Natural Gas Distribution',
            'Coal Mining',
            'Oilfield Services/Equipment',
            'Life Insurance',
            'Investment Managers',
            'Accident &Health Insurance',
            'Property-Casualty Insurers',
            'Finance: Consumer Services',
            'Specialty Insurers',
            'Finance/Investors Services',
            'Major Banks',
            'Investment Bankers/Brokers/Service',
            'Savings Institutions',
            'Commercial Banks',
            'Banks',
            'Business Services',
            'Finance Companies',
            'Diversified Financial Services',
            'Medical/Dental Instruments',
            'Medical Specialities',
            'Major Pharmaceuticals',
            'Biotechnology: In Vitro & In Vivo Diagnostic Substances',
            'Hospital/Nursing Management',
            'Other Pharmaceuticals',
            'Biotechnology: Commercial Physical & Biological Resarch',
            'Medical/Nursing Services',
            'Ophthalmic Goods',
            'Biotechnology: Electromedical & Electrotherapeutic Apparatus',
            'Multi-Sector Companies',
            'Power Generation',
            'Oil/Gas Transmission',
            'Computer Software: Programming, Data Processing',
            'Computer Communications Equipment',
            'Semiconductors',
            'EDP Services',
            'Computer Software: Prepackaged Software',
            'Computer peripheral equipment',
            'Computer Manufacturing',
            'Radio And Television Broadcasting And Communications Equipment',
            'Retail: Computer Software & Peripheral Equipment',
            'Air Freight/Delivery Services',
            'Trucking Freight/Courier Services',
            'Renewable Energy'
        ];
    };

    var alertData = {
        'request_payment' : {
            msg : 'Your payment request is submitted successfully',
            class : 'success'
        },
        'signup' : {
            msg : 'Congratulations, your account is created successfully',
            class : 'success'
        },
        'log_in' : {
            msg: 'Please log in',
            class : 'danger'
        },
        'submit_invoice' :{
            msg : 'Invoice is created successfully',
            class : 'success'
        },
        'save_invoice' : {
            msg : 'Invoice is saved',
            class : 'success'
        },
        'ifactor_proposal_rejected' : {
            msg : 'You rejected factoring proposal',
            class : 'danger'
        },
        'ifactor_proposal_accepted' : {
            msg : 'You accepted factoring proposal',
            class : 'success'
        },
        'ifactor_request' :{
            msg : 'Your factoring request is submitted successfully',
            class : 'info'
        },
        'error500' :{
            msg : 'Internal server Error',
            class : 'danger'
        },
        'payment_success' : {
            msg : 'Your payment is successful',
            class : 'success'            
        },
        'ifactor_proposed' : {
            msg : 'Your factoring proposal is submitted successfully',
            class : 'success'            
        },
        'ifactor_rejected' : {
            msg : 'Your rejected factoring request',
            class : 'success'            
        },
        'ratings_f2s' : {
            msg : 'You just rated supplier',
            class : 'success'
        },
        'ratings_s2f' : {
            msg : 'You just rated supplier',
            class : 'success'
        },
        'rate_supplier_mandatory' : {
            msg : 'You must rate Supplier before submitting',
            class : 'danger'
        },
        'rate_financer_mandatory' : {
            msg : 'You must rate Financier before submitting',
            class : 'danger'
        },
        'invoice_buyer' : {
            msg : 'Buyer name is mandatory',
            class : 'danger'
        },
        'invoice_payableDate' : {
            msg : 'Payable date is mandatory',
            class : 'danger'
        },
        'invoiceNo' : {
            msg : 'Invoice no is mandatory',
            class : 'danger'
        },
        'invoiceAmount' : {
            msg : 'Invoice amount is mandatory',
            class : 'danger'
        },
        
    };

    var createToast = function(msg, className) {
        // console.log('helperService > createToast() > msg: ', msg, ' className: ', className);
        ngToast.create({
            className: className,
            content: msg
        });
    };

    var showAlert = function(type) {
        // console.log('helperService > showAlert() > type: ', type);
        var alert = alertData[type] || {msg : '', class : 'success'};
        createToast(alert.msg, alert.class);
    };

    var isObjEmpty = function(obj) {
        // console.log('helperService > isObjEmpty() > obj: ', obj);
        for(var prop in obj) {
            if (prop == '$$hashKey') {
                continue;
            }
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }

    var checkForMessage = function() {
        // console.log('helperService > checkForMessage() > $rootScope.message: ',$rootScope.message, '$rootScope.messageType:', $rootScope.messageType);
        if($rootScope.message!='' && $rootScope.messageType!=''){
            createToast($rootScope.message, $rootScope.messageType);
            $rootScope.message = '';
            $rootScope.messageType = '';
        }
    }

    var checkLoggedIn = function() {
        // console.log('helperService > checkLoggedIn()');
        GetPost.get({ url : '/startApp' }, function(err, res) {
            console.log('2');
            if (!res.status) {
                $location.path('/login');
            } else {
                console.log(res);
                $rootScope.userType = res.data.userType;
            }
        });
    }

    return {
        invoiceStatusMap : invoiceStatusMap,
        stateOptions : stateOptions,
        statusClassMap : statusClassMap,
        companyTypeOptions : companyTypeOptions,
        showAlert : showAlert,
        createToast : createToast,
        isObjEmpty : isObjEmpty,
        checkForMessage: checkForMessage,
        checkLoggedIn: checkLoggedIn
    }

}]);

