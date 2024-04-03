const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ResponseObjectClass = require('../helpers/ResponseObject');

const newResponseObject = new ResponseObjectClass();
const Users = require('../models/user');
const UserSession = require('../models/userSession');



const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.send(
        newResponseObject.create({
          code: 401,
          success: true,
          message: 'user does not exists',
        }),
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.send(
        newResponseObject.create({
          code: 401,
          success: false,
          message: 'Invalid password*',
        }),
      );
    }

    const { JWT_SECRET } = process.env;
    const newToken = jwt.sign({ userId: user._id, userEmail: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const newSession = new UserSession({
      userId: user._id,
      accessToken: newToken,
      accessTokenExpiry: '7d',
    });
    await newSession.save();

    return res.send(
      newResponseObject.create({
        code: 200,
        success: true,
        message: 'Login successful',
        data: user,
        userToken: newToken,
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




const signup = async (req, res) => {
  try {
    const { name, email, password, usertype } = req.body;
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.send(
        newResponseObject.create({
          code: 401,
          success: true,
          message: 'Users already exists',
        }),
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newuser = new Users({
      name,
      email,
      password: hashedPassword,
      usertype,
    });
    await newuser.save();
    const token = jwt.sign(
      { userId: newuser._id, userEmail: newuser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.send(
      newResponseObject.create({
        code: 200,
        success: true,
        message: 'Users added successfully',
        Users: newuser,
        userToken: token,
      }),
    );
  } catch (err) {
    return res.send(
      newResponseObject.create({
        code: 500,
        success: false,
        message: 'Error adding new Users',
        error: err.message,
      }),
    );
  }
};




const logout = async (req, res) => {
  try {
    const { token } = req.body;
    const result = await UserSession.deleteOne({ accessToken: token });
    return res.send(
      newResponseObject.create({
        code: 200,
        success: true,
        message: 'User Logged out successfully',
        data: result,
      }),
    );
  } catch (err) {
    return res.send(
      newResponseObject.create({
        code: 500,
        success: false,
        message: 'Error Logging out the user',
        error: err.message,
      }),
    );
  }
};



module.exports = {
  login,
  signup,
  logout,
};
