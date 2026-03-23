import { Client, ContractExecuteTransaction, ContractFunctionParameters, TransactionReceipt } from '@hashgraph/sdk';
import { VaultInfo } from '../types';

export class BonzoVaultContract {
  private client: Client;
  private contractId: string;

  constructor(client: Client, contractId: string) {
    this.client = client;
    this.contractId = contractId;
  }

  async harvest(): Promise<TransactionReceipt> {
    const transaction = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(3000000)
      .setFunction('harvest')
      .freezeWithSigner(this.client);

    const signedTx = await transaction.executeWithSigner(this.client);
    const receipt = await signedTx.getReceipt(this.client);
    
    return receipt;
  }

  async rebalance(newLower: number, newUpper: number): Promise<TransactionReceipt> {
    const transaction = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(3000000)
      .setFunction('rebalance', new ContractFunctionParameters()
        .addUint256(newLower)
        .addUint256(newUpper))
      .freezeWithSigner(this.client);

    const signedTx = await transaction.executeWithSigner(this.client);
    const receipt = await signedTx.getReceipt(this.client);
    
    return receipt;
  }

  async withdraw(amount: number): Promise<TransactionReceipt> {
    const transaction = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(3000000)
      .setFunction('withdraw', new ContractFunctionParameters()
        .addUint256(amount))
      .freezeWithSigner(this.client);

    const signedTx = await transaction.executeWithSigner(this.client);
    const receipt = await signedTx.getReceipt(this.client);
    
    return receipt;
  }

  async getVaultInfo(): Promise<VaultInfo> {
    const transaction = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(100000)
      .setFunction('getVaultInfo')
      .freezeWithSigner(this.client);

    const signedTx = await transaction.executeWithSigner(this.client);
    const record = await signedTx.getRecord(this.client);
    
    // Parse the contract function result
    const result = record.contractFunctionResult!;
    const data = result.getBytes32Array(0);
    
    // This is a simplified parsing - in reality you'd need to parse the actual struct
    return {
      address: this.contractId,
      token0: 'HBAR', // Would be parsed from contract
      token1: 'USDC', // Would be parsed from contract
      totalValueLocked: parseFloat(data[0].toString()) || 0,
      apr: parseFloat(data[1].toString()) || 0,
      liquidityRange: {
        lower: parseFloat(data[2].toString()) || 0,
        upper: parseFloat(data[3].toString()) || 0
      },
      lastHarvest: parseInt(data[4].toString()) || Date.now()
    };
  }

  async getTotalValueLocked(): Promise<number> {
    const transaction = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(100000)
      .setFunction('getTotalValueLocked')
      .freezeWithSigner(this.client);

    const signedTx = await transaction.executeWithSigner(this.client);
    const record = await signedTx.getRecord(this.client);
    
    const result = record.contractFunctionResult!;
    return result.getUint256(0).toNumber();
  }

  async getApr(): Promise<number> {
    const transaction = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(100000)
      .setFunction('getApr')
      .freezeWithSigner(this.client);

    const signedTx = await transaction.executeWithSigner(this.client);
    const record = await signedTx.getRecord(this.client);
    
    const result = record.contractFunctionResult!;
    return result.getUint256(0).toNumber();
  }

  async getLastHarvestTime(): Promise<number> {
    const transaction = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setGas(100000)
      .setFunction('getLastHarvestTime')
      .freezeWithSigner(this.client);

    const signedTx = await transaction.executeWithSigner(this.client);
    const record = await signedTx.getRecord(this.client);
    
    const result = record.contractFunctionResult!;
    return result.getUint256(0).toNumber();
  }
}
