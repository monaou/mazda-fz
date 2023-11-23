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

function LabelingPanel({ contest }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedClassForVote, setSelectedClassForVote] = useState("");
    const [warningMessage, setWarningMessage] = useState('');
    const classTypes = contest.class || []; // ここでクラスタイプを取得するか、API等から取得する

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
            <button onClick={openModal}>Vote</button>
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

                <h2>Select Product:</h2>
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
