import bcrypt from "bcryptjs"

export const saltAndHashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10)
}