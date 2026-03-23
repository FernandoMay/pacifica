import { Client, AccountId, TokenId, ContractId, TransactionId, Hbar } from '@hashgraph/sdk';

export interface HieroConfig {
  network: 'mainnet' | 'testnet' | 'previewnet' | 'custom';
  mirrorNodeUrl?: string;
  apiKey?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface TokenInfo {
  tokenId: TokenId;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  treasury: AccountId;
  keys: {
    adminKey?: string;
    supplyKey?: string;
    wipeKey?: string;
    freezeKey?: string;
    kycKey?: string;
  };
}

export interface AccountInfo {
  accountId: AccountId;
  balance: Hbar;
  tokens: {
    tokenId: TokenId;
    balance: number;
    decimals: number;
  }[];
  alias?: string;
  ethereumAddress?: string;
}

export interface TransactionResult {
  transactionId: TransactionId;
  status: string;
  hash?: string;
  error?: string;
  gasUsed?: number;
  timestamp?: Date;
}

export interface ScheduledTransaction {
  scheduledTransactionId: TransactionId;
  transactionBody: any;
  execTime?: Date;
  expirationTime?: Date;
  memo?: string;
  createdBy: AccountId;
  payer: AccountId;
}

export interface ConsensusMessage {
  topicId: string;
  message: string;
  sequenceNumber: number;
  timestamp: Date;
  runningHash: string;
  chunkNumber?: number;
  totalChunks?: number;
}

export interface ContractCallParams {
  contractId: ContractId;
  function: string;
  parameters?: any[];
  gas?: number;
  value?: Hbar;
}

export interface QueryOptions {
  limit?: number;
  order?: 'asc' | 'desc';
  timestamp?: Date;
  accountId?: AccountId;
  tokenId?: TokenId;
}

export interface PaginationResult<T> {
  items: T[];
  links: {
    next?: string;
    prev?: string;
  };
  total: number;
}

export interface ReactHookOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

// Error types
export class HieroError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HieroError';
  }
}

export class NetworkError extends HieroError {
  constructor(message: string, public statusCode?: number) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class TransactionError extends HieroError {
  constructor(message: string, public transactionId?: TransactionId) {
    super(message, 'TRANSACTION_ERROR');
    this.name = 'TransactionError';
  }
}
