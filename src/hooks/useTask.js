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
            function convertUnixTimestampToJST(unixTimestamp) {
                const date = new Date(unixTimestamp * 1000); // UNIXタイムスタンプをミリ秒に変換
                date.setHours(date.getHours()); // UTCからJSTに変換（9時間加算）

                // 日付をYYYY-MM-DD HH:MM:SS形式にフォーマット
                const year = date.getFullYear();
                const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるので1を加算
                const day = ('0' + date.getDate()).slice(-2);
                const hours = ('0' + date.getHours()).slice(-2);
                const minutes = ('0' + date.getMinutes()).slice(-2);
                const seconds = ('0' + date.getSeconds()).slice(-2);

                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }
            function base64ToUint8Array(base64) {
                const raw = atob(base64);
                const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));

                for (let i = 0; i < raw.length; i++) {
                    uint8Array[i] = raw.charCodeAt(i);
                }
                return uint8Array;
            }

            try {
                const contract = new ethers.Contract(ContestContract.address, ContestContract.abi, signer);
                let tokenIds = [];

                switch (mode_arg) {
                    case mode.ALL:
                        tokenIds = await contract.getVotingActiveNFTs();
                        break;

                    case mode.REWARD:
                        tokenIds = await contract.getVotedAndEndedNFTs();
                        break;

                    case mode.TASK:
                        tokenIds = await contract.getTokensByOwner();
                        break;

                    case mode.NFT:
                        tokenIds = await contract.getCreatedAndEndedNFTs();
                        break;
                    default:
                        tokenIds = await contract.getCreatedAndEndedNFTs();
                        break;
                }

                const fetchedNFTs = [];
                for (let tokenId of tokenIds) {
                    const tokenURI = await contract.tokenURI(tokenId);
                    // tokenURIからBase64エンコードされたJSONを取得してデコード
                    const jsonBase64 = tokenURI.split(",")[1];
                    const byteArray = base64ToUint8Array(jsonBase64); // Uint8Array に変換
                    const jsonString = new TextDecoder('utf-8').decode(byteArray); // UTF-8 文字列にデコード

                    const tokenData = JSON.parse(jsonString);
                    const classArray = tokenData.class.split(",").filter(element => element !== '');

                    fetchedNFTs.push({
                        id: tokenId.toNumber(),
                        name: tokenData.name,
                        description: tokenData.description,
                        image: tokenData.image, // 画像のURIも追加
                        reward: tokenData.reward / 1000000,
                        owner: tokenData.owner,
                        created_time: convertUnixTimestampToJST(tokenData.created_time),
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
