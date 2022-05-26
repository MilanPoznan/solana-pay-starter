export function createTransferCheckedInstruction(
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners: Signer[] = [],
  programId = TOKEN_PROGRAM_ID
): TransactionInstruction {
  const keys = addSigners(
    [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
    ],
    owner,
    multiSigners
  );

  const data = Buffer.alloc(transferCheckedInstructionData.span);
  transferCheckedInstructionData.encode(
    {
      instruction: TokenInstruction.TransferChecked,
      amount: BigInt(amount),
      decimals,
    },
    data
  );

  return new TransactionInstruction({ keys, programId, data });
}