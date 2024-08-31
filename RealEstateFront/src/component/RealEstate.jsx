import { ethers } from "ethers";
import { useContext } from "react";
import { toast } from "sonner";
import { BlockchainContext } from "../context/blockContext";

export function RealEstate({setOpenProperty}) {
    const { propiedades, contractEscrow, contractEstate, isInspected, isInspector  } = useContext(BlockchainContext);
    async function handlerClick(tokenID, price) {
        try {
            if (!isInspected[tokenID]) {
                return toast.error("Property inspection is missing");
            }
            const priceInWei = ethers.parseUnits(price.toString(), "ether");
            const data = await contractEscrow.finishPurchase(tokenID, { value: priceInWei });
            console.log('Purchase completed:', data);
            return;
        } catch (error) {
            toast.error("Something was wrong!")
            console.log(error);
        }
    }
    async function  handleInspect (tokenID) {
        try {
            if (!isInspector()) {
                return toast.error("You are not de inspector");
            }
            const rta = await contractEscrow.inspection(tokenID);
            console.log(rta);
            if(rta){
                toast.success("The ispection was sucesfully!")
            }
        } catch (error) {
            console.log(error);
        }
    }
    if (propiedades.length === 0) return <p className="text-center">No properties available.</p>;
    console.log(propiedades);
    return (
        <section className="min-h-screen bg-gray-100 flex flex-col gap-6 p-4">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Homes For You</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
                {propiedades.map(prop => (
                    <div key={prop.tokenID} className="w-full max-w-xs bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
                        <img onClick={() => setOpenProperty(prop.tokenID)} src={prop?.metadata?.image} alt="Property image" className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-800">{prop?.metadata?.name}</h3>
                            <p className="text-gray-600">{prop?.metadata?.description}</p>
                            <p className="text-lg font-medium text-gray-800 mt-2">
                                Price: {prop?.metadata?.attributes[0]?.value} ETH
                            </p>
                        </div>
                        <div className="p-4 flex justify-center">
                            {prop.isSold ? (
                                <span className="bg-red-500 text-white text-lg font-semibold px-4 py-2 rounded">
                                    Sold
                                </span>
                            ) : (
                                (isInspector() && !isInspected[prop.tokenID]) ? 
                                <button
                                    onClick={async () => await handleInspect(prop.tokenID)} 
                                    className="bg-blue-600 text-white text-lg font-semibold px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    Inspected
                                </button> : 

                                
                                <button
                                    onClick={() => handlerClick(prop.tokenID, prop?.metadata?.attributes[0]?.value)}
                                    className="bg-blue-600 text-white text-lg font-semibold px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Buy
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
