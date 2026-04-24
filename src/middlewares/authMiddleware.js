const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE: verifyToken
// Se ejecuta ANTES del handler de cualquier ruta protegida.
// Lee el token del header "Authorization: Bearer <token>", lo verifica
// y si es válido, guarda los datos del usuario en req.user para usarlos después.
// ─────────────────────────────────────────────────────────────────────────────
function verifyToken(req, res, next) {
    // 1. Leer el header Authorization (viene como "Bearer eyJ...")
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ msg: "Token requerido" });
    }

    // 2. Separar "Bearer" del token real
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: "Formato de token inválido" });
    }

    try {
        // 3. Verificar que el token sea auténtico y no haya expirado
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Guardar los datos del usuario en req.user para la siguiente función
        req.user = decoded;

        // 5. Llamar a next() para continuar al handler de la ruta
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
}

module.exports = verifyToken;
