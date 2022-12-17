// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Access.sol";


interface IWalletA {
    // Allows admin to add new owner to the wallet
    function addOwner(address owner) external;

    // Allows admin to remove owner from the wallet
    function removeOwner(address owner) external;

    // Allows admin to transfer owner from one wallet to  another
    function transferOwner(address _from, address _to) external;

    // Allows an owner to confirm a transaction.
    function confirmTransaction(uint256 transactionId) external;

    // Allows anyone to execute a confirmed transaction.
    function executeTransaction(uint256 transactionId) external;

    // Allows an owner to revoke a confirmation for a transaction.
    function revokeTransaction(uint256 transactionId) external;
}

contract AccessWallet is Access {
    using SafeMath for uint256;

    IWalletA _walletInterface;

    // Contract constructor instantiates wallet interface and sets msg.sender to admin
     
    constructor(IWalletA wallet_, address[] memory _owners) Access(_owners){
        _walletInterface = IWalletA(wallet_);
        admin = msg.sender;
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
     }

    function getAdmin() external view returns (address) {
        return admin;
    }
}