import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AldoNFT from '../utils/aldoNFT_abi.json';

function NFTDashboard() {
  const [nfts, setNfts] = useState([]);
  const [userAddress, setUserAddress] = useState(null);

  const nftContractAddress = "0x3ED7AbEa85ac7AbEbF4387fFD715bfE0b5beC346";

  useEffect(() => {
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
            nftList.push({
              tokenId: i,
              tokenURI,
            });
          } catch (err) {
            console.warn(`Token ID ${i} gagal dimuat:`, err);
          }
        }

        setNfts(nftList);

      } catch (err) {
        console.error('Gagal membaca totalMinted:', err);
      }
    };

    loadNFTs();
  }, []);

  return (
    <div style={{ margin: '30px' }}>
      <h2>📦 NFT Dashboard</h2>
      {userAddress && <p>👤 Connected as: {userAddress}</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>No.</th>
            <th>Token ID</th>
            <th>IPFS Metadata Link</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {nfts.length > 0 ? nfts.map((nft, index) => (
            <tr key={nft.tokenId}>
              <td>{index + 1}</td>
              <td>{nft.tokenId}</td>
              <td>{nft.tokenURI}</td>
              <td><a href={nft.tokenURI} target="_blank" rel="noopener noreferrer">🔗 View</a></td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4">No NFTs Found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default NFTDashboard;
