import { ethers } from "ethers";

export const getProvider = async () => {
    // 現在のプロバイダを取得（MetaMaskなど）
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider;
};

export const connectMetaMask = async (provider) => {
    if (provider) {
        // MetaMaskにアクセス許可を要求
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts.length === 0) {
            throw new Error('MetaMask: No accounts found');
        }

        const address = accounts[0]; // 最初のアドレスを取得
        const chainId = (await provider.getNetwork()).chainId;

        return {
            address,
            chainId
        };
    }
    return null;
};


export const disconnectMetaMask = async () => {
    // ethers.js には明示的な"切断"メソッドはありません。
    // 通常、ユーザーがMetaMask UIを介して切断します。
    // しかし、アプリケーションの状態をリセットするロジックはここに書けます。
};
