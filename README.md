# dbs_arweave
Arweave microservice for DBS

```bash
npm install
export ACCEPTED_PAYMENTS=ethereum,matic
export ARWEAVE_GATEWAY_URI="https://node1.bundlr.network"
export PORT=8081
export PRIVATE_KEY="0000000000000000000000000000000000000000000000000000000000000000"
npm start
```

```bash
curl -d '{ "type":"arweave", "userAddress": "0x0000000000000000000000000000000000000000", "files": [{"length": 100}], "payment": {"chainId": 137, "tokenAddress": "0x0000000000000000000000000000000000000000"} }' -X POST -H 'Content-Type: application/json' http://localhost:8081/getQuote
```