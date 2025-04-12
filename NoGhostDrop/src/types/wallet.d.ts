export type WalletProfile = {
    address: string;
    balance: string,
    active_months: number;
    tx_count: number;
    unique_contracts: number;
    bridge_tx_count: number;
    avg_tx_value: number;
    var_tx_value: number;
    sig_diversity: number;
    tx_time_variance: number;
  
    function_call_counts: {
      [fn: string]: {
        count: number;
      };
    };
  
    contract_interactions: {
      [contractAddress: string]: {
        count: number;
      };
    };
  
    tx_hour_distribution: {
      [hour: string]: number; // 예: "13": 2
    };
  
    tx_sequence: string[];
  };
  