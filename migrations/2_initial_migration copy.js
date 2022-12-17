const Multisig = artifacts.require("Multisig");
const accounts = [
    "0x85920C37bA83284f77d636cA1334DD4c3728b1E8",
    "0x93C2D777DeB1E36D159c22944E62aDe9Fe5fee5a",
    "0xfC3991CB861D5FDB72A1a854408FBf3763d230cD",
    "0x082d449718eE75170a46992FD4eA63d2e46906b9",
    "0xBef0cAc6A21c3D8ba457527983913b5E355dc96E"
]
const requiredNumOfConfirmatioins = 3;
module.exports = function(deployer){
    deployer.deploy(Multisig, accounts, requiredNumOfConfirmatioins);
}