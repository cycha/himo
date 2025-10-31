import { User, IUser } from '@himo/commons';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password').exec();
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async create(userData: { email: string; password: string }): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, userData, { new: true })
      .select('-password')
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async exists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email }).exec();
    return count > 0;
  }

  async count(): Promise<number> {
    return User.countDocuments().exec();
  }
}

export const userRepository = new UserRepository();
