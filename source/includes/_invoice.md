# Invoice

This section lists all api endpoints related to Invoice. The following list explains the list of apis and their usage.

API Endpoint | Initiator | Usage 
------- | ----------- | ---------
/createInvoice | Supplier | Create an Invoice
/approveInvoice | Buyer | Verify Invoice
/rejectInvoice | Buyer | Reject Invoice
/requestFactoring | Supplier | Request financers for factoring
/factoringProposal |Financer | Factoring Proposal to Supplier
/rejectFactoringRequest | Supplier | Reject Factoring Proposal
/acceptFactoringProposal | Supplier | Reject Factoring Proposal
/prepaySupplier | Financer | Pay First Payment to Supplier
/payInvoice | Buyer | Pay invoice amount to Financer
/postpaySupplier | Financer | Pay final payment to supplier
/getInvoiceDetails | All | Get invoice details


## Create Invoice

Create an Invoice.

### HTTP Request

`POST http://infactor.xinfin.org/createInvoice`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
companyName | String | Yes
companyType | String | Yes
buyerEmail | String | Yes
buyerAddress | String | Yes
contactName | String | Yes
companyPhone | Integer | Yes
companyEmail | String | Yes
purchaseTitle | String | Yes
purchaseNo | Integer | Yes
purchaseDate | Date | Yes
purchaseAmount | Integer | Yes
purchaseDocs | Image(Base64) | Yes
payableDate | Date | Yes
invoiceNo | Integer | Yes
invoiceDate | Date | Yes
invoiceAmount | Integer | Yes

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Verify Invoice Details

Verify the invoice details.

### HTTP Request

`POST http://infactor.xinfin.org/approveInvoice`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes
remark | String | Yes


### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Rejcct Invoice Details

Reject the invoice details.

### HTTP Request

`POST http://infactor.xinfin.org/rejectInvoice`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes
remark | String | Yes

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Initiate Factoring

Lists invoice for fatcoring. This endpoints sends notification to all financers available on the platform for factoring.

### HTTP Request

`POST http://infactor.xinfin.org/requestFactoring`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | Integer | Yes
remark | String | Yes

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Propose Factoirng

This endpoint enables financer to propose factoring solution to supplier by filling a simple form.

The key elements of the form are :

Parameters | Description
--------- | -------- | --------- 
invoiceAmount | Total factoring amount
platformCharges | Interest Rate/Month (typical 0.5-2%)
saftyPercentage | This defines the percentage of factoring amount to be kept as saftey (typically 15-20%) 

Factoring amount is paid to supplier in 2 steps. Safty Percentage defines the amount to be paid in second(final) payment.

### HTTP Request

`POST http://infactor.xinfin.org/factoringProposal`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes
invoiceAmount | Integer | Yes
platformCharges | Integer | Yes
saftyPercentage | Integer | Yes
payableDate | Date | Yes

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Reject Factoring Request

Rejects factoring request.

### HTTP Request

`POST http://infactor.xinfin.org/rejectFactoringRequest`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes
remark | String | Yes

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Accept Factoring Proposal

Accepts factoring request.

### HTTP Request

`POST http://infactor.xinfin.org/acceptFactoringProposal`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```

## Pay Invoice

This enpoint enables Buyer to Transfer invoice amount to financer.

### HTTP Request

`POST http://infactor.xinfin.org/payInvoice`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes
buyerAddress | String | Yes
financerAddress | String | Yes


### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Prepay Supplier

This enpoint enables Financer to Transfer first payment amount to supplier.

### HTTP Request

`POST http://infactor.xinfin.org/prepaySupplier`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes
supplierAddress | String | Yes
financerAddress | String | Yes
 


### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Postpay Supplier

This enpoint enables Financer to Transfer final payment amount to supplier.

### HTTP Request

`POST http://infactor.xinfin.org/postpaySupplier`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | Yes
supplierAddress | String | Yes
financerAddress | String | Yes

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
## Get Invoice Details

Get Invoice details.

### HTTP Request

`POST http://infactor.xinfin.org/getInvoiceDetails`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
invoiceId | String | yes

### Response Details

> The above command returns JSON structured like this:

```json
{
    "status" : true, 
    "data" : {
      "invoice":{
        "_id":"5b69a1002ca2d6dc11bb95e2",
        "companyName" :"General Motors",
        "companyType":"Automotive Aftermarket",
        "buyerEmail":"ifb@123.com",
        "buyerAddress":"0x3b16994c8649f8b6c4333f5831148dfbf90250c9",
        "contactName":"John Smith",
        "companyPhone":"90019001",
        "companyEmail":"john@gmsc.com",
        "purchaseTitle":"Supply of engine piston",
        "purchaseNo":"PO1234",
        "purchaseDate":"",
        "purchaseAmount":"25000",
        "purchaseDocs":"",
        "payableDate":"2018-08-21",
        "invoiceNo":"INV1234",
        "invoiceDate":"",
        "invoiceAmount":25000,
        "invoiceDocs":"",
        "grnNo":"GRN1234",
        "grnDate":"",
        "grnDocs":"",
        "state":"completed",
        "grnAmount":"0",
        "supplierEmail":"ifs@123.com",
        "supplierName":"atul supplier",
        "supplierAddress":"0x4732a8f965916e3cf0a68d6116deb191a01e5dba",
        "invoiceId":"4wpqlorsjkjr3vpr",
        "created":15656776,
        "buyerInvoiceRemark":"",
        "financerAddress":"0xd7388802a6fc6b5d1391538c64ea675fdcccefb3",
        "financerEmail":"iff@123.com",
        "platformCharges":"2",
        "saftyPercentage":"82",
        "acceptFactoringRemark":"jhgty jkhjjvgjy",
        "firstPayment":20500,
        "charges":90000,
        "chargesPer":4,
        "balancePayment":10000,
        "balancePaymentPer":15,
        "ifactorProposalDocs":null,
        "acceptProposalRemark":"",
        "supplierRatings":4,
        "supplierRatingRemark":"",
        "financerRatings":4,
        "financerRatingRemark":"",
        "supplierData":{
          "_id":"5b572e9dc6221ad60a511a1c",
          "firstName":"atul",
          "lastName":"supplier",
          "email":"ifs@123.com",
          "password":"123",
          "type":"Supplier",
          "address":"0x4732a8f965916e3cf0a68d6116deb191a01e5dba",
          "phrase":"123",
        }
      },
      "invoiceHistory":[],
      "tarnsferEvents":[],
      "otherEvents":[],
      "balance":100000
    }
  }
```