//지갑 주소를 받으면 온체인의 활동 정보 받아서 아래의 json 형식으로 정리

import express from 'express';
import { Request, Response } from 'express';
import { ethers } from "ethers";


// RPC 프로바이더 설정
const provider = new ethers.providers.JsonRpcProvider('https://public-node.testnet.rsk.co');

// 함수 시그니처 매핑
const functionSignatures: { [key: string]: string } = {
  "0xa9059cbb": "transfer(address,uint256)",
  "0x095ea7b3": "approve(address,uint256)",
  "0x23b872dd": "transferFrom(address,address,uint256)",
  "0x70a08231": "balanceOf(address)",
  "0x18160ddd": "totalSupply()",
  "0xdd62ed3e": "allowance(address,address)",
};

// timestamp를 포함하는 트랜잭션 타입 정의
interface TxWithTimestamp extends ethers.providers.TransactionResponse {
  timestamp: number;
}

const app = express();
app.use(express.json()); // JSON 요청을 파싱하기 위한 미들웨어

 export async function analyzeWallet(walletAddress: string) {
  if (!walletAddress) {
      throw new Error("지갑 주소가 필요합니다.");
  }

  try {
      const result = await collectWalletData(walletAddress);
      return result; // 분석 결과를 반환
  } catch (error) {
      console.error("지갑 분석 중 오류:", error);
      throw new Error("지갑 분석 중 오류가 발생했습니다.");
  }
}


// collectWalletData 함수 수정
async function collectWalletData(walletAddress: string) {
  console.log("시작: 지갑 분석 시작");
  const balance = await provider.getBalance(walletAddress);
  console.log("💰 지갑 잔액 조회 완료");
  const balanceInEther = ethers.utils.formatEther(balance);

  const latestBlockNumber = await provider.getBlockNumber();
  console.log(`📦 최신 블록 번호: ${latestBlockNumber}`);

  const fromBlock = latestBlockNumber - 1000 > 0 ? latestBlockNumber - 1000 : 0;
  const blockNumbers = Array.from({ length: latestBlockNumber - fromBlock + 1 }, (_, i) => fromBlock + i);

  // 🔄 병렬 블록 요청
  const blockResults = await Promise.allSettled(
    blockNumbers.map(async (blockNumber) => {
      try {
        const block = await provider.getBlockWithTransactions(blockNumber);
        return block;
      } catch (error) {
        console.error(`❌ 블록 ${blockNumber} 실패`, error);
        return null;
      }
    })
  );

  const txs: TxWithTimestamp[] = [];

  // 성공한 블록에서 트랜잭션 추출
  blockResults.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      const block = result.value;
      block.transactions.forEach((tx) => {
        if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
          txs.push({ ...tx, timestamp: block.timestamp });
        }
      });
    }
  });

  // 📊 분석 로직 (기존과 동일)
  const activeMonths = new Set<string>();
  const uniqueContracts = new Set<string>();
  const bridgeAddresses = new Set<string>([
    "0x22f1f604cd5b0f2ef5b0f0b0f0b0f0b0f0b0f0b0",
    "0x3e9bc21c9b189c09df3ef1b824798658d5011937",
  ]);
  let bridgeTxCount = 0;
  let totalTxValue = ethers.BigNumber.from(0);
  const txValues: number[] = [];
  const functionCallCounts: { [key: string]: number } = {};
  const contractInteractions: { [key: string]: number } = {};
  const txHourDistribution: { [key: string]: number } = {};
  const txSequence: string[] = [];

  console.log(`📦 총 ${txs.length}개 트랜잭션 감지됨`);
  txs.forEach((tx) => {
    const date = new Date(tx.timestamp * 1000);
    const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
    activeMonths.add(month);

    if (tx.to) {
      const toLower = tx.to.toLowerCase();
      uniqueContracts.add(toLower);
      if (bridgeAddresses.has(toLower)) bridgeTxCount++;
      contractInteractions[toLower] = (contractInteractions[toLower] || 0) + 1;
    }

    totalTxValue = totalTxValue.add(tx.value);
    txValues.push(parseFloat(ethers.utils.formatEther(tx.value)));

    const hour = date.getHours().toString();
    txHourDistribution[hour] = (txHourDistribution[hour] || 0) + 1;

    if (tx.data && tx.data !== "0x") {
      const selector = tx.data.slice(0, 10);
      const functionName = functionSignatures[selector] || selector;
      functionCallCounts[functionName] = (functionCallCounts[functionName] || 0) + 1;
      txSequence.push(functionName);
    }
  });

  const avgTxValue = txValues.length
    ? txValues.reduce((sum, val) => sum + val, 0) / txValues.length
    : 0;

  const varTxValue = txValues.length
    ? txValues.reduce((sum, val) => sum + Math.pow(val - avgTxValue, 2), 0) / txValues.length
    : 0;

  const result = {
    address: walletAddress,
    balance: balanceInEther,
    active_months: activeMonths.size,
    tx_count: txs.length,
    unique_contracts: uniqueContracts.size,
    bridge_tx_count: bridgeTxCount,
    avg_tx_value: avgTxValue,
    var_tx_value: varTxValue,
    sig_diversity: Object.keys(functionCallCounts).length,
    tx_time_variance: 0,
    function_call_counts: functionCallCounts,
    contract_interactions: contractInteractions,
    tx_hour_distribution: txHourDistribution,
    tx_sequence: txSequence,
  };

  console.log("✅ 분석 완료!");
  console.log(JSON.stringify(result, null, 2));

  return result;
}

