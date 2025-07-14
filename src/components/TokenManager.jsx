import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';
import abi from '../utils/abi.json'; // Pastikan path sesuai dengan file ABI kamu

const TokenManager = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [logs, setLogs] = useState([]);


  // Ganti ini dengan alamat kontrakmu di jaringan yang dipakai (misalnya Holesky)
  const contractAddress = '0xa5d845705b58572F736BAf7b8b76C9823d84AdCD';

  useEffect(() => {
    const fetchLogs = async () => {
      if (contract) {
        try {
          const filter = contract.filters.Transfer(); // tanpa filter, ambil semua
          const events = await contract.queryFilter(filter, -10000); // ambil dari 10.000 blok terakhir
          const parsed = events.map((e) => ({
            from: e.args.from,
            to: e.args.to,
            value: formatEther(e.args.value),
            tx: e.transactionHash
          }));
          setLogs(parsed.reverse()); // tampilkan dari yang terbaru
        } catch (err) {
          console.error("Gagal ambil log:", err);
        }
      }
    };
  
    fetchLogs();
  }, [contract]);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const newProvider = new BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        const newContract = new Contract(contractAddress, abi, newSigner);
        const userAddress = await newSigner.getAddress();
        const balanceRaw = await newContract.balanceOf(userAddress);
        const balanceFormatted = formatEther(balanceRaw);

        setProvider(newProvider);
        setSigner(newSigner);
        setContract(newContract);
        setAddress(userAddress);
        setBalance(balanceFormatted);
      } else {
        alert('Please install MetaMask to use this app.');
      }
    };

    init();
  }, []);

  const addTokenToMetaMask = async () => {
    const tokenAddress = "0xa5d845705b58572F736BAf7b8b76C9823d84AdCD"; 
    const tokenSymbol = "ALD";
    const tokenDecimals = 18;
    const tokenImage = ""; // optional
  
    try {
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
  
      console.log("MetaMask response:", wasAdded);
  
      if (wasAdded) {
        alert("🎉 Token ALDO berhasil ditambahkan ke MetaMask!");
      } else {
        alert("❌ Pengguna membatalkan penambahan token.");
      }
    } catch (error) {
      console.error("Gagal menambahkan token ke MetaMask:", error);
      alert("❌ Gagal menambahkan token. Cek console.");
    }
  };
  
  

  const handleMint = async () => {
    try {
      const tx = await contract.mint(address, parseEther(mintAmount));
      await tx.wait();
      alert('Mint berhasil!');
    } catch (error) {
      console.error(error);
      alert('Mint gagal.');
    }
  };

  const handleTransfer = async () => {
    try {
      const tx = await contract.transfer(recipient, parseEther(transferAmount));
      await tx.wait();
      alert('Transfer berhasil!');
    } catch (error) {
      console.error(error);
      alert('Transfer gagal.');
    }
  };
  //-================================CSS=====================
  const cellStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    fontSize: '0.9rem'
  };
  
  const shortenAddress = (addr) => {
    return addr.length > 10
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : addr;
  };
  

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial' }}>
        <button onClick={addTokenToMetaMask}>➕ Tambahkan $ALDO ke MetaMask</button>
      <h2>Token Manager</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Balance:</strong> {balance} TOKEN</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>Mint Token</h3>
        <input
          type="text"
          placeholder="Jumlah token"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
        />
        <button onClick={handleMint}>Mint</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Transfer Token</h3>
        <input
          type="text"
          placeholder="Alamat penerima"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Jumlah token"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />
        <button onClick={handleTransfer}>Transfer</button>
      </div>
      <div style={{ marginTop: '2rem' }}>
  <h3>📜 Riwayat Transaksi Token</h3>
  {logs.length === 0 ? (
    <p>Tidak ada transaksi.</p>
  ) : (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'Arial',
      marginTop: '1rem',
    }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }}>
          <th style={cellStyle}>#</th>
          <th style={cellStyle}>From</th>
          <th style={cellStyle}>To</th>
          <th style={cellStyle}>Amount</th>
          <th style={cellStyle}>Tx</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, idx) => (
          <tr key={idx}>
            <td style={cellStyle}>{logs.length - idx}</td>
            <td style={cellStyle}><code>{shortenAddress(log.from)}</code></td>
            <td style={cellStyle}><code>{shortenAddress(log.to)}</code></td>
            <td style={cellStyle}>{log.value} $ALDO</td>
            <td style={cellStyle}>
              <a href={`https://holesky.etherscan.io/tx/${log.tx}`} target="_blank" rel="noreferrer">
                🔗 View
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

    </div>
  );
};

export default TokenManager;
