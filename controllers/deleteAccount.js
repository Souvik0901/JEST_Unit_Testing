const Users = require('../models/user');
const ResponseObjectClass = require('../helpers/ResponseObject');

const newResponseObject = new ResponseObjectClass();

const removeUser = async (req, res) => {
  const { userId } = req.user;
  try {
    const result = await Users.deleteOne({ _id: userId });
    return res.send(
      newResponseObject.create({
        code: 200,
        success: true,
        message: 'Account Deleted Sucessfully',
        data: result,
      }),
    );
  } catch (error) {
    return res.send(
      newResponseObject.create({
        code: 500,
        success: false,
        message: 'Error in deleting Account',
        error: error.message,
      }),
    );
  }
};

module.exports = { removeUser };
