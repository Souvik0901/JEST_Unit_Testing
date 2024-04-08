const ResponseObjectClass = require('../helpers/ResponseObject');

const newResponseObject = new ResponseObjectClass();
const Users = require('../models/user');

const getUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await Users.findOne({ _id: userId });
    if (!user) {
      return res.send(
        newResponseObject.create({
          code: 401,
          success: true,
          message: 'user does not exists',
        }),
      );
    }
    return res.send(
      newResponseObject.create({
        code: 200,
        success: true,
        userDetails: user,
        message: 'user details fetched successfully',
      }),
    );
  } catch (err) {
    return res.send(
      newResponseObject.create({
        code: 500,
        success: false,
        message: 'Error during login',
        error: err.message,
      }),
    );
  }
};

const getAllInstructors = async (req, res) => {
  const search = req.query.search || '';
  const query = {
    name: { $regex: search, $options: 'i' },
  };
  try {
    const { userId } = req.user;
    const instructors = await Users.find({ userId, usertype: 'instructor', ...query });
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const startIndex = (page - 1) * limit;
    const lastIndex = page * limit;
    const results = {};
    results.totalInstructors = instructors.length;
    results.pageCount = Math.ceil(instructors.length / limit);
    if (lastIndex < instructors.length) {
      results.next = {
        page: page + 1,
      };
    }
    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
      };
    }
    results.result = instructors.slice(startIndex, lastIndex);
    if (!instructors || instructors.length === 0) {
      return res.send(
        newResponseObject.create({
          code: 200,
          success: false,
          message: 'No Instructors Found',
          data: {},
        }),
      );
    }

    return res.send(
      newResponseObject.create({
        code: 200,
        success: true,
        message: 'Fetching all instructors',
        ...results,
      }),
    );
  } catch (err) {
    return res.send(
      newResponseObject.create({
        code: 500,
        success: false,
        message: 'Error retrieving instructors',
        error: err.message,
      }),
    );
  }
};

module.exports = { getUser, getAllInstructors };
