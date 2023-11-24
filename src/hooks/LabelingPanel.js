import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import styled from 'styled-components';
import ContestContract from '../shared_json/ContestContract.json';
import ProductContract from '../shared_json/ProductContract.json';
import { ethers } from 'ethers';

const WarningMessage = styled.p`
  color: red;
  margin-left: 10px;
  margin-top: 10px;
  font-size: 12px;
`;

function LabelingPanel({ contest }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedClassForVote, setSelectedClassForVote] = useState(-1);
    const [warningMessage, setWarningMessage] = useState('');
    const classTypes = contest.class || []; // ここでクラスタイプを取得するか、API等から取得する
    const [products, setProducts] = useState([]);
    const scrollContainerRef = useRef(null);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);

    const scrollLeft = () => {
        setCurrentProductIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const scrollRight = () => {
        setCurrentProductIndex((prevIndex) => Math.min(prevIndex + 1, products.length - 1));
    };

    useEffect(() => {
        const loadProducts = async () => {
            const newProducts = await Promise.all(classTypes.map(async (classType) => {
                const productData = await fetchProductData(classType);
                return productData;
            }));
            setProducts(newProducts);
        };

        loadProducts();
    }, [classTypes]);

    function base64ToUint8Array(base64) {
        const raw = atob(base64);
        const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));

        for (let i = 0; i < raw.length; i++) {
            uint8Array[i] = raw.charCodeAt(i);
        }
        return uint8Array;
    }

    const fetchProductData = async (classType) => {
        const { ethereum } = window;

        if (!ethereum) {
            console.error("No web3 provider detected");
            return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(ProductContract.address, ProductContract.abi, signer);
        const classTypeBN = ethers.BigNumber.from(classType);
        const tokenURI = await contract.tokenURI(classTypeBN);
        const jsonBase64 = tokenURI.split(",")[1];
        const byteArray = base64ToUint8Array(jsonBase64); // Uint8Array に変換
        const jsonString = new TextDecoder('utf-8').decode(byteArray); // UTF-8 文字列にデコード

        const data = JSON.parse(jsonString);
        return {
            id: classType,
            name: data.name,
            description: data.description,
            image: convertIpfsToHttpUrl(data.image),
            address: data.owner // 仮にアドレス情報が含まれていると仮定
        };
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleVoteForClass = async () => {
        if (!selectedClassForVote) {
            setWarningMessage("Please select a class to vote for.");
            return;
        }

        const { ethereum } = window;

        if (!ethereum) {
            console.error("No web3 provider detected");
            return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(ContestContract.address, ContestContract.abi, signer);

        try {
            const tx = await contract.voteForClass(contest.id, selectedClassForVote);
            await tx.wait();
            console.log('Voted successfully for the class', { tx });
            setWarningMessage("Successfully voted for the class!"); // Success message
        } catch (err) {
            console.error("An error occurred while voting", err);
            setWarningMessage("Error occurred while voting. Please try again.");
        }
        closeModal()
    };

    const convertIpfsToHttpUrl = (ipfsUrl) => {
        if (ipfsUrl.startsWith('ipfs://')) {
            return `https://ipfs.io/ipfs/${ipfsUrl.split('ipfs://')[1]}`;
        }
        return ipfsUrl;
    }

    return (
        <div>
            <button onClick={openModal}>投票</button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <h2>コンテスト詳細</h2>
                {contest.image && <img src={convertIpfsToHttpUrl(contest.image)} alt="contest Image" style={{ width: '150px', height: '150px', marginBottom: '20px' }} />}
                <br />
                <strong>ID:</strong> {contest.id}<br />
                <strong>Name:</strong> {contest.name}<br />
                <strong>Description:</strong> {contest.description}<br />
                <strong>Reward:</strong> {contest.reward}<br />
                <strong>Created Time:</strong> {contest.created_time}<br />
                <strong>End Time:</strong> {contest.end_time}

                <h2>プロダクト選択</h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={scrollLeft}>＜</button>
                    <div ref={scrollContainerRef} style={{ overflowX: 'auto', display: 'flex' }}>
                        {products.map((product, index) => (
                            <div key={index} style={{
                                margin: '10px',
                                backgroundColor: selectedClassForVote === product.id ? 'lightblue' : 'transparent',
                                display: index === currentProductIndex ? 'block' : 'none'
                            }}>
                                {product.image && <img src={convertIpfsToHttpUrl(product.image)} alt="product Image" style={{ width: '150px', height: '150px', marginBottom: '20px' }} />}
                                <div>Name: {product.name}</div>
                                <div>Description: {product.description}</div>
                                <div>Address: {product.address}</div>
                                <button onClick={() => setSelectedClassForVote(product.id)}
                                    style={{ backgroundColor: selectedClassForVote === product.id ? 'green' : 'blue' }}>Select</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={scrollRight}>＞</button>
                </div>
                {warningMessage && <WarningMessage>{warningMessage}</WarningMessage>}
                <button onClick={handleVoteForClass}>投票</button>
            </Modal>
        </div>
    );
}

export default LabelingPanel;
