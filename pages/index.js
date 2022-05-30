import React, { useEffect, useState } from "react";
import CreateProduct from "../components/CreateProduct";

import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import Product from '../components/Product'
// Constants
const TWITTER_HANDLE = "CryFamBrother";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  //ovaj hook daje nam adresu kontektovanog usera bilo gde u app, zato sam morao da ga premetim iz child u HOC  jebo mi pas mater
  const { publicKey } = useWallet()

  const isOwner = (publicKey ? publicKey.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY : false);

  const [products, setProducts] = useState([]);
  const [creating, setCreating] = useState(false);

  const renderNotConnectedContainer = () => (
    <div>
      <img src="https://media.giphy.com/media/eSwGh3YK54JKU/giphy.gif" alt="emoji" />

      <div className="button-container">
        <WalletMultiButton className="cta-button connect-wallet-button" />
      </div>
    </div>
  );
  const renderItemBuyContainer = () => (
    <div className="products-container">
      {products.map((product) => {
        return (
          <Product key={product.id} product={product} />
        )
      })}
    </div>
  );

  useEffect(() => {
    if (publicKey) {
      fetch(`/api/fetchProducts`)
        .then(response => response.json())
        .then(data => {
          setProducts(data)
          console.log('Products', data)
        })
    }
  }, [publicKey])
  return (
    <div className="App">
      <div className="container">
        <header className="header-container">
          <p className="header"> Kupi dobru sliku brate moj </p>
          <p className="sub-text">Jedina prodavnica koja prihvata shitcoins</p>

          {isOwner && (
            <button className="create-product-button" onClick={() => setCreating(!creating)}>
              {creating ? "Close" : "Create Product"}
            </button>
          )}
        </header>

        <main>
          {/* We only render the connect button if public key doesn't exist */}

          {creating && <CreateProduct />}

          {publicKey ? renderItemBuyContainer() : renderNotConnectedContainer()}

        </main>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src="twitter-logo.svg" />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
