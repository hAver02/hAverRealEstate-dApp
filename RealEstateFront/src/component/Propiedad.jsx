import { useContext, useState } from "react";
import { toast } from "sonner";
import { BlockchainContext } from "../context/blockContext";
import { Log, ethers } from "ethers";

export function PropertyDetail({ openProperty }) {
    const {propiedades, account, isInspected, isInspector} = useContext(BlockchainContext)
    const property = propiedades.find(prop => prop.tokenID == openProperty);
    if (!property) return <p>No property selected.</p>;
    const { metadata, isSold } = property;
    
    const handlePurchase = async () => {
        if(property.seller == account[0]) return;
        try {
            if(isInspected(property.tokenID)) return toast("Inspection is missing!")
        } catch (error) {
            console.error("Purchase error:", error);
            toast.error("Error completing purchase.");
        }
    };
    console.log(isInspector());
    // console.log(account.findIndex(acc => acc.toString() == inspector.toString()));

    return (
        <section className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Property Details</h2>
            <div className="flex flex-col md:flex-row gap-6">
                <img src={metadata?.image} alt={metadata?.name} className="w-full md:w-1/2 h-60 object-cover rounded-lg shadow-md" />
                <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{metadata?.name}</h3>
                    <p className="text-lg text-gray-600 mb-2">Address: {metadata?.address}</p>
                    <p className="text-lg text-gray-800 mb-4">{metadata?.description}</p>
                    
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Purchase Price:</span>
                            <span>{metadata?.attributes[0]?.value} ETH</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Bed Rooms:</span>
                            <span>{metadata?.attributes[1]?.value}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Bathrooms:</span>
                            <span>{metadata?.attributes[2]?.value}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Square Feet:</span>
                            <span>{metadata?.attributes[3]?.value}</span>
                        </div>
                    </div>

                    {isSold ?  (
                        <span className="text-lg font-semibold text-red-600">Sold</span>
                    ) :
                    (
                        (isInspector() && !isInspected[prop.tokenID])? 
                            <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Inspected</button> 
                        : 
                        <button 
                            onClick={handlePurchase} 
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Purchase
                        </button>
                    ) 
                
                
                    }
                </div>
            </div>
        </section>
    );
}