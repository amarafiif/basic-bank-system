const request = require('supertest');
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let mockUsers = {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => ({ users: mockUsers })),
    };
});
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.post('/auth/register', registerUser);
app.post('/auth/login', loginUser);
app.get('/auth/profile', getProfile);

describe('Auth Controller', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });
    

    test('should register a user', async () => {
        const mockUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            identity_number: '12345678',
            identity_type: 'ID',
            address: 'Test Street 123'
        };

        // Gunakan mockUsers untuk menetapkan nilai mock
        mockUsers.create.mockResolvedValue(mockUser);

        const res = await request(app)
            .post('/auth/register')
            .send(mockUser);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data.email).toBe('test@example.com');
    });

    test('should login a user and return token', async () => {
        const mockUser = {
            email: 'test@example.com',
            password: 'password123',
        };

        const mockDbUser = {
            ...mockUser,
            id: 1
        };

        // Gunakan mockUsers untuk menetapkan nilai mock
        mockUsers.findFirst.mockResolvedValue(mockDbUser);
        bcrypt.compareSync.mockReturnValue(true);
        jwt.sign.mockReturnValue('mocked_token');

        const res = await request(app).post('/auth/login').send(mockUser);
        
        expect(res.status).toBe(200);
        expect(res.body.data.token).toBe('mocked_token');
    });

    test('should return user profile', async () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        };

        // Gunakan mockUsers untuk menetapkan nilai mock
        mockUsers.findUnique.mockResolvedValue(mockUser);

        const res = await request(app).get('/auth/profile');

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe('test@example.com');
    });
});
