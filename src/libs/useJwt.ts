import * as jwt from 'jsonwebtoken';

const useJwt = () => {
  const verifyToken = (token: string) => {
    try {
      return jwt.verify(token, process.env.SECRET_KEY);
    } catch (e) {
      return null;
    }
  };

  const createAccessToken = (payload: any, options?: jwt.SignOptions) => {
    return jwt.sign(payload, process.env.SECRET_KEY, {
      ...options,
      expiresIn: '1h',
    });
  };

  const createRefreshToken = (options?: jwt.SignOptions) => {
    return jwt.sign({}, process.env.SECRET_KEY, {
      ...options,
      expiresIn: '14d',
    });
  };

  return {
    createAccessToken,
    createRefreshToken,
    verifyToken,
  };
};

export default useJwt;
