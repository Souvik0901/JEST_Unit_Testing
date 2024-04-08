import request from 'supertest';
import app from '../../config/server';
import Users from '../models/user';
import {verifytoken} from '../middleware/authenticateUser'; 

jest.mock('../models/user');
jest.mock('../middleware/authenticateUser', () =>({
  verifytoken: jest.fn(),
}))



describe('GET, getuserdata', ()=>{
  it('should return user doesnot exist', async () => {
    Users.findOne.mockResolvedValue(null); 
    verifytoken.mockImplementation((req, res, next) => {
      req.user = {userId: '1739303dhdk922n'};
      next();
    });

    const response = await request(app)
      .get('/node/api/core/getuserdata')
      .set('Accept', 'application/json')
      .send({_id:'userid'})
      .expect('Content-Type', /json/)
      .expect(200);
     
     expect(response.body).toHaveProperty('success', true);
     expect(response.body).toHaveProperty('message', 'user does not exists');
  });



  it('should return user exist and user details', async () => {
    const req = {
      body: {
        _id: 'userid',
      },
    };
    const mockedUser = {
      _id: 'user_id',
    };
    Users.findOne = jest.fn().mockResolvedValue(mockedUser);
    verifytoken.mockImplementation((req, res, next) => {
      req.user = {userId: '1739303dhdk922n'};
      next();
    });

    const response = await request(app)
      .get('/node/api/core/getuserdata')
      .set('Accept', 'application/json')
      .send({_id:'userid'})
      .expect('Content-Type', /json/)
      .expect(200);
     
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'user details fetched successfully');
  });
  


  it('should return internal server error', async () => {
    Users.findOne.mockRejectedValue(new Error('Mocked internal server error'));
    verifytoken.mockImplementation((req, res, next) => {
      req.user;
      next();
    });

    const response = await request(app)
      .get('/node/api/core/getuserdata')
      .set('Accept', 'application/json')
      .send({_id:'userid'})
      .expect('Content-Type', /json/)
      .expect(200);
      
     expect(response.body).toHaveProperty('success', false);
     expect(response.body).toHaveProperty('message', 'Error during login');
  });
})
