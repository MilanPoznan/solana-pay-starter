import React, { useState, useMemo } from "react";
import { Keypair, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { InfinitySpin } from "react-loader-spinner";
import IPFSDownload from "./IpfsDownload";


export default function Buy({ itemID }) {

  const { connection } = useConnection()

  //Iz walle
  const { publicKey, sendTransaction } = useWallet()

  const orderID = useMemo(() => Keypair.generate().publicKey, []) // Public key used to identify the order

  const [paid, setPaid] = useState(null)
  const [loading, setLoading] = useState(false)


  const order = useMemo(
    () => ({
      buyer: publicKey.toString(),
      orderID: orderID.toString(),
      itemID: itemID
    }),
    [publicKey, orderID, itemID]
  )

  // Fetch the transaction object from the server 
  const processTransaction = async () => {

    setLoading(true)
    //Fetch data
    const transactionResponse = await fetch('../api/createTransaction', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })

    //Data to json
    const transactionData = await transactionResponse.json()

    //Create transaction 
    const orderTransaction = Transaction.from(Buffer.from(transactionData.transaction, 'base64'))
    console.log('transaction data is: ', orderTransaction);

    try {
      const transactionHash = await sendTransaction(orderTransaction, connection)
      console.log(`Transaction sent: https://solscan.io/tx/${transactionHash}?cluster=devnet`);

      setPaid(true);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }


  }




  if (!publicKey) {
    return (
      <div>
        <p>You need to connect your wallet to make transactions</p>
      </div>
    );
  }

  if (loading) {
    return <InfinitySpin color="gray" />;
  }

  return (
    <div>
      {paid ? (
        <IPFSDownload filename="Breyta1.png" hash="QmbB6rFdK6uQaYKnZZ5r5o4w2xQFUeWoGzmmgZQ2c1VyYo" cta="Download image" />
      ) : (
        <button disabled={loading} className="buy-button" onClick={processTransaction}>
          Buy now 🠚
        </button>
      )}
    </div>
  );
}
