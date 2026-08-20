const mongoose = require('mongoose');

const SRI_LANKAN_DISTRICTS = [
  'Ampara',
  'Anuradhapura',
  'Badulla',
  'Batticaloa',
  'Colombo',
  'Galle',
  'Gampaha',
  'Hambantota',
  'Jaffna',
  'Kalutara',
  'Kandy',
  'Kegalle',
  'Kilinochchi',
  'Kurunegala',
  'Mannar',
  'Matale',
  'Matara',
  'Moneragala',
  'Mullaitivu',
  'Nuwara Eliya',
  'Polonnaruwa',
  'Puttalam',
  'Ratnapura',
  'Trincomalee',
  'Vavuniya',
];

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: [
          'NIC Copy',
          'Income Certificate',
          'Electricity Bill',
          'Water Bill',
          'Grama Niladhari Certificate',
          'Bank Statement',
        ],
        message: '{VALUE} is not a valid document type',
      },
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const personalInfoSchema = new mongoose.Schema(
  {
    nicNumber: {
      type: String,
      required: [true, 'NIC number is required'],
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(v);
        },
        message: (props) => `${props.value} is not a valid Sri Lankan NIC number`,
      },
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a valid gender',
      },
    },
    maritalStatus: {
      type: String,
      required: [true, 'Marital status is required'],
      enum: {
        values: ['Single', 'Married', 'Divorced', 'Widowed'],
        message: '{VALUE} is not a valid marital status',
      },
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^(?:\+94|0)?[7][0-9]{8}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid Sri Lankan mobile number`,
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      enum: {
        values: SRI_LANKAN_DISTRICTS,
        message: '{VALUE} is not a valid Sri Lankan district',
      },
    },
    dsDivision: {
      type: String,
      required: [true, 'DS Division is required'],
      trim: true,
    },
    gnDivision: {
      type: String,
      required: [true, 'GN Division is required'],
      trim: true,
    },
  },
  { _id: false }
);

const householdInfoSchema = new mongoose.Schema(
  {
    numberOfFamilyMembers: {
      type: Number,
      required: [true, 'Number of family members is required'],
      min: [1, 'Number of family members must be at least 1'],
    },
    numberOfIncomeEarners: {
      type: Number,
      required: [true, 'Number of income earners is required'],
      min: [0, 'Number of income earners cannot be negative'],
    },
    numberOfChildren: {
      type: Number,
      required: [true, 'Number of children is required'],
      min: [0, 'Number of children cannot be negative'],
    },
    numberOfElderlyDependents: {
      type: Number,
      required: [true, 'Number of elderly dependents is required'],
      min: [0, 'Number of elderly dependents cannot be negative'],
    },
    numberOfDisabledMembers: {
      type: Number,
      required: [true, 'Number of disabled members is required'],
      min: [0, 'Number of disabled members cannot be negative'],
    },
    monthlyHouseholdExpenses: {
      type: Number,
      required: [true, 'Monthly household expenses are required'],
      min: [0, 'Monthly household expenses cannot be negative'],
    },
  },
  { _id: false }
);

const employmentInfoSchema = new mongoose.Schema(
  {
    employmentStatus: {
      type: String,
      required: [true, 'Employment status is required'],
      enum: {
        values: ['Employed', 'Unemployed', 'Self-Employed', 'Retired'],
        message: '{VALUE} is not a valid employment status',
      },
    },
    occupation: {
      type: String,
      required: [
        function () {
          return this.employmentStatus && this.employmentStatus !== 'Unemployed';
        },
        'Occupation is required when employment status is not Unemployed',
      ],
      trim: true,
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: ['Permanent', 'Temporary', 'Contract', 'Daily-Wage', 'None'],
        message: '{VALUE} is not a valid employment type',
      },
    },
    employerName: {
      type: String,
      trim: true,
    },
    yearsOfEmployment: {
      type: Number,
      min: [0, 'Years of employment cannot be negative'],
    },
  },
  { _id: false }
);

const incomeInfoSchema = new mongoose.Schema(
  {
    totalMonthlyHouseholdIncome: {
      type: Number,
      required: [true, 'Total monthly household income is required'],
      min: [0, 'Total monthly household income cannot be negative'],
    },
    salaryIncome: {
      type: Number,
      default: 0,
      min: [0, 'Salary income cannot be negative'],
    },
    businessIncome: {
      type: Number,
      default: 0,
      min: [0, 'Business income cannot be negative'],
    },
    agriculturalIncome: {
      type: Number,
      default: 0,
      min: [0, 'Agricultural income cannot be negative'],
    },
    pensionIncome: {
      type: Number,
      default: 0,
      min: [0, 'Pension income cannot be negative'],
    },
    otherIncome: {
      type: Number,
      default: 0,
      min: [0, 'Other income cannot be negative'],
    },
  },
  { _id: false }
);

const educationSkillsSchema = new mongoose.Schema(
  {
    highestEducationalQualification: {
      type: String,
      required: [true, 'Highest educational qualification is required'],
      enum: {
        values: [
          'No Schooling',
          'Primary',
          'O-Level',
          'A-Level',
          'Diploma',
          'Degree',
          'Postgraduate',
        ],
        message: '{VALUE} is not a valid educational qualification',
      },
    },
    vocationalTraining: {
      type: String,
      trim: true,
    },
    professionalSkills: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const housingInfoSchema = new mongoose.Schema(
  {
    houseOwnership: {
      type: String,
      required: [true, 'House ownership status is required'],
      enum: {
        values: ['Owned', 'Rented', 'Other'],
        message: '{VALUE} is not a valid house ownership status',
      },
    },
    houseType: {
      type: String,
      required: [true, 'House type is required'],
      trim: true,
    },
    numberOfRooms: {
      type: Number,
      required: [true, 'Number of rooms is required'],
      min: [1, 'Number of rooms must be at least 1'],
    },
    roofMaterial: {
      type: String,
      required: [true, 'Roof material is required'],
      trim: true,
    },
    wallMaterial: {
      type: String,
      required: [true, 'Wall material is required'],
      trim: true,
    },
    floorMaterial: {
      type: String,
      required: [true, 'Floor material is required'],
      trim: true,
    },
    accessToElectricity: {
      type: Boolean,
      required: [true, 'Access to electricity selection is required'],
    },
    accessToCleanWater: {
      type: Boolean,
      required: [true, 'Access to clean water selection is required'],
    },
    toiletFacilities: {
      type: String,
      required: [true, 'Toilet facilities description is required'],
      trim: true,
    },
  },
  { _id: false }
);

const assetDeclarationSchema = new mongoose.Schema(
  {
    ownsVehicle: {
      type: Boolean,
      required: [true, 'Owns vehicle selection is required'],
      default: false,
    },
    numberOfVehicles: {
      type: Number,
      default: 0,
      min: [0, 'Number of vehicles cannot be negative'],
    },
    ownsProperty: {
      type: Boolean,
      required: [true, 'Owns property selection is required'],
      default: false,
    },
    numberOfProperties: {
      type: Number,
      default: 0,
      min: [0, 'Number of properties cannot be negative'],
    },
    ownsBusiness: {
      type: Boolean,
      required: [true, 'Owns business selection is required'],
      default: false,
    },
    ownsAgriculturalLand: {
      type: Boolean,
      required: [true, 'Owns agricultural land selection is required'],
      default: false,
    },
  },
  { _id: false }
);

const verificationDetailsSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      required: [true, 'Bank account number is required'],
      select: false,
      trim: true,
    },
    electricityAccountNumber: {
      type: String,
      required: [true, 'Electricity account number is required'],
      trim: true,
    },
    waterAccountNumber: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
    },
    personalInfo: personalInfoSchema,
    householdInfo: householdInfoSchema,
    employmentInfo: employmentInfoSchema,
    incomeInfo: incomeInfoSchema,
    educationSkills: educationSkillsSchema,
    housingInfo: housingInfoSchema,
    assetDeclaration: assetDeclarationSchema,
    verificationDetails: verificationDetailsSchema,
    documents: {
      type: [documentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Draft',
    },
    eligibilityScore: {
      type: Number,
      default: null,
    },
    fraudRiskScore: {
      type: Number,
      default: null,
    },
    fraudFlag: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index on personalInfo.nicNumber for fast querying if personalInfo is present
applicationSchema.index({ 'personalInfo.nicNumber': 1 }, { sparse: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
