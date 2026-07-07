const mongoose = require('mongoose');

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
    }catch(e){
        console.error("error occured " , e.message);
    }
}

module.exports = connectDB;