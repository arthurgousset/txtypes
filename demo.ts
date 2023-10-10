import {
    createPublicClient,
    createWalletClient,
    http,
    parseEther,
    parseGwei,
    parseTransaction,
    serializeTransaction,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores } from "viem/chains";
import "dotenv/config"; // use to read private key from environment variable

/**
 * Boilerplate to create a client
 */
const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http(),
});
const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
const client = createWalletClient({
    chain: celoAlfajores, // Celo testnet
    transport: http(),
});

/**
 * Dynamic fee transaction type (EIP-1559)
 */
async function demoDynamicFeeTransactionType() {
    console.log(`Starting dynamic fee (EIP-1559) transaction type demo`);
    const transactionHash = await client.sendTransaction({
        account, // Sender
        to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Recipient (illustrative address)
        value: parseEther("0.01"), // 0.01 CELO
        maxFeePerGas: parseGwei("10"), // Special field for dynamic fee transaction type (EIP-1559)
        maxPriorityFeePerGas: parseGwei("10"), // Special field for dynamic fee transaction type (EIP-1559)
    });
    console.log(`Dynamic fee (EIP-1559) transaction`, transactionHash);

    const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: await transactionHash,
    });
    console.log(
        `Dynamic fee (EIP-1559) transaction receipt`,
        transactionReceipt
    );
}

/**
 * Legacy transaction type
 */
async function demoLegacyTransactionType() {
    console.log(`Starting legacy transaction type demo`);
    const transactionHash = await client.sendTransaction({
        account, // Sender
        to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Recipient (illustrative address)
        value: parseEther("0.01"), // 0.01 CELO
        gasPrice: parseGwei("20"), // Special field for legacy transaction type
    });
    console.log(`Legacy transaction`, transactionHash);

    const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: await transactionHash,
    });
    console.log(`Legacy transaction receipt`, transactionReceipt);
}

// Run demos
demoDynamicFeeTransactionType();
demoLegacyTransactionType();
