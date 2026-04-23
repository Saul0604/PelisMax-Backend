const User = require("../models/Users");
const bcrypt = require("bcryptjs");

class UserService {

    async register(name, email, password) {
        if (!name || !email || !password) {
            throw new Error("Todos los campos son obligatorios");
        }

        const exists = await User.findOne({ email });
        if (exists) {
            throw new Error("El usuario ya existe");
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashPassword
        })

        await user.save();
        return user;

    }
}

module.exports = UserService;