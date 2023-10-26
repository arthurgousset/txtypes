# Transaction types on Celo

This repo contains an explainer on transaction types supported on Celo and a demo to make specific 
transactions.

> **Warning**
> This repo is for educational purposes only. The information provided here may be inaccurate. 
> Please don’t rely on it exclusively to implement low-level client libraries.

## Summary

Celo has support for all Ethereum transaction types (i.e. "100% Ethereum compatibility") 
and a single Celo transaction type. 

### Actively supported on Celo

| Chain | Transaction type  | # | Specification | Recommended | Support | Comment |
|---|---|---|---|---|---|---|
| <img width="20" src="assets/images/Celo.png"> | Dynamic fee transaction v2 | `123` | [CIP-64](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0064.md) | ✅ | Active 🟢 | Supports paying gas in custom fee currencies |
| <img width="20" src="assets/images/Ethereum.png"> | Dynamic fee transaction | `2` | [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) ([CIP-42](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md)) | ✅ | Active 🟢 | Typical Ethereum transaction |
| <img width="20" src="assets/images/Ethereum.png"> | Access list transaction | `1` | [EIP-2930](https://eips.ethereum.org/EIPS/eip-2930) ([CIP-35](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0035.md)) | ❌ | Active 🟢 | Does not support dynamically changing _base fee_ per gas  | 
| <img width="20" src="assets/images/Ethereum.png"> | Legacy transaction | `0` | [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf) ([CIP-35](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0035.md)) | ❌ | Active 🟢 | Does not support dynamically changing _base fee_ per gas |

### At risk of deprecation on Celo

| Chain | Transaction type  | # | Specification | Recommended | Support | Comment |
|---|---|---|---|---|---|---|
| <img width="20" src="assets/images/Celo.png"> | Dynamic fee transaction | `124` | [CIP-42](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md) | ❌ | Security 🟠 | Deprecation warning published in [Gingerbread hard fork](https://github.com/celo-org/celo-proposals/blob/8260b49b2ec9a87ded6727fec7d9104586eb0752/CIPs/cip-0062.md#deprecation-warning) |
| <img width="20" src="assets/images/Celo.png"> | Legacy transaction | `0` | Celo Mainnet launch ([Blockchain client v1.0.0](https://github.com/celo-org/celo-blockchain/tree/celo-v1.0.0)) | ❌ | Security 🟠 | Deprecation warning published in [Gingerbread hard fork](https://github.com/celo-org/celo-proposals/blob/8260b49b2ec9a87ded6727fec7d9104586eb0752/CIPs/cip-0062.md#deprecation-warning) |

The stages of support are:

-   **Active support** 🟢: the transaction type is supported and recommended for use.
-   **Security support** 🟠: the transaction type is supported but not recommended for use
    because it might be deprecated in the future.
-   **Deprecated** 🔴: the transaction type is not supported and not recommended for use.

### Client library support

Legend:

-   <img width="12" src="assets/images/Ethereum.png"> = support for the recommended Ethereum transaction type (`2`)
-   <img width="12" src="assets/images/Celo.png"> = support for the recommended Celo transaction type (`123`)

| Client library | Language | <img width="20" src="assets/images/Ethereum.png"> | since | <img width="20" src="assets/images/Celo.png"> | since | Comment |
|---|:---:|:---:|:---:|:---|---|---|
| `viem` | TS/JS | ✅ | | 🟠 | | [In progress](https://github.com/wagmi-dev/viem/pull/1379) | 
| `ethers` | TS/JS | ✅ | |  ❌ | | Support via fork in <br> `celo-ethers-wrapper` | 
| `celo-ethers-wrapper` | TS/JS | ✅ | | ✅ | | --- |
| `web3js` | TS/JS | ✅ | |  ❌ | | Support via fork in  <br> `contractkit` |
| `contractkit` | TS/JS | ✅ |  | ✅ | >[v5.0.0](https://github.com/celo-org/celo-monorepo/releases/tag/v5.0) | --- |
| `Web3j` | Java | ✅ | |  ❌ |  | --- |
| `rust-ethers` | Rust |  ✅ | | ❌ | | --- |
| `brownie` | Python |  ✅ | | ❌ | | --- |

## Background

### Legacy transactions

Ethereum originally had one format for transactions (now called "legacy transactions"). 
A legacy transaction contains the following transaction parameters:
`nonce`, `gasPrice`, `gasLimit`, `recipient`, `amount`, `data`, and `chaindId`.

To produce a valid "legacy transaction":

1.  the **transaction parameters** are [RLP-encoded](https://eth.wiki/fundamentals/rlp): 

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, chaindId, 0, 0])
    ```

1.  the RLP-encoded transaction is hashed (using Keccak256).

1.  the hash is signed with a private key using the ECDSA algorithm, which generates the `v`, `r`, 
    and `s` **signature parameters**.

1.  the transaction _and_ signature parameters above are RLP-encoded to produce a valid **signed 
    transaction**:

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
    ```

A valid signed transaction can then be submitted on-chain, and its raw parameters can be 
parsed by RLP-decoding the transaction.

### Typed transactions

Over time, the Ethereum community has sought to add new types of transactions 
such as dynamic fee transactions 
([EIP-1559: Fee market change for ETH 1.0 chain](https://eips.ethereum.org/EIPS/eip-1559)) 
or optional access list transactions 
([EIP-2930: Optional access lists](https://eips.ethereum.org/EIPS/eip-2930)) 
to supported new desired behaviors on the network.

To allow new transactions to be supported without breaking support with the 
legacy transaction format, the concept of **typed transactions** was proposed in 
[EIP-2718: Typed Transaction Envelope](https://eips.ethereum.org/EIPS/eip-2718), which introduces 
a new high-level transaction format that is used to implement all future transaction types.

### Distinguishing between legacy and typed transactions

Whereas a valid "legacy transaction" is simply an RLP-encoded list of 
**transaction parameters**, a valid "typed transactions" is an arbitrary byte array 
prepended with a **transaction type**, where:

-   a **transaction type**, is a number between 0 (`0x00`) and 127 (`0x7f`) representing 
    the type of the transaction, and

-   a **transaction payload**, is arbitrary byte data that encodes raw transaction parameters 
    is compliance with the specified transaction type.

To distinguish between legacy transactions and typed transactions at the client level, 
the EIP designers observed that the **first byte** of a legacy transaction would never be in the range 
`[0, 0x7f]` (or `[0, 127]`), and instead always be in the range `[0xc0, 0xfe]` (or `[192, 254]`). 

With that observation, transactions can be decoded with the following heuristic:

-   read the first byte of a transaction
-   if it's bigger than `0x7f` (`127`), then it's a **legacy transaction**. To decode it you, 
    must read _all_ bytes (including the first byte just read) and interpret them as a 
    legacy transaction.
-   else, if it's smaller or equal to `0x7f` (`127`), then it's a **typed transaction**. To decode
    it you must read the _remaining_ bytes (excluding the first byte just read) and interpret them
    according to the specified transaction type.

Every transaction type is defined in an EIP, which specifies how to _encode_ as well as _decode_ 
transaction payloads. This means that a typed transaction can only be interpreted with knowledge of 
its transaction type and a relevant decoder.

## List of transaction types on Celo

### <img width="12" src="assets/images/Ethereum.png"> Legacy transaction (`0`)

> **Info**
> This transaction type is 100% compatible with Ethereum and has no Celo-specific parameters.

Although legacy transactions are never formally prepended with the `0x00` transaction type, 
they are commonly referred to as "type 0" transactions.

-   This transaction is defined as follows:

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
    ```

-   It was introduced on Ethereum during Mainnet launch on [date CHECK] as specified in the
    [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf).

-   It was introduced on Celo [during CHECK] on [date CHECK] as specified in 
    [CIP-35: Support for Ethereum-compatible transactions](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0035.md).

### <img width="12" src="assets/images/Ethereum.png"> Access list transaction (`1`)

> **Info**
> This transaction type is 100% compatible with Ethereum and has no Celo-specific parameters.

-   This transaction is defined as follows:

    ```
    0x01 || RLP([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
    ```

-   It was introduced on Ethereum during the Ethereum Berlin hard fork on 
    [Apr, 15 2021](https://ethereum.org/en/history/#berlin) as specified in 
    [EIP-2930: Optional access lists](https://eips.ethereum.org/EIPS/eip-2930).

-   It was introduced on Celo [during CHECK] on [date CHECK] as specified in 
    [CIP-35: Support for Ethereum-compatible transactions](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0035.md).

### <img width="12" src="assets/images/Ethereum.png"> Dynamic fee transaction (`2`)

> **Info**
> This transaction type is 100% compatible with Ethereum and has no Celo-specific parameters.

-   This transaction is defined as follows:

    ```
    0x02 || RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
    ```
    
-   It was introduced on Ethereum during the Ethereum London hard fork on 
    [Aug, 5 2021](https://ethereum.org/en/history/#london) as specified in
    [EIP-1559: Fee market change for ETH 1.0 chain](https://eips.ethereum.org/EIPS/eip-1559).

-   It was introduced on Celo during the
    [Celo Espresso hard fork](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0041.md)
    on [Mar, 8 2022](https://blog.celo.org/brewing-the-espresso-hardfork-92a696af1a17) as specified
    in [CIP-42: Modification to EIP-1559](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md)

### <img width="14" src="assets/images/Celo.png"> Legacy transaction (`0`)

> **Info**
> This transaction is not compatible with Ethereum and has three Celo-specific 
> parameters: `feecurrency`, `gatewayfeerecipient`, and `gatewayfee`.

-   This transaction is defined as follows:

    ```
    RLP([nonce, gasprice, gaslimit, feecurrency, gatewayfeerecipient, gatewayfee, recipient, amount, data, v, r, s])
    ```
    
-   It was introduced on Celo during Mainnet launch on 
    [Apr, 22 2020](https://dune.com/queries/3106924/5185945) as specified in 
    [Blockchain client v1.0.0](https://github.com/celo-org/celo-blockchain/tree/celo-v1.0.0).

### <img width="14" src="assets/images/Celo.png"> Dynamic fee transaction (`124`)

> **Info**
> This transaction is not compatible with Ethereum and has three Celo-specific 
> parameters: `feecurrency`, `gatewayfeerecipient`, and `gatewayfee`.

-   This transaction is defined as follows:

    ```
    0x7c || RLP([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, feecurrency, gatewayfeerecipient, gatewayfee, destination, amount, data, access_list, v, r, s])
    ```
    
-   It was introduced on Celo during the 
    [Celo Espresso hard fork](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0041.md)
    on [Mar, 8 2022](https://blog.celo.org/brewing-the-espresso-hardfork-92a696af1a17) as specified 
    in [CIP-42: Modification to EIP-1559](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md).

### <img width="14" src="assets/images/Celo.png"> Dynamic fee transaction v2 (`123`)

> **Info**
> This transaction is not compatible with Ethereum and has one Celo-specific 
> parameter: `feecurrency`.

-   This transaction is defined as follows:

    ```
    0x7b || RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, feeCurrency, v, r, s])
    ```

-   It was introduced on Celo during the 
    [Celo Gingerbread hard fork](https://github.com/celo-org/celo-proposals/blob/8260b49b2ec9a87ded6727fec7d9104586eb0752/CIPs/cip-0062.md) 
    on [Sep, 26 2023](https://forum.celo.org/t/mainnet-alfajores-gingerbread-hard-fork-release-sep-26-17-00-utc/6499)
    as specified in 
    [CIP-64: New Transaction Type: Celo Dynamic Fee v2](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0064.md)


## Demo usage

### Requirements

-   Celo account with 1 CELO and 1 cUSD on Alfajores (you can get free testnet tokens from 
    [faucet.celo.org](https://faucet.celo.org/alfajores))
-   Node.js v18.14.2

### Install dependencies

```sh
yarn install
# or
npm install
```

### Set up environment variables

Create a `.env` file in the root directory of the project:

```sh
cp .env.example .env
```

Paste the private key of an account that has CELO and cUSD on Alfajores into the `.env` file.

### Run the demo

```sh
yarn demo
# or
npm demo
```

### Expected output

```sh
~/Documents/txtypes main $ yarn run demo
yarn run v1.22.19
$ ts-node demo.ts
Initiating legacy transaction...
Transaction details: {
  type: 'legacy',
  status: 'success',
  transactionHash: '0x6ea4ee86797b7850b97fd418c17a8282dcf9370ac1eb2f6e1897d3697b0026ba',
  from: '0x303c22e6ef01cba9d03259248863836cb91336d5',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  feeCurrency: undefined
} 

Initiating dynamic fee (EIP-1559) transaction...
Transaction details: {
  type: 'eip1559',
  status: 'success',
  transactionHash: '0xa0f66c0c52be0480735b42818c7e08b59c487f5c9729ae969f900055703ad8f2',
  from: '0x303c22e6ef01cba9d03259248863836cb91336d5',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  feeCurrency: undefined
} 

Initiating custom fee currency transaction...
Transaction details: {
  type: '0x7c',
  status: 'success',
  transactionHash: '0x9935c26499205b028a2518cfa5a32b7ebf68533deec414c8ded9f91ae5aa5dd8',
  from: '0x303c22e6ef01cba9d03259248863836cb91336d5',
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  feeCurrency: undefined
} 

✨  Done in 30.86s.
```

