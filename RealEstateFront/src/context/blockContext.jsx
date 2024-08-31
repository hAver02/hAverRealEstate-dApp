import { createContext, useEffect, useState } from "react";
import mapProperties from "../helpers/mappedProperties";
const CID = "QmYVmPA1Dzh27jgPjcGEj2rPEKwzPSuErWVDa8F2QP6L1Z";
import abi1 from "../contracts/HaverRealState.json";
import abi2 from "../contracts/HaverEscrow.json";
import fetchTokenMetadata from "../helpers/fetchMetada";
import { ethers } from "ethers";


export const BlockchainContext = createContext();

export const BlockchainProvider = ({children}) => {

    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState('');
    const [signer, setSigner] = useState('');
    const [contractEstate, setContractEstate] = useState('');
    const [contractEscrow, setContractEscrow] = useState('');
    const [propiedades, setPropiedades] = useState([]);
    const [inspector,setInspector] = useState(null);
    const [isInspected, setIsInspected] = useState({})
    useEffect(() => {
      async function main(){
        const contractAddressRealEstate = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
        const contractAddressEscrow = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
        const abiEstate = abi1.abi;
        const abiEscrow = abi2.abi;
        try {
          const { ethereum } = window;
          if(!ethereum) return
          const account = await ethereum.request({
            method:"eth_requestAccounts"
          })
   
          window.ethereum.on("accountsChanged",()=>{
           window.location.reload()
          })
          const provider = new ethers.BrowserProvider(ethereum); //read the Blockchain    
          const signer = await provider.getSigner(); //write the blockchain
          // console.log(await signer.getAddress()); 
          setAccount(account);
          setProvider(provider);
          setSigner(signer);
  
          const contract1 = new ethers.Contract(
            contractAddressRealEstate,
            abiEstate,
            signer
          )
          const contract2 = new ethers.Contract(
            contractAddressEscrow,
            abiEscrow,
            signer
  
          )
          setContractEstate(contract1)
          setContractEscrow(contract2);
  
  
        } catch (error) {
          console.log(error);
        }
      }
      main()
    }, [])

    useEffect(() => {
      async function getInspector() {
        try {
          const rta = await contractEscrow.inspector();
          setInspector(rta);
        } catch (error) {
          console.log(error);
        }
      }
      async function getProperties(){
        try {
            if(!contractEstate) return;
            const data = await contractEscrow.getPropertiest();
            if(data.length == 0) return;
            const props = mapProperties(data);
            if(props.length == 0 || !props) return;

            for (const element of props) {
              const uri = await contractEstate.tokenURI(element.tokenID)
              const metadata = await fetchTokenMetadata(uri, element.tokenID);

              if (!metadata) continue;
              element.metadata = metadata;
              }
  
            setPropiedades(props);
        } catch (error) {
            console.log(error);
        }
      }
  
    if(!contractEscrow)return 
    getProperties();
    getInspector()
    }, [contractEscrow])

    useEffect(() => {
    async function getInpectedProperties(){
      try {
        if(!propiedades || propiedades.length == 0 ) return;
        const inspectedProperties = {};
        for (const element of propiedades) {
          const rta = await contractEscrow.isInspected(element.tokenID);
          inspectedProperties[element.tokenID] = rta;
        }

        setIsInspected(inspectedProperties);
      } catch (error) {
        console.log(error);
      }
    }
    if(!propiedades || propiedades.length == 0 ) return
    getInpectedProperties()
    }, [propiedades])

  const isInspector = () => {
    for (const element of account){
      // console.log(element, inspector);
      if(element.toString().toUpperCase() == inspector.toString().toUpperCase()) return true;
      return false
    }
  }
    return(
        <BlockchainContext.Provider value={{account, isInspector,setAccount, propiedades, contractEscrow, contractEstate, isInspected}}>
            {children}
        </BlockchainContext.Provider>
    )
}