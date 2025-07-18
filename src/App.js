import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import TokenManager from './components/TokenManager';
import NFTUploader from './components/NFTUploader';
import NFTUploaderAndMinter from './components/NFTUploaderAndMinter ';
import NFTDashboard from './components/NFTDashboard';
function App() {
  const [userAddress, setUserAddress] = useState(null);  // ✅ INI PENTING
  const contractNFT  = "0x3ED7AbEa85ac7AbEbF4387fFD715bfE0b5beC346"
  const transactionNFT  = "0x769dAf2A30E2A2be994c65b39aafcfFEa0c7317E"
  return (
    <div style={{ padding: '2rem' }}>
      <h1>🚀 ALDO Dashboard</h1>
      <WalletConnect onConnect={setUserAddress} />
      {userAddress && (
        <>
   
          <TokenManager />
          <NFTUploaderAndMinter/>
          <NFTUploader contractAddress={contractNFT} />
        <NFTDashboard contractAddress={contractNFT} />

        </>
      )}
    </div>
  );
}

export default App;
