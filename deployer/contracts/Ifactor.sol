pragma solidity ^0.4.4;

contract Ifactor {
    uint invoiceId;
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


	function Ifactor() public {

	}
	function addInvoice(uint _invoice_id, uint _invoice_no, string _state, uint _amount,
						address _supplier, address _buyer) public {
		invoiceId = _invoice_id ;
		invoiceNo = _invoice_no ;
		state = _state ;
		amount = _amount ;
		supplier = _supplier ;
		buyer = _buyer;
		addOwner(_supplier);
	}
	function getState() public view returns(string) {
		return state;
	}

	function setState(string invoice_state) public {
		state = invoice_state;
	}
	
	function addOwner(address owner) public {
        owners.push(owner);	    
	}

	function getCurrentOwner() public constant returns(address) {
        return owners[owners.length -1];
	}
	
	function getAmount() public constant returns(uint) {
        return amount;
	}

	function addFactoring(address _financer, uint _factor_charges, uint _factor_interest,
							uint _factor_safty_percentage) public {
		financer = _financer;
		factorCharges = _factor_charges;
		factorInterest = _factor_interest;
		factorSaftyPercentage = _factor_safty_percentage;		
	}

	function getPrepayAmount() public view returns(uint) {
		return amount * factorSaftyPercentage;
	}

	function getPostpayAmount() public view returns(uint) {
		return (amount * (1 - factorSaftyPercentage)) -
				amount * (factorSaftyPercentage + factorInterest);
	}

    event createInvoice(uint invoiceId, address supplier, address buyer, string companyName, string companyType, string contactName, string companyPhone, string companyEmail, uint purchaseTitle, uint purchaseNo, uint purchaseDate, uint purchaseAmount, uint payableDate, uint invoiceNo, uint invoiceDate, uint invoiceAmount, uint grnNo, uint created);
    event acceptInvoice(uint invoiceNo, uint invoiceId, address supplier, address buyer, uint created);
    event factoringProposal(uint invoiceNo, uint invoiceId, string state, address financer, uint factorCharges, uint factorInterest, uint factorSaftyPercentage, uint created);
    event factoringAccepted(uint invoiceNo, uint invoiceId, string state);
}