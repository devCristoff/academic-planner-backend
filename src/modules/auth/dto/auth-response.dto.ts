import { ApiProperty } from '@nestjs/swagger';
import { DtUser } from '@/src/modules/auth/entities/dt-user.entity';

/**
 * User information contained in authentication response
 */
export class AuthUserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 123,
  })
  id!: number;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  name!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'URL to user avatar image',
    example: 'https://example.com/avatars/john-doe.jpg',
    nullable: true,
  })
  avatarUrl!: string | null;
}

/**
 * Login response containing JWT access token and user information
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for subsequent API requests',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidGVybUlkIjoyLCJpYXQiOjE2MzIzMjI4MDB9.XYZ...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Authenticated user details',
    type: AuthUserDto,
  })
  user!: AuthUserDto;

  /**
   * Factory method to create AuthResponseDto from DtUser entity and access token
   */
  static from(user: DtUser, accessToken: string): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.accessToken = accessToken;
    dto.user = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
    return dto;
  }
}
