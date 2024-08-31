import { ethers } from "ethers";



function mapProperties(propiedades){
    // console.log(propiedades);
    if(!propiedades || propiedades.length == 0) return;
    const mappedProp = propiedades?.map(prop => ({
        tokenID : Number(prop[0]),
        seller : prop[1],
        buyer : prop[2],
        amount : ethers.parseEther(prop[3].toString()),
        isSold : prop[4]
        
    }))
    return mappedProp;
}
export default mapProperties;
