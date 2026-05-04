import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Patch,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApksService } from './apks.service';
import { CreateApkDto } from './dto/create-apk.dto';
import { ApiConsumes, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { existsSync } from 'fs';
import { Public } from '@thallesp/nestjs-better-auth';


@ApiTags('APKs')
@Controller('apks')
export class ApksController {
  constructor(private readonly apksService: ApksService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new APK' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 300 * 1024 * 1024, // 300MB
    },
  }))

  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createApkDto: CreateApkDto,
  ) {
    return this.apksService.create(file, createApkDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all APKs' })
  findAll() {
    return this.apksService.findAll();
  }

  @Public()
  @Get('download/:filename')
  @ApiOperation({ summary: 'Download an APK file' })
  @Header('Content-Type', 'application/vnd.android.package-archive')
  download(@Param('filename') filename: string, @Res() res: Response) {
    const path = this.apksService.getFilePath(filename);
    if (!existsSync(path)) {
      return res.status(404).send('File not found');
    }
    return res.download(path);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle APK active status' })
  toggleActive(@Param('id') id: string) {
    return this.apksService.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an APK' })
  remove(@Param('id') id: string) {
    return this.apksService.remove(id);
  }
}
