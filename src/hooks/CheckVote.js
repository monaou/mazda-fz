import React, { useState } from "react";
import Modal from "react-modal";
import ContestContract from '../shared_json/ContestContract.json';
import { ethers } from 'ethers';

function CheckVote({ task }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);

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

    return (
        <div>
            <button onClick={openModal}>analysis</button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <h3>Task Details:</h3>
                {task.image && <img src={convertIpfsToHttpUrl(task.image)} alt="Task Image" style={{ width: '150px', height: '150px', marginBottom: '20px' }} />}
                <p>Name: {task.name}</p>
                <p>Description: {task.description}</p>
                <p>Reward: {task.reward}</p>
                <p>End Time: {task.end_time}</p>
                <p>Label: {task.label}</p>
            </Modal>
        </div>
    );
}

export default CheckVote;
