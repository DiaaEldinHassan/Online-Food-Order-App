import { Types} from "mongoose";

export interface IUserLog {
  email: string;
  password: string;
}

export interface IPhone {
  iv: string;
  encryptedData: string;
}

export interface IUser extends IUserLog {
   _id?:Types.ObjectId;
  username: string;
  bio?: string | null;
  profilePicture?: string | null;
  phone?: IPhone[] | null;
  DOB: Date;
}

export interface IUserSignInReturn
{
      message:string;
      accessToken:string;
      refreshToken:string;
      role:string;
      statusCode:number;
}

export interface IUserSignUpInput  {
  phone?: string;
  _id?:Types.ObjectId;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
  profilePicture?: string | null;
  DOB?: Date;
  address:string;
}