import {
    Blockfrost,
    Lucid,
   } from "https://deno.land/x/lucid@0.8.3/mod.ts";

   const lucid = await Lucid.new(
    new Blockfrost(
    "https://cardano-preview.blockfrost.io/api/v0",
    "blockfrost_api_token",
    ),
    "Preview",
   );

lucid.selectWalletFromPrivateKey(await Deno.readTextFile("./wallet1.sk"));

const tx = await lucid.newTx()
  .payToAddress("addr_test1vpuwr65kh9xkhatg2f6ejyymls438r058asa350ulmuzmhg4p86wj", { lovelace: 10000000n })
  .complete();

const signedTx = await tx.sign().complete();

const txHash = await signedTx.submit();
// console.log(details);
console.log(txHash);