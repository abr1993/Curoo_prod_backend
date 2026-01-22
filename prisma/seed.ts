import { PrismaClient, FieldType, UserRole } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // --- 1️⃣ Create Specialties ---
   const ophthalmology = await prisma.specialty.upsert({
    where: { name: "Ophthalmology" },
    update: {},
    create: {
      name: "Ophthalmology",
      description: "Eye-related care and vision health",
    },
  });

  /* const cardiology = await prisma.specialty.upsert({
    where: { name: "Cardiology" },
    update: {},
    create: {
      name: "Cardiology",
      description: "Heart-related care and cardiovascular health",
    },
  });

   const internalMedicine = await prisma.specialty.upsert({
    where: { name: "Internal Medicine" },
    update: {},
    create: {
      name: "Internal Medicine",
      description: "prevention, diagnosis, and treatment of diseases in adults",
    },
  }); */

  // --- 2️⃣ Link SpecialtyForHistory templates (assuming you already seeded them before) ---
  const ophthalmologyHistory = await prisma.specialtyForHistory.create({
    data: {
      name: "Ophthalmology",
      description: "Eye-related care and medical history",
      fields: {
        create: [
          {
            name: "Medications",
            type: FieldType.TEXT,
            
          },
          {
            name: "Allergies",
            type: FieldType.TEXT,
            
          },
           {
              name: "Additional History",
              type: FieldType.TEXTAREA,
            },
          
          {
            name: "Eye history",
            type: FieldType.MULTISELECT,
            options: {
              create: [
                { value: "None" },
                { value: "Contact lenses" },
                { value: "Recent eye surgery (<90d)" },
                { value: "Glaucoma" },
                { value: "LASIK/PRK" },
                { value: "Uveitis" },
              ],
            },
          },
          {
            name: "Systemic",
            type: FieldType.MULTISELECT,
            options: {
              create: [
                { value: "None" },
                { value: "Diabetes" },
                { value: "Thyroid" },
                { value: "Autoimmune/Sjögren’s" },
              ],
            },
          },
        ],
      },
    },
  });
  /* const cardiologyHistory = await prisma.specialtyForHistory.create({
    data: {
      name: "Cardiology",
      description: "Heart-related care and medical history",
      fields: {
        create: [
          {
            name: "Medications",
            type: FieldType.TEXT,
            
          },
          {
            name: "Allergies",
            type: FieldType.TEXT,
            
          },
           {
              name: "Additional History",
              type: FieldType.TEXTAREA,
            },
          
          {
            name: "Cardiac history",
            type: FieldType.MULTISELECT,
            options: {
              create: [
                { value: "Hypertension" },
                { value: "CAD" },
                { value: "Heart failure" },
                { value: "Valve disease" },
              ],
            },
          },
          {
            name: "Risk factors",
            type: FieldType.MULTISELECT,
            options: {
              create: [
                { value: "Smoking" },
                { value: "Diabetes" },
                { value: "Obesity" },
                { value: "Family history" },
              ],
            },
          },
        ],
      },
    },
  });
  const internalMedicineHistory = await prisma.specialtyForHistory.create({
    data: {
      name: "Internal Medicine",
      description: "prevention, diagnosis, and treatment of diseases in adults",
      fields: {
        create: [
          {
            name: "Medications",
            type: FieldType.TEXT,
            
          },
          {
            name: "Allergies",
            type: FieldType.TEXT,
            
          },
           {
              name: "Additional History",
              type: FieldType.TEXTAREA,
            },
          
          {
            name: "General history",
            type: FieldType.MULTISELECT,
            options: {
              create: [
                { value: "Hypertension" },
                { value: "Gastrointestinal" },
                { value: "Hematologic" },
                { value: "Hypothyroidism" },
              ],
            },
          },
          {
            name: "Risk factors",
            type: FieldType.MULTISELECT,
            options: {
              create: [
                { value: "Pneumonia" },
                { value: "Diabetes" },
                { value: "Obesity" },
                { value: "Asthma" },
              ],
            },
          },
        ],
      },
    },
  }); */
  const ophHistoryTemplate = await prisma.specialtyForHistory.findFirst({
    where: { name: "Ophthalmology" },
  });
  /* const cardioHistoryTemplate = await prisma.specialtyForHistory.findFirst({
    where: { name: "Cardiology" },
  });
  const internalMedicineHistoryTemplate = await prisma.specialtyForHistory.findFirst({
    where: { name: "Internal Medicine" },
  }); */

  if (ophHistoryTemplate)
    await prisma.specialty.update({
      where: { id: ophthalmology.id },
      data: { history_template_id: ophHistoryTemplate.id },
    });

  /* if (cardioHistoryTemplate)
    await prisma.specialty.update({
      where: { id: cardiology.id },
      data: { history_template_id: cardioHistoryTemplate.id },
    }); 

  if (internalMedicineHistoryTemplate)
    await prisma.specialty.update({
      where: { id: internalMedicine.id },
      data: { history_template_id: internalMedicineHistoryTemplate.id },
    }); */

  // --- 3️⃣ Create Users (Providers) ---
  /* const drAlex = await prisma.user.create({
    data: {
      role: "PROVIDER",
      email: "alex.johnson@example.com",
      phone: "555-1111",
      provider: {
        create: {
          display_name: "Dr. Alex Johnson",
        },
      },
    },
  });

  const drEmma = await prisma.user.create({
    data: {
      role: "PROVIDER",
      email: "emma.watson@example.com",
      phone: "555-2222",
      provider: {
        create: {
          display_name: "Dr. Emma Watson",
        },
      },
    },
  });

  const drRichard = await prisma.user.create({
    data: {
      role: "PROVIDER",
      email: "richard.bolt@example.com",
      phone: "555-3333",
      provider: {
        create: {
          display_name: "Dr. Richard Bolt",
        },
      },
    },
  }); */
  const drEnoch = await prisma.user.create({
    data: {
      role: UserRole.PROVIDER,
      email: "team@curooapp.com",
      phone: "317-338-2345",
      provider: {
        create: {
          display_name: "Dr. Enoch Kassa",
          
        },
      },
    },
  });
