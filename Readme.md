## Cardano tx test

1. Create 2 wallet (A and B) address

2. Send preview test ADA to wallet(A) address - [preview faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)

3. Send 10 ADA from wallet(A) to wallet(B)

4. Send 10 ADA from wallet(A) to wallet(B) with metadata

5. Cardano Transaction per Transcation(TPT)


### commands
```bash

deno run --allow-net --allow-read 1.create-wallet.ts

deno run --allow-net --allow-read 2.send-to.ts

deno run --allow-net --allow-read 3.send-with-metadata.ts

deno run --allow-net --allow-read 4.tpt.ts

```

### Tools:
- Lucid - https://lucid.spacebudz.io
- Blockfrost - https://blockfrost.io
- node - https://nodejs.org/en/download/
- deno - https://deno.land/manual@v1.29.1/getting_started/installation