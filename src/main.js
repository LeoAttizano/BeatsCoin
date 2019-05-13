const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('6ea1bc83b18cadda5454404fccedf62efe4e1146340ec285a5c7a93778f548ad');
const myWalletAddress = myKey.getPublic('hex');


const beatsCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress,'WalletAdress', 10);
tx1.signTransaction(myKey);
beatsCoin.addTransaction(tx1);

console.log('\n Starting the miner...');
beatsCoin.minePendingTransactions(myWalletAddress);
console.log('\nBalance of xavier is', beatsCoin.getBalanceOfAddress(myWalletAddress));

console.log('Is chain Valid? ', beatsCoin.isChainValid());