const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const divisionsData = require('../data/srilanka-divisions.json');

const SUCCESS_THRESHOLD = 60;

// @route   GET /api/superadmin/divisions
// @desc    Get Sri Lanka location hierarchy (Province, District, DS, GN)
// @access  Private (Superadmin)
const getDivisionsData = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Divisions data retrieved successfully',
    data: divisionsData,
  });
});

// @route   GET /api/superadmin/dashboard-summary
// @desc    Get aggregated analytics & breakdown metrics with location filtering
// @access  Private (Superadmin)
const getDashboardSummary = asyncHandler(async (req, res) => {
  const { province, district, dsDivision, gnDivision } = req.query;

  // Base filter: ignore unsubmitted draft applications
  const filterQuery = {
    status: { $ne: 'Draft' },
  };

  // Location filtering logic
  if (province) {
    const provinceDistricts = divisionsData.districts
      .filter((d) => d.province && d.province.toLowerCase() === province.trim().toLowerCase())
      .map((d) => d.name);

    if (provinceDistricts.length > 0) {
      filterQuery['personalInfo.district'] = { $in: provinceDistricts };
    }
  }

  // District takes precedence over province filter if explicitly supplied
  if (district && district.trim() !== '') {
    filterQuery['personalInfo.district'] = district.trim();
  }

  if (dsDivision && dsDivision.trim() !== '') {
    filterQuery['personalInfo.dsDivision'] = dsDivision.trim();
  }

  if (gnDivision && gnDivision.trim() !== '') {
    filterQuery['personalInfo.gnDivision'] = gnDivision.trim();
  }

  // Execute all metric queries concurrently using Promise.all
  const [
    totalApplicants,
    submittedCount,
    underReviewCount,
    approvedCount,
    rejectedCount,
    waitingListCount,
    appealPendingCount,
    appealApprovedCount,
    appealRejectedCount,
    wlReinstatedCount,
    wlRejectedCount,
    lpNotStartedCount,
    lpSubmittedCount,
    lpUnderReviewCount,
    lpMLAssessedCount,
    predictedSuccessCount,
    mlAvgAggregation,
    districtBreakdownAggregation,
  ] = await Promise.all([
    // Total non-draft applicants
    Application.countDocuments(filterQuery),

    // Status counts
    Application.countDocuments({ ...filterQuery, status: 'Submitted' }),
    Application.countDocuments({ ...filterQuery, status: 'Under Review' }),
    Application.countDocuments({ ...filterQuery, status: 'Approved' }),
    Application.countDocuments({ ...filterQuery, status: 'Rejected' }),
    Application.countDocuments({ ...filterQuery, status: 'Waiting List' }),

    // Appeal outcomes
    Application.countDocuments({ ...filterQuery, status: 'Appealed' }),
    Application.countDocuments({ ...filterQuery, 'appeal.decision': 'Approved' }),
    Application.countDocuments({ ...filterQuery, 'appeal.decision': 'Rejected' }),

    // Waiting list resolution outcomes
    Application.countDocuments({ ...filterQuery, 'waitingListInfo.resolution': 'Reinstated' }),
    Application.countDocuments({ ...filterQuery, 'waitingListInfo.resolution': 'Rejected' }),

    // Lifestyle plan pipeline
    Application.countDocuments({
      ...filterQuery,
      $or: [
        { lifestylePlan: { $exists: false } },
        { 'lifestylePlan.status': 'Not Started' },
        { 'lifestylePlan.status': { $exists: false } },
      ],
    }),
    Application.countDocuments({ ...filterQuery, 'lifestylePlan.status': 'Submitted' }),
    Application.countDocuments({ ...filterQuery, 'lifestylePlan.status': 'Under Review' }),
    Application.countDocuments({ ...filterQuery, 'lifestylePlan.status': 'ML Assessed' }),

    // Predicted lifestyle improvement count (>= 60% probability)
    Application.countDocuments({
      ...filterQuery,
      'lifestylePlan.mlPrediction.successProbability': { $gte: SUCCESS_THRESHOLD },
    }),

    // ML Averages across ML Assessed applications in filtered set
    Application.aggregate([
      {
        $match: {
          ...filterQuery,
          'lifestylePlan.status': 'ML Assessed',
          'lifestylePlan.mlPrediction.successProbability': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgSuccessProb: { $avg: '$lifestylePlan.mlPrediction.successProbability' },
          avgDuration: { $avg: '$lifestylePlan.mlPrediction.estimatedDurationMonths' },
        },
      },
    ]),

    // District breakdown aggregation
    Application.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: '$personalInfo.district',
          totalApplicants: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          district: { $ifNull: ['$_id', 'Unknown'] },
          totalApplicants: 1,
          approved: 1,
          rejected: 1,
        },
      },
      { $sort: { totalApplicants: -1, district: 1 } },
    ]),
  ]);

  // Extract ML averages safely
  const averageSuccessProbability =
    mlAvgAggregation.length > 0 && mlAvgAggregation[0].avgSuccessProb !== null
      ? Math.round(mlAvgAggregation[0].avgSuccessProb * 10) / 10
      : null;

  const averageEstimatedDurationMonths =
    mlAvgAggregation.length > 0 && mlAvgAggregation[0].avgDuration !== null
      ? Math.round(mlAvgAggregation[0].avgDuration * 10) / 10
      : null;

  res.status(200).json({
    success: true,
    message: 'Dashboard summary retrieved successfully',
    data: {
      totalApplicants,
      byStatus: {
        submitted: submittedCount,
        underReview: underReviewCount,
        approved: approvedCount,
        rejected: rejectedCount,
        waitingListActive: waitingListCount,
      },
      appealOutcomes: {
        pendingReview: appealPendingCount,
        approved: appealApprovedCount,
        rejected: appealRejectedCount,
      },
      waitingListOutcomes: {
        active: waitingListCount,
        reinstated: wlReinstatedCount,
        rejected: wlRejectedCount,
      },
      lifestylePlanPipeline: {
        notStarted: lpNotStartedCount,
        submitted: lpSubmittedCount,
        underReview: lpUnderReviewCount,
        mlAssessed: lpMLAssessedCount,
      },
      predictedSuccessCount,
      averageSuccessProbability,
      averageEstimatedDurationMonths,
      districtBreakdown: districtBreakdownAggregation,
    },
  });
});

module.exports = {
  getDivisionsData,
  getDashboardSummary,
  SUCCESS_THRESHOLD,
};
