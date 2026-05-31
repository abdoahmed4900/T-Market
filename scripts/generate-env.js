const fs = require('fs');

const content = `export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env.APIKEY}',
    authDomain: '${process.env.AUTHDOMAIN}',
    projectId: '${process.env.PROJECTID}',
    storageBucket: '${process.env.STORAGEBUCKET}',
    messagingSenderId: '${process.env.MESSAGINGSENDERID}',
    appId: '${process.env.APPID}',
    measurementId: '${process.env.MEASUREMENTID}'
  }
};

export const stripePublicKey = '${process.env.STRIPE_PUBLIC_KEY}';

export const cloudinary = {
  cloudName: 'dghij1dey',
  uploadPreset: 'volt_tech'
};

export const fireStoreCollections = {
  users: 'users',
  brands: 'brands',
  categories: 'categories',
  products: 'products',
  orders: 'orders',
  support: 'support'
};
`;

fs.mkdirSync('src/environments', { recursive: true });
fs.writeFileSync('src/environments/environment.ts', content);

console.log('environment.ts generated');