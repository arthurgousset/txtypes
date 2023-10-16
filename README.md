# Transaction types on Celo

This repo contains an explainer of the transaction types supported on Celo and a demo to make specific transactions.

> **Warning**
> This repo is for educational purposes only. The information provided here may be inaccurate. 
> Please don’t rely on it exclusively to implement low-level client libraries.

## Summary

| Transaction type  | # | Recommended & Supported | Viem (TS) | Ethers (TS) | ContractKit (TS) | Web3js (TS) | Web3j (Java) | rust-ethers (Rust) | Brownie (Python) |
|---|---|---|---|---|---|---|---|---|---|
| Celo dynamic fee transaction v2 ([CIP-64](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0064.md)) | `123` | 👍 / active | ❌ | ❌ | ? | ❌ | ❌ | ? | ? |
| Ethereum dynamic fee transaction ([CIP-42](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md)) | `2` | 👍 / active | ✅ | ✅ | ✅ (>[v5.0.0](https://github.com/celo-org/celo-monorepo/releases/tag/v5.0)) | ❌ | ✅ | ? | ? |
| Celo dynamic fee transaction ([CIP-42](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md)) | `124` | 👎 / [deprecation warning](https://github.com/celo-org/celo-proposals/blob/8260b49b2ec9a87ded6727fec7d9104586eb0752/CIPs/cip-0062.md#deprecation-warning) ⚠️ | ✅ (>[v1.2.8](https://github.com/wagmi-dev/viem/blob/main/src/CHANGELOG.md#128)) | ❌ | ✅ (>[v5.0.0](https://github.com/celo-org/celo-monorepo/releases/tag/v5.0)) | ❌ | ❌ | ? | ? |
| Celo legacy transaction  | `0` | 👎 / active | ✅ | ❌ | ✅ | ❌ | ❌ | ? | ? |
| Ethereum legacy transaction ([CIP35](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0035.md)) | `0` | 👎 / active | ✅ | ✅ | ✅ | ❌ | ✅ | ? | ✅ |

Learn more about the transaction types below.

## Background

### History

Ethereum originally had one format for transactions (now called "legacy transactions"). 
A legacy transaction contained the following transaction parameters:

-   `nonce`
-   `gasPrice`
-   `gasLimit`
-   `recipient`
-   `amount`
-   `data`
-   `chaindId`

To a produce a valid legacy transaction:

1.  the transaction parameters are [RLP-encoded](https://eth.wiki/fundamentals/rlp): 

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, chaindId, 0, 0])
    ```

1.  the RLP-encoded transaction is hashed (using Keccak256).
1.  the hash is signed with a private key using the ECDSA algorithm, which generates the `v`, `r`, and `s` signature parameters.
1.  the transaction _and_ signature parameters above are RLP-encoded to produce a valid signed transaction:

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
    ```

A valid and signed transaction can then be submitted on-chain, and its raw parameters above can be parsed by simply RLP-decoding the transaction.

### Backwards-compatibility

Over time, the Ethereum community has sought to add new types of transactions such as dynamic fee transactions ([EIP-1559: Fee market change for ETH 1.0 chain](https://eips.ethereum.org/EIPS/eip-1559)) or optional access list transactions ([EIP-2930: Optional access lists](https://eips.ethereum.org/EIPS/eip-2930)) to supported new desired behaviors on the network.

To allow new types of transactions to be supported without affecting the legacy transaction format, the concept of **typed transactions** was proposed in [EIP-2718: Typed Transaction Envelope](https://eips.ethereum.org/EIPS/eip-2718), which introduces a new high-level transaction format to implement all future transaction types.

### Typed transactions

Whereas valid "legacy transactions" are the RLP-encoded and signed list of transaction parameters (seen above), valid "typed transactions" are simply a concatenated:

-   **transaction type**, which is a number between 0 (`0x00`) and 128 (`0x7f`) representing 
    the type of the transaction, and

-   **transaction payload**, which is arbitrary byte data that encodes raw transaction parameters 
    complying with the specified transaction type.

For example, legacy transactions are now called "type 0 transactions" because they are identified by the transaction type number 0 (or `0x00`) and are defined as follows:

-   transaction type: `0x00`

-   transaction payload:

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
    ```

A valid transaction is thus:

```
0x00 || RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
```

where `||` is the byte concatenation operator.

Every subsequently proposed transaction type is defined in an EIP and identified by a unique transaction type between 0 and 128. Such EIPs typically specify how a valid transaction payload is constructed, which means that the transaction payload of a typed transaction can only be interpreted with knowledge of the transaction type.

### Transaction types supported on Ethereum

Ethereum currently supports three EIP-2718 typed transactions ([and the non-typed legacy transaction format?]), namely:

1.  Legacy transaction
    -   transaction type: `0x00` (0)
    -   transaction payload:

        ```
        RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
        ```
    
    -   a valid transaction is thus:

        ```
        0x00 || RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
        ```
    
    -   Defined in [EIP-2718: Typed Transaction Envelope](https://eips.ethereum.org/EIPS/eip-2718).
    -   Supported since Ethereum Berlin hard fork on [Apr, 15 2021](https://ethereum.org/en/history/#berlin).

1.  Access list transaction

    -   transaction type: `0x01` (1)
    -   transaction payload:

        ```
        ...
        ```
    
    -   a valid transaction is thus:

        ```
        0x01 || ...
        ```

    -   Defined in [EIP-2930: Optional access lists](https://eips.ethereum.org/EIPS/eip-2930).
    -   Supported since Ethereum Berlin hard fork on [Apr, 15 2021](https://ethereum.org/en/history/#berlin).


1.  Dynamic fee transaction

    -   transaction type: `0x02` (2)
    -   transaction payload:

        ```
        RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
        ```
    
    -   a valid transaction is thus:

        ```
        0x02 || RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
        ```

    -   Defined in [EIP-1559: Fee market change for ETH 1.0 chain](https://eips.ethereum.org/EIPS/eip-1559).
    -   Supported since Ethereum London hard fork on date [Aug, 5 2021](https://ethereum.org/en/history/#london).

## Transaction types supported on Celo

Celo currently supports the following transaction types:

1.  Celo legacy transaction
    -   transaction type: `none` (not EIP-2718 compliant)
    -   a valid transaction is thus:

        ```
        RLP([nonce, gasprice, gaslimit, feecurrency, gatewayfeerecipient, gatewayfee, recipient, amount, data, v, r, s])
        ```
    
    -   Defined in Celo blockchain client release [v1.0.0](https://github.com/celo-org/celo-blockchain/tree/celo-v1.0.0).
    -   Supported since Celo Mainnet launch on [Apr, 22 2020](https://dune.com/queries/3106924/5185945).
    -   TLDR: this is the Ethereum legacy transaction type with three additional Celo-specific parameters (`feecurrency`, `gatewayfeerecipient`, and `gatewayfee`).

1.  Ethereum legacy transaction 
    -   transaction type: `0x00` (not EIP-2718 compliant)
    -   a valid transaction is thus:

        ```
        RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
        ```
    
    -   Defined in [CIP35: Support for Ethereum-compatible transactions](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0035.md)
    -   Supported since [CHECK: Celo Espresso hardfork on date ?]
    -   TLDR: this is the Ethereum legacy transaction type without any Celo-specific parameters.

1.  Celo dynamic fee transaction
    -   transaction type: `0x7c` (124)
    -   transaction payload:

        ```
        RLP([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, feecurrency, gatewayfeerecipient, gatewayfee, destination, amount, data, access_list, v, r, s])
        ```
    
    -   a valid transaction is thus: [CHECK: <-- Confirm this is correct]

        ```
        0x7c || RLP([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, feecurrency, gatewayfeerecipient, gatewayfee, destination, amount, data, access_list, v, r, s])
        ```
    
    -   Defined in [CIP-42: Modification to EIP-1559](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md)
    -   Supported since 
        [Celo Espresso hard fork](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0041.md)
        on [Mar, 8 2022](https://blog.celo.org/brewing-the-espresso-hardfork-92a696af1a17).
    -   TLDR: this is the Ethereum dynamic fee transaction type (EIP-1559) with three additional Celo-specific parameters (`feecurrency`, `gatewayfeerecipient`, and `gatewayfee`)

1.  Ethereum dynamic fee transaction
    -   transaction type: `0x02` (2)
    -   transaction payload:

        ```
        RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, v, r, s])
        ```
    
    -   a valid transaction is thus:

        ```
        0x02 || RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
        ```
    
    -   Defined in [CIP-42: Modification to EIP-1559](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0042.md)
    -   Supported since 
        [Celo Espresso hard fork](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0041.md)
        on [Mar, 8 2022](https://blog.celo.org/brewing-the-espresso-hardfork-92a696af1a17).
    -   TLDR: this is the Ethereum dynamic fee transaction type (EIP-1559) without any Celo-specific parameters.

1.  Celo dynamic fee transaction v2
    -   transaction type: `0x7b` (123)
    -   transaction payload:

        ```
        RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, feeCurrency, v, r, s])
        ```
    
    -   a valid transaction is thus:

        ```
        0x7b || RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, feeCurrency, v, r, s])
        ```
    
    -   Defined in [CIP-64: New Transaction Type: Celo Dynamic Fee v2](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0064.md)
    -   Supported since 
        [Celo Gingerbread hard fork](https://github.com/celo-org/celo-proposals/blob/8260b49b2ec9a87ded6727fec7d9104586eb0752/CIPs/cip-0062.md) 
        on [Sep, 26 2023](https://forum.celo.org/t/mainnet-alfajores-gingerbread-hard-fork-release-sep-26-17-00-utc/6499)
    -   TLDR: this is the Ethereum dynamic fee transaction type (EIP-1559) with one additional Celo-specific parameters (`feecurrency`) instead of three (`feecurrency`, `gatewayfeerecipient`, and `gatewayfee`)

## Demo usage

### Requirements

- Celo account with 1 CELO and 1 cUSD on Alfajores (you can get free testnet tokens from [faucet.celo.org](https://faucet.celo.org/alfajores))
- Node.js v18.14.2

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
yarn start
# or
npm start
```

## Todos

- [ ] [CHECK: That any valid typed or untyped Ethereum transaction is valid on Celo ?]
- [ ] [CHECK: Does Celo support 0x00 typed Celo-specific transactions?]
- [ ] [CHECK: Does Celo support access list with Celo-specific parameters]
- [ ] [CHECK: Does Celo support access list with legacy gasLimit field instead of EIP-1559]