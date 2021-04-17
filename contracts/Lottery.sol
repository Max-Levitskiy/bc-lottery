pragma solidity ^0.4.17;

contract Lottery {
  address public manager;
  address[] public players;

  constructor() public {
    manager = msg.sender;
  }

  modifier restricted() {
    require(msg.sender == manager, "Only manager can call pickWinner");
    _;
  }

  function enter() public payable {
    require(msg.value > .01 ether, "You need to send at least 0.001 ether");
    players.push(msg.sender);
  }

  function pickWinner() public restricted {
    uint index = random() % players.length;
    players[index].transfer(this.balance);
    players = new address[](0);
  }

  function getPlayers() public view returns(address[]) {
    return players;
  }

  function returnEntries() public restricted {

  }

  function random() private view returns (uint) {
    return uint(keccak256(block.difficulty, now, players));
  }

}
