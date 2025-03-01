import * as bcrypt from 'bcrypt';

/**
 *
 * @param password password in payload
 * @param hashedPassword password in database
 * @returns boolean
 */
const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
};

export default comparePassword;
