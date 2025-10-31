export interface SignupDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  created_at?: Date;
}

export interface AuthResponseDto {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    token: string;
  };
}

export interface ProfileResponseDto {
  success: boolean;
  data: UserResponseDto;
}
