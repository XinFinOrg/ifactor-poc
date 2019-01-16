# Signup

  This endpoint onboards an user to the platform. <code>/signup</code> adds user to the system, At the same time it automatically creates a Wallet account for the user by assigning the unique wallet address.

  There are 3 types of user roles in invoice factoring defined as type.
  User type can 'supplier', 'buyer' or 'financer'. Each user role has different functionality.

<aside class="warning">A user account can have only a single role</aside>


### HTTP Request

`POST http://infactor.xinfin.org/signup`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
firstName | String | yes
lastName | String | no
email | String | yes
password | String | yes
type | String | yes

<aside class="notice">All user requests are wrapped inside "input" key. So every request looks like <code>{"input" : {}}</code> </aside>

> The typical signup request would like this:

```bash
  curl -X POST 
  http://infactor.xinfin.org/signup 
  -H 'cache-control: no-cache' 
  -H 'content-type: application/json'
  -d '{
      "input" : {
        "firstName" : "John",
        "lastName" "Smith",
        "email" : "johns89@gmail.com",
        "password" : "jyt6665gyuu_",
        "type" : "supplier"
      }
  }'
```

> The signup request returns JSON structured like this:

```json
  {
    "status" : true
  }
```

# Login

Logs in user to the platform. Returns role specific user details.

### HTTP Request

`POST http://infactor.xinfin.org/login`

### Request Details

Parameters | Arguments | Required
--------- | -------- | --------- 
email | String | yes
password | String | yes

> The above command returns JSON structured like this. data object contains user details:

```json
  {
    "status" : true,
    "data" : {}
  }
```
<aside class="notice">All api endpoints except /signup and /login requires authentication through login session</aside>