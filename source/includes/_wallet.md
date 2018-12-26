# Wallet

Ifactor has pre-integrated wallet with ERC-20 token standard. When user signs up for the platform, a wallet address is created for the user.

## Get Balance

Returns a token balance for specified address.

### HTTP Request

`GET http://ifactor.xinfin.org/getBalance`


> The above command returns JSON structured like this:

```json
  {
    "status" : true,
    "data" : {
      "balance" : 10000
    }
  }
```

## Buy Tokens

Transfer tokens to a specified address from coinbase account(token pool).

### HTTP Request

`POST http://ifactor.xinfin.org/buyTokens`

Parameters | Arguments | Required
--------- | -------- | --------- 
address | String | yes
tokens | Integer | yes

> The above command returns JSON structured like this:

```json
  {
	  "status" : true
  }
```