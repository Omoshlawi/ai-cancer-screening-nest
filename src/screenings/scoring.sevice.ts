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
      ? RiskInterpretation.HIGH_RISK
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
    return breakdown.reduce((sum, factorScore) => sum + factorScore.score, 0);
  }

  private interpretScore(score: number): RiskInterpretation {
    if (score <= 15) {
      return RiskInterpretation.LOW_RISK;
    }
    if (score >= 16 && score <= 18) {
      return RiskInterpretation.MEDIUM_RISK;
    }
    return RiskInterpretation.HIGH_RISK;
  }

  private calculateAge(dateOfBirth: Date): number {
    return dayjs().diff(dateOfBirth, 'year');
  }

  private buildAgeScore(age: number | null): RiskFactorScore {
    if (age === null) {
      return {
        factor: RiskFactor.AGE,
        score: 0,
        reason: 'Age unavailable',
      };
    }

    // Only one age category can have response = 1, others are 0
    // Weight × Response (0 or 1)
    let weight = 0;
    let ageRange = '';

    if (age >= 25 && age <= 29) {
      weight = 3;
      ageRange = '25-29';
    } else if (age >= 30 && age <= 39) {
      weight = 4;
      ageRange = '30-39';
    } else if (age >= 40 && age <= 55) {
      weight = 5;
      ageRange = '40-55';
    } else if (age >= 56 && age <= 59) {
      weight = 4;
      ageRange = '56-59';
    } else if (age >= 60 && age <= 65) {
      weight = 4;
      ageRange = '60-65';
    }

    // Response is 1 if age is in valid range, 0 otherwise
    const response = weight > 0 ? 1 : 0;
    const points = weight * response;

    return {
      factor: RiskFactor.AGE,
      score: points,
      reason:
        points > 0
          ? `Client age is ${age} (${ageRange} years)`
          : `Client age is ${age} (outside screening range)`,
    };
  }

  private buildSexualDebutScore(firstIntercourseAge: number): RiskFactorScore {
    // Weight: 5, Response: 1 if < 18, 0 otherwise
    const weight = 5;
    const response = firstIntercourseAge < 18 ? 1 : 0;
    const points = weight * response;

    return {
      factor: RiskFactor.EARLY_SEXUAL_DEBUT,
      score: points,
      reason:
        points > 0
          ? 'First intercourse before 18 years'
          : 'First intercourse at or after 18 years',
    };
  }

  private buildMultiplePartnersScore(partners: number): RiskFactorScore {
    // Only one category can have response = 1
    // Weight × Response (0 or 1)
    let weight = 0;
    let category = '';

    if (partners <= 1) {
      weight = 2;
      category = '0-1';
    } else if (partners >= 2 && partners <= 5) {
      weight = 4;
      category = '2-5';
    } else if (partners >= 6) {
      weight = 5;
      category = '6+';
    }

    const response = 1; // Always 1 if we have a valid category
    const points = weight * response;

    return {
      factor: RiskFactor.MULTIPLE_PARTNERS,
      score: points,
      reason: `${partners} lifetime partners reported (${category})`,
    };
  }

  private buildParityScore(totalBirths: number): RiskFactorScore {
    // Only one category can have response = 1
    // Weight × Response (0 or 1)
    let weight = 0;
    let category = '';

    if (totalBirths <= 2) {
      weight = 2;
      category = '0-2';
    } else if (totalBirths >= 3 && totalBirths <= 5) {
      weight = 3;
      category = '3-5';
    } else if (totalBirths >= 6) {
      weight = 4;
      category = '6+';
    }

    const response = 1; // Always 1 if we have a valid category
    const points = weight * response;

    return {
      factor: RiskFactor.PARITY,
      score: points,
      reason: `${totalBirths} births reported (${category})`,
    };
  }

  private buildNeverScreenedScore(
    everScreened: ScreenBoolean,
  ): RiskFactorScore {
    // Weight: 3, Response: 1 if never screened, 0 otherwise
    const weight = 3;
    const neverScreened =
      everScreened === ScreenBoolean.NO ||
      everScreened === ScreenBoolean.NOT_SURE;
    const response = neverScreened ? 1 : 0;
    const points = weight * response;

    return {
      factor: RiskFactor.NEVER_SCREENED,
      score: points,
      reason:
        points > 0
          ? 'Client has never been screened for cervical cancer'
          : 'Client reports previous screening',
    };
  }

  private buildOralContraceptiveScore(
    contraceptives: ScreenBoolean,
  ): RiskFactorScore {
    // Weight: 2, Response: 1 if YES, 0 otherwise
    const weight = 2;
    const response = contraceptives === ScreenBoolean.YES ? 1 : 0;
    const points = weight * response;

    return {
      factor: RiskFactor.ORAL_CONTRACEPTIVES,
      score: points,
      reason:
        points > 0
          ? 'Used oral contraceptives for more than 5 years'
          : 'No long-term oral contraceptive use reported',
    };
  }

  private buildSmokingScore(smoking: SmokingStatus): RiskFactorScore {
    // Weight: 4, Response: 1 if current or past, 0 if never
    const weight = 4;
    const response = smoking === SmokingStatus.NEVER ? 0 : 1;
    const points = weight * response;

    return {
      factor: RiskFactor.SMOKING,
      score: points,
      reason:
        points > 0
          ? 'Current or past smoking history reported'
          : 'No history of smoking',
    };
  }

  private buildFamilyHistoryScore(
    familyHistory: ScreenBoolean,
  ): RiskFactorScore {
    // Weight: 3, Response: 1 if YES, 0 otherwise
    const weight = 3;
    const response = familyHistory === ScreenBoolean.YES ? 1 : 0;
    const points = weight * response;

    return {
      factor: RiskFactor.FAMILY_HISTORY,
      score: points,
      reason:
        points > 0
          ? 'First-degree relative diagnosed with cervical cancer'
          : 'No family history reported',
    };
  }

  private buildInfectionScore(
    hiv: ScreenBoolean,
    hpv: ScreenBoolean,
    sti: ScreenBoolean,
  ): RiskFactorScore {
    // Weight: 5 (though auto-screen takes precedence), Response: 1 if positive, 0 otherwise
    const weight = 5;
    const positive =
      hiv === ScreenBoolean.YES ||
      hpv === ScreenBoolean.YES ||
      sti === ScreenBoolean.YES;
    const response = positive ? 1 : 0;
    const points = weight * response;

    return {
      factor: RiskFactor.SEXUALLY_TRANSMITTED_INFECTION,
      score: points,
      reason: positive
        ? 'Positive history of HIV/HPV/STI; auto screening recommended'
        : 'No reported history of HIV/HPV/STI',
    };
  }
}
