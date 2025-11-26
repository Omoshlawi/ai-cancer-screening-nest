/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  RiskFactor,
  RiskFactorScore,
  RiskInterpretation,
  ScoringResult,
} from './scoring.dto';
import {
  ScreenBoolean,
  ScreenClientDto,
  SmokingStatus,
} from './screenings.dto';

@Injectable()
export class ScoringService {
  constructor(private readonly prismaService: PrismaService) {}

  async scoreClient(
    clientId: string,
    payload: ScreenClientDto,
  ): Promise<ScoringResult> {
    const client = await this.prismaService.client.findUnique({
      where: { id: clientId },
      select: { dateOfBirth: true },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    const clientAge = client.dateOfBirth
      ? this.calculateAge(client.dateOfBirth)
      : null;
    const breakdown: RiskFactorScore[] = [
      this.buildAgeScore(clientAge),
      this.buildSexualDebutScore(payload.firstIntercourseAge),
      this.buildMultiplePartnersScore(payload.lifeTimePatners),
      this.buildParityScore(payload.totalBirths),
      this.buildNeverScreenedScore(payload.everScreenedForCervicalCancer),
      this.buildOralContraceptiveScore(
        payload.usedOralContraceptivesForMoreThan5Years,
      ),
      this.buildSmokingScore(payload.smoking),
      this.buildFamilyHistoryScore(
        payload.familyMemberDiagnosedWithCervicalCancer,
      ),
      this.buildInfectionScore(
        payload.everDiagnosedWithHIV,
        payload.everDiagnosedWithHPV,
        payload.everDiagnosedWithSTI,
      ),
    ];

    const shouldAutoScreen = breakdown.some(
      (factor) =>
        factor.factor === RiskFactor.SEXUALLY_TRANSMITTED_INFECTION &&
        factor.score > 0,
    );
    const aggregateScore = this.deriveAggregateScore(breakdown);
    const interpretation = shouldAutoScreen
      ? RiskInterpretation.VERY_HIGH_RISK
      : this.interpretScore(aggregateScore);

    return {
      clientAge,
      breakdown,
      aggregateScore,
      interpretation,
      shouldAutoScreen,
    };
  }

  private deriveAggregateScore(breakdown: RiskFactorScore[]): number {
    let score = 0;
    for (const factorScore of breakdown) {
      score = Math.max(score, factorScore.score);
    }
    return score;
  }

  private interpretScore(score: number): RiskInterpretation {
    switch (score) {
      case 0:
        return RiskInterpretation.NO_RISK;
      case 1:
        return RiskInterpretation.VERY_LOW_RISK;
      case 2:
        return RiskInterpretation.LOW_RISK;
      case 3:
        return RiskInterpretation.MODERATE_RISK;
      case 4:
        return RiskInterpretation.HIGH_RISK;
      default:
        return RiskInterpretation.VERY_HIGH_RISK;
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    return dayjs().diff(dateOfBirth, 'year');
  }

  private buildAgeScore(age: number | null): RiskFactorScore {
    return {
      factor: RiskFactor.AGE,
      score: age !== null ? this.getAgeScore(age) : 0,
      reason: age !== null ? `Client age is ${age}` : 'Age unavailable',
    };
  }

  private getAgeScore(age: number): number {
    if (age >= 25 && age <= 29) {
      return 3;
    }
    if (age >= 30 && age <= 39) {
      return 4;
    }
    if (age >= 40 && age <= 55) {
      return 5;
    }
    if (age >= 56 && age <= 65) {
      return 4;
    }
    return 0;
  }

  private buildSexualDebutScore(firstIntercourseAge: number): RiskFactorScore {
    const score = firstIntercourseAge < 18 ? 5 : 0;
    return {
      factor: RiskFactor.EARLY_SEXUAL_DEBUT,
      score,
      reason:
        score === 0
          ? 'First intercourse at or after 18 years'
          : 'First intercourse before 18 years',
    };
  }

  private buildMultiplePartnersScore(partners: number): RiskFactorScore {
    return {
      factor: RiskFactor.MULTIPLE_PARTNERS,
      score: this.getPartnersScore(partners),
      reason: `${partners} lifetime partners reported`,
    };
  }

  private getPartnersScore(partners: number): number {
    if (partners <= 1) {
      return 2;
    }
    if (partners <= 5) {
      return 4;
    }
    return 5;
  }

  private buildParityScore(totalBirths: number): RiskFactorScore {
    return {
      factor: RiskFactor.PARITY,
      score: this.getParityScore(totalBirths),
      reason: `${totalBirths} births reported`,
    };
  }

  private getParityScore(totalBirths: number): number {
    if (totalBirths <= 2) {
      return 2;
    }
    if (totalBirths <= 5) {
      return 3;
    }
    return 4;
  }

  private buildNeverScreenedScore(
    everScreened: ScreenBoolean,
  ): RiskFactorScore {
    const neverScreened =
      everScreened === ScreenBoolean.NO ||
      everScreened === ScreenBoolean.NOT_SURE;
    return {
      factor: RiskFactor.NEVER_SCREENED,
      score: neverScreened ? 3 : 0,
      reason: neverScreened
        ? 'Client has never been screened for cervical cancer'
        : 'Client reports previous screening',
    };
  }

  private buildOralContraceptiveScore(
    contraceptives: ScreenBoolean,
  ): RiskFactorScore {
    return {
      factor: RiskFactor.ORAL_CONTRACEPTIVES,
      score: contraceptives === ScreenBoolean.YES ? 2 : 0,
      reason:
        contraceptives === ScreenBoolean.YES
          ? 'Used oral contraceptives for more than 5 years'
          : 'No long-term oral contraceptive use reported',
    };
  }

  private buildSmokingScore(smoking: SmokingStatus): RiskFactorScore {
    const score = smoking === SmokingStatus.NEVER ? 0 : 4;
    return {
      factor: RiskFactor.SMOKING,
      score,
      reason:
        score === 0
          ? 'No history of smoking'
          : 'Current or past smoking history reported',
    };
  }

  private buildFamilyHistoryScore(
    familyHistory: ScreenBoolean,
  ): RiskFactorScore {
    const positiveHistory = familyHistory === ScreenBoolean.YES;
    return {
      factor: RiskFactor.FAMILY_HISTORY,
      score: positiveHistory ? 3 : 0,
      reason: positiveHistory
        ? 'First-degree relative diagnosed with cervical cancer'
        : 'No family history reported',
    };
  }

  private buildInfectionScore(
    hiv: ScreenBoolean,
    hpv: ScreenBoolean,
    sti: ScreenBoolean,
  ): RiskFactorScore {
    const positive =
      hiv === ScreenBoolean.YES ||
      hpv === ScreenBoolean.YES ||
      sti === ScreenBoolean.YES;
    return {
      factor: RiskFactor.SEXUALLY_TRANSMITTED_INFECTION,
      score: positive ? 5 : 0,
      reason: positive
        ? 'Positive history of HIV/HPV/STI; auto screening recommended'
        : 'No reported history of HIV/HPV/STI',
    };
  }
}
