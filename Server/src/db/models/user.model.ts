import mongoose from "mongoose";
import { hashing } from "../../common";

const phoneSchema=new mongoose.Schema({
    iv:{
        type:String,
        required:true
    },
    encryptedData:{
        type:String,
        required:true,
        length:11
    }
})

export const AddressSchema = new mongoose.Schema({
  title: { type: String, default: 'Home' }, 
  street: String,
  city: String,
  zipCode: String,
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  phone: [phoneSchema],
  role: { type: String, enum: ['customer', 'admin', 'driver'], default: 'customer' },
  addresses: [AddressSchema],
  profilePic: { type: String, default: "" }
}, { timestamps: true, optimisticConcurrency:true });

UserSchema.pre("save",async function(){
    if(!this.isModified("password") || !this.password) return ;
    this.password= await hashing(this.password);
})
 
export const User = mongoose.model('User', UserSchema);
