import { Client, AccountId, PrivateKey, Hbar, NetworkName } from '@hashgraph/sdk';
import { HieroConfig, HieroError, NetworkError } from './types';

export class HieroClient {
  private client: Client;
  private config: HieroConfig;

  constructor(config: HieroConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  private createClient(): Client {
    try {
      let client: Client;

      switch (this.config.network) {
        case 'mainnet':
          client = Client.forMainnet();
          break;
        case 'testnet':
          client = Client.forTestnet();
          break;
        case 'previewnet':
          client = Client.forPreviewnet();
          break;
        case 'custom':
          if (!this.config.mirrorNodeUrl) {
            throw new HieroError('Custom network requires mirrorNodeUrl');
          }
          client = Client.forNetwork({ [this.config.mirrorNodeUrl]: '50211' });
          break;
        default:
          throw new HieroError(`Unsupported network: ${this.config.network}`);
      }

      // Set default max transaction fee
      client.setDefaultMaxTransactionFee(new Hbar(100));

      // Set timeout
      if (this.config.timeout) {
        client.setRequestTimeout(this.config.timeout);
      }

      return client;
    } catch (error) {
      throw new NetworkError(`Failed to create Hiero client: ${error}`);
    }
  }

  setOperator(accountId: string | AccountId, privateKey: string | PrivateKey): void {
    try {
      const account = typeof accountId === 'string' ? AccountId.fromString(accountId) : accountId;
      const key = typeof privateKey === 'string' ? PrivateKey.fromString(privateKey) : privateKey;
      
      this.client.setOperator(account, key);
    } catch (error) {
      throw new HieroError(`Failed to set operator: ${error}`);
    }
  }

  getClient(): Client {
    return this.client;
  }

  async getNetworkInfo(): Promise<{ network: string; mirrorNode: string }> {
    return {
      network: this.config.network,
      mirrorNode: this.config.mirrorNodeUrl || this.getDefaultMirrorNode()
    };
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
    } catch (error) {
      throw new HieroError(`Failed to close client: ${error}`);
    }
  }

  private getDefaultMirrorNode(): string {
    switch (this.config.network) {
      case 'mainnet':
        return 'https://mainnet.mirrornode.hedera.com';
      case 'testnet':
        return 'https://testnet.mirrornode.hedera.com';
      case 'previewnet':
        return 'https://previewnet.mirrornode.hedera.com';
      default:
        return '';
    }
  }

  // Factory methods for easy instantiation
  static forMainnet(config?: Partial<HieroConfig>): HieroClient {
    return new HieroClient({ network: 'mainnet', ...config });
  }

  static forTestnet(config?: Partial<HieroConfig>): HieroClient {
    return new HieroClient({ network: 'testnet', ...config });
  }

  static forPreviewnet(config?: Partial<HieroConfig>): HieroClient {
    return new HieroClient({ network: 'previewnet', ...config });
  }

  static forCustom(mirrorNodeUrl: string, config?: Partial<HieroConfig>): HieroClient {
    return new HieroClient({ network: 'custom', mirrorNodeUrl, ...config });
  }
}
