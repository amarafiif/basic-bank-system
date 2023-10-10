const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    createTransaction: async (req, res) => {
        try {
            const { source_account_id, destination_account_id, amount } = req.body;
    
            const result = await prisma.$transaction([
                prisma.bank_accounts.update({
                    where: { id: source_account_id },
                    data: { balance: { decrement: amount } },
                }),
                prisma.bank_accounts.update({
                    where: { id: destination_account_id },
                    data: { balance: { increment: amount } },
                }),
                prisma.bank_account_transactions.create({
                    data: {
                        source_account_id,
                        destination_account_id,
                        amount,
                    },
                }),
            ]);

            // Convert BigInt to string for serialization
            result[2].amount = result[2].amount.toString();
    
            res.status(201).json({ message: "Transaction successful", transaction: result[2] });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    listTransactions: async (req, res) => {
        try {
            const transactions = await prisma.bank_account_transactions.findMany({
                include: {
                    source_account: {
                        select: { user: { select: { name: true, email: true } } },
                    },
                    destination_account: {
                        select: { user: { select: { name: true, email: true } } },
                    },
                },
            });

            // Convert BigInt to string for serialization
            transactions.forEach(transaction => {
                transaction.amount = transaction.amount.toString();
            });
    
            res.json(transactions);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    getTransactionDetails: async (req, res) => {
        try {
            const transactionId = parseInt(req.params.transaction, 10);
    
            const transaction = await prisma.bank_account_transactions.findUnique({
                where: { id: transactionId },
                include: {
                    source_account: {
                        select: { user: { select: { name: true, email: true } } },
                    },
                    destination_account: {
                        select: { user: { select: { name: true, email: true } } },
                    },
                },
            });
    
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            // Convert BigInt to string for serialization
            transaction.amount = transaction.amount.toString();
    
            res.json(transaction);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    
}
