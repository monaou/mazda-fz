import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import RewardPool from '../shared_json/RewardPool.json';
import ProductContract from '../shared_json/ProductContract.json';
import ContestContract from '../shared_json/ContestContract.json';
import { ethers } from 'ethers';

ChartJS.register(ArcElement, Tooltip, Legend);

function ClaimReward({ contest }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const classTypes = contest.class || []; // ここでクラスタイプを取得するか、API等から取得する
    const [products, setProducts] = useState([]);

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
        const jsonString = atob(jsonBase64);
        const data = JSON.parse(jsonString);

        const contestContract = new ethers.Contract(ContestContract.address, ContestContract.abi, signer);
        const userClass = await contestContract.getUserClass(contest.id, classTypeBN);

        return {
            id: classType,
            name: data.name,
            description: data.description,
            image: convertIpfsToHttpUrl(data.image),
            address: data.owner, // 仮にアドレス情報が含まれていると仮定
            userClass: userClass
        };
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const convertIpfsToHttpUrl = (ipfsUrl) => {
        if (ipfsUrl.startsWith('ipfs://')) {
            return `https://ipfs.io/ipfs/${ipfsUrl.split('ipfs://')[1]}`;
        }
        return ipfsUrl;
    }

    const calculateVotingResults = (products) => {
        const totalVotes = products.reduce((acc, product) => acc + product.userClass, 0);
        return products.map(product => ({
            name: product.name,
            percentage: (product.userClass / totalVotes) * 100
        }));
    };

    const votingResults = calculateVotingResults(products);

    const data = {
        labels: votingResults.map(result => result.name),
        datasets: [{
            data: votingResults.map(result => result.percentage),
            backgroundColor: [
                // ここに背景色を指定
            ],
            borderColor: [
                // ここに境界線の色を指定
            ],
            borderWidth: 1
        }]
    };


    const handleClaimReward = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.error("No web3 provider detected");
            return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(RewardPool.address, RewardPool.abi, signer);

        try {
            const tx = await contract.claimReward(contest.id);
            await tx.wait();
            console.log('Claim successfully for the class', { tx });
        } catch (err) {
            console.error("An error occurred while claming", err);
        }
    };


    return (
        <div>
            <button onClick={openModal}>Claim</button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <h2>Contest Details:</h2>
                {contest.image && <img src={convertIpfsToHttpUrl(contest.image)} alt="contest Image" style={{ width: '150px', height: '150px', marginBottom: '20px' }} />}
                <br />
                <strong>ID:</strong> {contest.id}<br />
                <strong>Name:</strong> {contest.name}<br />
                <strong>Description:</strong> {contest.description}<br />
                <strong>Reward:</strong> {contest.reward}<br />
                <strong>Created Time:</strong> {contest.created_time}<br />
                <strong>End Time:</strong> {contest.end_time}

                <h2>Voting Results:</h2>
                <div style={{ width: '300px', height: '300px' }}>
                    <Pie data={data} />
                </div>

                {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ overflowX: 'auto', display: 'flex' }}>
                        {products.map((product, index) => (
                            <div key={index} style={{
                                margin: '10px'
                            }}>
                                {product.image && <img src={convertIpfsToHttpUrl(product.image)} alt="product Image" style={{ width: '150px', height: '150px', marginBottom: '20px' }} />}
                                <div>Name: {product.name}</div>
                                <div>Description: {product.description}</div>
                                <div>Address: {product.address}</div>
                            </div>
                        ))}
                    </div>
                </div> */}
                <button onClick={handleClaimReward}>Claim Reward</button>
            </Modal>

        </div>
    );
}

export default ClaimReward;
