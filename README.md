# WelfAI -- AI-Powered Low-Income Verification and Socioeconomic Support System for Sri Lanka

WelfAI is a final-year Software Engineering project that explores how
web technologies, machine learning, and location-based information can
support the assessment and management of low-income welfare applications
in Sri Lanka.

The system is designed to support applicants and administrators
throughout the welfare process. It provides application management,
document submission, administrative review, appeals, waiting-list
management, and AI-assisted lifestyle-improvement planning.

> **Academic prototype:** WelfAI is developed for educational and
> research purposes. Machine-learning predictions are decision-support
> information, not final eligibility decisions. The prototype uses
> synthetic and/or simulated data where real government integrations are
> not available. Production use would require authorized data access,
> privacy and security reviews, and validation with appropriate
> real-world data.

## Key Features

-   **Role-based access:** Supports different user roles and
    role-specific workflows.
-   **Welfare application management:** Applicants can prepare, submit,
    and track applications.
-   **Supporting document submission:** Supports uploading documents
    required for application review.
-   **Administrative review:** Administrators can review applications
    and record approval or rejection decisions.
-   **Rejection and appeal workflow:** Rejected applicants can submit
    appeals and supporting evidence for administrative review.
-   **Waiting-list management:** Supports managing applicants awaiting
    available support and reallocation.
-   **AI-assisted lifestyle-improvement plans:** Applicants can submit
    plans after approval, with machine-learning predictions used to
    support plan assessment.
-   **Machine-learning predictions:** Classification estimates whether a
    lifestyle-improvement goal may be achieved, while regression
    estimates the expected duration in months.
-   **Administrative dashboards:** Provides administrative views of
    application, support, and improvement-plan information.
-   **GIS/location-based support:** Includes location-related
    functionality to support geographic assessment and administration.
-   **Chatbot support:** Includes an AI chatbot feature to help users
    interact with the system.

## Technology Stack

  -----------------------------------------------------------------------
  Component                           Technologies
  ----------------------------------- -----------------------------------
  Frontend                            React, Vite, Tailwind CSS

  Backend API                         Node.js, Express.js

  Database                            MongoDB

  Machine-learning service            Python, FastAPI, scikit-learn

  Machine-learning models             Random Forest classification and
                                      regression

  Development tools                   Git, GitHub, Visual Studio Code
  -----------------------------------------------------------------------

## System Architecture

The repository is organized into three main components:

``` text
WelfAI/
├── client/       # React frontend
├── server/       # Node.js and Express backend API
├── ml-service/   # Python FastAPI machine-learning service
└── README.md
```

**High-level request flow**

1.  The user interacts with the React frontend.
2.  The frontend sends requests to the Node.js/Express backend.
3.  The backend manages application workflows and communicates with
    MongoDB.
4.  When a prediction is required, the backend communicates with the
    FastAPI machine-learning service.
5.  Prediction results are returned to the application as
    decision-support information for authorized users.

## Machine-Learning Approach

The WelfAI machine-learning component focuses on lifestyle-improvement
plans submitted by approved applicants.

-   **Classification:** predicts whether a plan's goal is likely to be
    achieved.
-   **Regression:** estimates the expected number of months required to
    achieve the goal.
-   **Input features:** include household composition, income and
    expenses, employment, education, housing, access to utilities, asset
    score, selected focus areas, and requested duration.
-   **Development data:** synthetic data is used for prototyping and
    model development.

Predictions should be interpreted with care. Synthetic-data evaluation
does not establish real-world accuracy or fairness. The system is
intended to assist human decision-making rather than automatically
approve or reject people.

## Getting Started

### Prerequisites

Install the following before running the project:

-   Node.js and npm
-   Python 3
-   MongoDB (local installation or an appropriately configured database)
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/ImalkaDinithi/WelfAI-.git
cd WelfAI-
```

### 2. Set up the frontend

``` bash
cd client
npm install
npm run dev
```

Use the local URL printed by Vite in the terminal to open the frontend.

### 3. Set up the backend

Open a separate terminal:

``` bash
cd server
npm install
```

Configure the environment variables required by the backend using the
project's existing environment-variable names or example file, if
provided. Set the database connection and other required configuration
before starting the server.

Run the start script defined in `server/package.json`, for example:

``` bash
npm run dev
```

If the project does not define a `dev` script, use the script listed in
that package file.

### 4. Set up the machine-learning service

Open another terminal:

``` bash
cd ml-service
python -m venv .venv
```

Activate the virtual environment on Windows:

``` powershell
.venv\Scripts\Activate.ps1
```

Install the dependencies listed in the ML service's dependency file. If
the project includes `requirements.txt`, run:

``` bash
pip install -r requirements.txt
```

Start the FastAPI service using the module and application variable
defined in the project. If the entry point is `main.py` and the FastAPI
instance is named `app`, the command is:

``` bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The exact entry-point command may differ depending on the files in
`ml-service`.

### Configuration notes

-   Do not commit `.env` files, database credentials, secret keys, API
    tokens, or private applicant documents.
-   Check the project's `.gitignore` and use environment-variable names
    expected by the existing source code.
-   The frontend, backend, database, and ML service must be configured
    to communicate with the correct local addresses and ports.

## Privacy, Ethics, and Limitations

-   Welfare and household data can be sensitive and should be handled
    securely.
-   Real government or financial data must only be accessed through
    authorized arrangements.
-   Synthetic or simulated data is not a substitute for validation with
    representative, lawfully obtained data.
-   Machine-learning outputs should not be treated as the sole basis for
    welfare eligibility or allocation decisions.
-   Before real-world deployment, the system would need appropriate
    security testing, model evaluation, bias and fairness assessment,
    accessibility review, and authorized integrations.

## Future Improvements

-   Integrate authorized and verified data sources where formal access
    is available.
-   Evaluate models with representative, appropriately consented or
    otherwise lawfully obtained data.
-   Improve explainability, fairness evaluation, and monitoring of model
    performance.
-   Strengthen deployment, logging, security, and accessibility.

## Author

**Imalka Senaratne**\
Software Engineering Undergraduate\


-   GitHub: [ImalkaDinithi](https://github.com/ImalkaDinithi)
-   Project repository:
    [WelfAI](https://github.com/ImalkaDinithi/WelfAI-)

## Disclaimer

WelfAI is an academic project and is not an official Sri Lankan
government platform. It is not affiliated with or endorsed by any
government welfare agency.
