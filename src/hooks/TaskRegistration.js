import React, { useState } from "react";
import Modal from "react-modal";
import styled from 'styled-components';
import RewardPool from '../shared_json/RewardPool.json';
import { ERC20_ABI } from '../shared_json/Erc20_mumbai';
import { Web3Storage } from 'web3.storage'
import { ethers } from 'ethers';

const WarningMessage = styled.p`
  color: red;
  margin-left: 10px;
  margin-top: 10px;
  font-size: 12px;
`;
const USDC_ADDRESS = "0x0fa8781a83e46826621b3bc094ea2a0212e71b23"

function TaskRegistration() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [taskName, setTaskName] = useState("");
    const [taskDesp, setTaskDesp] = useState("");
    const [reward, setReward] = useState("");
    const [endTime, setEndTime] = useState("");
    const [warningMessage, setWarningMessage] = useState("");

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImage(file);
        // 画像プレビューのセット
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleTaskRegistration = async () => {
        // Check if MetaMask (or another web3 provider) is injected into window
        const { ethereum } = window;

        if (!ethereum) {
            console.error("No web3 provider detected");
        }

        // Create a new instance of the web3 provider
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        if (!image || !taskName || !taskDesp || !reward) {
            setWarningMessage("All fields must be filled in.");
            return;
        }
        // NFTミントのロジックをここに追加
        if (!process.env.REACT_APP_WEB3_API_KEY) {
            throw new Error("API key is not set in the environment variables");
        }
        const client = new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + process.env.REACT_APP_WEB3_API_KEY + ".XHC6ohuCzd0eid50pwuH8-4UApBGvvfuABvGe6R5W_E" })
        if (image) {
            // 他のロジック
            const rootCid = await client.put([image], {
                name: 'experiment',
                maxRetries: 3
            });
            const res = await client.get(rootCid) // Web3Response
            if (res) {
                const files = await res.files() // Web3File[]
                for (const file of files) {
                    console.log("file.cid:", file.cid)
                    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);  // NOTE: ERC20トークンのABIにはapproveメソッドが含まれている必要があります
                    const rewardInString = (reward * 1000000).toString();
                    const parsedReward = ethers.utils.parseUnits(rewardInString, 6);
                    console.log("ethers.utils.parseUnits(reward * 1000000, 6):", parsedReward)
                    try {
                        const tx = await usdcContract.approve(RewardPool.address, parsedReward);  // USDCは小数点以下6桁なので、6を指定
                        await tx.wait();
                        console.log("Allowance set successfully");
                    } catch (err) {
                        console.error("An error occurred while setting the allowance", err);
                    }
                    const contract_pay = new ethers.Contract(RewardPool.address, RewardPool.abi, signer);
                    try {
                        const tx = await contract_pay.stakeReward(
                            taskName,
                            file.cid.toString(),
                            taskDesp,
                            parseInt(reward * 1000000),
                            parseInt(endTime)
                        );
                        await tx.wait();
                        console.log('Data has been saved successfully', { tx });
                        closeModal();
                    } catch (err) {
                        console.error("An error occurred while saving the data", err);
                    }
                }
            }
            closeModal();
        }
    };

    return (
        <div>
            <button onClick={openModal}>コンテスト作成</button>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
                <h2>コンテスト作成</h2>
                {/* 画像のプレビュー表示 */}
                {previewImage && <img src={previewImage} alt="Preview" style={{ width: '100px', height: '100px' }} />}
                <input type="file" onChange={handleImageUpload} />
                <input
                    type="text"
                    placeholder="name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="description"
                    value={taskDesp}
                    onChange={(e) => setTaskDesp(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="reward"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="end_time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
                {warningMessage && <WarningMessage>{warningMessage}</WarningMessage>}
                <button onClick={handleTaskRegistration}>作成</button>
            </Modal>
        </div>
    );
}

export default TaskRegistration;
