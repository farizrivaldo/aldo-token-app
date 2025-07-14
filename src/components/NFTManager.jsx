import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import nftAbi from '../utils/aldoNFT_abi.json';  // Pastikan ABI NFT kamu ada di sini

const NFTManager = ({ userAddress }) => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [metadataURI, setMetadataURI] = useState('');
  const [mintStatus, setMintStatus] = useState('');

  const nftContractAddress = "0x3ED7AbEa85ac7AbEbF4387fFD715bfE0b5beC346";

  const initContract = async () => {
    if (window.ethereum) {
      const newProvider = new BrowserProvider(window.ethereum);
      const signer = await newProvider.getSigner();
      const nftContract = new Contract(nftContractAddress, nftAbi, signer);

      setProvider(newProvider);
      setContract(nftContract);
    } else {
      alert('MetaMask tidak ditemukan');
    }
  };

  const handleMintNFT = async () => {
    if (!contract) {
      await initContract();
    }
    try {
      const tx = await contract.mintNFT(userAddress, metadataURI);
      setMintStatus('⏳ Minting NFT...');
      await tx.wait();
      setMintStatus('🎉 NFT Berhasil di-Mint!');
    } catch (error) {
      console.error(error);
      setMintStatus('❌ Mint Gagal.');
    }
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid gray', paddingTop: '1rem' }}>
      <h2>🎨 NFT Manager</h2>
      <p><strong>Kontrak NFT:</strong> {nftContractAddress}</p>

      <input
        type="text"
        placeholder="Link Metadata (IPFS)"
        value={metadataURI}
        onChange={(e) => setMetadataURI(e.target.value)}
        style={{ width: '80%' }}
      />
      <button onClick={handleMintNFT} style={{ marginLeft: '10px' }}>
        Mint NFT 🎨
      </button>

      {mintStatus && <p>{mintStatus}</p>}
    </div>
  );
};

export default NFTManager;
