const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            retryReads: true,
            family: 4
        };

        await mongoose.connect(config.mongodb.uri, options);

        mongoose.connection.on('error', (err) => {
            console.error('Erro na conexão com o MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB desconectado');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconectado');
        });

        console.log('MongoDB conectado com sucesso');
    } catch (error) {
        console.error('Erro ao conectar com o MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB; 