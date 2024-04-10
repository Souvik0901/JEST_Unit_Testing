import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../../config/server';
import Users from '../models/user';
import UserSession from '../models/userSession';


jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/user');
jest.mock('../models/userSession');



describe('POST login', () => {

  it('should return Unauthorized when user does not exist', async () => {
    Users.findOne.mockResolvedValue(null);
    const response = await request(app)
      .post('/node/api/core/login')
      .send({ email: 'nonexistent@example.com', password: 'somepassword' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body)
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'user does not exists');
  });


  it('should return Unauthorized when invalid password is provided', async () => {
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
    Users.findOne = jest.fn().mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(false);
    const response = await request(app)
      .post('/node/api/core/login')
      .send(req.body)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body)
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Invalid password*');
  });


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
    Users.findOne = jest.fn().mockResolvedValue(mockedUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValue('mockedToken');
    UserSession.prototype.save = jest.fn();
    const response = await request(app)
      .post('/node/api/core/login')
      .send(req.body)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body)
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Login successful');
  });


  it('should return 500 Internal Server Error', async () => {
    Users.findOne.mockRejectedValue(new Error('Mocked internal server error'));
    const response = await request(app)
      .post('/node/api/core/login')
      .send({ email: 'example@example.com', password: 'correctpassword' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body)
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Error during login');
  });
});






describe('POST signup', () => {

  it('should return user exist', async () => {
    Users.findOne.mockResolvedValue(!null);
    const response = await request(app)
      .post('/node/api/core/signup')
      .send({
        name: 'some name',
        email: 'nonexistent@example.com',
        password: 'somepassword',
        usertype: 'student',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body)
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Users already exists');
  });

  it('should return user added successfully', async () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        usertype: 'student',
      },
    };
  
    // Mocking the scenario where user does not exist
    Users.findOne.mockResolvedValue(null);

    // Mocking the scenario where user is successfully added
    const newuser = {
      _id: 'mockedUserId',
      ...req.body,
      save: jest.fn().mockResolvedValue(),
    };

    // Mocking the Users constructor to return newuser
    Users.mockImplementation(() => newuser);
 
    // Mocking bcrypt and jwt
    bcrypt.hash.mockResolvedValue('hashedPassword');
    jwt.sign.mockReturnValue('mockedToken');
  
    const response = await request(app)
      .post('/node/api/core/signup')
      .send(req.body)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  
    console.log(response.body);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Users added successfully');
  });
  

  it('should return 500 Internal Server Error', async () => {
    Users.findOne.mockRejectedValue(new Error('Mocked internal server error'));
    const response = await request(app)
      .post('/node/api/core/signup')
      .send({ email: 'example@example.com', password: 'correctpassword' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body)
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Error adding new Users');
  });
});






describe('POST logout', () => {
  // Test successful logout
  it('should return success logging out', async () => {
    UserSession.deleteOne = jest.fn().mockResolvedValue({accessToken: 'someaccestoken'});
    const response = await request(app)
      .post('/node/api/core/logout')
      .send({ token: 'mockedToken' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    console.log(response.body)
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'User Logged out successfully');
  });

  
  it('should return error logging out', async () => {
    UserSession.deleteOne = jest.fn().mockRejectedValue(new Error('Mocked logout error'));
    const response = await request(app)
      .post('/node/api/core/logout')
      .send({ token: 'mockedToken' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    console.log(response.body)
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Error Logging out the user');
  });

});

