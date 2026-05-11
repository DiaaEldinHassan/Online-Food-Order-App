import { User } from "../../db/models";
import { BadRequestError, NotFoundError, decrypt, uploadToS3 } from "../../common";

class ProfileService {
  async getProfile(userId: string) {
    try {
      const user = await User.findById(userId).select("-password");
      if (!user) throw new NotFoundError("User");

      const decryptedPhones = user.phone?.length ? decrypt(user.phone as any) : [];

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phones: decryptedPhones,
        addresses: user.addresses,
        profilePic: user.profilePic,
        createdAt: (user as any).createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to fetch profile");
    }
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; password?: string; address?: object }) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new NotFoundError("User");

      if (data.name) user.name = data.name;
      if (data.email) user.email = data.email;
      if (data.password) user.password = data.password;
      if (data.address) (user.addresses as any).push(data.address);

      await user.save();

      return { message: "Profile updated successfully" };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to update profile");
    }
  }

  async uploadProfilePic(userId: string, file: Express.Multer.File) {
    try {
      const url = await uploadToS3(file);

      const user = await User.findByIdAndUpdate(
        userId,
        { profilePic: url },
        { new: true }
      ).select("-password");

      if (!user) throw new NotFoundError("User");

      return { profilePic: user.profilePic };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to upload profile picture");
    }
  }
}

export const profileService = new ProfileService();
