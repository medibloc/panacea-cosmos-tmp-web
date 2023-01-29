import React, { useState } from 'react';

import './App.css';
import { ChainInfo } from "@keplr-wallet/types";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { MsgSendEncodeObject } from "@cosmjs/stargate/build/modules";


declare global {
  interface Window extends KeplrWindow {}
}


const App = () => {
  const [term, setTerm] = useState('');

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    (
      async () => {
        const { keplr } = window;
        if (!keplr) {
          alert("you need to install Keplr");
          throw new Error("you need to install Keplr");
        }

        await keplr.experimentalSuggestChain(chainInfo());
        const offlineSigner = keplr.getOfflineSigner(chainId);
        const address = (await offlineSigner.getAccounts())[0].address;

        const client = await SigningStargateClient.connectWithSigner(chainRpcEndpoint, offlineSigner);

        const msg: MsgSendEncodeObject = {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: {
            fromAddress: address,
            toAddress: address,
            amount: [{
              denom: "umed",
              amount: "1",
            }],
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

        const resp = await client.signAndBroadcast(address, [msg], fee);
        alert(`code:${resp.code}, hash:${resp.transactionHash}`);
      }
    )();
  }

  return (
    <div className="container">
      <form onSubmit={submitForm}>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          type="text"
          placeholder="Enter a term"
          className="input"
        />
        <button type="submit" className="btn">Submit</button>
      </form>
    </div>
  );
};

export const chainId = "hygieia-8";
export const chainRpcEndpoint = "https://testnet-rpc.gopanacea.org:443";

export const chainInfo = (): ChainInfo => ({
  chainId: chainId,
  chainName: chainId,
  rpc: chainRpcEndpoint,
  rest: "https://testnet-api.gopanacea.org",
  bip44: {
    coinType: 371,
  },
  bech32Config: {
    bech32PrefixAccAddr: "panacea",
    bech32PrefixAccPub: "panacea" + "pub",
    bech32PrefixValAddr: "panacea" + "valoper",
    bech32PrefixValPub: "panacea" + "valoperpub",
    bech32PrefixConsAddr: "panacea" + "valcons",
    bech32PrefixConsPub: "panacea" + "valconspub",
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
  coinType: 371,
  features: ["stargate", "ibc-transfer", "ibc-go"],
});

export default App;