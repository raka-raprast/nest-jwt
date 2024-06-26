import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Headers,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeaders,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { ProfileService } from './profile.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller()
@UseInterceptors(CacheInterceptor)
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get('api/getProfile')
  @ApiOkResponse({
    description: 'Profile has been found successfully',
  })
  @ApiTags('users')
  @ApiHeaders([{ name: 'x-access-token', description: 'Access Token' }])
  async getProfile(@Headers() header) {
    if (header['x-access-token'] == null) {
      throw new UnauthorizedException('No token provided.');
    }
    return this.profileService.getProfile(header['x-access-token']);
  }

  @Post('api/createProfile')
  @ApiCreatedResponse({
    description: 'Profile has been created successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Session has expired please log in again',
  })
  @ApiTags('users')
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @Headers() header,
  ) {
    console.log('Created');
    if (header['x-access-token'] == null) {
      throw new UnauthorizedException('No token provided.');
    }
    return this.profileService.createProfile(
      { ...createProfileDto, userId: '' },
      header['x-access-token'],
    );
  }

  @Put('api/updateProfile')
  @ApiOkResponse({
    description: 'Profile has been updated successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Session has expired please log in again',
  })
  @ApiBadRequestResponse({
    description: 'No existing user',
  })
  @ApiTags('users')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Headers() header,
  ) {
    if (header['x-access-token'] == null) {
      throw new UnauthorizedException('No token provided.');
    }
    return this.profileService.updateProfile(
      updateProfileDto,
      header['x-access-token'],
      '',
    );
  }

  @Post('api/profileImage')
  @ApiTags('users')
  @UseInterceptors(
    FileInterceptor('image', {
      dest: 'uploads/',
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 5000000 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Headers() header,
  ) {
    if (header['x-access-token'] == null) {
      throw new UnauthorizedException('No token provided.');
    }
    const imageUrl = await this.cloudinaryService.uploadImage(file);
    const updateProfileDto = new UpdateProfileDto();
    return this.profileService.updateProfile(
      updateProfileDto,
      header['x-access-token'],
      imageUrl.secure_url,
    );
  }
}
