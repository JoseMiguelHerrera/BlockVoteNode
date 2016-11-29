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
// const https = require('https');


// var config;
var chain;
var network;
var certPath;
var peers;
var users;
// var userObj;
// var newUserName;
var chaincodeID;
var certFile = 'us.blockchain.ibm.com.cert';
// var chaincodeIDPath = __dirname + "/chaincodeID";


var caUrl;
var peerUrls = [];
var EventUrls = [];

//******************************Application parameters START**********************
var USE_BLOCKVOTE_CC = true;
var DEV_MODE = false;

if (USE_BLOCKVOTE_CC) {
    //Our chaincode, change this parameter if you are invoking your own 
    // chaincodeID = "2434f1ebde11cea2af044b173d2b4420a5a2213b898a178b6fc8c201c12bab85";

    //chaincode on the shared account 
    chaincodeID = "72efc6bbcad805c16a06abf49353dbb4ad0253cd510bff5a7f164a8bf12c13ec";
} else {
    //sample chaincoide ID 
    chaincodeID = "36424ebc2d3dc8ab4959126f162789b4a2f614873990086bceb5367fabde0e9b";
}


init();

function init() {


    // Create a client blockchin.
    chain = hfc.newChain("BallotChain")

    //path to copy the certificate
    certPath = __dirname + "/src/chaincode/certificate.pem";

    // Read and process the credentials.json
    try {
        network = JSON.parse(fs.readFileSync(__dirname + '/ServiceCredentials.json', 'utf8'));
        if (network.credentials) network = network.credentials;
    } catch (err) {
        console.log("ServiceCredentials.json is missing or invalid file, Rerun the program with right file")
        process.exit();
    }

    peers = network.peers;
    users = network.users;

    setup();
    printNetworkDetails();
    enrollAdmin();
}

//******************************Application parameters DONE**********************

//*******************************Bluemix SETUP START ******************************

function printNetworkDetails() {
    console.log("\n------------- ca-server, peers and event URL:PORT information: -------------");
    console.log("\nCA server Url : %s\n", caUrl);
    for (var i = 0; i < peerUrls.length; i++) {
        console.log("Validating Peer%d : %s", i, peerUrls[i]);
    }
    console.log("");
    for (var i = 0; i < eventUrls.length; i++) {
        console.log("Event Url on Peer%d : %s", i, eventUrls[i]);
    }
    console.log("");
    console.log('-----------------------------------------------------------\n');
}


function setup() {
    // Determining if we are running on a startup or HSBN network based on the url
    // of the discovery host name.  The HSBN will contain the string zone.
    var isHSBN = peers[0].discovery_host.indexOf('secure') >= 0 ? true : false;
    var network_id = Object.keys(network.ca);
    caUrl = "grpcs://" + network.ca[network_id].discovery_host + ":" + network.ca[network_id].discovery_port;

    // Configure the KeyValStore which is used to store sensitive keys.
    // This data needs to be located or accessible any time the users enrollmentID
    // perform any functions on the blockchain.  The users are not usable without
    // This data.
    var uuid = network_id[0].substring(0, 8);
    chain.setKeyValStore(hfc.newFileKeyValStore(__dirname + '/keyValStore-' + uuid));

    if (isHSBN) {
        certFile = '0.secure.blockchain.ibm.com.cert';
    }
    fs.createReadStream(certFile).pipe(fs.createWriteStream(certPath));
    var cert = fs.readFileSync(certFile);

    chain.setMemberServicesUrl(caUrl, {
        pem: cert
    });

    peerUrls = [];
    eventUrls = [];
    // Adding all the peers to blockchain
    // this adds high availability for the client
    for (var i = 0; i < peers.length; i++) {
        // Peers on Bluemix require secured connections, hence 'grpcs://'
        peerUrls.push("grpcs://" + peers[i].discovery_host + ":" + peers[i].discovery_port);
        chain.addPeer(peerUrls[i], {
            pem: cert
        });
        eventUrls.push("grpcs://" + peers[i].event_host + ":" + peers[i].event_port);
        chain.eventHubConnect(eventUrls[0], {
            pem: cert
        });
    }
    // newUserName = config.user.username;
    // Make sure disconnect the eventhub on exit
    process.on('exit', function() {
        chain.eventHubDisconnect();
    });
}

//*******************************Bluemix SETUP DONE ******************************

//*******************************Admin SETUP START *******************************





var admin;


