export interface LegalPolicySection {
  id: string;
  heading: string;
  content: string;
  subsections?: { title: string; body: string }[];
}

export interface LegalPolicyItem {
  id: 'terms' | 'privacy' | 'safety' | 'cancellation' | 'community' | 'grievance';
  title: string;
  shortTitle: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'published' | 'draft';
  summary: string;
  mandatoryConsentOnSignup: boolean;
  sections: LegalPolicySection[];
}

export interface PolicyAuditEntry {
  id: string;
  policyId: string;
  policyTitle: string;
  previousVersion: string;
  newVersion: string;
  changedBy: string;
  changedAt: string;
  changeSummary: string;
}

export const INITIAL_LEGAL_POLICIES: LegalPolicyItem[] = [
  {
    id: 'terms',
    title: 'Terms & Conditions of Service',
    shortTitle: 'Terms & Conditions',
    version: 'v1.2.0',
    effectiveDate: 'October 1, 2026',
    lastUpdated: 'September 25, 2026',
    status: 'published',
    summary:
      'Governs access and use of the Navratri Companion platform, clarifying intermediary roles, user covenants, companion obligations, and limitation of liability under Indian law.',
    mandatoryConsentOnSignup: true,
    sections: [
      {
        id: 'platform-role',
        heading: '1. Platform Role & Nature of Intermediary Services',
        content:
          'Navratri Companion provides an online digital matchmaking and scheduling technology platform designed exclusively to facilitate festive cultural connections and booking arrangements between independent users ("Guests" or "Customers") and registered cultural hosts ("Companions").',
        subsections: [
          {
            title: 'Intermediary Status',
            body: 'The platform operates as a neutral technology intermediary as defined under Section 2(1)(w) of the Information Technology Act, 2000. Navratri Companion is not an employer, employment agency, escort service, dating bureau, labor contractor, or agent of any companion or guest.',
          },
          {
            title: 'No Guarantee of Conduct or Compatibility',
            body: 'Navratri Companion does not guarantee, warrant, or endorse the personal conduct, behavior, compatibility, safety, punctuality, or individual actions of any user or companion. Each user acknowledges that their interactions occur voluntarily upon mutually agreed terms.',
          },
        ],
      },
      {
        id: 'user-responsibilities',
        heading: '2. User General Responsibilities & Account Security',
        content:
          'Every registered user of the platform covenants and agrees to adhere strictly to the following binding responsibilities:',
        subsections: [
          {
            title: 'Truthful Information & KYC',
            body: 'Users must provide true, accurate, current, and complete personal and identification information during registration, profile setup, and booking submission.',
          },
          {
            title: 'Account Credential Security',
            body: 'Users are strictly responsible for maintaining the confidentiality of their User ID and password credentials. Any action initiated under your authenticated credentials is deemed authorized by you.',
          },
          {
            title: 'Mutual Respect & Applicable Laws',
            body: 'Users must treat all participants with utmost dignity and courtesy, strictly observing all applicable local, state, and central laws of India, including the Information Technology Act, 2000, Bharatiya Nyaya Sanhita, 2023, and municipal regulations.',
          },
          {
            title: 'Meeting Coordination & Reporting',
            body: 'Users are responsible for confirming and agreeing upon specific public meeting locations themselves and for immediately reporting any unsafe, non-platonic, or inappropriate behavior to platform support or local law enforcement.',
          },
        ],
      },
      {
        id: 'companion-obligations',
        heading: '3. Companion Host Responsibilities & Code of Conduct',
        content:
          'Registered companions act as independent cultural hosts and agreed companions for Garba and festive celebrations. Companions agree to:',
        subsections: [
          {
            title: 'Accurate Profile Representation',
            body: 'Maintain authentic profile photos, genuine bios, accurate Garba dance proficiency levels, and truthful fee rates. Impersonation or photo misrepresentation leads to permanent expulsion.',
          },
          {
            title: 'Strict Platonic Conduct',
            body: 'Provide exclusively platonic, professional, and friendly festive companionship. Solicitation or acceptance of sexual favors, vulgarity, or commercial dating is strictly prohibited.',
          },
          {
            title: 'Booking Attendance & Punctuality',
            body: 'Attend confirmed bookings punctually at the mutually agreed public festival location. Unexcused failure to appear results in escrow forfeiture and account penalty.',
          },
          {
            title: 'Accurate Payout Information',
            body: 'Furnish valid, verified UPI IDs or bank accounts registered in their own legal name for payout disbursement.',
          },
        ],
      },
      {
        id: 'customer-obligations',
        heading: '4. Customer & Guest Responsibilities',
        content:
          'Guests booking companionship experiences agree to uphold strict standards of festive decency and respect:',
        subsections: [
          {
            title: 'Respect for Personal Boundaries',
            body: 'Guests must respect the personal physical boundaries and comfort of companions at all times. Physical intimidation, harassment, uninvited contact, or coercive demands are zero-tolerance violations.',
          },
          {
            title: 'Strict Public Venue Rule',
            body: 'All meetings must occur exclusively in open, illuminated, public Navratri festival grounds, community party plots, or public food streets. Requesting companions to visit private apartments, residences, or secluded premises is grounds for immediate police reporting.',
          },
          {
            title: 'Prohibited Conduct',
            body: 'Guests shall not engage in harassment, stalking, threats, abuse, intoxication, illicit drug consumption, extortion, or any unlawful activity during or following a session.',
          },
        ],
      },
      {
        id: 'platform-limitations',
        heading: '5. Platform Limitations & Balanced Disclaimer of Liability',
        content:
          'Navratri Companion provides a technology platform for facilitating interactions and bookings between users. Users are responsible for their own decisions, conduct, communications, and interactions. The platform does not control or dictate the independent conduct or arrangements made by users outside the platform.',
        subsections: [
          {
            title: 'Limitation of Liability to Permitted Extent',
            body: 'To the maximum extent permitted by applicable law, the platform is not liable for independent acts, errors, breaches, representations, warranties, or omissions of users, or for interactions occurring outside the platform’s control.',
          },
          {
            title: 'Statutory Consumer Rights Preserved',
            body: 'Nothing in these Terms limits or excludes any liability, consumer right, or other protection that cannot legally be limited or excluded under applicable law, including the Consumer Protection Act, 2019, or liability arising from willful misconduct or gross negligence attributable directly to the platform operator.',
          },
        ],
      },
      {
        id: 'dispute-resolution',
        heading: '6. Governing Law, Dispute Resolution & Jurisdiction',
        content:
          'These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of India. Any dispute, claim, or controversy arising out of or relating to this platform shall be subject to the exclusive jurisdiction of the competent courts situated in Ahmedabad, Gujarat, India.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy & Data Protection',
    shortTitle: 'Privacy Policy',
    version: 'v1.2.0',
    effectiveDate: 'October 1, 2026',
    lastUpdated: 'September 25, 2026',
    status: 'published',
    summary:
      'Explains personal data collection, processing purposes, contact number unlocking protocols, operational data sharing, and security safeguards under the Digital Personal Data Protection Act (DPDPA), 2023.',
    mandatoryConsentOnSignup: true,
    sections: [
      {
        id: 'information-collected',
        heading: '1. Personal Information We Collect',
        content:
          'To deliver a secure and verified festive companion experience, Navratri Companion collects specific categories of personal data:',
        subsections: [
          {
            title: 'Identity & Profile Information',
            body: 'Full legal name, chosen User ID, email address, mobile phone number, age, gender, profile photograph/selfie, city, cultural interests, Garba style, and biographical information.',
          },
          {
            title: 'Identity Verification Data',
            body: 'Government ID documents (such as Aadhaar, PAN, Voter ID, or Driving License) uploaded for KYC verification, face-match photographs, and verification timestamps.',
          },
          {
            title: 'Booking & Interaction Data',
            body: 'Session date, requested time slot, package tier (2-Hour or 4-Hour), mutually agreed public meeting locations, special festive notes, and mutual check-in records.',
          },
          {
            title: 'Payment & Financial Transaction Information',
            body: 'Payment reference numbers, UPI transaction references (UTR), escrow ledger logs, payout account identifiers (UPI ID / IFSC / account mask), and registration fee payment records.',
          },
          {
            title: 'Support, Feedback & Grievance Data',
            body: 'Customer support messages, emergency SOS transmissions, problem reports, complaint descriptions, submitted screenshots, and dispute resolution notes.',
          },
          {
            title: 'Technical, Device & Session Data',
            body: 'IP addresses, browser type, device operating system, login/session timestamps, policy consent logs, and security audit events.',
          },
        ],
      },
      {
        id: 'purpose-of-use',
        heading: '2. Why We Collect & Process Your Data',
        content:
          'We process your personal information strictly for lawful purposes with legitimate bases, including:',
        subsections: [
          {
            title: 'Service Delivery & Booking Facilitation',
            body: 'Creating user accounts, authenticating logins, publishing companion listings, matching bookings, and issuing digital festival passes.',
          },
          {
            title: 'Escrow Payments & Payout Processing',
            body: 'Verifying registration fee payments, managing booking escrow holds, and disbursing companion payouts following successful mutual check-in.',
          },
          {
            title: 'Platform Safety, Trust & Fraud Prevention',
            body: 'Screening users against fraud, investigating reported violations, deterring impersonation, and coordinating rapid emergency response through our Safety Squad.',
          },
          {
            title: 'Legal Compliance & Dispute Resolution',
            body: 'Complying with statutory obligations under Indian information technology, tax, and consumer protection laws, and resolving user disputes.',
          },
        ],
      },
      {
        id: 'contact-unlock-rules',
        heading: '3. Contact Information Privacy & Unlocking Protocol',
        content:
          'We enforce strict data masking and privacy protection for telephone numbers and WhatsApp credentials:',
        subsections: [
          {
            title: 'Pre-Booking Concealment',
            body: 'Before a booking is confirmed and the required escrow payment is verified, all personal telephone numbers, WhatsApp details, and personal contact vectors remain completely hidden from visitors and unregistered viewers.',
          },
          {
            title: 'Post-Payment Authorized Unlocking',
            body: 'Upon successful confirmation of the booking payment via official UPI escrow, verified contact details (phone and WhatsApp) are unlocked strictly and mutually between the confirmed guest and assigned companion to coordinate arrival at the public meeting place.',
          },
          {
            title: 'No Public Web Indexing',
            body: 'Private contact information is never published in open web listings, search engine caches, or public marketing directories.',
          },
        ],
      },
      {
        id: 'data-sharing',
        heading: '4. Data Sharing with Essential Operational Providers',
        content:
          'We do not sell, rent, or trade your personal data to third-party advertisers or data brokers. However, to operate the platform, necessary information is shared with trusted operational service providers:',
        subsections: [
          {
            title: 'Operational Infrastructure & Cloud Providers',
            body: 'Cloud server hosting, secure database management, and platform uptime monitoring services.',
          },
          {
            title: 'Payment & Banking Gateways',
            body: 'Licensed payment infrastructure, UPI verification gateways, and automated escrow payout processing partners.',
          },
          {
            title: 'Communication & Verification Services',
            body: 'SMS gateway providers, transactional WhatsApp notification APIs, and automated KYC verification engines.',
          },
          {
            title: 'Statutory & Law Enforcement Authorities',
            body: 'We may disclose personal data to law enforcement, government bodies, or judicial courts when required by summons, court order, or applicable Indian law, particularly in cases involving physical safety or cybercrime.',
          },
        ],
      },
      {
        id: 'retention-security',
        heading: '5. Data Retention, Security & User Rights',
        content:
          'Your data is protected using 256-bit SSL encryption in transit and secure database vaults at rest. In compliance with the Digital Personal Data Protection Act, 2023, you retain the right to request access, correction, or deletion of your profile data by submitting a formal request to our Grievance Officer.',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety Guidelines & Legal Disclaimer',
    shortTitle: 'Safety & Disclaimer',
    version: 'v1.2.0',
    effectiveDate: 'October 1, 2026',
    lastUpdated: 'September 25, 2026',
    status: 'published',
    summary:
      'Critical safety practices for festival participants, verification boundaries, personal precautions, and emergency emergency service coordination protocols.',
    mandatoryConsentOnSignup: true,
    sections: [
      {
        id: 'safety-notice',
        heading: '1. Important Personal Safety Notice',
        content:
          'Your physical safety, emotional comfort, and well-being are paramount. All users must exercise personal prudence and follow these fundamental safety rules:',
        subsections: [
          {
            title: 'Public, Populated Venues Only',
            body: 'Always meet in bright, populated, open public festival spaces such as authorized Garba grounds, community party plots, or central festive food courts. Never agree to meet in secluded, unlit, or private locations.',
          },
          {
            title: 'Inform a Trusted Contact',
            body: 'Before departing for a session, share your itinerary, meeting location, companion’s digital pass details, and expected return time with a trusted family member or friend.',
          },
          {
            title: 'Secure Valuables & Transport',
            body: 'Keep mobile devices, cash, jewelry, and personal keys secure. Plan your arrival and return transit in advance using licensed public or app-based transport.',
          },
          {
            title: 'Guard Sensitive Information',
            body: 'Never share sensitive private data such as home addresses, banking passwords, OTPs, or private financial details with any companion or guest.',
          },
          {
            title: 'Leave Immediately if Uncomfortable',
            body: 'If at any point before or during a session you feel threatened, uncomfortable, or unsafe, end the interaction immediately and move toward festival security or crowd personnel.',
          },
        ],
      },
      {
        id: 'verification-boundaries',
        heading: '2. Platform Safety Features & Verification Boundaries',
        content:
          'Navratri Companion implements multiple proactive trust layers, including mobile phone verification, government identification checks, and community rating reviews. However, users must understand the inherent limitations of verification:',
        subsections: [
          {
            title: 'Verification Enhances Trust, Not Guarantees',
            body: 'Verification features are designed to improve community accountability and weed out bad actors. However, identity verification reflects past documentation and DOES NOT GUARANTEE a person’s future behavior, character, temperament, or safety.',
          },
          {
            title: 'No Guarantee of Complete Safety',
            body: 'Under no circumstances should a verified badge be interpreted as a warranty or guarantee by the platform that a user is 100% safe or infallible. Users must remain alert and exercise reasonable personal diligence at all times.',
          },
        ],
      },
      {
        id: 'emergency-protocols',
        heading: '3. Emergency Situations & Law Enforcement Contact',
        content:
          'In any situation involving imminent danger, physical threat, assault, or unlawful behavior, users must immediately contact official emergency services rather than relying solely on the platform application:',
        subsections: [
          {
            title: 'National Emergency Response System (NERS)',
            body: 'Dial 112 immediately for immediate Police, Ambulance, or Fire assistance across Gujarat.',
          },
          {
            title: 'Gujarat Police Women Helpline',
            body: 'Dial 181 (Abhayam Women Helpline) for 24x7 specialized women safety and immediate rescue dispatch.',
          },
          {
            title: 'Platform Emergency Support Squad',
            body: 'Once safe, activate the in-app Emergency SOS trigger or call our dedicated festival safety line at 1800 200 9090 so our team can log the incident, freeze funds, and assist police authorities.',
          },
        ],
      },
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation & Refund Policy',
    shortTitle: 'Cancellation & Refunds',
    version: 'v1.2.0',
    effectiveDate: 'October 1, 2026',
    lastUpdated: 'September 25, 2026',
    status: 'published',
    summary:
      'Clear, uniform rules governing the one-time registration fee, booking escrow collections, historical transaction integrity, and cancellation refund eligibility.',
    mandatoryConsentOnSignup: false,
    sections: [
      {
        id: 'registration-fee-policy',
        heading: '1. One-Time Account Registration Fee Policy',
        content:
          'The platform charges a ₹499 account registration fee for new hosts and premium account activations:',
        subsections: [
          {
            title: 'One-Time Onboarding Fee',
            body: 'The ₹499 registration fee is a strictly one-time account verification and onboarding charge. It covers identity verification, administrative screening, and platform provisioning.',
          },
          {
            title: 'No Recurring Charges for Active Accounts',
            body: 'The registration fee is NEVER charged again to an already approved, active account in future festival seasons.',
          },
          {
            title: 'Non-Refundable Upon Verification Inception',
            body: 'Because manual KYC screening and backend identity matching commence immediately upon submission, the registration fee is non-refundable once verification processing has begun.',
          },
        ],
      },
      {
        id: 'booking-payment-escrow',
        heading: '2. Booking Payment Collection & Escrow Holding',
        content:
          'All companion booking fees are collected via the platform’s secure UPI payment gateway and held securely in escrow. Funds are never released to the companion host until the mutual check-in is logged at the agreed public meeting place.',
      },
      {
        id: 'historical-transactions',
        heading: '3. Historical Transaction Integrity',
        content:
          'Once a payment has been completed for a booking, any subsequent modification to platform fee schedules, platform commissions, or companion hourly rates shall NOT retroactively change the financial value of historical or existing transactions. All confirmed passes are honored at their original booked rate.',
      },
      {
        id: 'cancellation-timelines',
        heading: '4. Cancellation Timelines & Refund Eligibility',
        content:
          'To ensure fairness to both guests and companion hosts reserving festive nights, cancellations are handled under the following uniform rules:',
        subsections: [
          {
            title: 'Cancellation > 24 Hours Before Session',
            body: 'Guests receive a 100% full refund of the companion base fee directly credited back to their original UPI payment source within 24 to 48 hours.',
          },
          {
            title: 'Cancellation Between 4 and 24 Hours Before Session',
            body: 'Guests receive a 70% refund of the companion base fee. The remaining 30% is credited to the companion as a reservation holding compensation.',
          },
          {
            title: 'Cancellation Under 4 Hours Before Session',
            body: 'Guests receive a 50% refund. The remaining 50% is released to the companion to compensate for loss of festive booking slot.',
          },
          {
            title: 'Companion No-Show or Failure to Arrive',
            body: 'If a companion fails to arrive at the agreed meeting place or cannot be reached, the guest receives an immediate 100% refund of all fees paid, and the companion profile receives an automatic penalty strike.',
          },
        ],
      },
      {
        id: 'dashboard-configurability',
        heading: '5. Dashboard Governance & Dispute Escalation',
        content:
          'In special circumstances involving medical emergencies or weather disruptions, the Platform Operations Admin has authority to grant 100% full compassionate refunds upon reviewing complaint tickets.',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community Guidelines & Standards of Conduct',
    shortTitle: 'Community Guidelines',
    version: 'v1.2.0',
    effectiveDate: 'October 1, 2026',
    lastUpdated: 'September 25, 2026',
    status: 'published',
    summary:
      'Community standards prohibiting harassment, fraud, sexual exploitation, abuse, and platform circumvention, along with progressive disciplinary enforcements.',
    mandatoryConsentOnSignup: true,
    sections: [
      {
        id: 'prohibited-conduct',
        heading: '1. Zero-Tolerance Prohibited Conduct',
        content:
          'Navratri Companion is built upon the sacred Gujarati festive values of joy, respect, and cultural celebration. The following behaviors are strictly prohibited and result in swift disciplinary action:',
        subsections: [
          {
            title: 'Harassment, Stalking & Abuse',
            body: 'Any form of verbal, emotional, or digital harassment, offensive messages, relentless calling, intimidation, or stalking before, during, or after a session.',
          },
          {
            title: 'Threats & Physical Violence',
            body: 'Any threat of bodily harm, physical assault, coercion, intimidation, or aggressive behavior toward any participant, staff member, or bystander.',
          },
          {
            title: 'Sexual Exploitation & Non-Consensual Acts',
            body: 'Navratri Companion is strictly non-sexual and cultural. Soliciting, proposing, or engaging in commercial sex, prostitution, pornography, nudity, or unwanted romantic physical contact is grounds for immediate police reporting.',
          },
          {
            title: 'Fraud, Impersonation & Fake Profiles',
            body: 'Creating misleading accounts, using stolen or altered photographs, misrepresenting age or identity, or pretending to be another person.',
          },
          {
            title: 'Privacy Violations & Doxxing',
            body: 'Publishing, distributing, or sharing another user’s real name, private phone number, residence, workplace, or photographs without their explicit written consent.',
          },
          {
            title: 'Extortion & Off-Platform Solicitation',
            body: 'Attempting to extort cash, demanding tips outside platform escrow, or threatening bad reviews to extract unearned payments.',
          },
          {
            title: 'Discrimination & Hate Speech',
            body: 'Promoting discrimination, disparagement, or hostility based on religion, caste, gender, sexual orientation, disability, or nationality.',
          },
        ],
      },
      {
        id: 'disciplinary-enforcement',
        heading: '2. Disciplinary Actions & Enforcement Framework',
        content:
          'When a complaint or safety report is received, platform operations investigates the evidence and enforces appropriate sanctions depending on severity:',
        subsections: [
          {
            title: 'Level 1: Formal Warning',
            body: 'Issued for minor infractions such as minor unpunctuality or uncommunicative behavior.',
          },
          {
            title: 'Level 2: Profile Restriction & Shadow Ban',
            body: 'Temporary exclusion from marketplace discovery while complaints are investigated.',
          },
          {
            title: 'Level 3: Booking Cancellation & Escrow Freeze',
            body: 'Immediate termination of pending bookings with funds frozen pending dispute resolution.',
          },
          {
            title: 'Level 4: Permanent Suspension & Blacklisting',
            body: 'Immediate permanent ban across all phone numbers, Aadhaar records, and IP ranges.',
          },
          {
            title: 'Level 5: Formal Police Referral',
            body: 'In cases involving harassment, assault, extortion, or fraud, complete digital logs are transferred directly to Gujarat Police Cyber Cell or local police stations.',
          },
        ],
      },
    ],
  },
  {
    id: 'grievance',
    title: 'Contact & Grievance Redressal Support',
    shortTitle: 'Contact / Grievance',
    version: 'v1.2.0',
    effectiveDate: 'October 1, 2026',
    lastUpdated: 'September 25, 2026',
    status: 'published',
    summary:
      'Statutory compliance details, designated Grievance Officer information under Indian IT Rules 2021, dispute redressal timelines, and 24/7 emergency hotlines.',
    mandatoryConsentOnSignup: false,
    sections: [
      {
        id: 'statutory-compliance',
        heading: '1. Statutory Compliance under Indian Information Technology Rules',
        content:
          'In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Consumer Protection (E-Commerce) Rules, 2020, Navratri Companion has designated a formal Grievance Redressal Officer to address complaints concerning platform usage, data privacy, and user conduct.',
      },
      {
        id: 'grievance-officer',
        heading: '2. Designated Grievance Redressal Officer Details',
        content:
          'Users and consumers may communicate grievances or complaints directly to our designated officer:',
        subsections: [
          {
            title: 'Grievance Officer Name',
            body: 'Mr. Bhavesh Trivedi',
          },
          {
            title: 'Designation & Department',
            body: 'Head of Legal Compliance, Trust & Grievance Redressal',
          },
          {
            title: 'Entity Name',
            body: 'Navratri Companion Technologies Pvt. Ltd.',
          },
          {
            title: 'Registered Office Address',
            body: 'Suite 402, Shivalik Highstreet, Near Keshavbaug Party Plot, Judges Bungalow Road, Vastrapur, Ahmedabad, Gujarat 380015, India',
          },
          {
            title: 'Dedicated Grievance Email',
            body: 'grievance@navratricompanion.com (Subject line: "Grievance Redressal - [Your User ID]")',
          },
          {
            title: 'Direct Redressal Desk Phone',
            body: '+91 (079) 4901 8800 (Monday – Saturday, 10:00 AM – 6:00 PM IST)',
          },
        ],
      },
      {
        id: 'redressal-timelines',
        heading: '3. Grievance Acknowledgment & Resolution Timelines',
        content:
          'We strictly observe the following statutory timelines upon receipt of any written complaint or grievance:',
        subsections: [
          {
            title: 'Acknowledgment within 24 Hours',
            body: 'Every formal complaint receives an automated or personalized written acknowledgment and unique Complaint Ticket ID within 24 hours of receipt.',
          },
          {
            title: 'Investigation & Resolution within 15 Days',
            body: 'In compliance with Indian law, all grievances are thoroughly investigated, documented, and formally disposed of within 15 calendar days from the date of receipt.',
          },
          {
            title: 'Expedited Review for Safety Matters',
            body: 'Complaints alleging harassment, impersonation, or physical safety concerns are escalated immediately to our Safety Squad and reviewed within 2 hours.',
          },
        ],
      },
      {
        id: 'emergency-helplines',
        heading: '4. 24x7 Festival Emergency Contacts',
        content:
          'For urgent festival night assistance or immediate security concerns:',
        subsections: [
          {
            title: '24x7 Festival Safety Helpline',
            body: '1800 200 9090 (Toll-Free, operational round the clock throughout Navratri)',
          },
          {
            title: 'Local Police Emergency (All India)',
            body: '112 / 100',
          },
          {
            title: 'Gujarat Abhayam Women Helpline',
            body: '181',
          },
        ],
      },
    ],
  },
];

export const INITIAL_POLICY_AUDIT_LOGS: PolicyAuditEntry[] = [
  {
    id: 'paud-001',
    policyId: 'terms',
    policyTitle: 'Terms & Conditions of Service',
    previousVersion: 'v1.1.0',
    newVersion: 'v1.2.0',
    changedBy: 'Super Admin (Operations Lead)',
    changedAt: '2026-09-25 15:30:00',
    changeSummary:
      'Updated limitation of liability clauses to strictly align with Indian IT Act 2000 and removed ambiguous disclaimers. Added explicit companion conduct covenants.',
  },
  {
    id: 'paud-002',
    policyId: 'privacy',
    policyTitle: 'Privacy Policy & Data Protection',
    previousVersion: 'v1.1.0',
    newVersion: 'v1.2.0',
    changedBy: 'Super Admin (Operations Lead)',
    changedAt: '2026-09-25 15:45:00',
    changeSummary:
      'Clarified telephone and WhatsApp contact unlocking rules after confirmed escrow payment and articulated essential operational vendor data sharing.',
  },
  {
    id: 'paud-003',
    policyId: 'cancellation',
    policyTitle: 'Cancellation & Refund Policy',
    previousVersion: 'v1.0.0',
    newVersion: 'v1.2.0',
    changedBy: 'Super Admin (Operations Lead)',
    changedAt: '2026-09-25 16:10:00',
    changeSummary:
      'Formalized ₹499 one-time non-recurring registration fee, locked historical transaction fee integrity, and defined clear tiered refund timelines.',
  },
];
