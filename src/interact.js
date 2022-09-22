import Web3 from "web3";
import { chainMap } from "./chains";

/*
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_API_URL);
const contract = require("../artifacts/contracts/Aydogan.sol/Aydogan.json");
const contractAddress = "0xd7C07aE2338bCf21868B23c7221AbA3a9Ee09383";
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);*/

export const web3 = new Web3(Web3.givenProvider); 
const nftWeb3 = new Web3(new Web3.providers.HttpProvider('https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'));
const contract = require("./contracts/Aydogan.sol/Aydogan.json");
const contractAddress = "0xd7C07aE2338bCf21868B23c7221AbA3a9Ee09383";
export const nftContract = new nftWeb3.eth.Contract(contract.abi, contractAddress);

export const connectWallet = async () => {
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
      params: [{ chainId: web3.utils.toHex(5) }]
    });
};

// Contract Methods

export const getMaxMintAmount = async () => {
  const result = await nftContract.methods.maxTokenPurchase().call();
  return result;
};

export const getTotalSupply = async () => {
  const result = await nftContract.methods.totalSupply().call();
  return result;
};

export const getNftPrice = async () => {
  const result = await nftContract.methods.tokenPrice().call();
  const resultEther = web3.utils.fromWei(result, "ether");
  return resultEther;
};

export const getSaleState = async () => {
  const result = await nftContract.methods.presaleIsActive().call();
  return result;
};

export const mintNFT = async (mintAmount) => {
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
    value: parseInt(web3.utils.toWei("0.008", "ether") * mintAmount).toString(
      16
    ), // hex
    gasLimit: "0",
    data: nftContract.methods.mintAydogan(mintAmount).encodeABI(), //make call to NFT smart contract
  };
  //sign the transaction via Metamask
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
};
