# Transaction types on Celo

> **info**
> This repo is for educational purposes only. The information provided here may be inaccurate. Please 
don’t rely on it exclusively to implement low-level client libraries.

This repo contains a demo and overview of transaction types support on Celo.

## Usage

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

## Summary

| Transaction type  | Recommended  | Support | Viem (TS) | Ethers (TS) | ContractKit (TS) | Web3js (TS) | Web3j (Java) | rust-ethers (Rust) | Brownie (Python) |
|---|---|---|---|---|---|---|---|---|---|
| Celo dynamic fee transaction type v2  | ✅  | active (>date) | 🟠 | ❌ | ? | ❌ | ❌ | ? | ? |
| Celo dynamic fee transaction type  | ❌  | deprecation notice (deadline) | ✅ (>vX.X.X) | ❌ | ✅ | ❌ | ❌ | ? | ? |
| Celo legacy transaction type  | ❌ | active (>date) | ✅ | ❌ | ✅ | ❌ | ❌ | ? | ? |
| Ethereum dynamic fee transaction type  | ✅ | active (>date) | ✅ | ✅ | ✅ | ❌ | ✅ | ? | ? |
| Ethereum legacy transaction type  | ❌  | active (>date) | ✅ | ✅ | ✅ | ❌ | ✅ | ? | ✅ |

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

To a produce a valid transaction:

1.  the transaction parameters are [RLP-encoded](https://eth.wiki/fundamentals/rlp): 

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, chaindId, 0, 0])
    ```

1.  the RLP-encoded (and unsigned) transaction is hashed using keccak256.
1.  the hash is signed with a private key using the ECDSA algorithm, which generates the `v`, `r`, and `s` signature parameters.
1.  the transaction and signature parameters above are RLP-encoded, which produces a valid signed transaction: 

    ```
    RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
    ```

1.  a valid signed transaction can be used on-chain, and its transaction and signature parameters can be parsed by simply RLP-decoding the transaction.

### Backwards-compatibility

Over time, the Ethereum community has sought to add new types of transactions such as dynamic fee transactions (known as "EIP-1559 transactions") or optional access list transactions (EIP-2930) to supported new desired behaviors on the network.

To allow new types of transactions to be supported without affecting the legacy transaction format, the concept of **typed transactions** was proposed in EIP-2718, which introduces a single high-level transaction format (or "envelope") to implement all future transaction types.

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

1.  Legacy transaction type
    -   transaction type: `0x00` (0)
    -   transaction payload:

        ```
        RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
        ```
    
    -   a valid transaction is thus:

        ```
        0x00 || RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
        ```
    
    -   Defined in [EIP-2718: Typed Transaction Envelope](https://eips.ethereum.org/EIPS/eip-2718)
    -   Supported since [CHECK: Ethereum Berlin hardfork on date ?]

1.  Access list transaction type

    -   transaction type: `0x01` (1)
    -   transaction payload:

        ```
        ...
        ```
    
    -   a valid transaction is thus:

        ```
        0x01 || ...
        ```

    -   Defined in [EIP-2930: Optional access lists](https://eips.ethereum.org/EIPS/eip-2930)
    -   Supported since [CHECK: Ethereum London hardfork on date ?]


1.  Dynamic fee transaction type

    -   transaction type: `0x02` (2)
    -   transaction payload:

        ```
        RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
        ```
    
    -   a valid transaction is thus:

        ```
        0x02 || RLP([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])
        ```

    -   Defined in [EIP-1559: Fee market change for ETH 1.0 chain](https://eips.ethereum.org/EIPS/eip-1559)
    -   Supported since [CHECK: Ethereum London hardfork on date ?]

### Transaction types supported on Celo

Celo currently supports the following transaction types:

1.  Celo legacy transaction type
    -   transaction type: `none` (not EIP-2718 compliant)
    -   a valid transaction is thus:

        ```
        RLP([nonce, gasprice, gaslimit, feecurrency, gatewayfeerecipient, gatewayfee, recipient, amount, data, v, r, s])
        ```
    
    -   Defined in Celo blockchain client release ([v1.0.0](https://github.com/celo-org/celo-blockchain/tree/celo-v1.0.0))
    -   Supported since [CHECK: Celo Mainnet launch on date ?]
    -   TLDR: this is the Ethereum legacy transaction type with three additional Celo-specific parameters (`feecurrency`, `gatewayfeerecipient`, and `gatewayfee`)

1.  Ethereum legacy transaction 
    -   transaction type: `none` (not EIP-2718 compliant)
    -   a valid transaction is thus:

        ```
        RLP([nonce, gasprice, gaslimit, recipient, amount, data, v, r, s])
        ```
    
    -   Defined in [CIP35: Support for Ethereum-compatible transactions](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0035.md)
    -   Supported since [CHECK: Celo Espresso hardfork on date ?]
    -   TLDR: this is the Ethereum legacy transaction type without any Celo-specific parameters.

1.  Celo dynamic fee transaction type
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
    -   Supported since [CHECK: Celo Espresso hardfork on date ?]
    -   TLDR: this is the Ethereum dynamic fee transaction type (EIP-1559) with three additional Celo-specific parameters (`feecurrency`, `gatewayfeerecipient`, and `gatewayfee`)

1.  Ethereum dynamic fee transaction type
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
    -   Supported since [CHECK: Espresso hardfork on date ?]
    -   TLDR: this is the Ethereum dynamic fee transaction type (EIP-1559) without any Celo-specific parameters.

1.  Celo dynamic fee transaction type v2
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
    -   Supported since [CHECK: Celo Gingerbread hardfork on date ?]
    -   TLDR: this is the Ethereum dynamic fee transaction type (EIP-1559) with one additional Celo-specific parameters (`feecurrency`) instead of three (`feecurrency`, `gatewayfeerecipient`, and `gatewayfee`)

[CHECK: That means any valid typed or untyped Ethereum transaction is valid on Celo ?]
[CHECK: Does Celo support 0x00 typed Celo-specific transactions?]
[CHECK: Does Celo support access list with Celo-specific parameters]
[CHECK: Does Celo support access list with legacy gasLimit field instead of EIP-1559]
