import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApkDto } from './dto/create-apk.dto';
import { join } from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class ApksService implements OnModuleInit {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'apks');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  async create(file: Express.Multer.File, createApkDto: CreateApkDto) {
    await this.ensureUploadDir();

    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = join(this.uploadDir, filename);

    await writeFile(filePath, file.buffer);

    const size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Set all other APKs to inactive if this is a new one?
    // Or just let the user manage it. Let's keep it simple for now.

    return this.prisma.apk.create({
      data: {
        version: createApkDto.version,
        notes: createApkDto.notes,
        filename: filename,
        size: size,
        url: `/api/apks/download/${filename}`, // This will be the endpoint to download
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.apk.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const apk = await this.prisma.apk.findUnique({ where: { id } });
    if (!apk) throw new NotFoundException('APK not found');
    return apk;
  }

  async remove(id: string) {
    const apk = await this.findOne(id);

    const filePath = join(this.uploadDir, apk.filename);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return this.prisma.apk.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const apk = await this.findOne(id);
    return this.prisma.apk.update({
      where: { id },
      data: { isActive: !apk.isActive },
    });
  }

  getFilePath(filename: string) {
    return join(this.uploadDir, filename);
  }
}
