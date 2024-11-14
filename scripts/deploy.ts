const { ethers } = require('hardhat');

async function main() {
  const VotingSystem = await ethers.getContractFactory('VotingSystem');
  const votingSystem = await VotingSystem.deploy();

  await votingSystem.deployed();

  console.log('VotingSystem deployed to:', votingSystem.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