function enrollAdmin() {

    //enroll the admin 
    chain.enroll(users[0].enrollId, users[0].enrollSecret, function(err, user) {
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


//*******************************Transaction functions START ********************
function invokeChainCode(voter, vote, res) {
    console.log("Andrei is invoking chaincode...");
    var invokeRequest = {
        chaincodeID: chaincodeID,
        fcn: "write",
        args: [voter, vote]
    };


    // Trigger the invoke transaction
    var invokeTx = admin.invoke(invokeRequest);

    // Print the invoke results
    invokeTx.on('submitted', function(results) {
        // Invoke transaction submitted successfully
        console.log(util.format("\n%s Successfully submitted chaincode invoke transaction: request=%j, response=%j", voter, invokeRequest, results));
    });
    invokeTx.on('complete', function(results) {
        // Invoke transaction completed successfully
        console.log(util.format("\n%s Successfully completed chaincode invoke transaction: request=%j, response=%j", voter, invokeRequest, results));
        res.end('You have succesfully voted! You can review your vote with the "Review Vote" action');
    });
    invokeTx.on('error', function(err) {
        // Invoke transaction submission failed
        console.log(util.format("\n%s Failed to submit chaincode invoke transaction: request=%j, error=%j", voter, invokeRequest, err));
        res.end("Sorry, your submission has failed. Please contact the system administrator.");
    });
    //End the response proces 
    // res.end();

}

function queryChainCode(voter, res) {
    console.log(voter + " is querying chaincode...");
    // Construct the query request
    var queryRequest = {
        // Name (hash) required for query
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: "read",
        // Existing state vasriable to retrieve
        args: [voter]
    }

    // Trigger the query transaction
    var queryTx = admin.query(queryRequest);

    // Print the query results
    queryTx.on('complete', function(results) {
        // Query completed successfully
        console.log("\n%s Successfully queried  chaincode function: request=%j, value=%s", voter, queryRequest, results.result.toString());
        console.log(results);
        if (results.result.toString() == "yes") {
            res.end(voter + " wants UK to leave the EU.");
        } if (results.result.toString() == "no") {
            res.end(voter + " wants UK to stay in the EU.");
        }else {
            res.end(voter + " has not voted yet.");
        }

    });
    queryTx.on('error', function(err) {
        // Query failed
        console.log("\n%s Failed to query chaincode, function: request=%j, error=%j", voter, queryRequest, err);
        res.end("Sorry, your query has failed. Please contact the system administrator");
    });
}


//This is specific to the Brexit referendum
function queryResultsChaincode(res) {
    console.log("Querying results of Brexit referendum...");

    //ask for number of yes 
    var yesQueryRequest = {
        // Name (hash) required for query
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: "read",
        // Existing state variable to retrieve
        args: ["yesVotes"]
    }


    //ask for number of no 
    var noQueryRequest = {
        // Name (hash) required for query
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: "read",
        // Existing state variable to retrieve
        args: ["noVotes"]
    }

    var yesCount;
    var noCount;

    // ask for yes votes 
    var yesQuery = admin.query(yesQueryRequest);

    // Print the query results
    yesQuery.on('complete', function(results) {
        // Query completed successfully
        console.log("\n Successfully queried yes results of Brexit: request=%j, yes votes = %s", yesQueryRequest, results.result.toString());
        yesCount = results.result.toString();

        // ask for no votes
        var noQuery = admin.query(noQueryRequest);

        // Print the query results
        noQuery.on('complete', function(results) {
            // Query completed successfully
            console.log("\n Successfully queried no results of Brexit: request=%j, no votes = %s", noQueryRequest, results.result.toString());

            noCount = results.result.toString();
            //TODONOW: Figure out how to send two numbers to the plukash
            //I will have to send it as a string separated by a space 

            //Example:"9 10", I have to conver this into a number at the frount end
            var BrexitResults = "";
            BrexitResults += yesCount + " " + noCount;

            //can I send numbers through here?
            res.end(BrexitResults);
        });
        noQuery.on('error', function(err) {
            // Query failed
            console.log("Failed to query results of Brexit referendum: request=%j, error=%j", noQueryRequest, err);
            res.end("Sorry, your requests for results has failed. Please contact the system administrator");
        });

    });
    yesQuery.on('error', function(err) {
        // Query failed
        cconsole.log("Failed to query results of Brexit referendum: request=%j, error=%j", yesQueryRequest, err);
        res.end("Sorry, your requests for results has failed. Please contact the system administrator");
    });


}

//*******************************Transaction functions DONE ********************

//*******************************WEB APP SERVICE START ******************************
// create a new express server
var app = express();

//Use morgan for logging, it is currently on dev mode  
app.use(morgan('dev'));
//parse the JSON body of a POST request 
app.use(bodyParser.urlencoded());

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));


var hostname = 'localhost';
var port = 3000;
app.listen(port, hostname, function() {
    console.log(`WebServer running at http://${hostname}:${port}/`);
});


app.post('/vote', function(req, res) {
    console.log("enrollmentID: " + req.body.enrollmentID + " vote: " + req.body.vote + " invokes.");
    //Call the invoke 
    var id = req.body.enrollmentID.replace(/ +/g, "");
    invokeChainCode(id, req.body.vote, res);
});

app.post('/query', function(req, res) {
    console.log("enrollmentID: " + req.body.enrollmentID + " query.");
    //Call the query 
    var id = req.body.enrollmentID.replace(/ +/g, "");
    queryChainCode(id, res);
});

//This is only for Brexit referendum 
app.get('/queryresults', function(req, res) {
    //get the results of the refrendum 
    queryResultsChaincode(res);
})

// app.post('/', function(req, res){
//     console.log("enrollmentID: " + req.body.enrollmentID + " " + req.body.action);
//     var userTransaction = {
//         type: req.body.action,
//         vote: req.body.vote
//     }
//     registerUser(req.body.enrollmentID, userTransaction);


//     //TODO: send out feedback
//     res.end();
// })

//TODO: Create a program that will stress test the IBM Blockchain on Bluemix 

//*******************************WEB APP SERVICE DONE ******************************


// // get the app environment from Cloud Foundry
// var appEnv = cfenv.getAppEnv();

// // start server on the specified port and binding host
// app.listen(appEnv.port, '0.0.0.0', function() {
//     // print a message when the server starts listening
//     console.log("server starting on " + appEnv.url);
// });
