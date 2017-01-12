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
    chaincodeID = "a148fcad2fc0a66ee880d1feee0e31caf604aee24e7c5e39946fdbba17cb06ddd1746b6cca79dfb1aaee0c62a47f44c606cffb6bcdafb943f33cee49d0c5340a";
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
        deployChaincode();
    });
}
//*******************************Admin SETUP DONE *******************************


function deployChaincode() {
    // var args = getArgs(config.deployRequest);
    // Construct the deploy request
    chain.setDeployWaitTime(240);
    var deployRequest = {
        // Function to trigger
        fcn: "init",
        // Arguments to the initializing function
        args: ["Brexit Vote"],
        chaincodePath: "BlockVoteChainCode/start",
        // the location where the startup and HSBN store the certificates
        certificatePath: network.cert_path
    };

    // Trigger the deploy transaction
    var deployTx = admin.deploy(deployRequest);

    // Print the deploy results
    deployTx.on('complete', function(results) {
        // Deploy request completed successfully
        chaincodeID = results.chaincodeID;
        console.log("\nChaincode ID : " + chaincodeID);
        console.log(util.format("\nSuccessfully deployed chaincode: request=%j, response=%j", deployRequest, results));
        // Save the chaincodeID
        fs.writeFileSync(chaincodeIDPath, chaincodeID);
    });

    deployTx.on('error', function(err) {
        // Deploy request failed
        console.log(util.format("\nFailed to deploy chaincode: request=%j, error=%j", deployRequest, err));
        process.exit(1);
    });
}