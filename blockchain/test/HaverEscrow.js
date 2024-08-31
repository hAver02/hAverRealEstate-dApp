const { expect } = require("chai");

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 'ether')
}

describe("Haver Escrow",() =>{
    let realState;
    let haverEscrow;
    let buyer, seller,inspector;

    beforeEach(async () => {
        [buyer, seller, inspector] = await ethers.getSigners();
        // console.log('balance buyer', await ethers.provider.getBalance(buyer))

        const RealState = await ethers.getContractFactory("HaverRealState");
        realState = await RealState.deploy();
        await realState.waitForDeployment();
        // console.log("Deployed contract address REAL ESTATE: ", await realState.getAddress());
        
        let transaction = await realState.connect(seller).safeMint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()
        // console.log(await realState.ownerOf(0)); 

        const HaverEscrow = await ethers.getContractFactory("HaverEscrow");
        haverEscrow = await HaverEscrow.deploy(await realState.getAddress(),  inspector.address);
        await haverEscrow.waitForDeployment();
        
        // console.log("Deployed contract address HAVER ESCROW: ", await haverEscrow.getAddress());

        transaction = await realState.connect(seller).approve(await haverEscrow.getAddress(), 0);
        await transaction.wait();
        // console.log(haverEscrow);

        transaction = await haverEscrow.connect(seller).list(0, tokens(5) );
        await transaction.wait()

        })

        describe('Deployment', () => {
            it('Returns NFT address', async () => {
                const result = await haverEscrow.nftAddress()
                expect(result).to.be.equal(await realState.getAddress())
            })
    
            it('Returns inspector', async () => {
                const result = await haverEscrow.inspector()
                expect(result).to.be.equal(inspector.address)
            })
        })

        describe("Listing", async  () => {
            it("Update ownership", async () => {
                expect(await realState.ownerOf(0)).to.be.equal(await haverEscrow.getAddress());
            })
            it("Update isListed", async () => {
                const result = await haverEscrow.isListed(0);
                expect(result).to.be.equal(true);
            })
            it("isInspectedFalse", async () => {
                const result = await haverEscrow.isInspected(0);
                expect(result).to.be.equal(false);
                transaction = await haverEscrow.connect(inspector).inspection(0);
                await transaction.wait()
                const result2 = await haverEscrow.isInspected(0);
                expect(result2).to.be.equal(true);
            })
        })

        describe("Selling", async () => {
            it("Should allow buyer buy a property", async () => {
        
                transaction = await haverEscrow.connect(buyer).finishPurchase(0, {value : tokens(5)});
                await transaction.wait()
                const escrowBalance = await ethers.provider.getBalance(await haverEscrow.getAddress());
                const ownerBalance = await ethers.provider.getBalance(seller.address);
                // console.log(escrowBalance, ownerBalance);
                // Contract balance should be 0 after transfer
                expect(escrowBalance).to.equal(0); 

                // Check if the property is no longer listed
                expect(await haverEscrow.isListed(0)).to.be.false;

                // Check if the property was transferred to the buyer
                expect(await realState.ownerOf(0)).to.equal(buyer.address);

                // Check the balance of the seller (owner) after the transfer
                expect(ownerBalance).to.be.gt(tokens(5));
    })
})
})

        

    