import { ethers } from 'ethers';
import { useContext } from 'react';
import { BlockchainContext } from '../context/blockContext';
// import logo from '../assets/logo.svg';

const Navigation = ({setCreateProperty}) => {
    const {account, setAccount} = useContext(BlockchainContext)
    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
    }

    return (
        <nav className='px-2 flex justify-between bg-blue-400 items-center py-3'>
            <ul className='flex gap-5 text-black font-bold text-lg'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="#">Sell</a></li>
                <li className='cursor-pointer' onClick={() => setCreateProperty(true)}>Crear Propiedad</li>
            </ul>

            <div>
                <h1 className='text-black font-serif text-xl'>hAver Real Estate</h1>
            </div>

            {account ? (
                <button
                    type="button"
                    className="border-2 border-black px-1 py-2 rounded-lg hover:bg-blue-300"
                >
                    {account[0].slice(0,6) + "..." + account[0].slice(30,42)}
                </button>
            ) : (
                <button
                    type="button"
                    className='px-2 bg-blue-300 mr-2 py-1 rounded-xl text-black font-semibold'
                    onClick={connectHandler}
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;