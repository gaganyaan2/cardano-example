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
   
  lucid.selectWalletFromPrivateKey(await Deno.readTextFile("./owner.sk"));
   
  const validator = await readValidator("./assets/vesting/spend/script.cbor");
   
  // --- Supporting functions
   
  async function readValidator(filepath: String): Promise<SpendingValidator> {
    return {
      type: "PlutusV2",
      script: toHex(cbor.encode(fromHex(await Deno.readTextFile(filepath)))),
    };
  }

   
const ownerPublicKeyHash = lucid.utils
.getAddressDetails(await lucid.wallet.address())
.paymentCredential
.hash;

const beneficiaryPublicKeyHash = lucid.utils
.getAddressDetails("addr_test1vz8z3jhg7gt5zy32q53uejqg5kv87f4szhpulcgdk79ynus3fljxz")
.paymentCredential
.hash;

const Datum = Data.Object({
lock_until: Data.BigInt, // this is POSIX time, you can check and set it here: https://www.unixtimestamp.com
owner: Data.String, // we can pass owner's verification key hash as byte array but also as a string
beneficiary: Data.String, // we can beneficiary's hash as byte array but also as a string
});

type Datum = Data.Static<typeof Datum>;

const datum = Data.to<Datum>(
{
 lock_until: 1674328600000n, // Will lock for 5 min from current time 1674328600000 = Sun 22 January 2023 00:46:40
 owner: ownerPublicKeyHash, // our own wallet verification key hash
 beneficiary: beneficiaryPublicKeyHash
},
Datum,
);

const txLock = await lock(20000000, { into: validator, datum: datum });

await lucid.awaitTx(txLock);

console.log(`20 ADA locked into the contract
  Tx ID: ${txLock}
  Datum: ${datum}
`);

// --- Supporting functions

async function lock(lovelace, { into, datum }): Promise<TxHash>{
const contractAddress = lucid.utils.validatorToAddress(into);

const tx = await lucid
  .newTx()
  .payToContract(contractAddress, { inline: datum }, { lovelace })
  .complete();

const signedTx = await tx
  .sign()
  .complete();

return signedTx.submit();
}