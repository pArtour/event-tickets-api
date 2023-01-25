export class JwtDto {
  id: number;
  userId: string;
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;
}
