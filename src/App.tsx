import React, { useState } from "react";

import "./App.css";
import { ChainInfo, Window as KeplrWindow } from "@keplr-wallet/types";
import { MsgUndelegateEncodeObject, SigningStargateClient } from "@cosmjs/stargate";

declare global {
  interface Window extends KeplrWindow {}
}

const App = () => {
  const [myAddress, setMyAddress] = useState('');
  const [validatorAddress, setValidatorAddress] = useState('');
  const [amount, setAmount] = useState('');

  const undelegate = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    (
      async () => {
        const { keplr } = window;
        if (!keplr) {
          alert("You need to install Keplr");
          throw new Error("You need to install Keplr");
        }

        await keplr.experimentalSuggestChain(chainInfo());

        const offlineSigner = keplr.getOfflineSignerOnlyAmino(chainId);
        const accounts = await offlineSigner.getAccounts();
        const address = accounts[0].address;

        const msg: MsgUndelegateEncodeObject = {
          typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
          value: {
            delegatorAddress: address,
            validatorAddress: validatorAddress,
            amount: {
              denom: "umed",
              amount: (Number(amount) * 1000000).toString(),
            },
          },
        };

        const fee = {
          amount: [
            {
              denom: "umed",
              amount: "1000000",
            },
          ],
          gas: "200000",
        };

        const client = await SigningStargateClient.connectWithSigner(chainRpcEndpoint, offlineSigner);
        const resp = await client.signAndBroadcast(address, [msg], fee);
        alert(`code:${resp.code}, hash:${resp.transactionHash}`);
      }
    )();
  }

  const connectWallet = () => {
    (
      async() => {
        const { keplr } = window;
        if (!keplr) {
          alert("you need to install Keplr");
          throw new Error("you need to install Keplr");
        }

        await keplr.experimentalSuggestChain(chainInfo());

        const offlineSigner = keplr.getOfflineSignerOnlyAmino(chainId);
        const accounts = await offlineSigner.getAccounts();
        const address = accounts[0].address;
        setMyAddress(address);
      }
    )();
  };

  return (
    <div className="container">
      <h1>A temporary MediBloc wallet for Cosmos Ledger users</h1>
      <label className="elem">MyAddress: {myAddress}</label>
      <div className="btnDiv">
        <button onClick={connectWallet} className="btn">Connect wallet</button>
      </div>
      <form onSubmit={undelegate} className="form">
        <div className="formElem">
          <label>ValidatorAddress: </label>
          <input
            value={validatorAddress}
            onChange={(e) => setValidatorAddress(e.target.value)}
            type="text"
            placeholder="Enter a validator address to undelegate"
            className="input"
          />
        </div>
        <div className="formElem">
          <label>Amount: </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="text"
            placeholder="Enter an amount to undelegate (in MED)"
            className="input"
          />
        </div>
        <div className="btnDiv">
          <button type="submit" className="btn">Undelegate</button>
        </div>
      </form>
    </div>
  );
};

export const chainId = "panacea-3";
export const chainName = "MediBloc-Cosmos"
export const chainRpcEndpoint = "https://rpc.gopanacea.org:443";
export const chainRestEndpoint = "https://api.gopanacea.org:443";

export const chainInfo = (): ChainInfo => ({
  chainId: chainId,
  chainName: chainName,
  rpc: chainRpcEndpoint,
  rest: chainRestEndpoint,
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "panacea",
    bech32PrefixAccPub: "panaceapub",
    bech32PrefixValAddr: "panaceavaloper",
    bech32PrefixValPub: "panaceavaloperpub",
    bech32PrefixConsAddr: "panaceavalcons",
    bech32PrefixConsPub: "panaceavalconspub",
  },
  currencies: [
    {
      coinDenom: "MED",
      coinMinimalDenom: "umed",
      coinDecimals: 6,
      coinGeckoId: "medibloc",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "MED",
      coinMinimalDenom: "umed",
      coinDecimals: 6,
      coinGeckoId: "medibloc",
      gasPriceStep: {
        low: 5,
        average: 6,
        high: 7,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "MED",
    coinMinimalDenom: "umed",
    coinDecimals: 6,
    coinGeckoId: "medibloc",
  },
  features: ["stargate", "ibc-transfer", "ibc-go"],
});

export default App;