import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("Starting deployment...");

  // Deploy DecentralizedDiscord contract
  console.log("\nDeploying DecentralizedDiscord...");
  const DecentralizedDiscord = await hre.ethers.getContractFactory("DecentralizedDiscord");
  const discord = await DecentralizedDiscord.deploy();
  await discord.waitForDeployment();
  const discordAddress = await discord.getAddress();
  console.log("DecentralizedDiscord deployed to:", discordAddress);

  // Deploy DiscordNFT contract
  console.log("\nDeploying DiscordNFT...");
  const mintPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH
  const DiscordNFT = await hre.ethers.getContractFactory("DiscordNFT");
  const nft = await DiscordNFT.deploy(mintPrice);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("DiscordNFT deployed to:", nftAddress);

  // Save contract addresses and ABIs
  const deploymentInfo = {
    DecentralizedDiscord: {
      address: discordAddress,
      abi: JSON.parse(discord.interface.formatJson())
    },
    DiscordNFT: {
      address: nftAddress,
      abi: JSON.parse(nft.interface.formatJson())
    },
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  // Create client/src directory if it doesn't exist
  const clientSrcDir = path.join(__dirname, "..", "client", "src");
  if (!fs.existsSync(clientSrcDir)) {
    fs.mkdirSync(clientSrcDir, { recursive: true });
  }

  // Save deployment info
  const deploymentsPath = path.join(clientSrcDir, "contracts.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nContract info saved to:", deploymentsPath);

  console.log("\n=== Deployment Summary ===");
  console.log("DecentralizedDiscord:", discordAddress);
  console.log("DiscordNFT:", nftAddress);
  console.log("Network:", hre.network.name);
  console.log("=========================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