/*    const drAlex = await prisma.user.create({
    data: {
      role: UserRole.PROVIDER,
      email: "alex.johnson@example.com",
      phone: "555-1111",
      provider: {
        create: {
          display_name: "Dr. Alex Johnson",
        },
      },
    },
  }); */
  const system = await prisma.user.create({
    data: {
      role: UserRole.SYSTEM,
      email: "system@curooapp.com",
      phone: "000-000-0000",
      
    },
  });
  
  

  // --- 4️⃣ Assign ProviderSpecialties ---
  const enochOphSpec = await prisma.providerSpecialty.create({
    data: {
      provider_id: drEnoch.id,
      specialty_id: ophthalmology.id,
    },
  });
  /* const alexOphSpec = await prisma.providerSpecialty.create({
    data: {
      provider_id: drAlex.id,
      specialty_id: ophthalmology.id,
    },
  }); */
  /* const enochIMSpec = await prisma.providerSpecialty.create({
    data: {
      provider_id: drEnoch.id,
      specialty_id: internalMedicine.id,
    },
  });
  const alexOphSpec = await prisma.providerSpecialty.create({
    data: {
      provider_id: drAlex.id,
      specialty_id: ophthalmology.id,
    },
  });

  const emmaOphSpec = await prisma.providerSpecialty.create({
    data: {
      provider_id: drEmma.id,
      specialty_id: ophthalmology.id,
    },
  });

  const richardCardioSpec = await prisma.providerSpecialty.create({
    data: {
      provider_id: drRichard.id,
      specialty_id: cardiology.id,
    },
  }); */

  // --- 5️⃣ Create Provider Licenses ---
  await prisma.providerLicense.createMany({
    data: [
      /* {
        provider_specialty_id: alexOphSpec.id,
        provider_id: drAlex.id,
        state: "CA",
        price_cents: 12000,
        daily_cap: 10,
      },
      {
        provider_specialty_id: alexOphSpec.id,
        provider_id: drAlex.id,
        state: "TX",
        price_cents: 12000,
        daily_cap: 10,
      },
      {
        provider_specialty_id: emmaOphSpec.id,
        provider_id: drEmma.id,
        state: "CA",
        price_cents: 12000,
        daily_cap: 10,
      },
      {
        provider_specialty_id: richardCardioSpec.id,
        provider_id: drRichard.id,
        state: "TX",
        price_cents: 15000,
        daily_cap: 8,
      }, */
      {
        provider_specialty_id: enochOphSpec.id,
        provider_id: drEnoch.id,
        state: "IN",
        price_cents: 10000,
        daily_cap: 10,
      },
      /* {
        provider_specialty_id: alexOphSpec.id,
        provider_id: drAlex.id,
        state: "IN",
        price_cents: 12000,
        daily_cap: 10,
      }, */
      /* {
        provider_specialty_id: enochIMSpec.id,
        provider_id: drEnoch.id,
        state: "IN",
        price_cents: 8000,
        daily_cap: 10,
      },
      {
        provider_specialty_id: enochOphSpec.id,
        provider_id: drEnoch.id,
        state: "CA",
        price_cents: 12000,
        daily_cap: 10,
      }, */
    ],
  });

  // --- 6️⃣ Ophthalmology Conditions & Symptoms ---
  const ophConditions = await prisma.condition.createMany({
    data: [
      { name: "Dry eye symptoms", description: "Dry or gritty sensation" },
      { name: "Red or irritated eye", description: "Inflamed or red eye" },
      { name: "Stye or eyelid bump", description: "Eyelid inflammation or bump" },
      { name: "Eyelid lesion or growth", description: "Abnormal growth on eyelid" },
      { name: "Glaucoma", description: "Optic nerve pressure damage" },
      { name: "Cataract", description: "Clouding of eye lens" },
      { name: "Eye Surgeries", description: "Corrective ocular procedures" },
      { name: "Macular Degeneration", description: "Central vision deterioration" },
      
    ],
    skipDuplicates: true,
  });

  const ophSymptoms = await prisma.symptom.createMany({
    data: [
      { name: "Pain", description: "Eye pain or discomfort" },
      { name: "Light_sensitivity", description: "Sensitivity to light" },
      { name: "Redness", description: "Redness in the eye" },
      { name: "Blur", description: "Blurred vision" },
    ],
    skipDuplicates: true,
  });

  // --- 7️⃣ Cardiology Conditions & Symptoms ---
 /*  const cardioConditions = await prisma.condition.createMany({
    data: [
      { name: "Hypertension", description: "High blood pressure" },
      { name: "Arrhythmia", description: "Irregular heartbeat" },
      { name: "Heart failure", description: "Weak heart muscle" },
    ],
    skipDuplicates: true,
  });

  const cardioSymptoms = await prisma.symptom.createMany({
    data: [
      { name: "Chest pain", description: "Tightness or pain in the chest" },
      { name: "Shortness of breath", description: "Difficulty breathing" },
      { name: "Palpitations", description: "Irregular or rapid heartbeat" },
    ],
    skipDuplicates: true,
  });

  const internalMedicineConditions = await prisma.condition.createMany({
    data: [
      { name: "Hypertension", description: "High blood pressure" },
      { name: "Hypothyroidism", description: "Not producing enough thyroid hormones" },
      { name: "Hyperlipidemia", description: "High cholestrol" },
      { name: "Gout", description: "Inflammatory arthritis" },
      { name: "Gallstones", description: "Stones in gall blader" },
      
    ],
    skipDuplicates: true,
  });
  const internalMedicineSymptoms = await prisma.symptom.createMany({
    data: [
      { name: "Chest pain", description: "Tightness or pain in the chest" },
      { name: "Shortness of breath", description: "Difficulty breathing" },
      { name: "Palpitations", description: "Irregular or rapid heartbeat" },
      { name: "Rash or skin changes", description: "Rash or skin changes" }
    ],
    skipDuplicates: true,
  }); */

  // --- 8️⃣ Map specialties <-> conditions/symptoms ---
  // Ophthalmology
  const allOphConditions = await prisma.condition.findMany({
    where: { name: { in: ["Dry eye symptoms", "Red or irritated eye", "Stye or eyelid bump", "Eyelid lesion or growth","Glaucoma", "Cataract", "Eye Surgeries", "Macular Degeneration"] } },
  });
  const allOphSymptoms = await prisma.symptom.findMany({
    where: { name: { in: ["Pain", "Light_sensitivity", "Redness", "Blur"] } },
  });

  for (const c of allOphConditions) {
    await prisma.specialtyCondition.create({
      data: {
        specialty_id: ophthalmology.id,
        condition_id: c.id,
      },
    });
  }

  for (const s of allOphSymptoms) {
    await prisma.specialtySymptom.create({
      data: {
        specialty_id: ophthalmology.id,
        symptom_id: s.id,
      },
    });
  }

  // Cardiology
  /* const allCardioConditions = await prisma.condition.findMany({
    where: { name: { in: ["Hypertension", "Arrhythmia", "Heart failure"] } },
  });
  const allCardioSymptoms = await prisma.symptom.findMany({
    where: { name: { in: ["Chest pain", "Shortness of breath", "Palpitations"] } },
  });

  for (const c of allCardioConditions) {
    await prisma.specialtyCondition.create({
      data: {
        specialty_id: cardiology.id,
        condition_id: c.id,
      },
    });
  }

  for (const s of allCardioSymptoms) {
    await prisma.specialtySymptom.create({
      data: {
        specialty_id: cardiology.id,
        symptom_id: s.id,
      },
    });
  } 

  const allinternalMedicineConditions = await prisma.condition.findMany({
    where: { name: { in: ["Hypertension", "Hypothyroidism", "Hyperlipidemia", "Gout", "Gallstones"] } },
  });
  const allinternalMedicineSymptoms = await prisma.symptom.findMany({
    where: { name: { in: ["Chest pain", "Shortness of breath", "Palpitations", "Rash or skin changes"] } },
  });

  for (const c of allinternalMedicineConditions) {
    await prisma.specialtyCondition.create({
      data: {
        specialty_id: internalMedicine.id,
        condition_id: c.id,
      },
    });
  }

  for (const s of allinternalMedicineSymptoms) {
    await prisma.specialtySymptom.create({
      data: {
        specialty_id: internalMedicine.id,
        symptom_id: s.id,
      },
    });
  }  */

  /* if (!ophthalmology || !cardiology || !internalMedicine) {
    throw new Error('Required specialties not found in database.');
  } */
 if (!ophthalmology ) {
    throw new Error('Required specialties not found in database.');
  }
  // ✅ Ophthalmology Red Flags
  const ophthalmologyRedFlags = [
    'Severe eye pain',
    'Sudden vision loss or "curtain" over vision',
    'Chemical exposure or eye trauma',
    'Flashes of light with many new floaters',
    'Painful red eye with contact lens use',
    'Recent eye surgery (within 90 days)',
  ];

  // ✅ Cardiology Red Flags
  /* const cardiologyRedFlags = [
    'Chest pain radiating to arm, jaw, or back',
    'Shortness of breath at rest or with minimal exertion',
    'Fainting (syncope) or near-syncope during activity',
    'Palpitations with dizziness or chest discomfort',
    'Sudden swelling of legs or rapid weight gain (>2 kg in 2 days)',
  ];
  // ✅ internalMedicine Red Flags
  const internalMedicineRedFlags = [
    'Fatigue, weakness',
    'Unintentional weight loss or gain',
    'Abdominal pain or bloating',
    'Joint pain or stiffness',
    'Seizure'
  ]; */

  // Helper function to create red flags + linking table entries
  async function createRedFlagsForSpecialty(specialtyId: string, flags: string[]) {
    for (const [index, name] of flags.entries()) {
      const redFlag = await prisma.redFlag.create({
        data: {
          name,
          description: name, // You can adjust this if description differs
        },
      });

      await prisma.specialtyRedFlag.create({
        data: {
          specialty_id: specialtyId,
          red_flag_id: redFlag.id,
          order: index + 1,
        },
      });
    }
  }

  // Seed both specialties
  await createRedFlagsForSpecialty(ophthalmology.id, ophthalmologyRedFlags);
  //await createRedFlagsForSpecialty(cardiology.id, cardiologyRedFlags);
