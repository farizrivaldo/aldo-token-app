import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import nftABI from '../utils/aldoNFT_abi.json';
import tokenABI from '../utils/abi.json';   // ABI token ALDO

function NFTDashboard({ contractAddress, tokenAddress }) {
  const [nfts, setNFTs] = useState([]);
  const [account, setAccount] = useState('');
  const [newPrices, setNewPrices] = useState({});   // <- Tambahan
  const [approveAmount, setApproveAmount] = useState('');   // Tambahan

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

        const priceInALDO = await (async () => {
          try {
            const rawPrice = await contract.nftPrices(tokenId);
            return ethers.formatUnits(rawPrice, 18);
          } catch (err) {
            return "0";
          }
        })();

        nftList.push({
          tokenId: tokenId.toString(),
          name: metadata.name,
          image: imageURL,
          owner: owner.toLowerCase(),
          price: priceInALDO
        });

      } catch (err) {
        console.error(`Token ID ${tokenId} error:`, err);
      }
    }

    setNFTs(nftList);
  };

const approveToken = async () => {
  if (!approveAmount || Number(approveAmount) <= 0) {
    alert('Masukkan jumlah ALDO yang valid.');
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

  const rawAmount = ethers.parseUnits(approveAmount, 18);

  const tx = await tokenContract.approve(contractAddress, rawAmount);
  await tx.wait();

  alert(`✅ Approve berhasil untuk ${approveAmount} ALDO`);
};

  const buyNFT = async (tokenId, price) => {
    if (!window.ethereum) return alert('MetaMask belum terpasang');

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, nftABI, signer);

    try {
      const tx = await contract.buyNFT(tokenId, { gasLimit: 500000 });
      await tx.wait();
      alert(`🎉 NFT ID ${tokenId} berhasil dibeli!`);
      fetchNFTs();
    } catch (err) {
      console.error('Gagal membeli NFT:', err);
      alert('❌ Pembelian gagal: ' + (err.message || 'Unknown error'));
    }
  };

  const setPrice = async (tokenId, price) => {
    if (!price || Number(price) <= 0) {
      alert('Masukkan harga yang valid.');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, nftABI, signer);

    try {
      const rawPrice = ethers.parseUnits(price, 18);
      const tx = await contract.setPrice(tokenId, rawPrice);
      await tx.wait();
      alert(`✅ Harga NFT ID ${tokenId} diset ${price} ALDO`);
      fetchNFTs();
    } catch (err) {
      console.error('Gagal set harga:', err);
      alert('❌ Set harga gagal: ' + (err.message || 'Unknown error'));
    }
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

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
  <input
    type="text"
    placeholder="Jumlah ALDO untuk Approve"
    value={approveAmount}
    onChange={(e) => setApproveAmount(e.target.value)}
    style={{
      padding: '10px',
      width: '200px',
      marginRight: '10px'
    }}
  />

  <button
    onClick={approveToken}
    style={{
      padding: '10px 20px',
      backgroundColor: '#008CBA',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    ✅ Approve ALDO ke Kontrak NFT
  </button>
</div>


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

            {nft.price !== "0" && (
              <>
                <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  💰 Harga: {nft.price} ALDO
                </p>
                {nft.owner !== account.toLowerCase() && (
                  <button
                    onClick={() => buyNFT(nft.tokenId, nft.price)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4CAF50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Beli NFT Ini
                  </button>
                )}
              </>
            )}

            {nft.price === "0" && (
              <p style={{ color: 'gray', marginTop: '10px' }}>
                NFT ini tidak dijual
              </p>
            )}

            {nft.owner === account.toLowerCase() && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Harga baru (ALDO)"
                  value={newPrices[nft.tokenId] || ''}
                  onChange={(e) =>
                    setNewPrices({ ...newPrices, [nft.tokenId]: e.target.value })
                  }
                  style={{
                    padding: '5px',
                    width: '80%',
                    marginBottom: '5px'
                  }}
                />
                <button
                  onClick={() => setPrice(nft.tokenId, newPrices[nft.tokenId])}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#FFA500',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Set Harga Baru
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NFTDashboard;
