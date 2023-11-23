// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ContestContract.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RewardPool {
    address private owner;
    IERC20 public usdcToken;
    mapping(uint256 => uint256) public pendingRewards;
    mapping(uint256 => mapping(address => uint256)) public ditributeRewards;
    ContestContract public contestContract;
    address public admin;
    uint256 public feePercentage = 10; // 例: 10%

    constructor(
        address _contestContractAddress,
        address _adminAddress,
        address _usdcAddress
    ) {
        owner = msg.sender;
        contestContract = ContestContract(_contestContractAddress);
        admin = _adminAddress;
        usdcToken = IERC20(_usdcAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function stakeReward(
        string memory name,
        string memory imageURI,
        string memory description,
        uint256 reward,
        uint256 end_time
    ) external {
        uint256 tokenId = contestContract.mintIpfsNFT(
            msg.sender,
            name,
            imageURI,
            description,
            reward,
            end_time
        );

        require(
            contestContract.ownerOf(tokenId) == msg.sender,
            "Not the owner"
        );

        uint256 fee = (reward * feePercentage) / 100;
        uint256 stakingAmount = reward - fee;

        pendingRewards[tokenId] += stakingAmount;

        // Transfer USDC for the fee to the admin
        require(
            usdcToken.transferFrom(msg.sender, admin, fee),
            "USDC transfer failed"
        );
        // Transfer stakingAmount to this contract
        require(
            usdcToken.transferFrom(msg.sender, address(this), stakingAmount),
            "USDC transfer failed"
        );
    }

    function distributeRewards(uint256 tokenId) external {
        contestContract.endVoting(tokenId, msg.sender);
        require(contestContract.getVotingEnded(tokenId), "Voting not ended");

        address[] memory voters = contestContract.getVotersForToken(tokenId);
        uint256 matchingVotersCount = 0;

        for (uint256 i = 0; i < voters.length; i++) {
            if (contestContract.getUserVote(tokenId, voters[i])) {
                matchingVotersCount++;
            }
        }
        require(matchingVotersCount > 0, "No matching voters");

        uint256 rewardPerUser = pendingRewards[tokenId] / matchingVotersCount;

        for (uint256 i = 0; i < voters.length; i++) {
            if (contestContract.getUserVote(tokenId, voters[i])) {
                ditributeRewards[tokenId][voters[i]] += rewardPerUser;
            }
        }

        // 使わなかった報酬を考慮して、残りの報酬を修正する
        pendingRewards[tokenId] %= matchingVotersCount;
    }

    function claimReward(uint256 tokenId) external {
        uint256 rewardAmount = ditributeRewards[tokenId][msg.sender];
        require(rewardAmount > 0, "No reward available");

        // Prevent double claiming by resetting the reward for this tokenId for this user.
        ditributeRewards[tokenId][msg.sender] = 0;

        // Instead of using Ether's transfer, use USDC's transfer method to send the reward.
        require(
            usdcToken.transfer(msg.sender, rewardAmount),
            "USDC transfer failed"
        );
    }
}
