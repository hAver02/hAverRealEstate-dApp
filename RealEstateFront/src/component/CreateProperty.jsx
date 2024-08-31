import axios from "axios";
import { useContext, useState } from "react";
import { BlockchainContext } from "../context/blockContext";
import { ethers } from "ethers";

const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const pinataApiKey = "5b25812498f31869732b";
const pinataSecret = "c07754473c995fced110a2a7389012ef0d88379cf47432b0b87ecf941c957c01";

export function CreateProperty() {
    const { contractEstate, contractEscrow, isInspector } = useContext(BlockchainContext);
    const [imageFile, setImageFile] = useState(null);
    const [metadata, setMetadata] = useState({
        name: "",
        address: "",
        description: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        squareFeet: ""
    });

    async function uploadFile(file) {
        try {
            const data = new FormData();
            data.append("file", file);
            const res = await axios.post(url, data, {
                maxContentLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecret,
                }
            });
            return res.data.IpfsHash;
        } catch (error) {
            console.log('Error uploading file:', error);
        }
    }

    const handleImageFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleMetadataChange = (e) => {
        setMetadata({ ...metadata, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile || !metadata.name || !metadata.address || !metadata.description || !metadata.price || !metadata.bedrooms || !metadata.bathrooms || !metadata.squareFeet) return;

        const imageHash = await uploadFile(imageFile);
        if (imageHash) {
            const metadataWithImage = {
                name: metadata.name,
                address: metadata.address,
                description: metadata.description,
                image: `https://ipfs.io/ipfs/${imageHash}`,
                attributes: [
                    {
                        trait_type: "Purchase Price",
                        value: metadata.price
                    },
                    {
                        trait_type: "Bed Rooms",
                        value: metadata.bedrooms
                    },
                    {
                        trait_type: "Bathrooms",
                        value: metadata.bathrooms
                    },
                    {
                        trait_type: "Square Feet",
                        value: metadata.squareFeet
                    }
                ]
            };

            const metadataBlob = new Blob([JSON.stringify(metadataWithImage)], { type: 'application/json' });
            const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

            const metadataHash = await uploadFile(metadataFile);
            if (metadataHash) {
                console.log('Metadata uploaded successfully:', metadataHash);

                // Mint NFT
                try {
                    const uri = `https://ipfs.io/ipfs/${metadataHash}`;
                    const tx = await contractEstate.safeMint(uri.toString());
                    await tx.wait();
                    console.log('NFT minted successfully:', tx);

                    const data = await contractEstate.totalSupply();
                    const token = (Number(data) - 1);
                    const txApprove = await contractEstate.approve(await contractEscrow.getAddress(), token);
                    await txApprove.wait();

                    const priceInWei = ethers.parseUnits(metadata.price, "ether"); // Convert price to Wei
                    const txList = await contractEscrow.list(token, priceInWei, { value: ethers.parseUnits("0.01", "ether") });
                    await txList.wait();
                } catch (error) {
                    console.error('Error minting NFT:', error);
                }
            }
        }
    };
    if(isInspector()) return <div>Yo are the inspector, yo cant create a new property!</div>
    return (
        <div className="max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Upload Metadata and Image to Pinata</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Image File:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={metadata.name}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={metadata.address}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description:</label>
                    <input
                        type="text"
                        name="description"
                        value={metadata.description}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price (in ETH):</label>
                    <input
                        type="number"
                        name="price"
                        value={metadata.price}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Bedrooms:</label>
                    <input
                        type="number"
                        name="bedrooms"
                        value={metadata.bedrooms}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Bathrooms:</label>
                    <input
                        type="number"
                        name="bathrooms"
                        value={metadata.bathrooms}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Square Feet:</label>
                    <input
                        type="number"
                        name="squareFeet"
                        value={metadata.squareFeet}
                        onChange={handleMetadataChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Upload
                </button>
            </form>
        </div>
    );
}