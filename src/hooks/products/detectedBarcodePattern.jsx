// import Quagga from 'quagga';
// export const detectBarcodePattern = (imageData) => {
//     return new Promise((resolve, reject) => {
//         Quagga.decodeSingle({
//             decoder: {
//                 readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"], // Puedes ajustar los lectores según tus necesidades
//             },
//             locate: true, // Intenta localizar el código de barras en la imagen
//             src: imageData // La imagen que se va a analizar
//         }, (result) => {
//             if (result && result.codeResult && result.codeResult.code) {
//                 resolve(result.codeResult.code); // Devuelve el código de barras detectado
//             } else {
//                 reject(new Error('No se detectó ningún código de barras'));
//             }
//         });
//     });
// };