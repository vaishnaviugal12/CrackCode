import mongoose from "mongoose";


export async function main(){

await mongoose.connect(process.env.DB_CONNECT_STRING )
.then(() => console.log('Connected!'))
.catch((err) => console.log(" Connection failed", err));
}
    



