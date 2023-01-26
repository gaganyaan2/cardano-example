import {
    Blockfrost,
    C,
    Data,
    Lucid,
    SpendingValidator,
    TxHash,
    fromHex,
    toHex,
  } from "https://deno.land/x/lucid@0.8.3/mod.ts";
  import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
   
  const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      "blockfrost_api_token",
    ),
    "Preview",
  );
   
  lucid.selectWalletFromPrivateKey(await Deno.readTextFile("./beneficiary.sk"));
  
  const validator = await readValidator("./assets/vesting/spend/script.cbor");

  const metadata = "unlock 30 ADA"
  // --- Supporting functions
   
  async function readValidator(filepath: String): Promise<SpendingValidator> {
    return {
      type: "PlutusV2",
      script: toHex(cbor.encode(fromHex(await Deno.readTextFile(filepath)))),
    };
  }

const utxo = { txHash: "fa4d094cb42d95497d96ec5b56fbde4af9ea771bff10bd28f474561d2210b42d", outputIndex: 0 };
 
// we don't have any redeemer in our contract but it needs to be empty
const redeemer = Data.empty();
 
const txUnlock = await unlock(utxo, { from: validator, redeemer: redeemer });
 
await lucid.awaitTx(txUnlock);
 
console.log(`30 ADA recovered from the contract
    Tx ID: ${txUnlock}
    Redeemer: ${redeemer}
`);
  
async function unlock(ref, { from, redeemer }): Promise<TxHash> {
  const [utxo] = await lucid.utxosByOutRef([ref]);
 
  const currentTime = new Date().getTime();
  const laterTime = new Date(currentTime + 1 * 60 * 10 * 1000); // add two hours (TTL: time to live)
 
  const tx = await lucid
    .newTx()
    .collectFrom([utxo], redeemer)
    .addSigner(await lucid.wallet.address()) // this should be beneficiary address
    .validFrom(currentTime)
    .validTo(laterTime)
    .attachSpendingValidator(from)
    .attachMetadata(674, metadata)
    .complete();
 
  const signedTx = await tx
    .sign()
    .complete();
 
  return signedTx.submit();
}