require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const config = {
  solidity: '0.8.18',
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

module.exports = config;
