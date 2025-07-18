import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import nftABI from '../utils/aldoNFT_abi.json';

function NFTDashboard({ contractAddress }) {
  const [nfts, setNFTs] = useState([]);
  const [account, setAccount] = useState('');

  const fetchNFTs = async () => {
    if (!window.ethereum) return alert('MetaMask belum terpasang');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, nftABI, provider);

    const userAddress = await signer.getAddress();
    setAccount(userAddress);

    const totalMinted = await contract.totalMinted();
    const nftList = [];

    for (let tokenId = 1; tokenId <= totalMinted; tokenId++) {
      try {
        const owner = await contract.ownerOf(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);

        let metadataURL = tokenURI.startsWith('ipfs://')
          ? tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
          : tokenURI;

        const response = await fetch(metadataURL);
        const metadata = await response.json();

        let imageURL = metadata.image.startsWith('ipfs://')
          ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
          : metadata.image;

        nftList.push({
          tokenId: tokenId.toString(),
          name: metadata.name,
          image: imageURL,
          owner: owner.toLowerCase(),
        });

      } catch (err) {
        console.error(`Token ID ${tokenId} error:`, err);
      }
    }

    setNFTs(nftList);
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>🎨 Koleksi NFT Aldo</h1>
      <p style={{ textAlign: 'center' }}>
        <strong>Wallet Anda:</strong> {account}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        {nfts.map((nft) => (
          <div key={nft.tokenId} style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px'
          }}>
            <img
              src={nft.image}
              alt={nft.name}
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
            <h3 style={{ marginTop: '10px' }}>{nft.name}</h3>
            <p>ID NFT: {nft.tokenId}</p>
            <p style={{
              fontSize: '12px',
              color: '#555',
              wordBreak: 'break-all',
              textAlign: 'center'
            }}>
              👤 <strong>Pemilik:</strong><br /> {nft.owner}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NFTDashboard;
