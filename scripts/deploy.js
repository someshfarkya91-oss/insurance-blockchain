const hre = require("hardhat");

async function main() {
  const Insurance = await hre.ethers.getContractFactory("Insurance");

  const insurance = await Insurance.deploy();

  await insurance.waitForDeployment();

  const address = await insurance.getAddress();

  console.log("✅ Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});