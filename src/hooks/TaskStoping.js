import React, { useState } from "react";
import Modal from "react-modal";
import RewardPool from '../shared_json/RewardPool.json';
import { ethers } from 'ethers';


function TaskStoping({ task }) {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleVoteEnd = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.error("No web3 provider detected");
            return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(RewardPool.address, RewardPool.abi, signer);

        try {
            const tx = await contract.distributeRewards(task.id);
            await tx.wait();
            console.log('End Vote successfully for the class', { tx });
        } catch (err) {
            console.error("An error occurred while Ending vote", err);
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
            <button onClick={openModal} disabled={task.votingEnded}>Stoping</button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <h3>Task Details:</h3>
                {task.image && <img src={convertIpfsToHttpUrl(task.image)} alt="Task Image" style={{ width: '150px', height: '150px', marginBottom: '20px' }} />}
                <p>Name: {task.name}</p>
                <p>Description: {task.description}</p>
                <p>Reward: {task.reward}</p>
                <p>End Time: {task.end_time}</p>

                <h3>Vote Ending is ok ?</h3>
                <button onClick={handleVoteEnd}>Yes</button>
                <button onClick={closeModal}>No</button>
            </Modal>
        </div>
    );
}

export default TaskStoping;
