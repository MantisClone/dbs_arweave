const ethers = require("ethers");
const axios = require("axios");
const { expect } = require("chai");
const { getQuote } = require("./test.helpers.js");

describe("DBS Arweave Upload", function () {
    const provider = ethers.getDefaultProvider("https://rpc-mumbai.maticvigil.com/");
    const wallet = new ethers.Wallet(process.env.TEST_PRIVATE_KEY, provider);
    console.log("Wallet address: " + wallet.address);

    describe("getQuote", function () {
        it("should respond", async function () {
            const response = await getQuote(wallet);
            expect(response).to.exist;
            expect(response.status).to.equal(200);
        });
    });

    describe("Integration tests", function () {
        it("should fail to pull funds from user account without approval", async function() {
            this.timeout(20000);

            const quoteResponse = await getQuote(wallet);
            const quote = quoteResponse.data;

            const nonce = Math.floor(new Date().getTime()) / 1000;
            const message = ethers.utils.sha256(ethers.utils.toUtf8Bytes(quote.quoteId + nonce.toString()));
            const signature = await wallet.signMessage(message);
            const uploadResponse = await axios.post(`http://localhost:8081/upload`, {
                quoteId: quote.quoteId,
                files: ["ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", "ipfs://QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx"],
                nonce: nonce,
                signature: signature,
            });
            expect(uploadResponse).to.exist;
            expect(uploadResponse.status).to.equal(200);

            let status
            for(let i = 0; i < 15; i++) {
                let getStatusResponse = await axios.get(`http://localhost:8081/getStatus?quoteId=${quote.quoteId}`);
                expect(getStatusResponse).to.exist;
                expect(getStatusResponse.status).to.equal(200);
                status = getStatusResponse.data.status;
                console.log(`status = ${status}`);
                if(status === 5) break;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            expect(status).to.be.equal(6);
        });

        it("should pull funds from user account with approval", async function() {
            this.timeout(20000);

            const quoteResponse = await getQuote(wallet);
            const quote = quoteResponse.data;

            const abi = [
                'function approve(address, uint256) external returns (bool)',
            ];
            const paymentTokenContract = new ethers.Contract(quote.approveAddress, abi, wallet);
			const tx = await paymentTokenContract.approve(quote.approveAddress, ethers.constants.MaxInt256);
			const txReceipt = tx.wait();
            console.log(`txReceipt = ${txReceipt}`);

            const nonce = Math.floor(new Date().getTime()) / 1000;
            const message = ethers.utils.sha256(ethers.utils.toUtf8Bytes(quote.quoteId + nonce.toString()));
            const signature = await wallet.signMessage(message);
            const uploadResponse = await axios.post(`http://localhost:8081/upload`, {
                quoteId: quote.quoteId,
                files: ["ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", "ipfs://QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx"],
                nonce: nonce,
                signature: signature,
            });
            expect(uploadResponse).to.exist;
            expect(uploadResponse.status).to.equal(200);

            let status
            for(let i = 0; i < 15; i++) {
                let getStatusResponse = await axios.get(`http://localhost:8081/getStatus?quoteId=${quote.quoteId}`);
                expect(getStatusResponse).to.exist;
                expect(getStatusResponse.status).to.equal(200);
                status = getStatusResponse.data.status;
                console.log(`status = ${status}`);
                if(status === 5) break;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            expect(status).to.be.equal(6);
        });
    });

});
