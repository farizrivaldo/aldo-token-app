import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import TokenManager from './components/TokenManager';
import NFTUploader from './components/NFTUploader';
import NFTUploaderAndMinter from './components/NFTUploaderAndMinter ';
import NFTDashboard from './components/NFTDashboard';
function App() {
  const [userAddress, setUserAddress] = useState(null);  // ✅ INI PENTING
  const contractNFT  = "0x4448143edCd845321050B5fEd23d4F208b4c1a9A"
  const contractToken  = "0xa5d845705b58572F736BAf7b8b76C9823d84AdCD"
  return (
    <div style={{ padding: '2rem' }}>
      <h1>🚀 ALDO Dashboard</h1>
      <WalletConnect onConnect={setUserAddress} />
      {userAddress && (
        <>

          <TokenManager />
          <NFTUploaderAndMinter/>
          <NFTUploader contractAddress={contractNFT} />
        <NFTDashboard contractAddress={contractNFT} tokenAddress={contractToken} />

        </>
      )}
    </div>
  );
}

export default App;
