//chaincode for simple referendum vote election

package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

type Referendum struct { //jose: this struct perhaps should be used in the data model. Right now it's all a flat key,val store.
	referendumName string
	noVotes        int
	yesVotes       int
}

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

// ============================================================================================================================
// Main
// ============================================================================================================================
func main() { //main function executes when each peer deploys its instance of the chaincode
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// Init resets all the things
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. Expecting 1")
	}

	/* //for data future model expansion
	newRef := Referendum{referendumName: args[0], noVotes: 0, yesVotes: 0}
	jsonRef, err := json.Marshal(newRef)
	*/

	err := stub.PutState("election", []byte(args[0])) //initializes a key-value pair (election, "election name")
	if err != nil {
		return nil, err
	}

	yesVotes := strconv.Itoa(0)
	noVotes := strconv.Itoa(0)
	err = stub.PutState("noVotes", []byte(noVotes)) //initializes a key-value pair (election, "election name")
	if err != nil {
		return nil, err
	}

	err = stub.PutState("yesVotes", []byte(yesVotes)) //initializes a key-value pair (election, "election name")
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// Invoke is our entry point to invoke a chaincode function
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	fmt.Println("invoke is running " + function)

	// Handle different functions
	if function == "init" { //initialize the chaincode state, used as reset
		return t.Init(stub, "init", args)
	} else if function == "write" {
		return t.write(stub, args)

	}

	fmt.Println("invoke did not find func: " + function) //error

	return nil, errors.New("Received unknown function invocation")
}

func (t *SimpleChaincode) write(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {

	var name string
	var value string
	var err error

	fmt.Println("running write()")

	if len(args) != 2 {
		return nil, errors.New("Incorrect number of arguments. Expecting 2. name of the variable and value to set")
	}

	name = args[0]
	value = args[1]

	//TODO: check if this user has already voted
	//if user has already voted, return with message
	//else, proceed to vote

	yesVotesBytes, err := stub.GetState("yesVotes") //gets value for the given key
	noVotesBytes, err := stub.GetState("noVotes")   //gets value for the given key

	noVotes, err := strconv.Atoi(string(noVotesBytes))
	yesVotes, err := strconv.Atoi(string(yesVotesBytes))

	if strings.TrimRight(value, "\n") == "yes" {
		yesVotes++

		err = stub.PutState("yesVotes", []byte(strconv.Itoa(yesVotes))) //initializes a key-value pair (election, "election name")
		if err != nil {
			return nil, err
		}

	} else if strings.TrimRight(value, "\n") == "no" {
		noVotes++
		err = stub.PutState("noVotes", []byte(strconv.Itoa(noVotes))) //initializes a key-value pair (election, "election name")
		if err != nil {
			return nil, err
		}
	}

	err = stub.PutState(name, []byte(value)) //JOSE: writes a key-value pair with the given key and value paramenters. We need to introduce a more complex data model that includes an increasing vote ID, for iterating over votes.

	if err != nil {
		return nil, err
	}

	return nil, nil
}

// Query is our entry point for queries
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	fmt.Println("query is running " + function)

	// Handle different functions
	if function == "dummy_query" { //read a variable
		fmt.Println("hi there " + function) //error
		return nil, nil
	} else if function == "read" {
		return t.read(stub, args)
	}
	fmt.Println("query did not find func: " + function) //error

	return nil, errors.New("Received unknown function query")
}

func (t *SimpleChaincode) read(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var name string
	var jsonResp string

	var err error

	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. Expecting name of the var to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetState(name) //gets value for the given key
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get vote for " + name + "\"}"
		return nil, errors.New(jsonResp)
	}

	return valAsbytes, nil
}