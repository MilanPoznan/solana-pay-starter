import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import products from "./products.json";


// Make sure you replace this with your wallet address!

const sellerAddress = 'C7URT9hDmKYUHLZGzhvZLp71a6DvVCvfQaUxpmZrtTwU'
const sellerPublicKey = new PublicKey(sellerAddress);


const createTransaction = async (req, res) => {

  try {
    const { buyer, orderID, itemID } = req.body

    if (!buyer) {
      res.status(400).json({
        message: 'Missing buyer address'
      })
    }

    if (!orderID) {
      res.status(400).json({
        message: "Missing order ID",
      });
    }

    const itemPrice = products.find((item) => item.id === itemID).price

    if (!itemPrice) {
      res.status(404).json({
        message: "Item not found. please check item ID",
      });
    }

    const bigAmount = BigNumber(itemPrice)
    console.log(bigAmount)
    const buyerPublicKey = new PublicKey(buyer)
    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)

    const connection = new Connection(endpoint)

    // A blockhash is sort of like an ID for a block. It lets you identify each block.
    const { blockhash } = await connection.getLatestBlockhash("finalized");


    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey
    })

    const transactionInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: sellerPublicKey
    })

    transactionInstruction.keys.push({
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    })

    transaction.add(transactionInstruction)

    // Formatting our transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    })
    //Prevodim je u razumljiv format
    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64
    })
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "error creating tx" });
    return;
  }
}


export default function handler(req, res) {
  if (req.method === "POST") {
    createTransaction(req, res);
  } else {
    res.status(405).end();
  }
}