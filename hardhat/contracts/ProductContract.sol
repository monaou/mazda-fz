// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/Base64.sol";
import "./ContestContract.sol";

contract ProductContract is ERC721Enumerable {
    uint private _tokenIds;
    ContestContract public contestContract;

    struct NftAttributes {
        string name;
        string imageURL;
        string description;
        uint256 created_timestamp;
        address owner_address;
    }

    NftAttributes[] private Web3Nfts;

    constructor(address _contestContractAddress) ERC721("NFT", "nft") {
        contestContract = ContestContract(_contestContractAddress);
    }

    function mintIpfsNFT(
        uint256 contest_id,
        address sender,
        string memory name,
        string memory imageURI,
        string memory description
    ) public returns (uint256) {
        uint256 newItemId = _tokenIds;
        _safeMint(sender, newItemId);
        Web3Nfts.push(
            NftAttributes({
                name: name,
                imageURL: imageURI,
                description: description,
                created_timestamp: block.timestamp,
                owner_address: sender
            })
        );
        contestContract.AddClass(contest_id, name);
        _tokenIds = _tokenIds + 1;
        return newItemId;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        NftAttributes memory thisNFT = Web3Nfts[_tokenId];

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
                        '", "created_time": "',
                        Strings.toString(thisNFT.created_timestamp),
                        '", "owner": "',
                        Strings.toHexString(
                            uint256(uint160(thisNFT.owner_address))
                        ),
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
}
