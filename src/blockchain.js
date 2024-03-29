const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount.toString() + this.timestamp).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex')!== this.fromAddress){
            throw new Error('You cannot sign a transaction for other wallets!')
        }
        
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');

    }

    isValid(){
        if(fromAddress === null) return true;

        if(!this.signature || this.signature === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();

    }

    calculateHash(){
        return SHA256 (this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
        
    }

    mineBlock(dificulty){
        while(this.hash.substring(0,dificulty) !== Array(dificulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();


        }

        console.log("Block mined" + this.hash)
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
        constructor(){
            this.chain = [this.createGenesisBlock()];
            this.dificulty = 4;
            this.pendingTransactions = [];
            this.miningReward = 100;
        }

        createGenesisBlock(){
            return new Block("07/04/2019", [], "0");
        }

        getLatestBlock(){
            return this.chain[this.chain.length -1];

        }

        minePendingTransactions(miningRewardAddress){
            const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
            this.pendingTransactions.push(rewardTx);

            let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
            block.mineBlock(this.dificulty);

            console.log("Block Successfully Mined!")
            this.chain.push(block);

            this.pendingTransactions = [];
        }

        addTransaction(transaction){

            if(!transaction.fromAddress || !transaction.toAddress){
                throw new Error('Transaction must include from and to address')
            }
            if(!transaction.isValid()){
                throw new Error('Cannot add invalid transaction to chain');
            }

            this.pendingTransactions.push(transaction);
        }

        getBalanceOfAddress(address){
            let balance = 0;

            for(const block of this.chain){
                for(const trans of block.transactions){
                    if(trans.fromAddress === address){
                        balance -= trans.amount;
                    }
                    if(trans.toAddress === address){
                        balance += trans.amount;
                    }
                }
            }

            return balance;
        }

        getAllTransactionsForWallet(address){
            const txs = [];

            for(const block of this.chain){
                for(const tx of block.transactions){
                    if(tx.fromAddress === address || tx.toAddress === address){
                        txs.push(tx);
                    }
                }
            }
            return txs;
        }

    isChainValid(){
        const realGenesis = JSON.stringify(this.createGenesisBlock());

        if(realGenesis !== JSON.stringify(this.chain[0])){
            return false;
        }

        for(let i = 1; i < chainLength; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }

        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;