//  await createRedFlagsForSpecialty(internalMedicine.id, internalMedicineRedFlags);  

  await prisma.template.upsert({
    where: { name: "OTP_CODE" },
    update: {      
      description: "Used for login / signup / verification codes",      
      subject: "Your verification code",
      textBody: `Hello {{name}},

        Your verification code is: {{otp}}

        This code expires in {{expiresIn}} minutes.
        Thank you,
        Curoo
        `,
      htmlBody: `
          <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
            <p style="font-size: 14px; margin: 0 0 12px 0;">
              Hello {{name}},
            </p>

            <p style="font-size: 14px; margin: 0 0 12px 0;">
              Your verification code is:
            </p>

            <p style="font-size: 20px; font-weight: 600; letter-spacing: 4px; margin: 0 0 12px 0;">
              {{otp}}
            </p>

            <p style="font-size: 13px; color: #4b5563; margin: 0 0 20px 0;">
              This code expires in <strong>{{expiresIn}} minutes</strong>.
            </p>

            <p style="font-size: 14px; margin: 0;">
              Thank you,<br />
              <strong>Curoo</strong>
            </p>
          </div>
              `

    },
    create: {
      name: "OTP_CODE",
      description: "Used for login / signup / verification codes",
      channel: "EMAIL",
      subject: "Your verification code",
      textBody: `Hello {{name}},

        Your verification code is: {{otp}}

        This code expires in {{expiresIn}} minutes.
        Thank you,
        Curoo
        `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
            <p style="font-size: 14px; margin: 0 0 12px 0;">
              Hello {{name}},
            </p>

            <p style="font-size: 14px; margin: 0 0 12px 0;">
              Your verification code is:
            </p>

            <p style="font-size: 20px; font-weight: 600; letter-spacing: 4px; margin: 0 0 12px 0;">
              {{otp}}
            </p>

            <p style="font-size: 13px; color: #4b5563; margin: 0 0 20px 0;">
              This code expires in <strong>{{expiresIn}} minutes</strong>.
            </p>

            <p style="font-size: 14px; margin: 0;">
              Thank you,<br />
              <strong>Curoo</strong>
            </p>
          </div>
              `
            }
          });
  
  // 2. CONSULT SUBMITTED
  await prisma.template.upsert({
    where: { name: "CONSULT_SUBMITTED" },
    update: {
      description: "Sent when a consult is submitted by a patient",      
      subject: "You have recieved a consult.",
      textBody: `Hello,

            We’re reaching out to inform you that you have recieved a consult from a patient on Curoo.

            You can view the consult request by following the link below:
            {{consultLink}}

            Thank You,
              Curoo
            `,
      htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <p style="font-size: 14px; margin: 0 0 12px 0;">
          Hello,
        </p>

        <p style="font-size: 14px; margin: 0 0 12px 0;">
          We’re reaching out to inform you that you have recieved a consult from a patient on Curoo.
        </p>

        <p style="font-size: 14px; margin: 0 0 12px 0;">
          You can view the consult request by following the link below:
        </p>

        <p style="margin: 0 0 20px 0;">
          <a
            href="{{consultLink}}"
            style="font-size: 14px; color: #2563eb; text-decoration: none;"
          >
            View Consult
          </a>
        </p>

        <p style="font-size: 14px; margin: 0;">
          Thank you,<br />
          <strong>Curoo</strong>
        </p>
      </div>        
      `
    },
    create: {
      name: "CONSULT_SUBMITTED",
      description: "Sent when a consult is submitted by a patient",
      channel: "EMAIL",
      subject: "You have recieved a consult.",
      textBody: `Hello,

            We’re reaching out to inform you that you have recieved a consult from a patient on curoo.

            You can view the consult request by following the link below:
            {{consultLink}}

            Thank you,
              Curoo
            `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <p style="font-size: 14px; margin: 0 0 12px 0;">
          Hello,
        </p>

        <p style="font-size: 14px; margin: 0 0 12px 0;">
          We’re reaching out to inform you that you have recieved a consult from a patient on Curoo.
        </p>

        <p style="font-size: 14px; margin: 0 0 12px 0;">
          You can view the consult request by following the link below:
        </p>

        <p style="margin: 0 0 20px 0;">
          <a
            href="{{consultLink}}"
            style="font-size: 14px; color: #2563eb; text-decoration: none;"
          >
            View Consult
          </a>
        </p>

        <p style="font-size: 14px; margin: 0;">
          Thank you,<br />
          <strong>Curoo</strong>
        </p>
      </div>  
      `
    }
  });

  // 3. CONSULT ANSWERED
  await prisma.template.upsert({
    where: { name: "CONSULT_ANSWERED" },
    update: {
      description: "Sent when a provider answers a consult",      
      subject: "Your consult has been answered",
      textBody: `Hello,

              We’re reaching out to inform you that your consult has been answered by the provider.

              You can view the provider's response by following the link below:
              {{consultLink}}

              Thank you for using our service. Should you have any further questions, please don't hesitate to reach out.
              
              Curoo
              `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>

          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to inform you that your consult has been answered by the provider.
          </p>

          <p style="font-size: 14px; margin: 0 0 12px 0;">
            You can view the provider's response by following the link below:
          </p>

          <p style="margin: 0 0 20px 0;">
            <a
              href="{{consultLink}}"
              style="font-size: 14px; color: #2563eb; text-decoration: none;"
            >
              View Answer
            </a>
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Thank you for using our service. Should you have any further questions, please don't hesitate to reach out.
          </p>
          <p style="font-size: 14px; margin: 0;">            
            <strong>Curoo</strong>
          </p>
        </div>         
      `
    },
    create: {
      name: "CONSULT_ANSWERED",
      description: "Sent when a provider answers a consult",
      channel: "EMAIL",
      subject: "Your consult has been answered",
      textBody: `Hello,

              We’re reaching out to inform you that your consult has been answered by the provider.

              You can view the provider's response by following the link below:
              {{consultLink}}

              Thank you for using our service. Should you have any further questions, please don't hesitate to reach out.
              
              Curoo
              `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>

          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to inform you that your consult has been answered by the provider.
          </p>

          <p style="font-size: 14px; margin: 0 0 12px 0;">
            You can view the provider's response by following the link below:
          </p>

          <p style="margin: 0 0 20px 0;">
            <a
              href="{{consultLink}}"
              style="font-size: 14px; color: #2563eb; text-decoration: none;"
            >
              View Answer
            </a>
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Thank you for using our service. Should you have any further questions, please don't hesitate to reach out.
          </p>
          <p style="font-size: 14px; margin: 0;">            
            <strong>Curoo</strong>
          </p>
        </div> 
      `
    }
  });

  // 4. CONSULT EXPIRED
  await prisma.template.upsert({
    where: { name: "CONSULT_REQUEST_EXPIRED" },
    update: {
      description: "Sent when a consult expires without response",      
      subject: "Your consult has expired",
      textBody: `Hello,

              We’re reaching out to let you know that your consult request has expired, as it was not answered within {{expiryTime}}.
              If you still require assistance, you may submit a new consult request at any time.
                Thank you,
                Curoo              
              `,
      htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that your consult request has expired, as it was not answered within {{expiryTime}}.
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            If you still require assistance, you may submit a new consult request at any time.
          </p>          
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div>        
      `
    },
    create: {
      name: "CONSULT_REQUEST_EXPIRED",
      description: "Sent when a consult expires without response",
      channel: "EMAIL",
      subject: "Your consult has expired",
      textBody: `Hello,

              We’re reaching out to let you know that your consult request has expired, as it was not answered within {{expiryTime}}.
              If you still require assistance, you may submit a new consult request at any time.
                Thank you,
                Curoo              
              `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that your consult request has expired, as it was not answered within {{expiryTime}}.
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            If you still require assistance, you may submit a new consult request at any time.
          </p>          
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div> 
      `
    }
  });
  await prisma.template.upsert({
    where: { name: "CONSULT_EXPIRED" },
    update: {
      description: "Sent when a consult expires without response",      
      subject: "Your consult has expired",
      textBody: `Hello,

              We’re reaching out to let you know that the consult request with consult ID {{consultId}} assigned to you has now expired after remaining unanswered for {{expiryTime}}.
              
                Thank you,
                Curoo              
              `,
      htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that the consult request with consult ID {{consultId}} assigned to you has now expired after remaining unanswered for {{expiryTime}}.
          </p>                    
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div>          
      `
    },
    create: {
      name: "CONSULT_EXPIRED",
      description: "Sent when a consult expires without response",
      channel: "EMAIL",
      subject: "Your consult has expired",
      textBody: `Hello,

              We’re reaching out to let you know that the consult request with consult ID {{consultId}} assigned to you has now expired after remaining unanswered for {{expiryTime}}.
              
                Thank you,
                Curoo              
              `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that the consult request with consult ID {{consultId}} assigned to you has now expired after remaining unanswered for {{expiryTime}}.
          </p>                    
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div> 
      `
    }
  });
  await prisma.template.upsert({
    where: { name: "CONSULT_DECLINED" },
    update: {
      description: "Sent when a consult is declined by the provider",
      subject: "Your consult has been declined",
      textBody: `Hello,

              We’re reaching out to let you know that your consult request has been declined for the following reason(s):
              {{declineReason}}
              If you still require assistance, you may submit a new consult request at any time.
                Thank you,
                Curoo             
              `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that your consult request has been declined by the provider for the following reason:
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            {{declineReason}}
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            If you still require assistance, you may submit a new consult request at any time.
          </p>          
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div>         
      `
    },
    create: {
      name: "CONSULT_DECLINED",
      description: "Sent when a consult is declined by the provider",
      channel: "EMAIL",
      subject: "Your consult has been declined",
      textBody: `Hello,

              We’re reaching out to let you know that your consult request has been declined for the following reason(s):
              {{declineReason}}
              If you still require assistance, you may submit a new consult request at any time.
                Thank you,
                Curoo             
              `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that your consult request has been declined by the provider for the following reason(s):
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            {{declineReason}}
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            If you still require assistance, you may submit a new consult request at any time.
          </p>          
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div> 
      `
    }
  });
  await prisma.template.upsert({
    where: { name: "CONSULT_ACCEPTED" },
    update: {      
      description: "Sent when a consult is accepted by the provider",      
      subject: "Your consult has been accepted",
      textBody: `Hello,

              We’re reaching out to let you know that your consult request has been accepted by the provider.              
                Thank you,
                Curoo             
              `,
      htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that your consult request has been accepted by the provider.
          </p>
                   
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div>           
      `
    },
    create: {
      name: "CONSULT_ACCEPTED",
      description: "Sent when a consult is accepted by the provider",
      channel: "EMAIL",
      subject: "Your consult has been accepted",
      textBody: `Hello,

              We’re reaching out to let you know that your consult request has been accepted by the provider.              
                Thank you,
                Curoo             
              `,
      htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that your consult request has been accepted by the provider.
          </p>
                   
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div>           
      `
    }
  });

  await prisma.template.upsert({
    where: { name: "ACCEPTED_CONSULT" },
    update: {
      description: "Sent to provider when they accept a consult",      
      subject: "Your have accepted a consult",
      textBody: `Hello,

              We’re reaching out to let you know that you have accepted a consult request. Please give your answer in the next {{expiryTime}} or it'll be automatically declined.             
                Thank you,
                Curoo              
              `,
      htmlBody: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that you have accepted a consult request. Please give your answer in the next {{expiryTime}} or it'll be automatically declined.             
          </p>
                   
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div>           
      `
    },
    create: {
      name: "ACCEPTED_CONSULT",
      description: "Sent to provider when they accept a consult",
      channel: "EMAIL",
      subject: "Your have accepted a consult",
      textBody: `Hello,

              We’re reaching out to let you know that you have accepted a consult request. Please give your answer in the next {{expiryTime}} or it'll be automatically declined.             
                Thank you,
                Curoo             
              `,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            Hello,
          </p>
          <p style="font-size: 14px; margin: 0 0 12px 0;">
            We’re reaching out to let you know that you have accepted a consult request. Please give your answer in the next {{expiryTime}} or it'll be automatically declined.             
          </p>
                   
          <p style="font-size: 14px; margin: 0;">            
            Thank you,<br />
             <strong>Curoo</strong>
          </p>
        </div>
      `
    }
  });
  
  

  

  console.log('✅ Red flags seeded successfully!');

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



