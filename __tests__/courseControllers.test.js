import request from 'supertest';
import app from '../../config/server';
import Courses from '../models/courses';
import { verifytoken } from '../middleware/authenticateUser';
import { uploadFileToS3 } from '../helpers/s3Client';
import fs from 'fs';


jest.mock('../models/user');
jest.mock('../models/courses');
jest.mock('../middleware/authenticateUser', () => ({
  verifytoken: jest.fn(),
}));
jest.mock('../helpers/s3Client', () => ({
  uploadFileToS3: jest.fn(),
}));


describe('POST createCourseWithImage', () => {
  it('should return course creation successful', async () => {
    verifytoken.mockImplementation((req, res, next) => {
      req.user = { userId: '1739303dhdk922n' };
      next();
    });
    const req = {
      body: {
        courseTitle: 'RandomCourse',
        shortDescrp: 'descrp',
        longDescrp: 'long descrp',
        courseCategory: 'IT',
        courseLevel: 'advance',
        courseLanguage: 'english',
        lectures: 7,
        price: 10,
        period: 3,
        purchaseDate: 'date',
        videoLink: 'videolink',
      },
      file: {
        originalname: 'Weather.jpg',
        buffer: Buffer.from('dummyImageBuffer'),
        mimetype: 'image/jpeg',
      },
    };
    const imageUrl = `https://example.com/${req.file.originalname}`;
    uploadFileToS3.mockResolvedValue(imageUrl);

    const mockedCourse = {
      courseImage: imageUrl,
      courseTitle: req.body.courseTitle,
      shortDescrp: req.body.shortDescrp,
      longDescrp: req.body.longDescrp,
      courseCategory: req.body.courseCategory,
      courseLevel: req.body.courseLevel,
      courseLanguage: req.body.courseLanguage,
      lectures: req.body.lectures,
      price: req.body.price,
      period: req.body.period,
      purchaseDate: req.body.purchaseDate,
      videoLink: req.body.videoLink,
    }

    // Mocking the scenario where course is successfully added
    const newcourse = {
      _id: 'mockedcourseId',
      ...mockedCourse,
      save: jest.fn().mockResolvedValue(),
    };

    // Mocking the Courses constructor to return newcourse
    Courses.mockImplementation(() => newcourse);    

    const response = await request(app)
      .post('/node/api/core/createcoursewithimage')
      .set('Content-Type', 'multipart/form-data')
      .attach('courseImage', fs.readFileSync(__dirname + '/Weather.jpg'), 'Weather.jpg')
      .field('courseTitle', mockedCourse.courseTitle)
      .field('shortDescrp', mockedCourse.shortDescrp)
      .field('longDescrp', mockedCourse.longDescrp)
      .field('courseCategory', mockedCourse.courseCategory)
      .field('courseLevel', mockedCourse.courseLevel)
      .field('courseLanguage', mockedCourse.courseLanguage)
      .field('lectures', mockedCourse.lectures)
      .field('price', mockedCourse.price)
      .field('period', mockedCourse.period)
      .field('purchaseDate', mockedCourse.purchaseDate)
      .field('videoLink', mockedCourse.videoLink)
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(response.body);
  });
});

