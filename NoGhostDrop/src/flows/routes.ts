import express from 'express';
import { runWalletClaim } from './recieverClaimFlow';
import { runWalletReport } from './recieverReportFlow';
import { registerAirdrop } from '../services/registerAirdrop';

const router = express.Router();

// 🧾 지갑 진단 리포트
// POST /receiver/report
router.post('/receiver/report', async (req, res) => {
  try {
    const { walletAddress, tokenAddress } = req.body;

    if (!walletAddress || !tokenAddress) {
      return res.status(400).json({ error: 'walletAddress and tokenAddress are required' });
    }

    const report = await runWalletReport(walletAddress, tokenAddress);
    return res.json({ report });
  } catch (err) {
    console.error('❌ Error in /receiver/report:', err);
    return res.status(500).json({ error: '지갑 분석 중 오류가 발생했습니다.' });
  }
});

// 🎯 조건 충족 시 실제 claim
// POST /receiver/claim
router.post('/receiver/claim', async (req, res) => {
  try {
    const { walletAddress, tokenAddress } = req.body;

    if (!walletAddress || !tokenAddress) {
      return res.status(400).json({ error: 'walletAddress and tokenAddress are required' });
    }

    const result = await runWalletClaim(walletAddress, tokenAddress);
    return res.json({ result });
  } catch (err) {
    console.error('❌ Error in /receiver/claim:', err);
    return res.status(500).json({ error: '에어드랍 수령 중 오류가 발생했습니다.' });
  }
});

// 🚀 에어드랍 생성 (배포)
router.post('/issuer/deploy', async (req, res) => {
    try {
      const input = req.body; // 토큰 주소, 조건 등등
  
      const deployResult = await registerAirdrop(input);; // input: AirdropRegistrationInput 타입이어야 함
      return res.json({ deployResult });
    } catch (err) {
      console.error('❌ /issuer/deploy error:', err);
      return res.status(500).json({ error: '에어드랍 생성 실패' });
    }
  });
  
  export default router;