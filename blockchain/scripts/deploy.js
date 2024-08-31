const { ethers } = require("hardhat");
const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether')
}
const deploy = async () => {

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract whit the account ", deployer.address);

    const RealEstate = await ethers.getContractFactory("HaverRealState");
    const realState = await RealEstate.deploy();
    await realState.waitForDeployment();
    const address = await realState.getAddress();
    console.log("Deployed contract address: ", address);

    const HaverEscrow = await ethers.getContractFactory("HaverEscrow");
    const haverEscrow = await HaverEscrow.deploy(address, "0xBcd4042DE499D14e55001CcbB24a551F3b954096");
    await haverEscrow.waitForDeployment();
    console.log("Deployed contract address escrow: ", await haverEscrow.getAddress());

    // // const trasaction = await realState.
    // // crear nfts y publicarlos!
    // for (let index = 0; index < 3; index++) {
    //     // const element = array[index];
    //     let transaction = await realState.connect(deployer).safeMint();
    //     await transaction.wait();

    //     transaction = await realState.connect(deployer).approve(await haverEscrow.getAddress(),index);
    //     await transaction.wait();

    //     transaction = await haverEscrow.connect(deployer).list(index, tokens(0.001), {value : tokens(0.01)});
    //     await transaction.wait();

        
    // }
    

}

deploy().then(() => process.exit(0)).catch((err) => {
    console.log(err.message)
    process.exit(1);
}
);
