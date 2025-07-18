import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import nftJson from '../utils/aldoNFT_abi.json';
import { ethers } from 'ethers';
const nftAbi = nftJson.abi || nftJson;

const NFTUploaderAndMinter = () => {
  const [userAddress, setUserAddress] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');  // 🔥 Fitur Set Harga Jual
  const [cid, setCid] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [mintStatus, setMintStatus] = useState('');
  const [metadataLink, setMetadataLink] = useState('');
  const [lastTokenId, setLastTokenId] = useState('');

  const nftContractAddress = '0x4448143edCd845321050B5fEd23d4F208b4c1a9A';  // Ganti sesuai kontrak kamu

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
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
    if (!file || !name || !description) {
      alert('Lengkapi file, nama, dan deskripsi!');
      return;
    }

    const apiKey = 'c82a4d307297d657b5d6';
    const apiSecret = 'da8df2262e35caa4880b8a9d52c2090bc46e2497f77d8c913a004299abee9465';

    setUploadStatus('⏳ Upload gambar ke IPFS...');
    setMintStatus('');
    setCid('');
    setMetadataLink('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resImage = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret
        },
        body: formData
      });

      const imageData = await resImage.json();
      const imageCID = imageData.IpfsHash;
      const imageLink = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

      setUploadStatus(`✅ Gambar berhasil diupload! CID: ${imageCID}`);

      const metadata = {
        name: name,
        description: description,
        image: imageLink
      };

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFormData = new FormData();
      metadataFormData.append('file', metadataBlob, 'metadata.json');

      setUploadStatus('⏳ Upload metadata ke IPFS...');

      const resMetadata = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret
        },
        body: metadataFormData
      });

      const metadataData = await resMetadata.json();
      const metadataCID = metadataData.IpfsHash;
      const metadataURI = `ipfs://${metadataCID}`;
      const metadataPublicLink = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

      setMetadataLink(metadataPublicLink);
      setUploadStatus(`✅ Metadata berhasil diupload! CID: ${metadataCID}`);

      setMintStatus('⏳ Minting NFT...');
      const contract = await initContract();
      const tx = await contract.mintNFT(userAddress, metadataURI);
      
      const receipt = await tx.wait();
      setMintStatus('🎉 NFT berhasil di-mint!');

      const totalMinted = await contract.totalMinted();
      const newTokenId = totalMinted.toString();
      setLastTokenId(newTokenId);

      setCid(metadataCID);

    } catch (err) {
      console.error(err);
      setUploadStatus('❌ Upload atau minting gagal.');
      setMintStatus('❌ Mint Gagal.');
    }
  };

  const handleSetPrice = async () => {
    if (!lastTokenId || !price) {
      alert('Token ID tidak ditemukan atau harga kosong.');
      return;
    }

    try {
      const contract = await initContract();
      const priceInWei = ethers.parseUnits(price, 18);
      const tx = await contract.setPrice(lastTokenId, priceInWei);
      await tx.wait();
      alert(`✅ Harga NFT ID ${lastTokenId} telah di-set menjadi ${price} ALDO!`);
    } catch (err) {
      alert('❌ Gagal set harga: ' + (err.reason || err.message));
    }
  };

  return (
    <div>
      <h2>🚀 Upload, Mint & Jual NFT</h2>
      <p><strong>Wallet:</strong> {userAddress || '⛔ Belum connect'}</p>
      <p><strong>Contract:</strong> {nftContractAddress}</p>

      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /><br /><br />
      <input type="text" placeholder="Nama NFT" value={name} onChange={(e) => setName(e.target.value)} /><br />
      <textarea placeholder="Deskripsi NFT" value={description} onChange={(e) => setDescription(e.target.value)} /><br /><br />

      <button onClick={handleUploadAndMint}>
        Upload & Mint NFT 🎨
      </button>

      {uploadStatus && <p>{uploadStatus}</p>}
      {cid && (
        <p><strong>Metadata URI:</strong><br />
          <code>ipfs://{cid}</code>
        </p>
      )}
      {metadataLink && (
        <p><a href={metadataLink} target="_blank" rel="noopener noreferrer">Lihat Metadata JSON</a></p>
      )}
      {mintStatus && <p>{mintStatus}</p>}

      {lastTokenId && (
        <div style={{ marginTop: '20px' }}>
          <h3>💰 Set Harga Jual NFT (Token ID {lastTokenId})</h3>
          <input
            type="number"
            placeholder="Harga (ALDO)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          /> ALDO
          <br /><br />
          <button onClick={handleSetPrice}>
            Set Harga Jual 💸
          </button>
        </div>
      )}
    </div>
  );
};

export default NFTUploaderAndMinter;
