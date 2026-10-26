import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const rpcUrl = process.env.RPC_URL || "https://rpc.bohr.life";
  const rawKey = process.env.PRIVATE_KEY?.trim();

  if (!rawKey || rawKey === "your_private_key_here") {
    console.error("Please set PRIVATE_KEY in .env file");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(formattedKey, provider);
  console.log("Deploying from address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet BOT balance:", ethers.formatEther(balance));

  const artifact = JSON.parse(
    fs.readFileSync("./artifacts/contracts/TaskVault.sol/TaskVault.json", "utf8")
  );

  const arbiterAddress = process.env.ARBITER_ADDRESS || wallet.address;
  console.log("Setting initial arbiter to:", arbiterAddress);

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(arbiterAddress);

  console.log("Deployment tx sent:", contract.deploymentTransaction()?.hash);
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log("\n=========================================");
  console.log("TaskVault deployed successfully on Bohr Testnet!");
  console.log("Contract Address:", deployedAddress);
  console.log("Explorer:", `https://scan.bohr.life/address/${deployedAddress}`);
  console.log("=========================================\n");

  // Save address to a config file for frontend usage
  const configContent = `export const TASK_VAULT_ADDRESS = "${deployedAddress}";\n`;
  fs.writeFileSync("./src/contracts/deployedAddress.js", configContent);
  console.log("Saved address to src/contracts/deployedAddress.js");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
