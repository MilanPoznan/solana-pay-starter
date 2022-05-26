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

import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token";



// const usdcAddress = new PublicKey("C7URT9hDmKYUHLZGzhvZLp71a6DvVCvfQaUxpmZrtTwU");

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

    const buyerPublicKey = new PublicKey(buyer)

    const network = WalletAdapterNetwork.Devnet
    const endpoint = clusterApiUrl(network)
    const connection = new Connection(endpoint)

    // const buyerUsdcAddress = await getAssociatedTokenAddress(usdcAddress, buyerPublicKey)
    // const shopUsdcAddress = await getAssociatedTokenAddress(usdcAddress, sellerPublicKey)

    // A blockhash is sort of like an ID for a block. It lets you identify each block.
    const { blockhash } = await connection.getLatestBlockhash("finalized");

    // This is new, we're getting the mint address of the token we want to transfer
    // getMint -> Retrieve information about a mint
    const usdcMint = await getMint(connection, usdcAddress);
    console.log('usdcMint,', usdcMint)

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey
    })


    /**
     * Vraca TransactionSignature 
     * Narodski receno vraca promise sa potpisom transakcije 
     * TransactionSignature je string 
     */
    // const usdcTransactionInstruction = createTransferCheckedInstruction(
    //   buyerUsdcAddress, //ovo mi je izvor
    //   usdcAddress, //Adresa tokena, sto kontam mogu da stavljam i sub coll tokene
    //   shopUsdcAddress, //dresa gde lezu pare 
    //   buyerPublicKey, // verujem da ovo mora da stoji zbog trans-block hash
    //   bigAmount.toNumber() * 10 ** (await usdcMint).decimals, // sve jasno
    //   usdcMint.decimals //Mislim da svaki token moze da se kreira sa max 8 decimala pa zato ovo

    // )

    /**
     *  
     * { pubkey: [PublicKey], isSigner: true, isWritable: true },
     * { pubkey: [PublicKey], isSigner: false, isWritable: true } mi je jasno, ali zasto sinhrono posle push to key ne razumem bas 
     */
    const transactionInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: sellerPublicKey
    })


    //Nije mi bas najjasnije sto ovo radim moram da istrazim 
    transactionInstruction.keys.push({
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    })

    // console.log('transactionInstruction posle dodavanja key', transactionInstruction)

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