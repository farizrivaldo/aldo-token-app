import React, { useState, useEffect } from 'react';

function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask tidak ditemukan');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      onConnect(accounts[0]); // kirim ke parent
    } catch (err) {
      console.error(err);
      alert('Gagal connect ke MetaMask');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    onConnect(null); // reset parent
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
        onConnect(accounts[0] || null);
      });
    }
  }, []);

  return (
    <div style={{ marginBottom: '20px' }}>
      {account ? (
        <div>
          <p>✅ Connected: {account}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}
    </div>
  );
}

export default WalletConnect;
