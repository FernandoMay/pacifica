export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  protocols: Protocol[];
  owner: string;
  created: number;
  updated: number;
  status: 'active' | 'inactive' | 'error';
}

export interface Protocol {
  type: 'HCS-10' | 'A2A' | 'XMTP' | 'MCP';
  endpoint?: string;
  config?: any;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  protocol: Protocol['type'];
  content: string;
  timestamp: number;
  metadata?: any;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  installUrl: string;
  dependencies: string[];
}

export interface RegistryResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  examples: string[];
}

export interface HCS10Message {
  topicId: string;
  sequenceNumber: number;
  content: string;
  timestamp: number;
  operatorAccountId: string;
}

export interface A2AMessage {
  fromAgent: string;
  toAgent: string;
  messageType: string;
  payload: any;
  timestamp: number;
  signature?: string;
}

export interface XMTPMessage {
  from: string;
  to: string;
  content: string;
  timestamp: number;
  topic?: string;
}

export interface MCPRequest {
  method: string;
  params: any;
  id: string;
}

export interface MCPResponse {
  result?: any;
  error?: any;
  id: string;
}
