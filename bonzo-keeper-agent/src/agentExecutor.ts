import * as cron from 'node-cron';
import { IntelligentKeeper } from './agents/intelligentKeeper';
import { BonzoVaultContract } from './contracts/bonzoVault';
import { AgentDecision, AgentConfig } from './types';
import { Client } from '@hashgraph/sdk';

export class AgentExecutor {
  private keeper: IntelligentKeeper;
  private client: Client;
  private isRunning: boolean = false;
  private cronJob: cron.ScheduledTask | null = null;

  constructor(keeper: IntelligentKeeper, client: Client) {
    this.keeper = keeper;
    this.client = client;
  }

  async start(config: AgentConfig): Promise<void> {
    if (this.isRunning) {
      console.log('Agent is already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting ${config.name} agent with ${config.checkInterval}s interval`);

    // Schedule the agent to run at specified intervals
    const cronExpression = this.getCronExpression(config.checkInterval);
    
    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.executeAgentLoop();
    }, {
      scheduled: true
    });

    // Run immediately on start
    await this.executeAgentLoop();
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    console.log('Agent stopped');
  }

  private async executeAgentLoop(): Promise<void> {
    try {
      console.log('🤖 Running intelligent keeper analysis...');
      
      const decisions = await this.keeper.getAllDecisions();
      
      for (const decision of decisions) {
        await this.executeDecision(decision);
      }
      
      console.log(`✅ Completed analysis. Processed ${decisions.length} vaults.`);
    } catch (error) {
      console.error('❌ Error in agent execution:', error);
    }
  }

  private async executeDecision(decision: AgentDecision): Promise<void> {
    const vault = this.keeper.getVaultInfo(decision.vault);
    if (!vault) {
      console.error(`Vault ${decision.vault} not found`);
      return;
    }

    console.log(`📊 Decision for vault ${decision.vault}: ${decision.action} (${decision.confidence.toFixed(2)} confidence)`);
    console.log(`   Reason: ${decision.reason}`);

    if (decision.confidence < 0.6) {
      console.log(`⚠️  Low confidence decision, skipping execution`);
      return;
    }

    const vaultContract = new BonzoVaultContract(this.client, decision.vault);

    try {
      switch (decision.action) {
        case 'HARVEST':
          await this.executeHarvest(vaultContract);
          break;
        case 'REBALANCE':
          await this.executeRebalance(vaultContract, decision.parameters);
          break;
        case 'WITHDRAW':
          await this.executeWithdraw(vaultContract);
          break;
        case 'WAIT':
          console.log(`⏳ Waiting - no action needed`);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to execute ${decision.action} on vault ${decision.vault}:`, error);
    }
  }

  private async executeHarvest(vaultContract: BonzoVaultContract): Promise<void> {
    console.log(`🌾 Executing harvest...`);
    const receipt = await vaultContract.harvest();
    
    if (receipt.status.toString() === 'SUCCESS') {
      console.log(`✅ Harvest executed successfully`);
    } else {
      console.log(`❌ Harvest failed with status: ${receipt.status}`);
    }
  }

  private async executeRebalance(vaultContract: BonzoVaultContract, parameters: any): Promise<void> {
    console.log(`⚖️  Executing rebalance...`);
    console.log(`   New range: ${parameters.newRange.lower} - ${parameters.newRange.upper}`);
    
    const receipt = await vaultContract.rebalance(parameters.newRange.lower, parameters.newRange.upper);
    
    if (receipt.status.toString() === 'SUCCESS') {
      console.log(`✅ Rebalance executed successfully`);
    } else {
      console.log(`❌ Rebalance failed with status: ${receipt.status}`);
    }
  }

  private async executeWithdraw(vaultContract: BonzoVaultContract): Promise<void> {
    console.log(`🏃 Executing emergency withdrawal...`);
    
    // In a real implementation, you'd withdraw all or a calculated amount
    const vaultInfo = await vaultContract.getVaultInfo();
    const receipt = await vaultContract.withdraw(vaultInfo.totalValueLocked);
    
    if (receipt.status.toString() === 'SUCCESS') {
      console.log(`✅ Withdrawal executed successfully`);
    } else {
      console.log(`❌ Withdrawal failed with status: ${receipt.status}`);
    }
  }

  private getCronExpression(intervalSeconds: number): string {
    if (intervalSeconds < 60) {
      // For intervals less than 1 minute, use */X seconds (approximated)
      return `*/${Math.ceil(intervalSeconds / 10)} * * * * *`;
    } else if (intervalSeconds < 3600) {
      // For intervals less than 1 hour
      const minutes = Math.floor(intervalSeconds / 60);
      return `*/${minutes} * * * *`;
    } else {
      // For intervals of 1 hour or more
      const hours = Math.floor(intervalSeconds / 3600);
      return `0 */${hours} * * *`;
    }
  }

  async runOnce(): Promise<AgentDecision[]> {
    console.log('🔍 Running single analysis cycle...');
    return await this.keeper.getAllDecisions();
  }

  getStatus(): { isRunning: boolean; vaults: any[] } {
    return {
      isRunning: this.isRunning,
      vaults: this.keeper.getAllVaults()
    };
  }
}
