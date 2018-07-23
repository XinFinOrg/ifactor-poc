module.exports = {
  	networks: {
	    development: {
	      host: "localhost",
	      from : "0x0638e1574728b6d862dd5d3a3e0942c3be47d996",
	      port: 22001,
	      network_id: "*", // Match any network id
	      gas: "4200000",
	      gasPrice : 0
	    }
	}
};
