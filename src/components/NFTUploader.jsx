import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AldoNFT from '../utils/aldoNFT_abi.json';

function NFTDashboard() {
  const [nfts, setNfts] = useState([]);
  const [userAddress, setUserAddress] = useState(null);

  const nftContractAddress = "0x4448143edCd845321050B5fEd23d4F208b4c1a9A";

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    if (!window.ethereum) {
      alert('MetaMask tidak terdeteksi!');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setUserAddress(address);

    const contract = new ethers.Contract(nftContractAddress, AldoNFT, provider);

    try {
      const totalMinted = await contract.totalMinted();
      const nftList = [];

      for (let i = 1; i <= Number(totalMinted); i++) {
        try {
          const tokenURI = await contract.tokenURI(i);
          const owner = await contract.ownerOf(i);

          if (owner.toLowerCase() === address.toLowerCase()) {
            const metadataURL = tokenURI.startsWith('ipfs://')
              ? `https://gateway.pinata.cloud/ipfs/${tokenURI.replace('ipfs://', '')}`
              : tokenURI;

            const res = await fetch(metadataURL);
            const metadata = await res.json();

            nftList.push({
              tokenId: i,
              tokenURI,
              name: metadata.name || `NFT #${i}`
            });
          }

        } catch (err) {
          console.warn(`Token ID ${i} gagal dimuat:`, err);
        }
      }

      setNfts(nftList);

    } catch (err) {
      console.error('Gagal membaca totalMinted:', err);
    }
  };

  const handleDelete = async (tokenId) => {
    if (!window.ethereum) return alert('MetaMask tidak terdeteksi!');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(nftContractAddress, AldoNFT, signer);

    try {
      const confirmDelete = window.confirm(`Yakin ingin DELETE NFT ID ${tokenId}?`);
      if (!confirmDelete) return;

      const tx = await contract.burnNFT(tokenId);
      await tx.wait();

      alert(`NFT ID ${tokenId} berhasil dihapus (burn).`);
      loadNFTs(); // Refresh setelah delete

    } catch (err) {
      console.error(err);
      alert('❌ Gagal menghapus NFT.');
    }
  };

  return (
    <div style={{ margin: '30px' }}>
      <h2>📦 NFT Dashboard</h2>
      {userAddress && <p>👤 Connected as: {userAddress}</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Token</th>
            <th>Token ID</th>
            <th>IPFS Metadata Link</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {nfts.length > 0 ? nfts.map((nft, index) => (
            <tr key={nft.tokenId}>
              <td>{index + 1}</td>
              <td>{nft.name}</td>
              <td>{nft.tokenId}</td>
              <td>
                <a href={`https://gateway.pinata.cloud/ipfs/${nft.tokenURI.replace('ipfs://', '')}`} target="_blank" rel="noopener noreferrer">
                  🔗 View Metadata
                </a>
              </td>
              <td>
                <button onClick={() => handleDelete(nft.tokenId)}>🗑️ Delete NFT</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5">No NFTs Found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NFTDashboard;
