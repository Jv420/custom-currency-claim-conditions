import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import fs from "fs";
import path from "path";

(async () => {
  const sdk = new ThirdwebSDK("polygon");
  // replace the addresses and amount with your own
  const collectionAddress = "0x328e9c77f7F1aF8f55F11ECc6219E52b3C4C24A7";
  const tokenAddress = "0xc08a1971D96D4d32AEaDBdFceFf9D8582c863003";
  const tokenAmount = 12000000;

  const contract = await sdk.getContract(collectionAddress);

  if (!contract) {
    return console.log("Contract not found");
  }

  // getting all the NFTs of the collection
  const nfts = await contract.erc721.getAll();

  if (!nfts) {
    return console.log("No NFTs found");
  }

  // creating a new array of addresses
  const csv = nfts.reduce((acc, nft) => {
    const address = nft.owner;
    const quantity = acc[address] ? acc[address] + 1 : 1;
    return { ...acc, [address]: quantity };
  }, {});

  // filtering the addressees
  const filteredCsv = Object.keys(csv).reduce((acc, key) => {
    if (key !== "0x0000000000000000000000000000000000000000") {
      return {
        ...acc,
        [key]: csv[key],
      };
    }
    return acc;
  }, {});

  // writing the addresses to a csv file
  const csvString =
    "address,maxClaimable,price,currencyAddress\r" +
    Object.entries(filteredCsv)
      .map(
        ([address, quantity]) =>
          `${address},${quantity},${tokenAmount},${tokenAddress}`
      )
      .join("\r");

  fs.writeFileSync(path.join(path.dirname("."), "snapshot.csv"), csvString);
  console.log("Generated snapshot.csv");
})();
