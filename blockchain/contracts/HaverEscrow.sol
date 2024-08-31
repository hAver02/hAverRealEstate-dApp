// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
interface IERC721 {
    function transferFrom(address _from, address _to, uint tokenId) external;
    function getApproved(uint256 _tokenId) external view returns (address);
}
contract HaverEscrow is Ownable{

    address public nftAddress;
    address public inspector;
    uint256 private publicationCost = 0.01 ether;

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => bool) public isInspected;
    
    struct PropertySales {
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 amount;
        bool isSold;
    }
    
    mapping(uint256 => PropertySales) public infoPropertyByToken;
    PropertySales[] public propertySales;

    constructor(address _nftAddress,address _inspector) Ownable(msg.sender){
        nftAddress = _nftAddress;
        inspector = _inspector;
    }
    event PropertyListed(uint256 tokenId, address seller, uint256 amount);
    event PropertyUnlisted(uint256 tokenId, address seller);
    event PropertyUpdated(uint256 tokenId, address buyer, bool isSold);

    modifier OnlyInspector() {
        require(msg.sender == inspector, "You are not the inspector");
        _;
    }

    function list(uint tokenID, uint _price) public payable {
        require(_price > 0, "ERROR: Price incorrect");
        require(IERC721(nftAddress).getApproved(tokenID) == address(this), "We need permissions to list this ot ");
        require(msg.value == publicationCost, "Did not send the value of the cost of the publication");
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenID);
        PropertySales memory newProperty = PropertySales(tokenID, msg.sender, address(0), _price, false);
        propertySales.push(newProperty);
        infoPropertyByToken[tokenID] = newProperty;
        isListed[tokenID] = true;

        emit PropertyListed(tokenID, msg.sender, _price);
    }

    function findIndex(uint256 tokenId) internal view returns (uint) {
        for (uint i = 0; i < propertySales.length; i++) {
            if (propertySales[i].tokenId == tokenId) {
                return i;
            }
        }
        revert("Token ID not found");
    }
    
    function deleteProperty(uint256 tokenId) internal {
        require(infoPropertyByToken[tokenId].seller == msg.sender, "Yo are not the seller of this Token");
        uint index = findIndex(tokenId);
        require(index < propertySales.length, "Property not found");
        propertySales[index] = propertySales[propertySales.length - 1];
        propertySales.pop();
    }

    function unlist(uint tokenId) public payable {

        require(isListed[tokenId], "This Token is not listed!");
        require(infoPropertyByToken[tokenId].seller == msg.sender, "Yo are not the seller of this Token");
        IERC721(nftAddress).transferFrom(address(this),msg.sender,tokenId );

        isListed[tokenId] = false;
        delete infoPropertyByToken[tokenId];
        deleteProperty(tokenId);

        emit PropertyUnlisted(tokenId, msg.sender);
    }

    function inspection(uint256 tokenID) public OnlyInspector {
        isInspected[tokenID] = true;
    }

    function finishPurchase(uint256 tokenId) public payable {
        require(msg.sender != infoPropertyByToken[tokenId].seller, "You are the seller of this property");
        require(isListed[tokenId], "This Token is not listed!");
        PropertySales storage property = infoPropertyByToken[tokenId];
        require(msg.value >= property.amount, "Insufficient funds sent");
        require(!property.isSold, "Property already sold");
        require(isInspected[tokenId], "This property has not been inspected yet!");

        property.buyer = msg.sender;
        property.isSold = true;

        // Actualizar el elemento en propertySales
        uint256 index = findIndex(tokenId);
        if (index < propertySales.length) {
            PropertySales storage sale = propertySales[index];
            sale.buyer = msg.sender;
            sale.isSold = true;
        }

        // Emitir el evento de actualización
        emit PropertyUpdated(tokenId, msg.sender, true);
        // Transfer funds to the seller
        payable(property.seller).transfer(property.amount);

        // Transfer the NFT to the buyer
        IERC721(nftAddress).transferFrom(address(this), msg.sender, tokenId);

        isListed[tokenId] = false;

        emit PropertyUpdated(tokenId, msg.sender, true);
    }

    function withdrawFunds(address _to) public onlyOwner payable  {
        require(address(this).balance > 0, "There isnt funds");
        require(_to != address(0), " This address doesnt exist");
        payable(_to).transfer(address(this).balance);
    }

    function getPropertiest() public view returns(PropertySales[] memory){
        PropertySales[] memory properties = propertySales;
        return properties;
    }

}