const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

module.exports = {

    // Method untuk menambahkan user baru beserta dengan profilnya
    registerUser: async (req, res) => {

        // Hashkan password
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

    // Menampilkan daftar users dan juga profilenya 
    getUsers: async (req, res) => {
        try {
            const users = await prisma.users.findMany({
                include: {
                    profile: true,
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

    // Method untuk menampilkan detail informasi user, bank_account dan profilnya berdasarkan ID
    getUserDetails: async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
    
            if (isNaN(userId)) {
                return res.status(400).json({
                    error: "Format ID pengguna tidak valid"
                });
            }
    
            const user = await prisma.users.findUnique({
                where: {
                    id: userId
                },
                include: {
                    profile: true,
                    bank_accounts: {
                        include: {
                            source_transactions: {
                                select: {
                                    id: true,
                                    destination_account_id: true,
                                    amount: true
                                }
                            },
                            destination_transactions: {
                                select: {
                                    id: true,
                                    source_account_id: true,
                                    amount: true
                                }
                            }
                        }
                    }
                }
            });
    
            if (!user) {
                return res.status(404).json({
                    error: "User tidak ditemukan :("
                });
            }
    
            // Convert BigInt values to string for each bank account and its transactions
            const modifiedUser = {
                ...user,
                bank_accounts: user.bank_accounts.map(account => ({
                    ...account,
                    balance: account.balance.toString(),
                    source_transactions: account.source_transactions.map(trans => ({
                        ...trans,
                        amount: trans.amount.toString()
                    })),
                    destination_transactions: account.destination_transactions.map(trans => ({
                        ...trans,
                        amount: trans.amount.toString()
                    }))
                }))
            };
    
            return res.json({
                data: modifiedUser
            });
            
        } catch (error) {
            console.error(error); 
            return res.status(500).json({
                error: "Error saat mengambil detail user :(",
                detailedError: error.message 
            });
        }
    }
    
}