import React from "react";
import RewardPool from '../shared_json/RewardPool.json';
import { ethers } from 'ethers';

function ClaimReward({ task }) {

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
            const tx = await contract.claimReward(task.id);
            await tx.wait();
            console.log('Claim successfully for the class', { tx });
        } catch (err) {
            console.error("An error occurred while claming", err);
        }
    };


    return (
        <div>
            <button onClick={handleClaimReward}>Claim</button>
        </div>
    );
}

export default ClaimReward;
