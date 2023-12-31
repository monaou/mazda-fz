// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/Base64.sol";

contract ContestContract is ERC721Enumerable {
    uint private _tokenIds;

    struct NftAttributes {
        string name;
        string imageURL;
        string description;
        uint256 reward;
        uint256 created_timestamp;
        uint256 end_time;
        uint256[] class;
        address owner_address;
        uint256 label;
        bool votingEnded;
    }
    mapping(uint256 => mapping(uint256 => uint256)) public classVotes;
    mapping(uint256 => mapping(address => bool)) public userVotes;
    mapping(uint256 => address[]) public tokenVoters;

    NftAttributes[] private Web3Nfts;

    constructor() ERC721("NFT", "nft") {}

    function mintIpfsNFT(
        address sender,
        string memory name,
        string memory imageURI,
        string memory description,
        uint256 reward,
        uint256 end_time
    ) public returns (uint256) {
        uint256 newItemId = _tokenIds;
        _safeMint(sender, newItemId);
        uint256[] memory tempClass;
        Web3Nfts.push(
            NftAttributes({
                name: name,
                imageURL: imageURI,
                description: description,
                reward: reward,
                created_timestamp: block.timestamp,
                end_time: end_time,
                class: tempClass,
                owner_address: sender,
                label: 0,
                votingEnded: false
            })
        );
        _tokenIds = _tokenIds + 1;
        return newItemId;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        NftAttributes memory thisNFT = Web3Nfts[_tokenId];

        // Convert the class array to a single string
        string memory classString = "";
        for (uint256 i = 0; i < thisNFT.class.length; i++) {
            classString = string(
                abi.encodePacked(
                    classString,
                    Strings.toString(thisNFT.class[i]),
                    ","
                )
            );
        }

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        thisNFT.name,
                        '", "description": "',
                        thisNFT.description,
                        '", "image": "ipfs://',
                        thisNFT.imageURL,
                        '", "reward": "',
                        Strings.toString(thisNFT.reward),
                        '", "created_time": "',
                        Strings.toString(thisNFT.created_timestamp),
                        '", "end_time": "',
                        Strings.toString(thisNFT.end_time),
                        '", "class": "',
                        classString,
                        '", "owner": "',
                        Strings.toHexString(
                            uint256(uint160(thisNFT.owner_address))
                        ),
                        '", "label": "',
                        Strings.toString(thisNFT.label),
                        '", "votingEnded": "',
                        thisNFT.votingEnded ? "true" : "false",
                        '"}'
                    )
                )
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }

    function AddClass(uint256 contest_id, uint256 class_id) external {
        Web3Nfts[contest_id].class.push(class_id);
    }

    function getTokensByOwner() public view returns (uint256[] memory) {
        uint256 totalNfts = _tokenIds;
        uint256[] memory matchingTokens = new uint256[](totalNfts);

        uint256 counter = 0;
        for (uint256 i = 0; i < totalNfts; i++) {
            if (
                keccak256(abi.encodePacked(Web3Nfts[i].owner_address)) ==
                keccak256(abi.encodePacked(msg.sender))
            ) {
                matchingTokens[counter] = i;
                counter++;
            }
        }

        uint256[] memory resultTokens = new uint256[](counter);
        for (uint256 j = 0; j < counter; j++) {
            resultTokens[j] = matchingTokens[j];
        }

        return resultTokens;
    }

    function voteForClass(uint256 tokenId, uint256 class_id) external {
        require(Web3Nfts[tokenId].votingEnded == false, "Voting has ended");

        bool is_address_check = false;
        for (uint256 i = 0; i < tokenVoters[tokenId].length; i++) {
            if (tokenVoters[tokenId][i] == msg.sender) {
                is_address_check = true;
                break;
            }
        }

        if (!is_address_check) {
            tokenVoters[tokenId].push(msg.sender);
        }

        classVotes[tokenId][class_id]++;
        userVotes[tokenId][msg.sender] = true;
    }

    function endVoting(uint256 tokenId, address sender) external {
        require(ownerOf(tokenId) == sender, "Not the owner");
        require(Web3Nfts[tokenId].votingEnded == false, "Voting already ended");

        // 投票を集計して最も得票数の多いクラスをlabelとする
        uint256 topClass;
        uint256 topVotes = 0;
        for (uint256 i = 0; i < Web3Nfts[tokenId].class.length; i++) {
            uint256 currentClass = Web3Nfts[tokenId].class[i];
            if (classVotes[tokenId][currentClass] > topVotes) {
                topVotes = classVotes[tokenId][currentClass];
                topClass = currentClass;
            }
        }

        Web3Nfts[tokenId].label = topClass;
        Web3Nfts[tokenId].votingEnded = true;
    }

    function getVotingEnded(uint256 tokenId) external view returns (bool) {
        return Web3Nfts[tokenId].votingEnded;
    }

    function getLabelOf(uint256 tokenId) external view returns (uint256) {
        return Web3Nfts[tokenId].label;
    }

    function getUserVote(
        uint256 tokenId,
        address user
    ) external view returns (bool) {
        return userVotes[tokenId][user];
    }

    function getUserClass(
        uint256 tokenId,
        uint256 class_id
    ) external view returns (uint256) {
        return classVotes[tokenId][class_id];
    }

    function getVotersForToken(
        uint256 tokenId
    ) external view returns (address[] memory) {
        return tokenVoters[tokenId];
    }

    function getVotingActiveNFTs() external view returns (uint256[] memory) {
        uint256 totalNfts = _tokenIds;
        uint256[] memory tempNfts = new uint256[](totalNfts);
        uint256 count = 0;

        for (uint256 i = 0; i < totalNfts; i++) {
            if (!Web3Nfts[i].votingEnded) {
                tempNfts[count] = i;
                count++;
            }
        }

        uint256[] memory votingActiveNfts = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            votingActiveNfts[j] = tempNfts[j];
        }

        return votingActiveNfts;
    }

    function getVotedAndEndedNFTs() external view returns (uint256[] memory) {
        uint256 totalNfts = _tokenIds;
        uint256[] memory matchingTokens = new uint256[](totalNfts);
        uint256 counter = 0;
        for (uint256 i = 0; i < totalNfts; i++) {
            if (Web3Nfts[i].votingEnded && userVotes[i][msg.sender]) {
                matchingTokens[counter] = i;
                counter++;
            }
        }
        uint256[] memory resultTokens = new uint256[](counter);
        for (uint256 j = 0; j < counter; j++) {
            resultTokens[j] = matchingTokens[j];
        }
        return resultTokens;
    }

    function getCreatedAndEndedNFTs() external view returns (uint256[] memory) {
        uint256 totalNfts = _tokenIds;
        uint256[] memory matchingTokens = new uint256[](totalNfts);
        uint256 counter = 0;
        for (uint256 i = 0; i < totalNfts; i++) {
            if (
                Web3Nfts[i].owner_address == msg.sender &&
                Web3Nfts[i].votingEnded
            ) {
                matchingTokens[counter] = i;
                counter++;
            }
        }
        uint256[] memory resultTokens = new uint256[](counter);
        for (uint256 j = 0; j < counter; j++) {
            resultTokens[j] = matchingTokens[j];
        }
        return resultTokens;
    }
}
