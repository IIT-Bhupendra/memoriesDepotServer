import jwt, { decode } from "jsonwebtoken";

// How middlewares works
// if you click upon a like button => auth middleware() => like controller...

const auth = async (req, res, next) => {
  try {
    console.log(req.headers);
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;

    let decodedData;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, "SECRET_STRING");
      req.userId = decodedData?.id;
      console.log(decodedData);
    } else {
      decodedData = decode(token);
      req.userId = decodedData?.sub;
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

export default auth;
