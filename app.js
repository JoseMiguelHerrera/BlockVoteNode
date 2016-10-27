/*eslint-env node*/

//----------------------
// node.js starter application for Bluemix
//---------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
// var cfenv = require('cfenv');

//hyperledger SDK
var hfc = require('hfc');
//Access directories 
var fs = require('fs');
const https = require('https');

// Creating an environment variable for ciphersuites
process.env['GRPC_SSL_CIPHER_SUITES'] = 'ECDHE-RSA-AES128-GCM-SHA256:' +
    'ECDHE-RSA-AES128-SHA256:' +
    'ECDHE-RSA-AES256-SHA384:' +
    'ECDHE-RSA-AES256-GCM-SHA384:' +
    'ECDHE-ECDSA-AES128-GCM-SHA256:' +
    'ECDHE-ECDSA-AES128-SHA256:' +
    'ECDHE-ECDSA-AES256-SHA384:' +
    'ECDHE-ECDSA-AES256-GCM-SHA384';
//*******************************HFC SDK SETUP START ******************************

// Create a client blockchin.
var chain = hfc.newChain("BallotChain")

//Set the default chaincode path 
var ccPath = process.env["GOPATH"] + "/src/BlockVoteChainCode";
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

function copyCertificate() {
    //fs.createReadStream('certificate.pem').pipe(fs.createWriteStream(ccPath+'/certificate.pem'));
    fs.writeFileSync(ccPath + '/certificate.pem', fs.readFileSync(__dirname + '/certificate.pem'));

    setTimeout(function() {
        enrollAdmin();
    }, 1000);
}


var network_id = Object.keys(network.credentials.ca);
var uuid = network_id[0].substring(0, 8);

//keyValStore is local 

chain.setKeyValStore(hfc.newFileKeyValStore(__dirname + '/keyValStore-' + uuid));


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

    console.log("\n\n------------- peers and caserver information: -------------");
    console.log(chain.getPeers());
    console.log(chain.getMemberServices());
    console.log('-----------------------------------------------------------\n\n');

    console.log("Enrolling the admin... ");
    //enroll the admin 
    chain.enroll(users[0].username, users[0].secret, function(err, admin) {
        if (err) throw Error("\nERROR: failed to enroll admin : %s", err);
        // Set this user as the chain's registrar which is authorized to register other users.
        
        chain.setRegistrar(users[0].username);
    });
}
//admin deploys the chaincode 
function deploy() {

}

function testProgram() {

}

//*******************************HFC SDK SETUP DONE ******************************

//*******************************WEB APP SERVICE START ******************************
// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));



// app.listen(port, hostname, function() {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });

//Setup the APIs for communication between front end and back end 

//functions to interface with IBM Blockchain
function registerNewUser() {
    //admin registers the new user

}

function enrollUser() {
    //admin enrolls the user
}


//set the vote 
function invoke() {

}

function query() {

}

//*******************************WEB APP SERVICE DONE ******************************


// // get the app environment from Cloud Foundry
// var appEnv = cfenv.getAppEnv();

// // start server on the specified port and binding host
// app.listen(appEnv.port, '0.0.0.0', function() {
//     // print a message when the server starts listening
//     console.log("server starting on " + appEnv.url);
// });
