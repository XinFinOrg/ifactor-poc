# ifactor-poc
MVP for the factoring workflow discussed with associated parties. (Govt, Undertaker, Farmer, XinFin)

## Installation

Note : You’ll need to have Node 6.x.x version on your local development machine. You can use nvm to easily switch Node versions between different projects.

1. Clone the Repository

2. Install dependencies

            a. Install Node modules
              npm install
            b. Install Angular Modules
             bower install

3. Deploy Contract

      You'll need to run blockchain on your local machine. Visit XinFinOrg repos to setup private blockchain on your local machine.
      Go to deployer directory. Run following commands to compile and deploy contracts.
      You can edit truffle configurations from /deployer/truffle.js
 
            a. Compile Contract
                truffle compile
            b. Deploy Contract
                truffle migrate

4. start server

            npm start

5. Open the browser with following url.

    http://localhost:6001/login
