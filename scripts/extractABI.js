const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
const votingSystemDir = path.join(contractsDir, 'VotingSystem.sol');
const votingSystemArtifact = require(path.join(
  votingSystemDir,
  'VotingSystem.json'
));

const abi = votingSystemArtifact.abi;

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'contractABI.json'),
  JSON.stringify(abi, null, 2)
);

console.log('ABI has been extracted to src/contractABI.json');
