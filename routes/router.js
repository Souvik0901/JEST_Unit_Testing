/* Importing the express module. */
import express from 'express';
import multer from 'multer';

/* Importing the functions from  controller files. */
import checkConnection from '../controllers/checkConnection';
import userController from '../controllers/userControllers';
import courseControllers from '../controllers/courseControllers';
import getUserControllers from '../controllers/getUserControllers';
import editProfile from '../controllers/editProfile';
import deleteAccount from '../controllers/deleteAccount';
import enrollmentList from '../controllers/enrollmentList';
import cartControllers from '../controllers/cartControllers';
import orderControllers from '../controllers/orderControllers';
import wishlistControllers from '../controllers/wishlistControllers';

/* Importing the functions from middleware files. */
import authenticateUser from '../middleware/authenticateUser';

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(), // Store the file in memory to access buffer
});

/* Creating a new router object. */
const router = express.Router();

router.get('/health-check', checkConnection);
router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/logout', userController.logout);

router.post('/addtocart', authenticateUser.verifytoken, cartControllers.addCartitems);
router.get('/getcartitems', authenticateUser.verifytoken, cartControllers.getCartitems);
router.post('/removecartitems', authenticateUser.verifytoken, cartControllers.removeCartitems);
router.post('/emptycart', authenticateUser.verifytoken, cartControllers.emptyCart);

router.post('/addorders', authenticateUser.verifytoken, orderControllers.addOrderitems);
router.get('/getorderitems', authenticateUser.verifytoken, orderControllers.getOrderitems);
router.get('/gettopcourses', authenticateUser.verifytoken, orderControllers.getTopCourses);
router.get('/getstudentsorder', authenticateUser.verifytoken, orderControllers.getStudentorders);

router.get('/getuserdata', authenticateUser.verifytoken, getUserControllers.getUser);
router.get('/removeuser', authenticateUser.verifytoken, deleteAccount.removeUser);
router.get('/getenrollmentlist', authenticateUser.verifytoken, enrollmentList.getStudentDetails);
router.post('/setenrollmentlist', authenticateUser.verifytoken, enrollmentList.setStudentDetails);
router.post(
  '/updateprofileinfo',
  authenticateUser.verifytoken,
  upload.single('profileImg'),
  editProfile.changeUserdata,
);
router.get(
  '/getinstructorsdata',
  authenticateUser.verifytoken,
  getUserControllers.getAllInstructors,
);

router.post(
  '/createcoursewithimage',
  authenticateUser.verifytoken,
  upload.single('courseImage'),
  courseControllers.createCourseWithImage,
);
router.get('/getcourses', authenticateUser.verifytoken, courseControllers.getCourses);
router.get('/getsinglecourse/:id', authenticateUser.verifytoken, courseControllers.getSingleCourse);
router.get('/paginatedcourses', authenticateUser.verifytoken, courseControllers.paginatedCourses);
router.delete('/deletecourse/:id', authenticateUser.verifytoken, courseControllers.deleteCourse);
router.patch(
  '/updatecourse/:id',
  authenticateUser.verifytoken,
  upload.single('courseImage'),
  courseControllers.updateCourse,
);

router.get(
  '/recentlyview',
  authenticateUser.verifytoken,
  courseControllers.getRecentlyViewedCourses,
);
router.delete(
  '/clearrecentlyview',
  authenticateUser.verifytoken,
  courseControllers.clearAllViewedCourses,
);

router.post('/likedcourse', authenticateUser.verifytoken, wishlistControllers.createLikedCourse);
router.get(
  '/getlikedcourses',
  authenticateUser.verifytoken,
  wishlistControllers.getWishlistCourses,
);
router.delete('/clearwishlisted', authenticateUser.verifytoken, wishlistControllers.clearWishlist);

/* Exporting the router object. */
export default router;
