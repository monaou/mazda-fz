import React, { useState } from "react";
import Modal from "react-modal";
import styled from 'styled-components';
import ContestContract from '../shared_json/ContestContract.json';
import RewardPool from '../shared_json/RewardPool.json';
import { Web3Storage } from 'web3.storage'
import { ethers } from 'ethers';

const WarningMessage = styled.p`
  color: red;
  margin-left: 10px;
  margin-top: 10px;
  font-size: 12px;
`;

function LabelingPanel({ task }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedClassForVote, setSelectedClassForVote] = useState("");
    const [warningMessage, setWarningMessage] = useState('');
    const classTypes = task.class || []; // ここでクラスタイプを取得するか、API等から取得する

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
            const tx = await contract.voteForClass(task.id, selectedClassForVote);
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
            <button onClick={openModal}>Labeling</button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <h3>Task Details:</h3>
                {task.image && <img src={convertIpfsToHttpUrl(task.image)} alt="Task Image" style={{ width: '150px', height: '150px', marginBottom: '20px' }} />}
                <p>Name: {task.name}</p>
                <p>Description: {task.description}</p>
                <p>Reward: {task.reward}</p>
                <p>End Time: {task.end_time}</p>

                <h3>Vote for a class:</h3>
                <select value={selectedClassForVote} onChange={(e) => setSelectedClassForVote(e.target.value)}>
                    {classTypes.map((classType, index) => (
                        <option key={index} value={classType}>{classType}</option>
                    ))}
                </select>
                {warningMessage && <WarningMessage>{warningMessage}</WarningMessage>}
                <button onClick={handleVoteForClass}>Vote</button>
            </Modal>
        </div>
    );
}

export default LabelingPanel;
