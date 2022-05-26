import React, { useMemo } from "react";
//Objekat sa solana mrezama
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
//Komponenta koja dozvoljava useru da izabere wallet
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
//ConnectionProvider -> uzima RPC endpoint i dozvoljava nam da komunirciramo direktno sa nodovima na Solana BC. On nas konektuje na mrezu u stvari
//WalletProvider -> daje standardni interface da se konektujemo na svaki od novcanika 
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
//Ove klase ubacujemo u WalletProvider 
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
//Kreira RPC endpoint bazir na mrezi koju smo prosledili
import { clusterApiUrl } from "@solana/web3.js";

//Stilovi
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import "../styles/App.css";

const App = ({ Component, pageProps }) => {

  //Izabrali mrezu
  const network = WalletAdapterNetwork.Devnet

  //Kreirali RPC enpoint na BC
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  //Instancirali sve wallete koji nam trebaju
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    [network]
  )

  return (
    //Kontektovali se na mrezu
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {/* JEbala ih dokumentacija da ih jebala wallet modal je samo UI  */}
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
