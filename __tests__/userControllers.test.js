import request from 'supertest';
import app from '../../config/server'; // Assuming this imports your Express app
import Users from '../models/user'; // Import the Users model
import jwt from 'jsonwebtoken'; // Import jsonwebtoken package
import bcrypt from 'bcryptjs'; // Import bcrypt package
import UserSession from '../models/userSession';

jest.mock('bcryptjs'); // Mock bcrypt
jest.mock('jsonwebtoken'); // Mock jsonwebtoken
jest.mock('../models/user'); // Mock the Users model



describe('POST login', () => {

  // Test when user does not exist
  it('should return 200 Unauthorized when user does not exist', async () => {
    Users.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/node/api/core/login')
      .send({ email: 'nonexistent@example.com', password: 'somepassword' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'user does not exists');
  });



  // Test when invalid password is provided
  it('should return 200 Unauthorized when invalid password is provided', async () => {
    Users.findOne.mockResolvedValue({
      _id: 'someuserid',
      email: 'example@example.com',
      password: '$2a$10$mockedhash', // Mocked hashed password
    });

    bcrypt.compare.mockReturnValue(false);

    const response = await request(app)
      .post('/node/api/core/login')
      .send({ email: 'example@example.com', password: 'wrongpassword' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid password*');
  });





  // Test successful login
  it('should login successfully', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        password: 'password123', // Mocking the password
      },
    };

    const mockedUser = {
      _id: 'user_id',
      email: 'test@example.com',
      password: 'hashedPassword123', // Mocked hashed password
    };

    // Mocking the user found in the database
    Users.findOne = jest.fn().mockResolvedValue(mockedUser);

    // Mocking the bcrypt compare function to always return true
    bcrypt.compare.mockResolvedValue(true);

    // Mocking the JWT sign function
    jwt.sign = jest.fn().mockReturnValue('mockedToken');

    // Mocking the UserSession save function
    UserSession.prototype.save = jest.fn();

    const res = {
      send: jest.fn(),
    };

    const response = await request(app)
      .post('/node/api/core/login')
      .send(req.body)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('message', 'Login successful');
  });



  // Test internal server error
  it('should return 500 Internal Server Error', async () => {
  // Mocking findOne method to throw an error
  Users.findOne.mockRejectedValue(new Error('Mocked internal server error'));

  const response = await request(app)
    .post('/node/api/core/login')
    .send({ email: 'example@example.com', password: 'correctpassword' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message', 'Error during login');
  });

});
