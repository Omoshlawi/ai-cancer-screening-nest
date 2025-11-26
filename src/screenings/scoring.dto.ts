export enum RiskFactor {
  AGE = 'AGE',
  EARLY_SEXUAL_DEBUT = 'EARLY_SEXUAL_DEBUT',
  MULTIPLE_PARTNERS = 'MULTIPLE_PARTNERS',
  SEXUALLY_TRANSMITTED_INFECTION = 'SEXUALLY_TRANSMITTED_INFECTION',
  PARITY = 'PARITY',
  NEVER_SCREENED = 'NEVER_SCREENED',
  ORAL_CONTRACEPTIVES = 'ORAL_CONTRACEPTIVES',
  SMOKING = 'SMOKING',
  FAMILY_HISTORY = 'FAMILY_HISTORY',
}

export enum RiskInterpretation {
  NO_RISK = 'NO_RISK',
  VERY_LOW_RISK = 'VERY_LOW_RISK',
  LOW_RISK = 'LOW_RISK',
  MODERATE_RISK = 'MODERATE_RISK',
  HIGH_RISK = 'HIGH_RISK',
  VERY_HIGH_RISK = 'VERY_HIGH_RISK',
}

export type RiskFactorScore = {
  factor: RiskFactor;
  score: number;
  reason: string;
};

export type ScoringResult = {
  clientAge: number | null;
  breakdown: RiskFactorScore[];
  aggregateScore: number;
  interpretation: RiskInterpretation;
  shouldAutoScreen: boolean;
};
