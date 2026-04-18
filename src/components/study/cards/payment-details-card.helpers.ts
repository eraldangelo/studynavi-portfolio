type DependentFeeParams = {
  hasDependents: boolean;
  isCanada: boolean;
  dependentVisaFeeOver18: number;
  dependentVisaFee: number;
  dependentStudyPermitFee: number;
  agencyAssistanceFee: number;
  dependentMedicalExamFee: number;
  medical0to4Fee?: number;
  medical5to10Fee?: number;
  medical11to14Fee?: number;
  medical15plusFee?: number;
  dependentBiometricsFee: number;
};

export function computeHasDependentFees(params: DependentFeeParams) {
  const {
    hasDependents,
    isCanada,
    dependentVisaFeeOver18,
    dependentVisaFee,
    dependentStudyPermitFee,
    agencyAssistanceFee,
    dependentMedicalExamFee,
    medical0to4Fee,
    medical5to10Fee,
    medical11to14Fee,
    medical15plusFee,
    dependentBiometricsFee,
  } = params;

  if (!hasDependents) return false;

  if (isCanada) {
    return (
      dependentVisaFeeOver18 > 0
      || dependentVisaFee > 0
      || dependentStudyPermitFee > 0
      || agencyAssistanceFee > 0
      || dependentMedicalExamFee > 0
      || (medical0to4Fee ?? 0) > 0
      || (medical5to10Fee ?? 0) > 0
      || (medical11to14Fee ?? 0) > 0
      || (medical15plusFee ?? 0) > 0
    );
  }

  return (
    dependentMedicalExamFee > 0
    || dependentVisaFee > 0
    || dependentVisaFeeOver18 > 0
    || dependentBiometricsFee > 0
    || agencyAssistanceFee > 0
  );
}
