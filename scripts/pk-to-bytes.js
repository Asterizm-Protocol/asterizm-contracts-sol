const fs = require('fs');
const bs58 = require('bs58');

const privKeyBase58 = "PLACE_FOR_PK";

try {
    const bytes = bs58.decode(privKeyBase58);
    if (bytes.length !== 64) {
        console.error("Wrong key length? 64 bytes needed");
    } else {
        const arr = [...bytes];
        console.log(arr);
    }
} catch (e) {
    console.error('Error Base58:', e);
}
