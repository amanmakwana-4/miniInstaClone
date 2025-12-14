import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Provide a username is small charcters only'],
        unique: true,
        trim: true,
        minlength: [3, 'minimum username length is 3 charcters'],
        maxlength: [30, 'max username length is 29 characters']
    },
    email: {
        type: String,
        required: [true, 'provide email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio maxlength is 150 characters'],
        default: ''
    },
    profilePicture: {
        type: String,
        default: 'https://via.placeholder.com/150'
    }
}, {
    timestamps: true
});
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};
const User = mongoose.model('User', userSchema);
export default User;
