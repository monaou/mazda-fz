// useNFTs.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ContestContract from '../shared_json/ContestContract.json';
import { mode } from "./../constants/modeConstants";

export const useTasks = (address, mode_arg) => {
    const [nfts, setNFTs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const { ethereum } = window;

        if (!ethereum) {
            console.error("No web3 provider detected");
        }

        // Create a new instance of the web3 provider
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (!address) {
            setNFTs([]);
            setLoading(false);
            return;
        }

        const fetchNFTs = async () => {
            try {
                const contract = new ethers.Contract(ContestContract.address, ContestContract.abi, signer);
                let tokenIds = [];

                switch (mode_arg) {
                    case mode.ALL:
                        tokenIds = await contract.getVotingActiveNFTs();
                        break;

                    case mode.REWARD:
                        tokenIds = await contract.getVotedAndEndedNFTs(signer.getAddress());
                        break;

                    case mode.TASK:
                        tokenIds = await contract.getTokensByOwner();
                        break;

                    case mode.NFT:
                        tokenIds = await contract.getCreatedAndEndedNFTs();
                        break;
                }

                const fetchedNFTs = [];
                for (let tokenId of tokenIds) {
                    const tokenURI = await contract.tokenURI(tokenId);
                    // tokenURIからBase64エンコードされたJSONを取得してデコード
                    const jsonBase64 = tokenURI.split(",")[1];
                    const jsonString = atob(jsonBase64);
                    const tokenData = JSON.parse(jsonString);

                    const classArray = tokenData.class.split(","); // classStringを配列に変換

                    fetchedNFTs.push({
                        id: tokenId.toNumber(),
                        name: tokenData.name,
                        description: tokenData.description,
                        image: tokenData.image, // 画像のURIも追加
                        reward: tokenData.reward,
                        owner: tokenData.owner,
                        created_time: tokenData.created_time,
                        end_time: tokenData.end_time,
                        class: classArray, // 変換されたclassの配列
                        ownerAddress: tokenData.owner, // ownerAddressの情報を追加
                        label: tokenData.label, // labelの情報を追加
                        votingEnded: tokenData.votingEnded === "true" // votingEndedの情報を追加。boolean型に変換
                    });
                }

                if (isMounted) {
                    setNFTs(fetchedNFTs);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching NFTs:", error);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchNFTs();

        return () => {
            isMounted = false;
        };
    }, [address, mode_arg]);

    return [nfts, loading];
};
