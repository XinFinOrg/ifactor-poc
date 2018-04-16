pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract Ifactor is StandardToken {
    struct Invoice {
        string invoiceId;
        uint invoiceNo;
        uint amount;
        address supplier;
        address buyer;
        address financer;
    	string state;
        address[] owners;
    	uint factorCharges;
    	uint factorInterest;
    	uint factorSaftyPercentage;        
    }
    
    address owner;

    mapping (string => Invoice) Invoices;
    
    modifier mustBeOwner() {
        require(msg.sender == owner);
        _;
    }

	function Ifactor() public {
	    owner = msg.sender;
	    totalSupply_ = 100000;
	    balances[msg.sender] = 100000;
	}

	function setTotalSupply(uint _amt) {
		totalSupply_ = _amt;
	}

	function buyTokens(address _address) {
	    balances[_address] = 10000;
	}

    function getBalance(address _address) public view returns(uint) {
        return balances[_address];
    }

	function addInvoice(string _invoice_id, uint _invoice_no, string _state, uint _amount,
						address _supplier, address _buyer) public {
		Invoice inv;
		inv.invoiceId = _invoice_id ;
		inv.invoiceNo = _invoice_no ;
		inv.state = _state ;
		inv.amount = _amount ;
		inv.supplier = _supplier ;
		inv.buyer = _buyer;
		Invoices[_invoice_id] = inv;
	}

	function getState(string _invoice_id) public view returns(string) {
		Invoice inv = Invoices[_invoice_id];
		return inv.state;
	}

	function setState(string _invoice_id, string _invoice_state) public {
		Invoice inv = Invoices[_invoice_id];
		inv.state = _invoice_state;
	}
	
	function getAmount(string _invoice_id) public constant returns(uint) {
		Invoice inv = Invoices[_invoice_id];
        return inv.amount;
	}

	function addFactoring(string _invoice_id, address _financer, uint _factor_charges, uint _factor_interest, uint _factor_safty_percentage) public {
		Invoice inv = Invoices[_invoice_id];
		inv.financer = _financer;
		inv.factorCharges = _factor_charges;
		inv.factorInterest = _factor_interest;
		inv.factorSaftyPercentage = _factor_safty_percentage;		
	}

	function prepayFactoring(string _invoice_id) public view returns(uint) {
		Invoice inv = Invoices[_invoice_id];
		uint _value =  inv.amount * inv.factorSaftyPercentage;
		address _from = inv.financer;
		address _to = inv.supplier;
        transferFrom(_from, _to, _value);
	}

    function payInvoice(string _invoice_id) public {
		Invoice inv = Invoices[_invoice_id];
        address _from = inv.supplier;
        address _to = inv.financer;
        uint _value = inv.amount;
        transferFrom(_from, _to, _value);
    }

	function postpayFactoring(string _invoice_id) public view returns(uint) {
		Invoice inv = Invoices[_invoice_id];
		uint _value = (inv.amount * (1 - inv.factorSaftyPercentage)) -
				inv.amount * (inv.factorCharges);
		address _from = inv.financer;
		address _to = inv.supplier;
        transferFrom(_from, _to, _value);
	}

    event createInvoice(string invoiceId, address supplier, address buyer, string companyName, string companyType, string contactName, string companyPhone, string companyEmail, uint purchaseTitle, uint purchaseNo, uint purchaseDate, uint purchaseAmount, uint payableDate, uint invoiceNo, uint invoiceDate, uint invoiceAmount, uint grnNo, uint created);
    event acceptInvoice(uint invoiceNo, string invoiceId, address supplier, address buyer, uint created);
    event factoringProposal(uint invoiceNo, string invoiceId, string state, address financer, uint factorCharges, uint factorInterest, uint factorSaftyPercentage, uint created);
    event factoringAccepted(uint invoiceNo, string invoiceId, string state);
}