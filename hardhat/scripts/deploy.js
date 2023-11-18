const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const ContestContract = await hre.ethers.getContractFactory("ContestContract");
  const contestInstance = await ContestContract.deploy();
  await contestInstance.deployed();

  const RewardPool = await hre.ethers.getContractFactory("RewardPool");
  const adminAddress = process.env.OWNER_ADDRESS;
  const usdcAddress = "0x0fa8781a83e46826621b3bc094ea2a0212e71b23";  // <-- あなたのUSDCアドレスに置き換えてください

  const rewardPoolInstance = await RewardPool.deploy(contestInstance.address, adminAddress, usdcAddress);
  await rewardPoolInstance.deployed();

  console.log("ContestContract deployed to:", contestInstance.address);
  console.log("RewardPool deployed to:", rewardPoolInstance.address);

  // Save the artifacts in the shared_json directory
  const directoryPath = path.join(__dirname, "../../src/shared_json");

  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const contestArtifact = await hre.artifacts.readArtifact("ContestContract");
  fs.writeFileSync(
    path.join(directoryPath, "ContestContract.json"),
    JSON.stringify({
      address: contestInstance.address,
      abi: contestArtifact.abi
    })
  );

  const rewardPoolArtifact = await hre.artifacts.readArtifact("RewardPool");
  fs.writeFileSync(
    path.join(directoryPath, "RewardPool.json"),
    JSON.stringify({
      address: rewardPoolInstance.address,
      abi: rewardPoolArtifact.abi
    })
  );
}

// Handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
