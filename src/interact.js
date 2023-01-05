import Web3 from "web3";
import { chainMap } from "./chains";


export const web3 = new Web3(window.ethereum); 
//const nftWeb3 = new Web3(new Web3.providers.HttpProvider('https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
const contractAbi = require("./contracts/abi.json");
const contractAddress = "0x2918Be08C2b0DDE764301c4231DA4f4FcceB0dCA";
export const nftContract = new web3.eth.Contract(contractAbi, contractAddress);
let myDesc;

export const connectWallet = async () => {
  console.log(window.ethereum);
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const obj = {
        status: "",
        address: addressArray[0],
      };

      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😞" + err.message,
      };
    }
  } else {
    window.location.href = "https://metamask.app.link/dapp/jocular-trifle-fa4f55.netlify.app/";
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://metamask.io/download.html"
            >
              You must install MetaMask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };

  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        let balance = await web3.eth.getBalance(addressArray[0]);
        let formatedBalance = web3.utils.fromWei(balance, "ether");
        let netWorkchainID = window.ethereum.networkVersion;
        let chainName = chainMap[netWorkchainID].name;
        return {
          address: addressArray[0],
          status: "",
          chainName: chainName,
          balance: formatedBalance,
        };
      } else {
        return {
          address: "",
          status: "😞",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😞" + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://metamask.io/download.html"
            >
              You must install MetaMask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const changeChain = async () => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: web3.utils.toHex(137) }]
    });
};

// Contract Methods

export const getMaxMintAmount = async () => {
  const result = await nftContract.methods.maxSupply().call();
  return result;
};

export const getTotalSupply = async () => {
  const result = await nftContract.methods.totalSupply().call();
  return result;
};

export const getNftPrice = async () => {
  const result = await nftContract.methods.cost().call();
  const resultEther = web3.utils.fromWei(result, "ether");
  return resultEther;
};

export const getSaleState = async () => {
  const result = await nftContract.methods.paused().call();
  return result;
};

export const mintNFT = async (mintAmount) => {
  myDesc = 'Mint started';
  await changeChain();
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: ("🦊 Connect to Metamask using Connect Wallet button."),
    };
  }

  //set up your Ethereum transaction
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: window.ethereum.selectedAddress, // must match user's active address.
    value: parseInt(web3.utils.toWei("10", "ether") * mintAmount), // hex
    gasLimit: "0",
    data: nftContract.methods.freeMint(mintAmount).encodeABI(), //make call to NFT smart contract
  };
  //sign the transaction via Metamask

  try {
  web3.eth.sendTransaction(transactionParameters, function(error, hash){

    return {
      success: true,
      status:
      myDesc +"✅ Check out your transaction on Polygonscan: https://polygonscan.com/tx/" +
        hash,
    };
    
  });
} catch (error) {
  return {
    success: false,
    status: myDesc + "😥 Something went wrong: " + error.message,
  };
}

  /*
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      success: true,
      status:
        "✅ Check out your transaction on Etherscan: https://goerli.etherscan.io/tx/" +
        txHash,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
*/


};
