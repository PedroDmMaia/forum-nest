import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)

export type pageQueryParamsSchema = z.infer<typeof pageQueryParamsSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestions {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(201)
  async handle(
    @Query('page', queryValidationPipe) page: pageQueryParamsSchema,
  ) {
    const perPage = 1

    const questions = await this.prisma.question.findMany({
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * perPage,
    })

    return { questions }
  }
}
