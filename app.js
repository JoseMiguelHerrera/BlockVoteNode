/*eslint-env node*/
var morgan = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var util = require('util');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
// var cfenv = require('cfenv');

//hyperledger SDK
var hfc = require('hfc');
//Access directories 
var fs = require('fs');
const https = require('https');

//******************************Application parameters START**********************
var USE_BLOCKVOTE_CC = true;
var DEV_MODE = false;
// Creating an environment variable for ciphersuites
process.env['GRPC_SSL_CIPHER_SUITES'] = 'ECDHE-RSA-AES128-GCM-SHA256:' +
    'ECDHE-RSA-AES128-SHA256:' +
    'ECDHE-RSA-AES256-SHA384:' +
    'ECDHE-RSA-AES256-GCM-SHA384:' +
    'ECDHE-ECDSA-AES128-GCM-SHA256:' +
    'ECDHE-ECDSA-AES128-SHA256:' +
    'ECDHE-ECDSA-AES256-SHA384:' +
    'ECDHE-ECDSA-AES256-GCM-SHA384';
// Create a client blockchin.
var chain = hfc.newChain("BallotChain")

//Set the default chaincode path 
var ccPath = "";
if (USE_BLOCKVOTE_CC) {
    ccPath = process.env["GOPATH"] + "/src/BlockVoteChainCode/start";
} else {
    ccPath = process.env["GOPATH"] + "/src/chaincode_example02";
}
console.log("The chaincode is supposed to bet at:" + ccPath);

// Read and process the credentials.json
var network;
try {
    network = JSON.parse(fs.readFileSync(__dirname + '/ServiceCredentials.json', 'utf8'));
} catch (err) {
    console.log("ServiceCredentials.json is missing, Rerun once the file is available")
    process.exit();
}

var peers = network.credentials.peers;
var users = network.credentials.users;


var chaincodeID;
if (USE_BLOCKVOTE_CC) {
    //Our chaincode, change this parameter if you are invoking your own 
    chaincodeID = "2434f1ebde11cea2af044b173d2b4420a5a2213b898a178b6fc8c201c12bab85";
} else {
    //sample chaincoide ID 
    chaincodeID = "36424ebc2d3dc8ab4959126f162789b4a2f614873990086bceb5367fabde0e9b";
}
//******************************Application parameters DONE**********************

//*******************************Bluemix SETUP START ******************************



//Andrei: what is this for?
//Download the certificates from Bluemix
var certFile = 'certificate.pem';
var certUrl = network.credentials.cert;
fs.access(certFile, function(err) {
    if (!err) {
        console.log("\nDeleting existing certificate ", certFile);
        fs.unlinkSync(certFile);
    }

    downloadCertificate();
});

function downloadCertificate() {
    var file = fs.createWriteStream(certFile);
    var data = '';
    https.get(certUrl, function(res) {
        console.log('\nDownloading %s from %s', certFile, certUrl);
        if (res.statusCode !== 200) {
            console.log('\nDownload certificate failed, error code = %d', certFile, res.statusCode);
            process.exit();
        }
        res.on('data', function(d) {
            data += d;
        });
        // event received when certificate download is completed
        res.on('end', function() {
            if (process.platform != "win32") {
                data += '\n';
            }
            fs.writeFileSync(certFile, data);
            copyCertificate();
        });
    }).on('error', function(e) {
        console.error(e);
        process.exit();
    });
}
//copy the certificate.pem over to the chaincode folder 
function copyCertificate() {
    //fs.createReadStream('certificate.pem').pipe(fs.createWriteStream(ccPath+'/certificate.pem'));
    fs.writeFileSync(ccPath + '/certificate.pem', fs.readFileSync(__dirname + '/certificate.pem'));

    setTimeout(function() {
        enrollAdmin();
    }, 1000);
}
var network_id = Object.keys(network.credentials.ca);
var uuid = network_id[0].substring(0, 8);
//*******************************Bluemix SETUP DONE ******************************

//*******************************Admin SETUP START *******************************

//keyValStore is local 
chain.setKeyValStore(hfc.newFileKeyValStore(__dirname + '/keyValStore-' + uuid));

var admin;

function enrollAdmin() {

    // Set the URL for membership services
    var ca_url = "grpcs://" + network.credentials.ca[network_id].discovery_host + ":" + network.credentials.ca[network_id].discovery_port;
    var cert = fs.readFileSync(certFile);
    chain.setMemberServicesUrl(ca_url, {
        pem: cert
    });

    // Adding all the peers to blockchain
    // this adds high availability for the client
    for (var i = 0; i < peers.length; i++) {
        chain.addPeer("grpcs://" + peers[i].discovery_host + ":" + peers[i].discovery_port, {
            pem: cert
        });
    }


    if (DEV_MODE) {
        chain.setDevMode(true);
        console.log("The chain is set to development mode");
        //Deploy will not take long as the chain should already be running
        chain.setDeployWaitTime(10);
    } else {
        // chain.setDeployWaitTime(120);
    }

    //TODO: Register and enroll our own admin, instead of the hardcoded one in membersrvc.yaml! 
    // var SuperAdmin = new Member(registrationRequest, chain);
    // console.log(SuperAdmin);
    //enroll the admin 
    console.log("Enrolling admin");
    chain.enroll(users[0].username, users[0].secret, function(err, user) {
        if (err) throw Error("\nERROR: failed to enroll admin : %s", err);
        // Set this user as the chain's registrar which is authorized to register other users.
        /*
            Andrei: What can the registrar do? 
         */
        admin = user;
        chain.setRegistrar(admin);
        // console.log(admin)
        console.log("Admin is now enrolled.");
    });
}
//*******************************Admin SETUP DONE *******************************



