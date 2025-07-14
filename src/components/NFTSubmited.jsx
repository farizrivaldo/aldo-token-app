import React, { useState } from 'react';

function NFTSubmited() {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) {
      alert('Pilih file dulu!');
      return;
    }

    const apiKey = 'c82a4d307297d657b5d6';
    const apiSecret = 'da8df2262e35caa4880b8a9d52c2090bc46e2497f77d8c913a004299abee9465';

    const formData = new FormData();
    formData.append('file', file);

    setStatus('⏳ Mengupload ke IPFS...');
    setCid('');

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret
        },
        body: formData
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        setCid(result.IpfsHash);
        setStatus('✅ Upload berhasil!');
      } else {
        setStatus('❌ Upload gagal: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('Gagal upload:', error);
      setStatus('❌ Terjadi error saat upload.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`ipfs://${cid}`);
    alert('✅ CID disalin ke clipboard!');
  };

  return (
    <div style={{ margin: '1rem' }}>
      <h3>Upload NFT ke IPFS (Pinata)</h3>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
        Upload
      </button>

      {status && <p>{status}</p>}

      {cid && (
        <div>
          <p><strong>CID:</strong> {cid}</p>
          <p><strong>URI:</strong> ipfs://{cid}</p>
          <button onClick={handleCopy}>📋 Copy CID</button>
        </div>
      )}
    </div>
  );
}

export default NFTSubmited;
