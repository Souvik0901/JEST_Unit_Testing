import request from 'supertest';
import app from '../../config/server';
import Users from '../models/user';
import {verifytoken} from '../middleware/authenticateUser'; 

jest.mock('../models/user');
jest.mock('../middleware/authenticateUser', () =>({
  verifytoken: jest.fn(),
}))

describe('GET,removeuser', () => {
  it('should return account deleted successfully', async() => {
    verifytoken.mockImplementation((req, res, next) => {
      req.user = {userId: '1739303dhdk922n'};
      next();
    });
    const req = {
      body: {
        _id: 'userid',
      },
    };
    const mockedUser = {
      _id: 'user_id',
    };
    Users.deleteOne = jest.fn().mockResolvedValue(mockedUser);
    const response = await request(app)
      .get('/node/api/core/removeuser')
      .set('Accept', 'application/json')
      .send({_id:'userid'})
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Account Deleted Sucessfully');
  });

  it('should return error in deleting account', async() => { 
    verifytoken.mockImplementation((req, res, next) => {
      req.user ={userId: 'ch373uih74399ee9e'} ;
      next();
    });
    Users.deleteOne.mockRejectedValue(new Error('Mocked internal server error'));
    const response = await request(app)
      .get('/node/api/core/removeuser')
      .set('Accept', 'application/json')
      .send({_id:'userid'})
      .expect('Content-Type', /json/)
      .expect(200);
      
     expect(response.body).toHaveProperty('success', false);
     expect(response.body).toHaveProperty('message', 'Error in deleting Account');
  });
  
});
