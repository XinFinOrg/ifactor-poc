# Dashboard

Returns user specific invoice records.

The following list describes the visibility of invoices for each user role.

User Type | Visibilty
--------- | ---------- 
Supplier | Invoices created/uploaded by supplier
Buyer | Invoices having Buyer
Financer | All Factoring enbaled Invoices

##  Get Supplier Dashboard

Get the list of supplier invoices.

### HTTP Request

`GET http://ifactor.xinfin.org/getSupplierDashboard?email=ifs@gmail.com`

> The above command returns JSON structured like this:

```json
{
    "status" : true, 
    "data" : [
      {
        "_id":"5b69a1002ca2d6dc11bb95e2",
        "companyName" :"General Motors",
        "buyerEmail":"ifb@123.com",
        "buyerAddress":"0x3b16994c8649f8b6c4333f5831148dfbf90250c9",
        "companyEmail":"john@gmsc.com",
        "purchaseTitle":"Supply of engine piston",
        "purchaseNo":"PO1234",
        "purchaseDate":"",
        "purchaseAmount":"25000",
        "payableDate":"2018-08-21",
        "invoiceNo":"INV1234",
        "invoiceDate":"",
        "invoiceAmount":25000,
        "supplierEmail":"ifs@123.com",
        "supplierName":"atul supplier",
        "supplierAddress":"0x4732a8f965916e3cf0a68d6116deb191a01e5dba",
        "created":15656776
      }
    ]
}
```
##  Get Buyers Dashboard


### HTTP Request

`GET http://ifactor.xinfin.org/getBuyersDashboard?email=ifs@gmail.com`


### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```
##  Get Financer Dashboard

Get Financer invoices.

### HTTP Request

`POST http://ifactor.xinfin.org/getFinancerDashboard?email=ifs@gmail.com`

### Response Details

> The above command returns JSON structured like this:

```json
  {
    "status" : true
  }
```