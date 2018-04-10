pragma solidity ^0.4.4;

contract Ifactor {
    struct Invoice {
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
    }

    mapping (uint => Invoice) Invoices;

	function Ifactor() public {

	}
	function addInvoice(uint _invoice_id, uint _invoice_no, string _state, uint _amount,
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
	function getState(uint _invoice_id) public view returns(string) {
		Invoice inv = Invoices[_invoice_id];
		return inv.state;
	}

	function setState(uint _invoice_id, string _invoice_state) public {
		Invoice inv = Invoices[_invoice_id];
		inv.state = _invoice_state;
	}
	
	function getAmount(uint _invoice_id) public constant returns(uint) {
		Invoice inv = Invoices[_invoice_id];
        return inv.amount;
	}

	function addFactoring(uint _invoice_id, address _financer, uint _factor_charges, uint _factor_interest,
							uint _factor_safty_percentage) public {
		Invoice inv = Invoices[_invoice_id];
		inv.financer = _financer;
		inv.factorCharges = _factor_charges;
		inv.factorInterest = _factor_interest;
		inv.factorSaftyPercentage = _factor_safty_percentage;		
	}

	function getPrepayAmount(uint _invoice_id) public view returns(uint) {
		Invoice inv = Invoices[_invoice_id];
		return inv.amount * inv.factorSaftyPercentage;
	}

	function getPostpayAmount(uint _invoice_id) public view returns(uint) {
		Invoice inv = Invoices[_invoice_id];
		return (inv.amount * (1 - inv.factorSaftyPercentage)) -
				inv.amount * (inv.factorSaftyPercentage + inv.factorInterest);
	}

    event createInvoice(uint invoiceId, address supplier, address buyer, string companyName, string companyType, string contactName, string companyPhone, string companyEmail, uint purchaseTitle, uint purchaseNo, uint purchaseDate, uint purchaseAmount, uint payableDate, uint invoiceNo, uint invoiceDate, uint invoiceAmount, uint grnNo, uint created);
    event acceptInvoice(uint invoiceNo, uint invoiceId, address supplier, address buyer, uint created);
    event factoringProposal(uint invoiceNo, uint invoiceId, string state, address financer, uint factorCharges, uint factorInterest, uint factorSaftyPercentage, uint created);
    event factoringAccepted(uint invoiceNo, uint invoiceId, string state);
}