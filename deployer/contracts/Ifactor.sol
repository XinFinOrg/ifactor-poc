pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract Ifactor is StandardToken {
    struct Invoice {
        string invoiceId;
        string invoiceNo;
        uint amount;
        address supplier;
        address buyer;
        address financer;
    	string state;
        address[] owners;
    	uint factorCharges;
    	uint factorInterest;
    	uint factorSaftyPercentage;
    	uint daysToPayout;
    }
    
    address owner;

    mapping (string => Invoice) Invoices;
    
    modifier mustBeOwner() {
        require(msg.sender == owner);
        _;
    }

	function Ifactor() public {
	    owner = msg.sender;
	    totalSupply_ = 1000000000;
	    balances[msg.sender] = 1000000000;
	}

	function setTotalSupply(uint _amt) {
		totalSupply_ = _amt;
	}

	function addTotalSupply(uint _tokens) public mustBeOwner {
		totalSupply_ += _tokens;
		balances[msg.sender] += _tokens;
	}

	function buyTokens(address _address, uint _value) {
	    balances[_address] = _value;
	    balances[owner] = balances[owner] - _value;
	}

    function getBalance(address _address) public view returns(uint) {
        return balances[_address];
    }

	function addInvoice(string _invoice_id, string _invoice_no, string _state, uint _amount, address _supplier, address _buyer, uint _created) public {
		Invoice inv;
		inv.invoiceId = _invoice_id ;
		inv.invoiceNo = _invoice_no ;
		inv.state = _state ;
		inv.amount = _amount ;
		inv.supplier = _supplier ;
		inv.buyer = _buyer;
		Invoices[_invoice_id] = inv;
		invoiceHistory(_invoice_id, _state, _created);
		createInvoice(_invoice_id, _invoice_no, _state, _amount, _supplier, _buyer);
	}

	function getState(string _invoice_id) public view returns(string) {
		Invoice inv = Invoices[_invoice_id];
		return inv.state;
	}

	function setState(string _invoice_id, string _invoice_state, uint _created) public {
		Invoice inv = Invoices[_invoice_id];
		inv.state = _invoice_state;
		invoiceHistory(_invoice_id, _invoice_state, _created);
	}

	function emitPayableDate(string _invoice_id, uint _payable_date) public {
		payableDates(_invoice_id, _payable_date);
	}

	function setPayoutDays(string _invoice_id, uint _payout_days) {
		Invoice inv = Invoices[_invoice_id];
		inv.daysToPayout = _payout_days;
	}

	function getAmount(string _invoice_id) public constant returns(uint) {
		Invoice inv = Invoices[_invoice_id];
        return inv.amount;
	}

	function addFactoring(string _invoice_id, address _financer, uint _factor_charges, uint _factor_safty_percentage, uint _amount, uint _days_to_payout, uint _created) public {
		Invoice inv = Invoices[_invoice_id];
		inv.financer = _financer;
		inv.factorCharges = _factor_charges;
		inv.factorSaftyPercentage = _factor_safty_percentage;
		inv.daysToPayout = _days_to_payout;
        setState(_invoice_id, 'ifactor_proposed', _created);
	    factoringProposal(_invoice_id, _factor_charges, _factor_safty_percentage, _amount, _created);
	}

	function getInterestAmount(string _invoice_id) public constant returns(uint) {
		Invoice inv = Invoices[_invoice_id];
		uint _charges = (inv.daysToPayout  * inv.factorCharges * 100)/30;
		return (_charges * inv.amount)/100;
	}

	function requestFactoring(string _invoice_id, string _invoice_state, uint _amount, uint _created) public {
		Invoice inv = Invoices[_invoice_id];
		inv.state = _invoice_state;
        factoringRequest(_invoice_id, _amount, _created);
		invoiceHistory(_invoice_id, _invoice_state, _created);
	}

	function prepayFactoring(string _invoice_id, uint _amount, uint _created) public {
		Invoice inv = Invoices[_invoice_id];
        setState(_invoice_id, 'ifactor_prepaid', _created);
        ifactorTransfer(_invoice_id, 'ifactor_prepaid', _amount, _created);
	}

    function payInvoice(string _invoice_id, uint _amount, uint _created) public {
		Invoice inv = Invoices[_invoice_id];
        setState(_invoice_id, 'invoice_paid', _created);
        ifactorTransfer(_invoice_id, 'invoice_paid', _amount, _created);
    }

	function postpayFactoring(string _invoice_id, uint _amount, uint _created) public {
		Invoice inv = Invoices[_invoice_id];
        setState(_invoice_id, 'invoice_paid', _created);
        ifactorTransfer(_invoice_id, 'ifactor_postpaid', _amount, _created);
	}

    function getPostpayAmount(string _invoice_id) public returns(uint) {
		Invoice inv = Invoices[_invoice_id];
		uint _value = (inv.amount * 100) -
						(
							(inv.amount * inv.factorSaftyPercentage) +
							getInterestAmount(_invoice_id)
						);
        _value = _value/100;
		return _value;
    }

    function getPrepayAmount(string _invoice_id) public returns(uint) {
		Invoice inv = Invoices[_invoice_id];
		uint _value =  inv.amount * inv.factorSaftyPercentage/100;
		return _value;
    }

   function getAddresses(string _invoice_id) public view returns(address[]) {
        address[] entities;
        Invoice inv = Invoices[_invoice_id];
        entities.push(inv.supplier);
        entities.push(inv.buyer);
        entities.push(inv.financer);
        return entities;
    }

   function getSupplier(string _invoice_id) public view returns(address) {
        Invoice inv = Invoices[_invoice_id];
        return inv.supplier;
    }

   function getBuyer(string _invoice_id) public view returns(address) {
        Invoice inv = Invoices[_invoice_id];
        return inv.buyer;
    }

   function getFinancer(string _invoice_id) public view returns(address) {
        Invoice inv = Invoices[_invoice_id];
        return inv.financer;
    }

    function getInvoiceAmount(string _invoice_id) public returns(uint){
		Invoice inv = Invoices[_invoice_id];
		return inv.amount;
    }

	event createInvoice(string invoiceId, string invoiceNo, string state, uint amount,
						address supplier, address buyer);
	event invoiceHistory(string invoiceId, string state, uint created);
	event factoringRequest(string invoiceId, uint amount, uint created);
	event factoringProposal(string invoiceId, uint factorCharges, uint factorSaftyPercentage, uint amount, uint created);
   	event ifactorTransfer(string invoiceId, string transferType, uint amount, uint created);
   	event payableDates(string invoiceId, uint payableDate);
}