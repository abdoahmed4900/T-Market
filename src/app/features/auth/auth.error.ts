export interface AuthError {
  code: number;
  message: string;
  errors : {
    message: string;
    domain: string;
    reason: string;
  }[]
}