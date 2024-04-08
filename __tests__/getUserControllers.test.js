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




describe('GET, getinstructorsdata', () => {
  it('should return no instructors found', async() => {
    Users.find.mockResolvedValue([]); 
    verifytoken.mockImplementation((req, res, next) => {
      req.user = { userId: '1739303dhdk922n' };
      next();
    });

    const response = await request(app)
      .get('/node/api/core/getinstructorsdata')
      .set('Accept', 'application/json')
      .send({ userId: '1739303dhdk922n', usertype: 'instructor' })
      .expect('Content-Type', /json/)
      .expect(200);


    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'No Instructors Found');
  });


  it('should return fetching all instructors', async() => {
    const mockedInstructors = [
      { name: 'Instructor 1', userId: '1', usertype: 'instructor' },
      { name: 'Instructor 2', userId: '2', usertype: 'instructor' },
    ];
    Users.find.mockResolvedValue(mockedInstructors);
    verifytoken.mockImplementation((req, res, next) => {
      req.user = { userId: '1739303dhdk922n' };
      next();
    });

    const response = await request(app)
      .get('/node/api/core/getinstructorsdata')
      .set('Accept', 'application/json')
      .send({ userId: '1739303dhdk922n', usertype: 'instructor' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Fetching all instructors');
  });

  
  it('should return error retrieving instructors', async() => {
    Users.find.mockRejectedValue(new Error('Mocked error retrieving instructors'));
    verifytoken.mockImplementation((req, res, next) => {
      req.user = { userId: '1739303dhdk922n' };
      next();
    });

    const response = await request(app)
      .get('/node/api/core/getinstructorsdata')
      .set('Accept', 'application/json')
      .send({ userId: '1739303dhdk922n', usertype: 'instructor' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Error retrieving instructors');
    expect(response.body).toHaveProperty('error', 'Mocked error retrieving instructors');
  });
});
