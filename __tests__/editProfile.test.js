import request from 'supertest';
import app from '../../config/server';
import Users from '../models/user';
import { verifytoken } from '../middleware/authenticateUser';
import { uploadFileToS3 } from '../helpers/s3Client';

jest.mock('../models/user');
jest.mock('../middleware/authenticateUser', () => ({
  verifytoken: jest.fn(),
}));
jest.mock('../helpers/s3Client', ()=>({
  uploadFileToS3: jest.fn(),
}));






describe('POST, updateprofileinfo', () => {
  it('should return profile data updated successfully', async () => {
    verifytoken.mockImplementation((req, res, next) => {
      req.user = { userId: '1739303dhdk922n' };
      next();
    });
    const req = {
      body: {
        username: 'testUser',
        emailId: 'test@example.com',
        phoneNumber: '1234567890',
        location: 'Test Location',
        abouttxt: 'Test About',
      },
      file: {
        originalname: 'testImage.jpg',
        buffer: Buffer.from('dummyImageBuffer'),
        mimetype: 'image/jpeg',
      },
    };
    const imageUrl = `https://example.com/${req.file.originalname}`;
    uploadFileToS3.mockResolvedValue(imageUrl);


    const mockedUser = {
        name : req.body.username,
        email: req.body.emailId,
        profileImg: imageUrl,
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
        abouttxt:req.body.abouttxt,     
    }
    Users.updateOne  = jest.fn().mockResolvedValue(mockedUser);

    const response = await request(app)
      .post('/node/api/core/updateprofileinfo')
      .set('Content-Type', 'multipart/form-data')
      .attach('profileImg', mockedUser.imageUrl)
      .field('username', mockedUser.name)
      .field('emailId', mockedUser.email)
      .field('phoneNumber', mockedUser.phoneNumber)
      .field('location', mockedUser.location)
      .field('abouttxt', mockedUser.abouttxt)
      .expect('Content-Type', /json/)
      .expect(200);
  
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Profile data updated successfully');
  }); 






  it('should return error in updating users data', async () => {
    verifytoken.mockImplementation((req, res, next) => {
      req.user = { userId: '1739303dhdk922n' };
      next();
    });

    const req = {
      body: {
        username: 'testUser',
        emailId: 'test@example.com',
        phoneNumber: '1234567890',
        location: 'Test Location',
        abouttxt: 'Test About',
      },
      file: {
        originalname: 'testImage.jpg',
        buffer: Buffer.from('dummyImageBuffer'),
        mimetype: 'image/jpeg',
      },
    };
    const imageUrl = `https://example.com/${req.file.originalname}`;
    uploadFileToS3.mockResolvedValue(imageUrl);


    const mockedUser = {
        name : req.body.username,
        email: req.body.emailId,
        profileImg: imageUrl,
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
        abouttxt:req.body.abouttxt,     
    }

    Users.updateOne.mockRejectedValue(new Error('Mocked internal server error'));

    const response = await request(app)
      .post('/node/api/core/updateprofileinfo')
      .set('Content-Type', 'multipart/form-data')
      .attach('profileImg', mockedUser.imageUrl)
      .field('username', mockedUser.name)
      .field('emailId', mockedUser.email)
      .field('phoneNumber', mockedUser.phoneNumber)
      .field('location', mockedUser.location)
      .field('abouttxt', mockedUser.abouttxt)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', 'Error in updating users data');
  });
  
  
});


