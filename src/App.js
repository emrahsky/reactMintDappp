import nftsGif from './preview.gif';
import './App.css';
import { useState, useEffect } from "react";
import { 
  connectWallet, 
  getCurrentWalletConnected, 
  web3, 
  getMaxMintAmount,
  getTotalSupply,
  getNftPrice,
  mintNFT,
  getSaleState, } from "./interact";
import { chainMap } from "./chains";


const App = () => {

const [status, setStatus]  = useState("");
const [walletAddress, setWalletAddress] = useState("");
const [walletBalance, setWalletBalance] = useState(0);
const [walletChainName, setWalletChainName] = useState(0);
const [count, setCount] = useState(1);
const [maxMintAmount, setMaxMintAmount] = useState(0);
const [totalSupply, setTotalSupply] = useState(0);
const [nftPrice, setNftPrice] = useState("0.01");
const [isSaleActive, setIsSaleActive] = useState(true);
const [myDescription, setMyDescription] = useState(true);

const connectWalletPressed = async () => {
  const walletResponse = await connectWallet();
  setWalletAddress(walletResponse.address);
  setStatus(walletResponse.status);
};

const updateTotalSupply = async () => {
  const mintedCount = await getTotalSupply();
  setTotalSupply(mintedCount);
};

const incrementCount = () => {
  if (count < maxMintAmount) {
    setCount(count + 1);
  }
};

const decrementCount = () => {
  if (count > 1) {
    setCount(count - 1);
  }
};

const mintNFTPressed = async () => {
    const { status } = await mintNFT(count);
    setStatus(status);
  
    // We minted a new token, so we need to update the total supply
    updateTotalSupply();
};


useEffect(() => {
  const prepare = async () => {
    const walletResponse = await getCurrentWalletConnected();
    setWalletAddress(walletResponse.address);
    setStatus(walletResponse.status);
    setWalletChainName(walletResponse.chainName);
    setWalletBalance(walletResponse.balance);

    setMaxMintAmount(await getMaxMintAmount());
    setNftPrice(await getNftPrice());
    setIsSaleActive(await getSaleState());
    await updateTotalSupply();

    addWalletListener();
  };

  prepare();
}, []);

const addWalletListener = () => {
  if (typeof window.ethereum !== 'undefined') {
    setMyDescription('MetaMask is installed!');
  }

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length > 0) {
        let balance = await web3.eth.getBalance(accounts[0]);
        let formatedBalance = web3.utils.fromWei(balance, "ether");
        let netWorkchainID = window.ethereum.networkVersion;
        let chainName = chainMap[netWorkchainID].name;
        setWalletChainName(chainName);
        setWalletAddress(accounts[0]);
        setWalletBalance(formatedBalance);
        setStatus("");
        setMyDescription('Accounts changed');
      } else {
        setWalletAddress("");
        setStatus("🦊 Connect to Metamask using Connect Wallet button.");
      }
    });

    window.ethereum.on('chainChanged', async (chainId) => {      // bunun yerine networkChanged daha başarılı fakat kullanımdan kaldırılacak !
      let networkId = window.ethereum.networkVersion;
      let chainName = chainMap[networkId].name;
      let accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      let balance = await web3.eth.getBalance(accounts[0]);
      let formatedBalance = web3.utils.fromWei(balance, "ether");
      setWalletChainName(chainName);
      setWalletAddress(accounts[0]);
      setWalletBalance(formatedBalance);
      setMyDescription('Chain changed');
      window.location.reload();
    });
  }
};

  return (
    <div className="App">
     <main className="App-main">
      <h3>
        <span>MINT</span> NFT
        </h3>
         {/* <img src={nftsGif} className="App-gif" alt=""/>  */}

        {isSaleActive ? (
          <>
          <button type="button" className="connect-button" onClick={connectWalletPressed}>
          {walletAddress.length > 0 ? (
                      "Connected: " + String(walletAddress).substring(0, 6) + "..." + String(walletAddress).substring(38)+
                      "  | Balance : " + walletBalance +
                      "  | Chain : " + walletChainName
                    ) : (
                      <span>Connect Wallet</span>
                    )}
          </button>

          <p className="App-nftDetail">
              <span className="App-mintAmount">{`${totalSupply}`}</span> /
              10K
          </p>

          <div className="quantity">
            <button className="quantity__minus" onClick={decrementCount}><span>-</span></button>
              <h1 className="quantity__count">{count}</h1>
            <button className="quantity__plus" onClick={incrementCount}><span>+</span></button>
          </div>

          <p className="App-mintGas">
                {nftPrice} ETH{" "}
                <span className="text-sm text-gray-300"> + GAS</span>
          </p>

          <button
            className="connect-button bg-mint"
            onClick={mintNFTPressed}
          >
            Mint now!
          </button>
        </>
        ) : (
          <p>
            😥 Sale is not active yet!        
          </p>
        )}
        <div className="App-status">    
      {status && (     
            <small>
              {status}
            </small>
          )}
          </div> 
      </main>
    </div>
  );
}

export default App;
