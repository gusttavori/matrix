const prisma = require('./prisma');

/**
 * Calculates the average grade based on total score and max possible score.
 * 
 * @param {number} totalScore 
 * @param {number} maxScore 
 * @returns {number} Average from 0 to 10
 */
const calculateAverage = (totalScore, maxScore) => {
  if (maxScore === 0) return 0;
  return parseFloat(((totalScore / maxScore) * 10).toFixed(2));
};

/**
 * Applies parallel recovery rules.
 * The system considers the highest grade between the original and the recovery grade.
 * 
 * @param {number} originalGrade 
 * @param {number|null} recoveryGrade 
 * @returns {number}
 */
const calculateRecovery = (originalGrade, recoveryGrade) => {
  if (recoveryGrade === null || recoveryGrade === undefined) return originalGrade;
  return Math.max(originalGrade, recoveryGrade);
};

/**
 * Calculates attendance percentage.
 * 
 * @param {number} presentClasses 
 * @param {number} totalClasses 
 * @returns {number} Percentage from 0 to 100
 */
const calculateAttendance = (presentClasses, totalClasses) => {
  if (totalClasses === 0) return 100;
  return Math.round((presentClasses / totalClasses) * 100);
};

/**
 * Determines if a student is eligible for final recovery based on the institution's minimum average.
 * 
 * @param {number} finalAverage 
 * @param {number} minAverage 
 * @returns {boolean}
 */
const isEligibleForRecovery = (finalAverage, minAverage) => {
  return finalAverage < minAverage;
};

/**
 * Get institution academic settings
 * 
 * @param {number} institutionId 
 * @param {number} schoolYear 
 * @returns {Object} Settings
 */
const getAcademicSettings = async (institutionId, schoolYear) => {
  const settings = await prisma.academicSetting.findUnique({
    where: {
      institutionId_schoolYear: {
        institutionId,
        schoolYear
      }
    }
  });
  
  if (!settings) {
    // Return default matrix settings if none configured
    return {
      bimestersCount: 4,
      pointsPerPeriod: 25,
      minAverage: 6,
      minAttendance: 75
    };
  }
  
  return settings;
};

/**
 * Throws an error if the specified AcademicPeriod is closed.
 * 
 * @param {number} periodId 
 * @param {number} institutionId 
 */
const checkPeriodClosed = async (periodId, institutionId) => {
  const period = await prisma.academicPeriod.findFirst({
    where: { id: periodId, institutionId }
  });

  if (!period) {
    const { AppError } = require('./AppError');
    throw new AppError('Período acadêmico não encontrado', 404);
  }

  if (period.isClosed) {
    const { AppError } = require('./AppError');
    throw new AppError('Edição não permitida: Este bimestre já foi fechado.', 403);
  }
};

module.exports = {
  calculateAverage,
  calculateRecovery,
  calculateAttendance,
  isEligibleForRecovery,
  getAcademicSettings,
  checkPeriodClosed
};
