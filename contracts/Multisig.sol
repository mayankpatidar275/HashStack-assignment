// Its not always favourable to give authority to a single account when money is involved.
// If somebody will send the money to the contract, it wont go straight into it, it has to pass through several confirmations.

// This contract will have capabilities of multi sig wallet and it extends other contract which is even capable of managing the owners of multi sig wallet
import "./Access.sol";
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Multisig is Access {
    event Deposite(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(address indexed owner, uint256 indexed transactionId, address indexed transactionTo, uint256 value, bytes data); // using bytes intead of string saves gas
    event ConfirmationTransaction(address indexed owner, uint256 indexed transactionId);
    event RevokeConfirmation(address indexed owner, uint256 indexed transactionId);
    event ExecuteTransaction(address indexed owner, uint256 indexed transactionId);

    // address[] owners;
    // mapping(address => bool) public isOwner;
    uint256 public numConfirmationRequired;

    struct Transaction{
        address payable to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    Transaction[] public transactions;

    // modifier prevents from reentrancy attack in smart contract
     modifier onlyOwner(){
        require(isOwner[msg.sender], "Only owner allowed");
        _;
     }
     
     modifier transactionExists(uint256 _transactionId){
        require(_transactionId < transactions.length, "Transaction does not exist");
        _;
     }

    modifier notExecuted(uint256 _transactionId){
        require(!transactions[_transactionId].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 _transactionId){
        require(!isConfirmed[_transactionId][msg.sender], "transaction already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint256 _numOfConfirmationRequired) Access(_owners){
        require(_owners.length > 0, "Owners required");
        require(_numOfConfirmationRequired > 0 && _numOfConfirmationRequired <= _owners.length, "Invalid number of required confirmation");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationRequired = _numOfConfirmationRequired;

    }

    receive() external payable{
        emit Deposite(msg.sender, msg.value, address(this).balance); 
    }

    function submitTransaction(address payable _to, uint256 _value, bytes memory _data) public onlyOwner{
        uint256 transactionId = transactions.length;
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        }));
        emit SubmitTransaction(msg.sender, transactionId, _to, _value, _data);
    }

    function confirmationTransaction(uint256 _txIndex) public onlyOwner transactionExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmationTransaction(msg.sender, _txIndex);
    }

    // function executeTransaction(uint256 _txIndex) public payable onlyOwner transactionExists(_txIndex) notExecuted(_txIndex) {
        function executeTransaction(uint256 _txIndex, address payable _to) public payable onlyOwner transactionExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        
        require(transaction.numConfirmations >= numConfirmationRequired, "Cannot execute this transaction");
        bool sent = _to.send(msg.value);
        require(sent, "Failed to send Ether");

        transaction.executed = true;
        // (bool success,) = transaction.to.call{ value: transaction.value}(
        //     transaction.data
        //     // ""
        // );
        // require(success, "Transaction failed");
        // emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function removeConfirmation(uint256 _txIndex) public onlyOwner transactionExists(_txIndex) notExecuted(_txIndex) {
        Transaction storage transaction = transactions[_txIndex];
        require(isConfirmed[_txIndex][msg.sender], "Transaction not confirmed");
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function getOwners() public view returns(address[] memory){
        return owners;
    }

    function getTransactionsCount() public view returns(uint256){
        return transactions.length;
    }

    function getTransaction(uint256 _txIndex) public view returns(
        address to, uint value, bytes memory data, bool executed, uint256 numConfirmations
    ) 
    {
        Transaction storage transaction = transactions[_txIndex];
        return(
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}