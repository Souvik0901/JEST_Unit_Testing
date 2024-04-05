import request from 'supertest';
import app from '../../config/server'; 
import Users from '../models/user'; 
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs'; 
import UserSession from '../models/userSession';

jest.mock('bcryptjs'); 
jest.mock('jsonwebtoken'); 
jest.mock('../models/user'); 
jest.mock('../models/userSession');



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
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123', 
        },
      };

      const mockedUser = {
        _id: 'user_id',
        email: 'test@example.com',
        password: 'hashedPassword123', 
      };

      // Mocking the user found in the database
      Users.findOne = jest.fn().mockResolvedValue(mockedUser);

      // Mocking the bcrypt compare function to always return false
      bcrypt.compare.mockResolvedValue(false);

      const res = {
        send: jest.fn(),
      };

      const response = await request(app)
        .post('/node/api/core/login')
        .send(req.body)
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
          password: 'password123', 
        },
      };

      const mockedUser = {
        _id: 'user_id',
        email: 'test@example.com',
        password: 'hashedPassword123', 
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



describe('POST signup', () => {
    // Test when user does not exist
    it('should return 200  when user exist', async () => {
      Users.findOne.mockResolvedValue(!null);
  
      const response = await request(app)
        .post('/node/api/core/signup')
        .send({name:'some name', email: 'nonexistent@example.com', password: 'somepassword', usertype: 'student' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Users already exists');
    });

      
    // Test user added successfully
    it('should return user added successfully', async () => {
    // Define test data
        const userData = {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          usertype: 'student',
        };

        // Mock the Users.findOne method to return null, indicating user does not exist
        Users.findOne.mockResolvedValue(null);

        // Mock the bcrypt.hash function to return a hashed password
        bcrypt.hash.mockResolvedValue('hashedPassword');

        // Mock the Users model save method to resolve successfully
        Users.prototype.save.mockResolvedValue();

        // Mock the jwt.sign function to return a mock token
        jwt.sign.mockReturnValue('mockedToken');

        const response = await request(app)
          .post('/node/api/core/signup')
          .send(userData)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Users added successfully');

    });

    // Test internal server error
    it('should return 500 Internal Server Error', async () => {
      // Mocking findOne method to throw an error
      Users.findOne.mockRejectedValue(new Error('Mocked internal server error'));
  
      const response = await request(app)
        .post('/node/api/core/signup')
        .send({ email: 'example@example.com', password: 'correctpassword' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Error adding new Users');
  
    });

})



describe('POST logout', ()=>{

    // Test successful logout
    it('should return success logging out', async () => {
      // Mock request body
      const req = {
        body: {
          token: 'mockedToken',
        },
      };

      // Mock UserSession.deleteOne to resolve successfully
      UserSession.deleteOne = jest.fn().mockResolvedValue();

      const response = await request(app)
        .post('/node/api/core/logout')
        .send({ token: 'mockedToken' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User Logged out successfully');
    });

    // Test internal server error
    it('should return error logging out', async () => {
      // Mock request body
      const req = {
        body: {
          token: 'mockedToken',
        },
      };

      // Mock UserSession.deleteOne to reject with an error
      UserSession.deleteOne = jest.fn().mockRejectedValue(new Error('Mocked logout error'));

      const response = await request(app)
        .post('/node/api/core/logout')
        .send({ token: 'mockedToken' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Error Logging out the user');
    });
})


