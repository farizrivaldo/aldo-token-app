import React, { useState, useEffect } from 'react';

function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask tidak ditemukan. Silakan instal.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      onConnect(accounts[0]);  // Informasi akun dikirim ke komponen parent
    } catch (err) {
      if (err.code === 4001) {
        console.warn('User membatalkan koneksi MetaMask.');
      } else {
        console.error('Gagal connect ke MetaMask:', err);
        alert('Gagal connect ke MetaMask.');
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    onConnect(null);  // Reset akun di parent
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        const connectedAccount = accounts[0] || null;
        setAccount(connectedAccount);
        onConnect(connectedAccount);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup saat komponen di-unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [onConnect]);

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
