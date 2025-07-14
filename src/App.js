import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import TokenManager from './components/TokenManager';
import NFTManager from './components/NFTManager';
import NFTUploader from './components/NFTUploader';
import NFTSubmited from './components/NFTSubmited';
import NFTUploaderAndMinter from './components/NFTUploaderAndMinter ';
function App() {
  const [userAddress, setUserAddress] = useState(null);  // ✅ INI PENTING
  const contractNFT  = "0x3ED7AbEa85ac7AbEbF4387fFD715bfE0b5beC346"
  return (
    <div style={{ padding: '2rem' }}>
      <h1>🚀 ALDO Dashboard</h1>
      <WalletConnect onConnect={setUserAddress} />
      {userAddress && (
        <>
   
          <TokenManager />
          <NFTUploaderAndMinter/>
          {/* <NFTSubmited/> */}
          <NFTUploader contractAddress={contractNFT} />
          {/* <NFTManager userAddress={userAddress} />   ✅ PROPS DIKIRIM */}
        </>
      )}
    </div>
  );
}

export default App;
