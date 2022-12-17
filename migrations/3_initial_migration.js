const AccessWallet = artifacts.require("AccessWallet");
const Multisig = artifacts.require("Multisig");
const accounts = [
    "0x0dE29F26C21fED8Ca9b3E2F780561d7FA1B1dDDb",
    "0xD09C74A0b42c00317fFDe576e0c09482B8b5A432",
    "0x188CF3e9c841630ebd458FA3C420bed8e1153231",
    "0xa68d4cCC05E651486313EE29C63E7B0672E395a6",
    "0x22a7c2764E9d381740b86e0B7dAD63454bF24a6F"
]
const requiredNumOfConfirmatioins = 3;
module.exports = function(deployer) {
  deployer.deploy(Multisig, accounts, requiredNumOfConfirmatioins)
    .then(function() {
      return deployer.deploy(AccessWallet, Multisig.address, accounts);
    });
};
