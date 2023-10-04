const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

module.exports = {

    // Method untuk menambahkan user baru beserta dengan profilnya
    registerUser: async (req, res) => {

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = await prisma.users.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
        })

        const profile = await prisma.profiles.create({
            data: {
                identity_number: req.body.identity_number,
                identity_type: req.body.identity_type,
                address: req.body.address,
                user: {
                    connect: { id:user.id }
                }
            }
        })

        return res.json({
            data: profile
        })
    },

    // Menampilkan daftar users
    getUsers: async (req, res) => {
        try {
            const users = await prisma.users.findMany({
                include: {
                    profile: true
                }
            });

            return res.json({
                data: users
            });
        } catch (error) {
            return res.status(500).json({
                error: "Error saat mengambil detail user :("
            });
        }
    },

    // Method untuk menampilkan detail informasi user dan profilnya berdasarkan ID
    getUserDetails: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await prisma.users.findUnique({
                where: {
                    id: parseInt(userId)
                },
                include: {
                    profile: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    error: "User tidak ditemukan :("
                });
            }

            return res.json({
                data: user
            });
        } catch (error) {
            return res.status(500).json({
                error: "Error saat mengambil detail user :("
            });
        }
    }
}