// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Lottery {
    address public owner;
    address payable[] public players;
    uint public loterryId;
    mapping (uint => address payable) public lotteryHistory;

    constructor() {
        owner = msg.sender;
        loterryId = 1;
    }

    function getWinnerByLottery(uint lotteryId) public view returns (address payable) {
        return lotteryHistory[lotteryId];
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function enter () public payable {
        require(msg.value > .001 ether);

        // adresa igrača koji ulazi u lutriju
        players.push(payable(msg.sender));
    }

    function getRandomNumber() public view returns (uint) {
        return uint(keccak256(abi.encodePacked(owner, block.timestamp)));
    }
    function pickWinner() public onlyOwner {
        
        uint index = getRandomNumber() % players.length;
        players[index].transfer(address(this).balance);
        
        
        lotteryHistory[loterryId] = players[index];
        loterryId++;

        // ponovi stanje ugovora
        players = new address payable[](0);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}