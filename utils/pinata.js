const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const uploadToIPFS = async (filePath) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const data = new FormData();

  data.append('file', fs.createReadStream(filePath), {
    filename: 'firma.png',
    contentType: 'image/png'
  });

  try {
    const res = await axios.post(url, data, {
      maxBodyLength: 'Infinity',
      headers: {
        ...data.getHeaders(),
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    });

    return res.data.IpfsHash;
  } catch (error) {
    console.error('Error al subir a IPFS:', error.message);
    throw new Error('No se pudo subir la imagen a IPFS');
  }
};

module.exports = { uploadToIPFS };
