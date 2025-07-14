import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import nftJson from '../utils/aldoNFT_abi.json';
const nftAbi = nftJson.abi || nftJson; // Pastikan formatnya array

const NFTUploaderAndMinter = () => {
  const [userAddress, setUserAddress] = useState('');
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [mintStatus, setMintStatus] = useState('');

  const nftContractAddress = '0x3ED7AbEa85ac7AbEbF4387fFD715bfE0b5beC346';

  // Auto connect wallet saat load
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setUserAddress(accounts[0]);
        } catch (err) {
          console.error('User denied wallet access', err);
        }
      } else {
        alert('MetaMask tidak ditemukan.');
      }
    };
    connectWallet();
  }, []);

  const initContract = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(nftContractAddress, nftAbi, signer);
  };

  const handleUploadAndMint = async () => {
    if (!file) {
      alert('Pilih file terlebih dahulu!');
      return;
    }

    const apiKey = 'c82a4d307297d657b5d6';
    const apiSecret = 'da8df2262e35caa4880b8a9d52c2090bc46e2497f77d8c913a004299abee9465';

    const formData = new FormData();
    formData.append('file', file);

    setUploadStatus('⏳ Mengupload ke IPFS...');
    setMintStatus('');
    setCid('');

    try {
      // Upload to Pinata
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadStatus('❌ Upload gagal: ' + JSON.stringify(data));
        return;
      }

      const ipfsUri = `ipfs://${data.IpfsHash}`;
      setCid(data.IpfsHash);
      setUploadStatus(`✅ Upload berhasil! CID: ${data.IpfsHash}`);

      // Mint NFT
      setMintStatus('⏳ Minting NFT...');
      const contract = await initContract();
      const tx = await contract.mintNFT(userAddress, ipfsUri);
      await tx.wait();
      setMintStatus('🎉 NFT berhasil di-mint!');
    } catch (err) {
      console.error(err);
      setUploadStatus('❌ Upload atau minting gagal.');
      setMintStatus('❌ Mint Gagal.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🚀 Upload & Mint NFT</h2>
      <p><strong>Wallet:</strong> {userAddress || '⛔ Belum connect'}</p>
      <p><strong>Contract:</strong> {nftContractAddress}</p>

      <div style={{ marginBottom: '1rem' }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUploadAndMint} style={{ marginLeft: '10px' }}>
          Upload & Mint NFT 🎨
        </button>
      </div>

      {uploadStatus && <p>{uploadStatus}</p>}
      {cid && (
        <p>
          <strong>IPFS URI:</strong>{' '}
          <code>ipfs://{cid}</code>
        </p>
      )}
      {mintStatus && <p>{mintStatus}</p>}
    </div>
  );
};

export default NFTUploaderAndMinter;
