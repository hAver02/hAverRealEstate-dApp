
import './App.css'

import Navigation from './component/Navigation';
import Search from './component/Search';
import { RealEstate } from './component/RealEstate';
// import BlockchainHook from './Hooks/blockchainHook';
import { Toaster } from "sonner"
import { BlockchainContext, BlockchainProvider } from './context/blockContext';
import { useContext, useState } from 'react';
import  { CreateProperty }  from './component/CreateProperty';
import { PropertyDetail } from './component/Propiedad';



function App() {
  const [createProperty, setCreateProperty] = useState(false);
  const [openProperty, setOpenProperty] = useState(null)

  return (
    <BlockchainProvider>
      {createProperty ? 
      <div>
        <CreateProperty />
      </div>

      : 
      <div className='w-full min-h-screen'>
        <Toaster />
        <Navigation  setCreateProperty={setCreateProperty}/>
        {openProperty || openProperty == 0 ? 
          <PropertyDetail openProperty={openProperty}/>
        :
        <div>
          <Search />
          <RealEstate  setOpenProperty={setOpenProperty}/>
        </div>  
      }
    
      </div>
    }  
    </BlockchainProvider>
  )
}

export default App
