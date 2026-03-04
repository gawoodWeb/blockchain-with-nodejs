# Educational Blockchain Project in Node.js

## Objective

Build a simple blockchain to deeply understand:

Deterministic transaction formatting  
SHA-256 hashing  
ECDSA digital signatures  
Cryptographic verification  
How a mini peer-to-peer network works  

---

## Why This Project?

The goal is not to copy Bitcoin or Ethereum,  
but to understand how they actually work internally.

This project focuses on the core cryptographic and structural logic behind a blockchain.

---

## Project Architecture

project/

blockchain.js  
block.js  
transaction.js  
wallet.js  
crypto.js  
mempool.js  
server.js  

---

## Transaction Structure

A transaction contains only:

from  
to  
amount  

Important:  
The signature is NOT included in the data that is signed.

---

## Full Transaction Lifecycle

1. Create the transaction  
2. Validate the fields  
3. Serialize deterministically  
4. Generate SHA-256 hash  
5. Sign the hash using the private key  
6. Attach the signature to the transaction  
7. Other nodes verify the signature  

---

## Cryptographic Principle

Signature = Sign(hash(transaction), privateKey)

Verification = Verify(hash(transaction), signature, publicKey)

Fundamental rule:

Never sign the raw object.  
Always sign its hash.  

---

## Important Security Rules

Always enforce field order  
Never sign uncontrolled JSON  
Always validate data types  
Never include the signature inside the hashed data  
Always recompute the hash during verification  

---

## Future Extensions

Add a mining system  
Add TCP peer-to-peer networking  
Node synchronization  
Mining rewards  
Web interface to visualize the blockchain  
REST API to interact with the blockchain  

---

## Final Goal

Understand how a real blockchain works  
Master digital signatures  
Build a small distributed educational network
