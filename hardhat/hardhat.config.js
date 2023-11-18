require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;  // アカウントの秘密鍵

module.exports = {
  solidity: "0.8.17",
  networks: {
    mumbai: {  // PolygonのMumbaiテストネット
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY],
      chainId: 80001
    },
  },
};
