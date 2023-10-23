import {
    createPublicClient,
    createWalletClient,
    hexToBigInt,
    http,
    parseEther,
    parseGwei,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores } from "viem/chains";
import "dotenv/config"; // use to read private key from environment variable

// Constants
const EXPLORER_URL = 'https://alfajores.celoscan.io/tx/';
const PRIVATE_KEY = process.env.PRIVATE_KEY

/**
 * Boilerplate to create a client
 */
const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});
const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
const client = createWalletClient({
    chain: celoAlfajores, // Celo testnet
    transport: http(),
});

/**
 * Transation type: 0 (0x00)
 * Name: "Legacy"
 * Description: Ethereum legacy transaction
 */
async function demoLegacyTransactionType() {
    console.log(`Initiating legacy transaction...`);
    const transactionHash = await client.sendTransaction({
        account, // Sender
        to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Recipient (illustrative address)
        value: parseEther("0.01"), // 0.01 CELO
        gasPrice: parseGwei("20"), // Special field for legacy transaction type
    });
    console.log(`Legacy transaction:`, transactionHash, "\n");

    const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: await transactionHash,
    });
    console.log(`Legacy transaction receipt`, transactionReceipt, "\n");
    console.log(
        `See in explorer:`,
        `${EXPLORER_URL}${transactionReceipt.transactionHash}`,
        "\n"
    );
}

/**
 * Transaction type: 2 (0x02)
 * Name: "Dynamic fee"
 * Description: Ethereum EIP-1559 transaction
 */
async function demoDynamicFeeTransactionType() {
    console.log(`Initiating dynamic fee (EIP-1559) transaction...`);
    const transactionHash = await client.sendTransaction({
        account, // Sender
        to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Recipient (illustrative address)
        value: parseEther("0.01"), // 0.01 CELO
        maxFeePerGas: parseGwei("10"), // Special field for dynamic fee transaction type (EIP-1559)
        maxPriorityFeePerGas: parseGwei("10"), // Special field for dynamic fee transaction type (EIP-1559)
    });
    console.log(`Dynamic fee (EIP-1559) transaction:`, transactionHash, "\n");

    const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: await transactionHash,
    });
    console.log(
        `Dynamic fee (EIP-1559) transaction receipt`,
        transactionReceipt,
        "\n"
    );
    console.log(
        `See in explorer:`,
        `${EXPLORER_URL}${transactionReceipt.transactionHash}`,
        "\n"
    );
}

/**
 * Transaction type: 124 (0x7c)
 * Name: "Custom fee currency"
 * Description: Celo fee currency transaction
 */
async function demoFeeCurrencyTransactionType() {
    console.log(`Initiating custom fee currency transaction...`);
    const transactionHash = await client.sendTransaction({
        account, // Sender
        to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Recipient (illustrative address)
        value: parseEther("0.01"), // 0.01 CELO
        feeCurrency: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1", // cUSD fee currency
        maxFeePerGas: parseGwei("10"), // Special field for dynamic fee transaction type (EIP-1559)
        maxPriorityFeePerGas: parseGwei("10"), // Special field for dynamic fee transaction type (EIP-1559)
    });
    console.log(`Custom fee currency transaction:`, transactionHash, "\n");

    const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: await transactionHash,
    });
    console.log(
        `Custom fee currency transaction receipt`,
        transactionReceipt,
        "\n"
    );
    console.log(
        `See in explorer:`,
        `${EXPLORER_URL}${transactionReceipt.transactionHash}`,
        "\n"
    );
}

// Wrap both demos in an async function to await their completion
async function runDemosSequentially() {
    // Run each demo and await its completion
    // await demoLegacyTransactionType();
    // await demoDynamicFeeTransactionType();
    await demoFeeCurrencyTransactionType();
}

// Run the demos sequentially
runDemosSequentially().catch((err) => {
    // Handle any errors that might occur in the demos
    console.error("An error occurred:", err);
});
