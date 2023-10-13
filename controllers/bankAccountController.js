const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    createAccount: async (req, res) => {
        try {
            const account = await prisma.bank_accounts.create({
                data: {
                    bank_name: req.body.bank_name,
                    bank_account_number: req.body.bank_account_number,
                    balance: BigInt(req.body.balance),
                    user_id: req.body.user_id
                }
            });

            return res.status(201).json({
                ...account,
                balance: account.balance.toString()
            });

        } catch (error) {
            if (error.code && error.code === 'P2002') {
                return res.status(409).json({
                    error: "The provided data violates a unique constraint. Ensure bank_account_number is unique."
                });
            }

            return res.status(500).json({
                error: `Terjadi error ketika menambahkan akun: ${error.message}`
            });
        }
    },

    listAccounts: async (req, res) => {
        try {
            const accounts = await prisma.bank_accounts.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    source_transactions: true,
                    destination_transactions: true
                }
            });
    
            const modifiedAccounts = accounts.map(account => ({
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
            }));
    
            return res.json({
                data: modifiedAccounts
            });
    
        } catch (error) {
            console.error(error); 
            return res.status(500).json({
                error: "Error fetching accounts :(",
                detailedError: error.message 
            });
        }
    },

    getAccountDetail: async (req, res) => {
        try {
            const accountId = parseInt(req.params.id);
    
            if (isNaN(accountId)) {
                return res.status(400).json({
                    error: "Invalid account ID format"
                });
            }
    
            const account = await prisma.bank_accounts.findUnique({
                where: {
                    id: accountId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
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
            });
    
            if (!account) {
                return res.status(404).json({
                    error: "Account not found :("
                });
            }
    
            // Convert BigInt values to string
            const modifiedAccount = {
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
            };
    
            return res.json({
                data: modifiedAccount
            });
    
        } catch (error) {
            console.error(error); 
            return res.status(500).json({
                error: "Error fetching account details :(",
                detailedError: error.message 
            });
        }
    }
    
};