//*******************************USER Registration/Enrollment START ********************
function registerUser(id, userTransaction) {
    var enrollmentID = id;
    var registrationRequest = {
        enrollmentID: enrollmentID, //recorded under 'name' of the Member, this is the only parameter set in member object in the chain object
        attributes: [], //what are the attributes for?
        name: enrollmentID + "Name", //this does not get used at all in chain object or member services 
        roles: ["client"], //this is role in Member Services, choices are ["client","peer","validator","auditor"]
        account: "group1", //this affiliation in Member Services 
        affiliation: "00002" //this is affiliationRole in Member Services

    };
    console.log(userTransaction);
    console.log("Now registering: " + registrationRequest.name);


    chain.register(registrationRequest, function(err, enrollmentSecret) {
        if (err) {
            throw Error("Failed to register " + registrationRequest.name + ": " + err);
        }
        console.log("Succesfully registered " + registrationRequest.name);
        registrationRequest.enrollmentSecret = enrollmentSecret;
        //At this point, 'registration' only enables this person to enroll

        enrollUser(registrationRequest.enrollmentID, registrationRequest.enrollmentSecret, userTransaction);

    });

}

function enrollUser(id, secret, userTransaction) {

    console.log("Now enrolling: " + id);
    chain.enroll(id, secret,
        function(err, member) {
            if (err) {
                throw Error("Failed to enroll " + id + ": " + err);
            }

            console.log("Succesfully enrolled " + id);
            //User invokes the chaincode
            console.log(id + " wants to " + userTransaction.type);
            console.log(userTransaction);
            if (userTransaction.type == "invoke") {
                invokeChainCode(member, userTransaction.vote);
                return;
            }
            if (userTransaction.type == "query") {
                queryChainCode(member);
                return;
            }

        }
    );
}
//*******************************USER Registration/Enrollment DONE ********************

//*******************************Transaction functions START ********************
function invokeChainCode(member, vote) {
    console.log(member.name + " is invoking chaincode...");
    var invokeRequest = {
        chaincodeID: chaincodeID,
        fcn: "write",
        args: [member.name, vote]
    };


    // Trigger the invoke transaction
    var invokeTx = member.invoke(invokeRequest);

    // Print the invoke results
    invokeTx.on('submitted', function(results) {
        // Invoke transaction submitted successfully
        console.log(util.format("\n%s Successfully submitted chaincode invoke transaction: request=%j, response=%j", member.name, invokeRequest, results));
    });
    invokeTx.on('complete', function(results) {
        // Invoke transaction completed successfully
        console.log(util.format("\n%s Successfully completed chaincode invoke transaction: request=%j, response=%j", member.name, invokeRequest, results));
    });
    invokeTx.on('error', function(err) {
        // Invoke transaction submission failed
        console.log(util.format("\n%s Failed to submit chaincode invoke transaction: request=%j, error=%j", member.name, invokeRequest, err));
    });

}

function queryChainCode(member) {
    console.log(member.name + " is querying chaincode...");
    // Construct the query request
    var queryRequest = {
        // Name (hash) required for query
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: "read",
        // Existing state variable to retrieve
        args: [member.name]
    }

    // Trigger the query transaction
    var queryTx = member.query(queryRequest);

    // Print the query results
    queryTx.on('complete', function(results) {
        // Query completed successfully
        console.log("\n%s Successfully queried  chaincode function: request=%j, value=%s", member.name, queryRequest, results.result.toString());
    });
    queryTx.on('error', function(err) {
        // Query failed
        console.log("\n%s Failed to query chaincode, function: request=%j, error=%j", member.name, queryRequest, err);
    });
}

//*******************************Transaction functions DONE ********************

//*******************************WEB APP SERVICE START ******************************
// create a new express server
var app = express();

//Use morgan for logging, it is currently on dev mode  
app.use(morgan('dev'));
//parse the JSON body of a POST request 
app.use(bodyParser.json());

// // serve the files out of ./public as our main files
// app.use(express.static(__dirname + '/public'));


var hostname = 'localhost';
var port = 3000;
app.listen(port, hostname, function() {
    console.log(`Server running at http://${hostname}:${port}/`);
});

//TODO: Create the APIS and have it tested with postman

app.post('/vote', function(req, res) {
    console.log("enrollmentID: " + req.body.enrollmentID + " vote: " + req.body.vote + " invokes.");
    //Call the invoke 
    var userTransaction = {
        type: "invoke",
        vote: req.body.vote
    }
    registerUser(req.body.enrollmentID, userTransaction);
    res.end();
});

app.post('/query', function(req, res) {
    console.log("enrollmentID: " + req.body.enrollmentID + " query.");
    //Call the query 
    var userTransaction = {
        type: "query"
    }
    registerUser(req.body.enrollmentID, userTransaction);
    res.end();
});


//TODO: Create the web front end and test the backend with it 
//TODO: Create a program that will stress test the IBM Blockchain on Bluemix 

//*******************************WEB APP SERVICE DONE ******************************


// // get the app environment from Cloud Foundry
// var appEnv = cfenv.getAppEnv();

// // start server on the specified port and binding host
// app.listen(appEnv.port, '0.0.0.0', function() {
//     // print a message when the server starts listening
//     console.log("server starting on " + appEnv.url);
// });
