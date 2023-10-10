# Demo: Transaction types on Celo

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