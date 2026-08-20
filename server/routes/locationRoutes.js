const express = require('express');
const router = express.Router();
const locationsData = require('../data/srilanka-divisions.json');

// @route   GET /api/locations/districts
// @desc    Get all 25 Sri Lankan district names
// @access  Public
router.get('/districts', (req, res) => {
  const districts = locationsData.districts.map((d) => d.name);
  res.status(200).json({
    success: true,
    data: districts,
  });
});

// @route   GET /api/locations/ds-divisions?district=X
// @desc    Get DS Divisions for a given district
// @access  Public
router.get('/ds-divisions', (req, res) => {
  const { district } = req.query;

  if (!district) {
    return res.status(400).json({
      success: false,
      message: 'District parameter is required',
    });
  }

  const targetDistrict = locationsData.districts.find(
    (d) => d.name.toLowerCase() === district.toLowerCase()
  );

  if (!targetDistrict) {
    return res.status(404).json({
      success: false,
      message: `District '${district}' not found`,
      data: [],
    });
  }

  const dsDivisions = targetDistrict.dsDivisions.map((ds) => ds.name);
  res.status(200).json({
    success: true,
    data: dsDivisions,
  });
});

// @route   GET /api/locations/gn-divisions?dsDivision=X&district=Y
// @desc    Get GN Divisions for a given DS Division
// @access  Public
router.get('/gn-divisions', (req, res) => {
  const { dsDivision, district } = req.query;

  if (!dsDivision) {
    return res.status(400).json({
      success: false,
      message: 'dsDivision parameter is required',
    });
  }

  let dsObj = null;

  if (district) {
    const targetDistrict = locationsData.districts.find(
      (d) => d.name.toLowerCase() === district.toLowerCase()
    );
    if (targetDistrict) {
      dsObj = targetDistrict.dsDivisions.find(
        (ds) => ds.name.toLowerCase() === dsDivision.toLowerCase()
      );
    }
  } else {
    // Search across all districts if district is omitted
    for (const d of locationsData.districts) {
      const found = d.dsDivisions.find(
        (ds) => ds.name.toLowerCase() === dsDivision.toLowerCase()
      );
      if (found) {
        dsObj = found;
        break;
      }
    }
  }

  if (!dsObj) {
    return res.status(404).json({
      success: false,
      message: `DS Division '${dsDivision}' not found`,
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    data: dsObj.gnDivisions,
  });
});

module.exports = router;
