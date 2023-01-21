import {
    Blockfrost,
    C,
    Constr,
    Data,
    Lucid,
    SpendingValidator,
    TxHash,
    fromHex,
    toHex,
    utf8ToHex,
  } from "https://deno.land/x/lucid@0.8.3/mod.ts";
  import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
   
  const lucid = await Lucid.new(
    new Blockfrost(
      "https://cardano-preview.blockfrost.io/api/v0",
      "blockfrost_api_token",
    ),
    "Preview",
  );
   
  lucid.selectWalletFromPrivateKey(await Deno.readTextFile("./key.sk"));
   
  const validator = await readValidator("./assets/hello_world/spend/script.cbor");

  async function readValidator(filepath: String): Promise<SpendingValidator> {
    return {
      type: "PlutusV2",
      script: toHex(cbor.encode(fromHex(await Deno.readTextFile(filepath)))),
    };
  }


  const publicKeyHash = lucid.utils
  .getAddressDetails(await lucid.wallet.address())
  .paymentCredential
  .hash;
 
const datum = Data.to(new Constr(0, [publicKeyHash]));
 
const txLock = await lock(10000000, { into: validator, owner: datum });
 
await lucid.awaitTx(txLock);
 
console.log(`10 ADA locked into the contract
    Tx ID: ${txLock}
    Datum: ${datum}
`);
 
// --- Supporting functions
 
async function lock(lovelace, { into, owner }): Promise<TxHash>{
  const contractAddress = lucid.utils.validatorToAddress(into);
 
  const tx = await lucid
    .newTx()
    .payToContract(contractAddress, { inline: owner }, { lovelace })
    .complete();
 
  const signedTx = await tx
    .sign()
    .complete();
 
  return signedTx.submit();
}