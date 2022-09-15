// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract RandomNumber is VRFConsumerBase {
    bytes32 internal keyHash; //specijalizacija za Chainlink oracle
    uint internal fee;        
    uint public randomResult;

    constructor()
        VRFConsumerBase(
            0x6168499c0cFfCaCD319c818142124B7A15E857ab, // VRF coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709  // LINK token address
        ) {
            keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
            fee = 0.1 * 10 ** 18; 
        }
    
    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK in contract");
        //procedura plaćanja LINK-a
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness (bytes32 requestId, uint randomness) internal override {
        randomResult = randomness;
    }
}
