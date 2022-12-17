const Access = artifacts.require("Access");

module.exports = function(deployer) {
  deployer.deploy(Access, [
    "0x54E8fda48Cd35A7b7FF85996B46F84B9Bcc185d2",
    "0x210Cb02d1c4581013d04ee344305fd2a65268B86",
    "0x6DEcebA92BbFf751bC82a18A9D94bD441649593d",
    "0x93A9f4A39226E66A216Db737b5348E9708d73deF",
    "0xd87d3Eb2f4992495aAfeb22DfBE4e9d274ADE061"
]);
};
