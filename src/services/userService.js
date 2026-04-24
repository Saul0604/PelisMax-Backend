const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        });

        await user.save();
        return user;
    }

    async login(email, password) {
        // 1. Buscar al usuario por email
        const user = await User.findOne({ email });
        if (!user) throw new Error("Usuario no encontrado");

        // 2. Comparar la contraseña ingresada con el hash guardado en BD
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Contraseña incorrecta");

        // 3. Crear el payload: la info que viajará DENTRO del token
        //    (no pongas la contraseña aquí, eso sería un error de seguridad)
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
        };

        // 4. Firmar el token con la clave secreta del .env
        //    expiresIn: '7d' significa que el token dura 7 días
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        // 5. Retornar el token junto con los datos básicos del usuario
        return {
            token,
            user: { id: user._id, name: user.name, email: user.email },
        };
    }
}

module.exports = UserService;