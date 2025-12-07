---
title: "Dr. GPT: Empowering Your Healthcare Decisions"
date: "2025-03-20"
excerpt: "How to use AI as a tireless patient advocate. Describes a method for synthesizing scattered medical records into a unified dossier to catch missed diagnoses and dangerous drug interactions."
category: "Healthcare & AI"
author: "Jeffrey Emanuel"
source: "FMD"
---

## Introduction

Healthcare in America is deeply flawed, a fact painfully evident to anyone managing complex or chronic medical conditions. Records are scattered across multiple providers and patient portals, lab results often lack context, specialists rarely communicate effectively, and brief appointments leave little time for doctors to see the complete picture.

These issues aren't merely inconvenient; they can be life-threatening. Important patterns in test results are overlooked, dangerous drug interactions go unnoticed, and seemingly unrelated symptoms aren't pieced together into a coherent diagnosis. Meanwhile, patients and their families, highly motivated but lacking medical expertise, struggle helplessly to connect the dots.

Imagine having a team of tireless medical experts reviewing your complete medical history, analyzing every symptom, lab result, and medication interaction without bias, clearly explaining their insights in everyday language. What if this advanced medical analysis were free and accessible whenever needed?

This vision is now achievable through advanced AI models like Claude 3.7, GPT-4.5, and Grok3. These models have absorbed vast medical knowledge and can interpret health data with remarkable depth. While AI doesn't replace doctors (you'll still need them to authorize the tests and write the prescriptions at the very least!), it *significantly* enhances your ability to advocate effectively for yourself or loved ones, so you no longer have to feel helpless in the face of a complex and often highly dysfunctional healthcare system, where you are often left to fend for yourself, and where many patients "slip through the cracks" and end up with poor care or even die as a result.

In this article, I'll share a method I developed while guiding my 74-year-old father through complex medical issues. Using AI-driven analysis, we've identified overlooked diagnoses, dangerous medication interactions, and equipped ourselves with precise questions that have dramatically improved the care he received. The goal isn't replacing healthcare providers, but enhancing their effectiveness by providing comprehensive, organized, and analyzed information.

Note that, while I developed this technique while helping my father, **the medical case described here is entirely fictional**, with different diseases, different medications, different lab results, and different medical history.

The goal is to show you how to use this technique to help yourself or a family member, not to provide medical advice or diagnosis. However, I did use AI to help me generate a realistic and internally consistent medical case that would be complex enough to illustrate the technique and plausible enough to be believable.

The approach involves creating a detailed medical dossier, standardizing information from multiple sources using AI, and analyzing it through multiple AI models to reveal insights on diagnosis, prognosis, and treatments. Comparing analyses from different models identifies consensus and disagreements, leading to more nuanced understanding.

## Our Fictional Patient

Martin Chen is a 68-year-old retired civil engineer with a deeply complex medical history. Fifteen years ago, he was diagnosed with Stage III Hodgkin's Lymphoma and underwent aggressive treatment with ABVD chemotherapy and targeted radiation. While he successfully overcame cancer, the treatments left lasting effects including peripheral neuropathy and radiation-induced hypothyroidism. Five years ago, Martin was diagnosed with hypertrophic cardiomyopathy, and more recently developed atrial fibrillation.

Martin's current situation illustrates the fragmented nature of our healthcare system. He regularly sees a cardiologist, neurologist, primary care physician, and occasionally an endocrinologist. Each specialist focuses on their domain while having limited visibility into his complete medical picture. His medication regimen includes twelve different prescriptions – from anticoagulants to manage his atrial fibrillation to gabapentin for his neuropathic pain – prescribed by different specialists who rarely communicate with each other.

Lately, Martin has experienced worsening symptoms: increasing shortness of breath during his previously manageable woodworking sessions, disturbing palpitations, persistent fatigue, and ankle swelling by evening. His sleep is frequently disrupted because he struggles to breathe when lying flat. These symptoms significantly impact his quality of life, preventing him from enjoying his retirement and beloved hobbies.

His recent cardiology appointment left him frustrated. Despite arriving with detailed notes about his symptoms, the visit lasted barely fifteen minutes. The cardiologist recommended increasing fluid restriction and mentioned possibly adding another medication (disopyramide), but didn't take time to address Martin's concerns about potential medication interactions. Martin left with more questions than answers, wondering if his symptoms were solely cardiac-related or influenced by his complex medical history.

This scenario perfectly demonstrates why AI-powered medical analysis can be transformative. By compiling Martin's complete medical history, current medications, and detailed symptoms into a comprehensive dossier, we can leverage advanced AI models to analyze this information holistically – something no single specialist has the time or complete information to accomplish.

## Step 1: Build a Comprehensive Medication List

Your medical dossier starts with an exhaustive list of medications. Prescription labels hold vital information, including drug name, dosage, frequency, prescribing physician, and fill dates, critical to understanding a patient's health context.

Begin by photographing every medication container, including:

- Current prescriptions
- Regular over-the-counter medications
- Vitamins and supplements
- PRN (as-needed) medications
- Recently discontinued drugs (last 6 months)

Don’t worry about perfect photography. Advanced AI models extract accurate information even from imperfect images.

Submit these images to an AI model (Claude 3.7 or GPT-4.5) using this prompt:

>
> For each medication bottle shown, list the drug name, dosage, and if prescribed, include dosage instructions.
>

You'll get results like this:

1. **Apixaban (Prescription)**
   - Dosage: 5 mg per tablet
   - Instructions: Take 1 tablet by mouth twice daily

2. **Diltiazem CD (Prescription)**
   - Dosage: 240 mg per tablet
   - Instructions: Take 1 tablet by mouth once daily in the morning

Keep adding more photos (you can do 4 photos at a time with ChatGPT and Claude and it will still work well), with the prompt:

>
> Do the same for the next 4 images.
>

When you've done that for all the bottles, ask the AI to standardize all medication details clearly:

>
> Now compile a complete, standardized list of every medication from the previous step, preserving all provided information.
>

This ensures nothing critical is overlooked (often a risk when relying on memory during doctors' visits). It also highlights potential drug interaction problems, crucial for elderly patients who may unknowingly face dangerous drug interactions due to multiple prescribing providers who aren't communicating effectively. Be sure to include any over-the-counter medications, supplements, and vitamins, as these can also interact with prescription medications.

Finally, copy the final output of this process. You now want to paste this into a text editor. I like to use [Sublime Text](https://www.sublimetext.com/) for this, but [VS Code](https://code.visualstudio.com/) from Microsoft is totally free and is also an excellent choice. Why use a text editor instead of Microsoft Word or Google Docs or a Gmail message? Because you want to keep the formatting as what is called "markdown" text, which is a very simple text format that is easy to read and write, and also easy for the AI models to read and understand. It's a plain text format that uses special characters to indicate formatting, such as headings, lists, and links. This makes it ideal for creating documents that need to be easily shared and edited across different platforms.

Anyway, save your newly created text file using a filename like `patient_name__medical_dossier.md`. This file will end up being your master document that serves as your "bedrock prompt" for all later steps in the process. But for now, at these beginning stages, it acts more like a temporary place to store snippets of text that you'll generate in the different stages we will discuss below.

Later, we will structure this document more to explain what the sections mean. But for now, you can just separate sections with a line of dashes (`---`) in between them. This will help you keep track of everything as you go along.

## Step 2: Collect Medical Records

With your medication list in hand, the next task is gathering and standardizing medical records. This might seem daunting, especially given the fragmented nature of healthcare documentation, but AI makes this process remarkably more manageable.

Start by identifying all sources of medical information:

- Hospital patient portals (Epic MyChart is common)
- Primary care physician records
- Specialist reports and visit notes
- Laboratory results
- Imaging reports (CT scans, MRIs, X-rays)
- Procedure reports (surgeries, endoscopies, etc.)
- Discharge summaries

Many major healthcare systems now use patient portals that give you access to test results, visit notes, and other records. If you're helping a family member, have them add you as a proxy user. This typically requires completing a form either online or at the provider's office.

Once you have access, you'll notice these portals often present information in formats that are difficult to extract: web interfaces with complex tables, PDFs with inconsistent formatting, or even scanned images of typed reports. This is where AI becomes invaluable.

For each document or report, create a new conversation with a frontier model like Claude 3.7 or GPT-4.5 and use this prompt:

>
>Below are the results of copying and pasting a website for medical test results for a patient. I need you to extract ALL relevant information from this and turn it into clean markdown formatted text for me that preserves all information and intuits the original information's structure correctly, which may have been impacted as a result of loss of formatting from the copy and paste process.
>

Then paste the raw text or upload the document. The AI will transform even poorly formatted data into clean, structured markdown. Sometimes, if the webpage has a lot of graphical elements (e.g., charts or visual indications of a range of normal values and where your results fall), you may get a better result by taking a screenshot of the page and uploading that instead. The AI is very good at reading images of text, and it will do a much better job of preserving the original formatting in that case. Another good trick is to look for a "print" button on the page, which often slightly changes the layout, and save this as a PDF using Chrome; then try selecting the text from the PDF and see if you get better-looking results than selecting and copying straight from the website.

### Here's an example of before and after:

The original text from the Epic MyChart website might look like this, which is what you paste into the AI— you can see that the formatting is all messed up and hard to read:

```plaintext
Results
COMPREHENSIVE METABOLIC PANEL & CARDIAC MARKERS (Martin)
Collected on Mar 12, 2025 10:45 AM
Sodium
Normal range: 135 - 145 mEq/L
135 145
142
Potassium
Normal range: 3.5 - 5.0 mEq/L
3.5 5.0
3.6
Chloride
Normal range: 98 - 107 mEq/L
98 107
102
Carbon Dioxide
Normal range: 22 - 30 mEq/L
22 30
23
BUN
Normal range: 7 - 20 mg/dL
7 20
19
Creatinine
Normal range: 0.6 - 1.2 mg/dL
0.6 1.2
1.18
Glucose
Normal range: 70 - 99 mg/dL
70 99
114 High
eGFR
Normal range: >60 mL/min/1.73m²
>60
63
Calcium
Normal range: 8.5 - 10.2 mg/dL
8.5 10.2
9.3
NT-proBNP
Normal range: <300 pg/mL
<300
945 High
Troponin T
Normal range: <0.03 ng/mL
<0.03
0.02
ALT
Normal range: 7 - 55 U/L
7 55
25
AST
Normal range: 8 - 48 U/L
8 48
30
Alk Phos
Normal range: 45 - 115 U/L
45 115
88
```

After processing, the AI might produce:

```markdown
# COMPREHENSIVE METABOLIC PANEL & CARDIAC MARKERS

**Patient:** Martin  
**Collected on:** Mar 12, 2025 10:45 AM

## Results

| Test | Normal Range | Value | Status |
|------|--------------|-------|--------|
| Sodium | 135 - 145 mEq/L | 142 | |
| Potassium | 3.5 - 5.0 mEq/L | 3.6 | |
| Chloride | 98 - 107 mEq/L | 102 | |
| Carbon Dioxide | 22 - 30 mEq/L | 23 | |
| BUN | 7 - 20 mg/dL | 19 | |
| Creatinine | 0.6 - 1.2 mg/dL | 1.18 | |
| Glucose | 70 - 99 mg/dL | 114 | High |
| eGFR | >60 mL/min/1.73m² | 63 | |
| Calcium | 8.5 - 10.2 mg/dL | 9.3 | |
| NT-proBNP | <300 pg/mL | 945 | High |
| Troponin T | <0.03 ng/mL | 0.02 | |
| ALT | 7 - 55 U/L | 25 | |
| AST | 8 - 48 U/L | 30 | |
| Alk Phos | 45 - 115 U/L | 88 | |
```

As you can see, the structured markdown clearly presents critical values in tabular format, making it easy to read and understand.

**Important:** Make sure that, when copying from the AI, you always click the copy button in the corner of the chat window, as this will copy the text in a format that preserves the markdown formatting. If you just select and copy the text, it will not preserve the formatting correctly.

The nice thing about markdown is that the text above looks like a nice table when "rendered" as markdown:

### COMPREHENSIVE METABOLIC PANEL & CARDIAC MARKERS

**Patient:** Martin  
**Collected on:** Mar 12, 2025 10:45 AM

#### Results

| Test | Normal Range | Value | Status |
|------|--------------|-------|--------|
| Sodium | 135 - 145 mEq/L | 142 | |
| Potassium | 3.5 - 5.0 mEq/L | 3.6 | |
| Chloride | 98 - 107 mEq/L | 102 | |
| Carbon Dioxide | 22 - 30 mEq/L | 23 | |
| BUN | 7 - 20 mg/dL | 19 | |
| Creatinine | 0.6 - 1.2 mg/dL | 1.18 | |
| Glucose | 70 - 99 mg/dL | 114 | High |
| eGFR | >60 mL/min/1.73m² | 63 | |
| Calcium | 8.5 - 10.2 mg/dL | 9.3 | |
| NT-proBNP | <300 pg/mL | 945 | High |
| Troponin T | <0.03 ng/mL | 0.02 | |
| ALT | 7 - 55 U/L | 25 | |
| AST | 8 - 48 U/L | 30 | |
| Alk Phos | 45 - 115 U/L | 88 | |

But it's also very easy to read in plain text, and most importantly, the AI can easily understand it natively, which is why we use markdown for this process.

For PDFs, simply upload the document with the prompt above. Modern AI handles extensive documents easily, although you may need to segment very long ones.

Add each processed test result to your dossier, separating them with markdown dividers (`---`). This helps track health progression clearly over time. Don't worry so much about the order of the tests at this stage, although if you can, it's a good idea to keep them in chronological order. You can always rearrange them later if you want to. The AI will understand it either way, but it will need to waste more "brain power" trying to figure out the order of the tests based on their dates if you don't keep them in chronological order.

By systematically applying this approach, you'll build an incredibly powerful resource, transforming fragmented medical information into a coherent, actionable healthcare tool.

Don't forget to include doctor's visit notes whenever available. These often contain valuable information about symptoms, physical exam findings, and the physician's assessment that may not appear in lab results. Modern electronic health record systems increasingly make these notes available to patients, though they may be buried in the portal.

For older records that exist only on paper, take clear photos and use the AI to transcribe them. While the process is more laborious, these historical records can provide crucial context, especially for chronic conditions where baseline values and progression over time matter significantly.

Remember that many hospitals and physicians' offices have medical records departments that can provide complete records upon request. By law, you have a right to these records, and while there may be nominal fees for copying and processing, accessing comprehensive records is worth the investment.

## Step 3: Process Lab Results and Tests

While the previous step covered collecting all medical records, this step focuses specifically on optimizing how you process laboratory results and diagnostic tests, which often contain the most valuable objective data.

Lab results deserve special attention because they:

- Provide objective measurements
- Show trends over time when collected and compared properly
- Often contain subtle abnormalities that might be overlooked
- May reveal patterns across different test types that no single specialist would connect

When working with laboratory results and diagnostic tests, the good news is you don't need to worry about formatting or structuring the data perfectly yourself. The AI models excel at extracting and organizing medical information—that's one of their greatest strengths.

The AI will handle all the details: preserving test names, numerical values, reference ranges, units, dates, and abnormal flags. It will transform even the most disorganized data into well-structured markdown without requiring any special guidance from you.

For imaging reports like CT scans or MRIs, the same approach works perfectly. The AI will automatically identify and highlight the most important sections, particularly the impression/conclusion where radiologists summarize their key findings.

One valuable optimization to consider: if you have multiple instances of the same test over time (like blood glucose measurements taken every few months), ask the AI to create a condensed timeline view. This preserves the critical information while using far less context space:

>
> Please create a timeline table showing how this patient's [test name] values have changed over the past two years, including dates, values, reference ranges, and whether results were flagged as abnormal.
>

This timeline approach is particularly valuable for monitoring chronic conditions like diabetes, kidney function, or cholesterol levels, where trends often tell a more important story than any single reading. It also significantly reduces the context length of your medical dossier without sacrificing important information. But it's probably not worth doing this unless you have a really large number of tests to include, as it can be a bit tedious to do this for every test.

Not only that, but the more text that ends up in your medical dossier, the more difficult it is for the AI to process and analyze it. Remember, the less context you use while still providing the same core information, the better the models will perform with diagnosis and analysis.

Models like Claude 3.7 and GPT-4.5 have limited context windows, so efficient use of that space improves their ability to focus on the most relevant details. Even if they seem to be able to fit all the text in their context window or "short term memory," the more you try to cram in there, the worse the models get at analyzing and understanding the information.

When you don't do this "pre-processing" stage, the model ends up wasting some of its cognitive power on irrelevant details rather than on the main thing that matters: excellent medical diagnosis and analysis. This is the main reason why we separate out this process into phases and stages involving multiple different "conversations" with the AI, rather than trying to do everything in one go, starting from the raw text data or PDFs.

By breaking the process down like this, we can put all the relevant information on a silver platter for the AI to analyze in a format that is optimized for easy understanding and analysis.

## Step 4: Create a Comprehensive Medical Dossier

Now comes the critical task of assembling all this information into a single, coherent document: your medical dossier. This isn't just a collection of records; it's a carefully structured resource that will serve as the foundation for sophisticated AI analysis.

Go back to your text editor that has your existing document (i.e., `patient_name__medical_dossier.md`), and start structuring and ordering the text you already have there by moving things around with cut and paste and by adding additional sections. You can structure it in this order:

1. **Introduction**: A concise summary of the patient's key demographics, major medical conditions, and primary concerns
2. **Current Medications**: The comprehensive medication list you created in Step 1
3. **Symptoms and Complaints**: Current symptoms described in detail with onset, duration, and severity
4. **Medical History**: Major past conditions, surgeries, and significant events
5. **Recent Visit Notes**: Doctor's assessments from the past 1-2 years
6. **Lab Results**: Organized by test type and date
7. **Imaging and Procedure Reports**: Most recent first
8. **Family Medical History**: Relevant conditions in first-degree relatives

Begin with a clear introduction paragraph that gives AI models essential context. Here's an example:

>
> Patient Martin Chen is 68 years old. He has a complex medical history: Stage III Hodgkin's Lymphoma 15 years ago treated with aggressive ABVD chemotherapy and radiation; hypertrophic cardiomyopathy diagnosed 5 years ago; and persistent atrial fibrillation for the past 8 months. He takes multiple medications for cardiac issues, neuropathic pain, and hypothyroidism (a result of radiation therapy). Recently, his symptoms have worsened significantly - progressive shortness of breath, disturbing palpitations, severe fatigue, nighttime breathing difficulties when lying flat, and increasingly troublesome ankle edema. His latest NT-proBNP level of 850 pg/mL (nearly triple the normal limit) suggests worsening cardiac stress. His cardiologist is considering adding disopyramide and has mentioned possible alcohol septal ablation if his condition deteriorates further.
>

This paragraph immediately orients the AI to the patient's age, major conditions, and current concerns. Include any symptoms that are particularly troubling or have changed recently.

Add clear section dividers (using markdown's `---`) between each major component, and ensure every document or result has a clear header with the date. This structural clarity helps the AI understand what information belongs together and how different pieces relate chronologically.

The completed dossier becomes what I call your "bedrock prompt": a comprehensive foundation that captures the patient's complete medical picture. This document is your primary resource for the next steps and will typically be 5,000-10,000 words for a patient with moderate medical complexity.

## Step 5: Generate AI-Powered Analysis

With your bedrock prompt ready, you can now harness the analytical power of frontier AI models. These systems can process and reason about medical information in ways that would be impossible for most non-specialists, identifying patterns, risks, and potential diagnoses that might otherwise be missed.

The quality of analysis you receive depends heavily on the quality of your final prompt—the specific questions you ask after presenting all the medical information. Here's the prompt structure I've found most effective:

>
> Based on EVERYTHING you have seen above, tell me your best estimates of what is wrong with the patient and what his prognosis is, what the best course of action might be under different most likely scenarios, and at each step, explain your reasoning and why you think that (especially which pieces of evidence have the largest impact on your estimate of probabilities from a Bayesian standpoint).
>

This prompt accomplishes several critical things:

1. It asks for a comprehensive assessment based on all available information
2. It requests both diagnostic impressions and prognosis estimates
3. It asks for actionable next steps under different scenarios
4. It demands explicit reasoning, forcing the AI to show its work
5. It specifically requests a Bayesian approach, which helps quantify uncertainty and the relative importance of different pieces of evidence

The resulting analysis will typically include:

- Potential diagnoses ranked by likelihood
- Key evidence supporting each diagnosis
- Contradictory evidence or missing information that would help confirm or rule out possibilities
- Recommended follow-up tests or consultations
- Treatment considerations
- Prognosis estimates with confidence levels
- Potential risks or complications to monitor
## Example Analysis

Here is a complete example of what the AI might produce, based on Martin Chen's medical dossier and Claude 3.7's analysis:

---

## Medical Analysis for Martin Chen

After reviewing the comprehensive medical records provided, I'll share my assessment of Martin's condition, prognosis, and recommendations for care. I'll explain my reasoning and highlight the most significant clinical evidence guiding my analysis.

### Primary Medical Issues

#### 1. Obstructive Hypertrophic Cardiomyopathy with Critical Outflow Obstruction

This represents Martin's most urgent and life-threatening condition, supported by several critical indicators:

- **Left Ventricular Outflow Tract (LVOT) gradient of 85 mmHg at rest, 124 mmHg with Valsalva** (severely elevated; normal is <30 mmHg)
- Asymmetric septal hypertrophy (septal wall thickness 1.8 cm)
- Left atrial enlargement (48 mm)
- Moderate mitral regurgitation
- Symptoms consistent with severe HOCM: dyspnea, chest discomfort, fatigue, orthopnea

**Bayesian impact:** The dramatically elevated LVOT gradient is the strongest predictor of symptom severity and carries the highest weight in my assessment. Resting gradients >50 mmHg are associated with significantly increased morbidity and mortality, and Martin's gradient is substantially higher at 85 mmHg.

#### 2. Extensive Myocardial Fibrosis

- **Late gadolinium enhancement (LGE) involving 22% of myocardial mass on cardiac MRI**
- Pattern consistent with HCM-related fibrosis rather than ischemic scarring
- Multiple areas of fibrosis at right ventricular insertion points and mid-myocardium

**Bayesian impact:** The extensive LGE on cardiac MRI dramatically increases Martin's risk of sudden cardiac death. LGE >15% of myocardial mass is associated with a 2-4 fold increase in risk for ventricular arrhythmias and sudden death, independent of other risk factors.

#### 3. Poorly Controlled Atrial Fibrillation

- Persistent despite current medication regimen
- Heart rate variability noted on Holter monitor (60-142 bpm)
- Likely contributing to symptom severity and exercise intolerance
- Significantly increased stroke risk (CHA₂DS₂-VASc score: 3)

#### 4. Secondary Concerns

- **Chemotherapy-induced peripheral neuropathy:** Limits exercise capacity and quality of life
- **Post-radiation hypothyroidism:** May contribute to exercise intolerance if not optimally managed
- **Obstructive sleep apnea:** May be exacerbating cardiovascular symptoms
- **Potential medication interactions:** Current regimen includes multiple medications affecting cardiac conduction

### Prognosis Assessment

Based on the evidence, I estimate Martin's prognosis as follows:

- **1-year mortality risk:** Approximately 8-12%
- **5-year mortality risk:** Approximately 25-35%

Key factors influencing this assessment:

1. **Severity of LVOT obstruction:** Gradient >80 mmHg at rest
2. **Extent of myocardial fibrosis:** 22% of myocardial mass showing LGE
3. **Age and comorbidities:** 68 years old with history of Hodgkin's, atrial fibrillation
4. **Functional capacity:** Declining but still independently mobile
5. **Preserved ejection fraction:** 68% (positive prognostic factor)

### Most Likely Scenarios and Recommended Actions

#### Scenario 1: Responds to Optimized Medical Therapy (30-40% probability)

**Supporting evidence:**
- No previous trials of disopyramide
- Potentially suboptimal doses of negative inotropic agents
- Preserved systolic function
- Symptoms progressing but not end-stage

**Recommendations:**
1. Add disopyramide 100 mg BID, titrate as tolerated
2. Increase verapamil to 240 mg BID if blood pressure allows
3. Aggressive fluid management (restriction to 1.5 L/day)
4. Enhanced rhythm control strategy for atrial fibrillation
5. Optimization of heart rate control
6. Comprehensive sleep study with CPAP titration if indicated

**Bayesian reasoning:** The combination of severe LVOT obstruction and lack of previous disopyramide trial suggests significant potential for symptomatic improvement with optimized negative inotropic therapy.

#### Scenario 2: Requires Invasive Intervention (40-50% probability)

**Supporting evidence:**
- Severely elevated LVOT gradient (85 mmHg)
- Extensive myocardial fibrosis (22%)
- Progressive symptoms despite current therapy
- Anatomically suitable septal morphology for intervention

**Recommendations:**
1. Urgent referral to specialized HCM center
2. Alcohol septal ablation evaluation
3. Surgical myectomy consideration as alternative
4. Implantable cardioverter-defibrillator (ICD) risk assessment
5. Advanced hemodynamic assessment with exercise

**Bayesian reasoning:** The magnitude of obstruction and extent of fibrosis suggest advanced disease unlikely to be adequately controlled with medical therapy alone. The high proportion of LGE significantly increases sudden death risk.

#### Scenario 3: Multisystem Decline (15-20% probability)

**Supporting evidence:**
- History of cardiotoxic therapy (radiation, doxorubicin)
- Progressive neuropathic symptoms
- Sleep-disordered breathing
- Multiple medication interactions

**Recommendations:**
1. Comprehensive cardio-oncology evaluation
2. Pulmonology consultation for sleep apnea management
3. Medication reconciliation with pharmacist consultation
4. Neurological reassessment for neuropathy progression
5. Palliative care involvement for symptom management

**Bayesian reasoning:** The constellation of post-cancer therapy effects across multiple systems suggests his decline may involve late cardiotoxicity and not be attributable to primary HCM progression alone.

### Critical Next Steps

1. **Structural Intervention Evaluation:**
   - Urgent referral to HCM center of excellence
   - Evaluation for alcohol septal ablation or surgical myectomy
   - Comprehensive risk assessment for sudden cardiac death
   - ICD candidacy evaluation

2. **Medical Optimization:**
   - Trial of disopyramide
   - Careful adjustment of negative inotropes
   - Enhanced rhythm control for atrial fibrillation
   - Fluid restriction and management

3. **Comprehensive Care:**
   - Sleep study and treatment
   - Cardio-oncology consultation
   - Medication reconciliation
   - Advanced directives discussion

4. **Monitoring and Follow-up:**
   - Serial NT-proBNP measurements
   - Repeat echocardiography with provocative maneuvers
   - Event monitoring for arrhythmia detection
   - Symptom-based quality of life assessment

### Conclusion

Martin's case presents a complex interplay of hypertrophic cardiomyopathy, extensive myocardial fibrosis, and post-cancer therapy effects. His severely elevated LVOT gradient and extensive myocardial fibrosis represent the most immediate threats but may be amenable to targeted interventions.

His prognosis is guarded but can be significantly improved with proper management of his LVOT obstruction and addressing his risk of sudden cardiac death. The most critical factor determining his short-term outcome will be his response to enhanced medical therapy and/or structural interventions targeting his outflow obstruction.

---

And here is the analysis done by ChatGPT 4.5 using the same medical dossier as the prompt:

---

Based on the extensive information provided, here's a structured Bayesian reasoning analysis, followed by my best assessment of Martin Chen's condition, prognosis, and recommended courses of action:

### Step 1: Key Evidence & Symptoms

From the information, several key medical conditions and symptoms stand out:

- **Hypertrophic Cardiomyopathy (HCM) with Severe Obstruction**:
  - Asymmetric septal hypertrophy (septal wall thickness 1.8 cm)
  - **LVOT gradient of 85 mmHg at rest, 124 mmHg with Valsalva** (severely elevated; normal is <30 mmHg)
  - Preserved ejection fraction (68%)
  - Left atrial enlargement (48 mm)
  - Clinical symptoms: progressive dyspnea, chest discomfort, orthopnea, fatigue, dizziness with position changes

- **Extensive Myocardial Fibrosis**:
  - **Late gadolinium enhancement (LGE) on cardiac MRI involving 22% of myocardial mass**
  - Pattern consistent with non-ischemic fibrosis typical in advanced HCM
  - Multiple areas of fibrosis at right ventricular insertion points and mid-myocardium

- **Persistent Atrial Fibrillation**:
  - Diagnosed 8 months ago, persistent despite current treatment
  - Heart rate variability (60-142 bpm) on Holter monitoring
  - NT-proBNP elevation (850 pg/mL) consistent with cardiac wall stress
  - Currently managed with apixaban anticoagulation and rate control

- **Post-Cancer Treatment Effects**:
  - History of Stage III Hodgkin's Lymphoma treated with ABVD chemotherapy and radiation
  - Chemotherapy-induced peripheral neuropathy requiring gabapentin and amitriptyline
  - Post-radiation hypothyroidism managed with levothyroxine
  - No evidence of cancer recurrence or secondary malignancy

- **Other Conditions**:
  - Mild obstructive sleep apnea (not optimally treated)
  - Osteoarthritis in knees
  - Possible early glucose intolerance (fasting glucose 108 mg/dL)

### Step 2: Bayesian Reasoning & Likely Diagnoses

#### 1. **Obstructive Hypertrophic Cardiomyopathy in Advanced Stage (Probability: ~99%)**

- **Strongest evidence**: Severely elevated LVOT gradient (85 mmHg resting, 124 mmHg with Valsalva), asymmetric septal hypertrophy, extensive myocardial fibrosis (22% LGE), progressive symptoms despite medication optimization.
- This represents Martin's primary life-threatening condition and explains the majority of his symptoms.

#### 2. **High Risk for Sudden Cardiac Death (Probability: ~80%)**

- Extensive LGE on MRI (22% of myocardial mass) dramatically increases SCD risk
- Persistent atrial fibrillation further increases arrhythmic risk
- High LVOT gradient indicating severe obstruction (independent risk factor)
- History of syncope and/or presyncope with exertion

#### 3. **Radiation-Associated Cardiac Disease Component (Probability: ~70%)**

- History of mediastinal radiation for Hodgkin's Lymphoma
- Pattern of diastolic dysfunction
- Development of atrial fibrillation (common in radiation heart disease)
- Preserved systolic function despite significant structural abnormalities

#### 4. **Sleep-Disordered Breathing Exacerbating Cardiac Status (Probability: ~65%)**

- Documented mild OSA likely worsening with progressive HCM
- Nocturnal symptoms including orthopnea
- Exacerbating both atrial fibrillation and HCM symptoms
- Suboptimally treated at present

### Step 3: Prognosis Estimation (Given the Bayesian priors above):

- **Immediate (next 1-3 months)**:
  - Moderate risk (~15%) of significant arrhythmic event without intervention
  - High risk (~30%) of HCM-related hospitalization without more aggressive management
  - Continued deterioration in functional capacity if obstruction remains unaddressed

- **Short-term (next 6-12 months)**:
  - Prognosis guarded: Approximately 60-70% probability of clinical stabilization with appropriate interventional management
  - Without intervention, high probability (>50%) of progressive cardiac decompensation or major arrhythmic event

- **Long-term (1-5 years)**:
  - Without intervention: 5-year mortality risk approximately 30-40% (driven primarily by sudden death risk and progressive heart failure)
  - With optimal management: 5-year mortality potentially reduced to 15-20%
  - Significant probability (40-50%) of progressive diastolic heart failure development despite interventions

### Step 4: Recommended Course of Action & Rationale

#### **Immediate Actions (Next 2-4 Weeks)**:

- **Urgent referral to specialized HCM center**:
  - The LVOT gradient of 85 mmHg at rest represents a critical finding demanding specialist evaluation
  - Comprehensive risk stratification for sudden cardiac death (SCD)
  - Immediate consideration for septal reduction therapy

- **ICD evaluation**:
  - The 22% LGE on cardiac MRI represents a major risk factor for SCD
  - Risk calculators would likely show high 5-year SCD risk
  - Primary prevention ICD likely indicated given multiple risk factors

- **Enhanced medical management while awaiting intervention**:
  - Add disopyramide 100mg BID (titrate based on QT interval)
  - Optimize negative inotropic therapy (beta blocker/calcium channel blocker)
  - Strict fluid restriction (1.5 L/day)

#### **Short-term Actions (1-3 Months)**:

- **Septal reduction therapy**:
  - Likely alcohol septal ablation or surgical myectomy based on anatomy and center expertise
  - Detailed assessment of mitral apparatus to guide intervention choice

- **Enhanced rhythm control strategy**:
  - Consider catheter ablation for atrial fibrillation if septal reduction successful
  - Optimization of rate control in interim

- **Sleep apnea management**:
  - Comprehensive sleep study
  - CPAP titration and adherence support

#### **Long-term Management (3-12 Months and beyond)**:

- Regular cardiology follow-up with serial imaging every 3-6 months
- Lifelong anticoagulation management
- Comprehensive rehabilitation program post-intervention
- Continued monitoring of thyroid function and peripheral neuropathy

### Step 5: Most Impactful Bayesian Evidence (for clarity):

- **LVOT Gradient (85 mmHg resting, 124 mmHg provoked)**: Critical marker of severe obstruction with >95% specificity for symptomatic HCM; represents the single most important actionable finding.

- **Extent of LGE on Cardiac MRI (22% of myocardial mass)**: Extremely strong predictor of sudden cardiac death risk (increases risk 3-5 fold); fundamentally changes management strategy requiring ICD consideration.

- **Combination of Atrial Fibrillation and Severe HCM**: Synergistically increases both symptom burden and mortality risk; requires coordinated management strategy.

- **Previous Radiation Exposure**: Significantly impacts long-term cardiac remodeling and prognosis, even with optimal management of primary HCM.

### Final Summary:

Martin Chen is suffering from advanced obstructive hypertrophic cardiomyopathy with critical outflow tract obstruction and extensive myocardial fibrosis. The severely elevated LVOT gradient (85 mmHg at rest) and extensive LGE on cardiac MRI (22% of myocardium) represent two critical findings that fundamentally drive management decisions. His condition is compounded by persistent atrial fibrillation and possible radiation-associated cardiac disease from previous cancer treatment.

His prognosis without intervention is poor, with significant risks for sudden cardiac death and progressive heart failure. However, with prompt referral to a specialized HCM center, comprehensive SCD risk assessment, likely ICD implantation, and septal reduction therapy (either alcohol septal ablation or surgical myectomy), his symptoms and long-term survival can be significantly improved.

The management strategy must be multifaceted, addressing not only the primary structural cardiac abnormality but also rhythm management, sleep-disordered breathing, and post-cancer therapy effects. Immediate referral to a specialized HCM center represents the most crucial next step, as the severity of obstruction and extent of fibrosis place him at high risk for adverse events without specialized intervention.

---

## What to Take Away from These

As you can see above, the core analysis is similar, but the two models have different emphases and highlight different aspects of the case. It also shows how the models can cross-check each other's findings to provide a more comprehensive analysis. The most interesting part of this to me was how the models immediately zoomed in on those two particular test results: the LVOT gradient and the extensive myocardial fibrosis on cardiac MRI as the most important pieces of evidence in the case (while this part is fictional, it is inspired by an analogous clinical test result from a real patient).

These pieces of evidence were *so* discriminative that they **completely dominated** the whole analysis. The reason is that the LVOT gradient was dramatically elevated; normally it is supposed to be under 30 mmHg, and Martin's was 85 mmHg at rest and 124 mmHg with Valsalva, nearly 3-4 times higher than normal! Not only that, but a high LVOT gradient has a very strong *specificity* for indicating severe obstructive hypertrophic cardiomyopathy. That is, you are unlikely to see an LVOT gradient that high unless there is a critical obstruction in the heart. Similarly, the 22% myocardial fibrosis found on cardiac MRI represents a dramatic increase in sudden death risk that fundamentally changes management decisions.

When considering a scenario like Martin's, I would wonder whether any of his doctors had fully explained the significance of these critical findings to him. He might not even know what an LVOT gradient is, or understand how the extent of myocardial fibrosis dramatically increases his risk of sudden death.

It makes me wonder whether his doctors would have fully appreciated these specific pieces of data amid the sea of other data points and evidence. My strong suspicion is that many clinicians might not realize how every other piece of evidence becomes relatively less important compared to these two test results. This is a very real possibility, and it is a very real risk with the current state of medicine, where doctors are so overwhelmed with data that they can't even see the forest for the trees.

As smart and as hardworking as most doctors are, they aren't supermen, and they aren't computers. In fact, the majority of doctors barely understand basic statistical concepts. There's an infamous [article](https://pmc.ncbi.nlm.nih.gov/articles/PMC7315482/) on this subject from 2020. According to the article, 0% of the surveyed doctors correctly understood p-values (an important statistical concept when trying to understand the predictive validity of a drug trial or other experimental finding).

The article specifically states that:

> ...88% of the residents expressed fair to complete confidence in understanding p-values, but 100% of them had the p-value interpretation wrong.

The article further explains that 58.8% of the residents selected choice C, which was designated by the survey authors as the correct answer. However, that choice C was actually incorrect, too! None of the four possible answers were correct. This highlights that the misunderstanding of p-values extends even to those who created the survey and published it in "one of the most prestigious medical journals in the world.

When you ask a human doctor for the probability of something, they are likely to just make something up. Whereas these LLMs literally think in terms of conditional probabilities, and can give you a very precise answer that will be consistent over repeated questionings in different conversations.

On top of that, most doctors are horribly overworked, sleep-deprived, and distracted. They are constantly bombarded with information, and they have to make decisions in a matter of seconds. They are not going to be able to give you the same level of analysis that these LLMs can give you, because they simply don't have the time or the cognitive bandwidth to do so. They also are far less likely to know all the innumerable weird drug interactions and side effects that can occur across ten or more different medications prescribed by 4 or 5 different doctors. They are also less likely to know the latest research on the best treatment protocols for a given condition, especially if it is a rare condition or a condition outside of their specialty.

Most importantly, once your health problems get out of the well-trodden territory of the most common conditions, like diabetes or hypertension, there is a very long tail of rare conditions that are not well understood, and for which there is no consensus on the best treatment. Sure, if you manage to get in front of a super-specialist who has seen a few dozen cases of your condition, they may be able to give you some good advice. Or if you are wealthy and fortunate enough to go to one of the truly standout 99.9th percentile of smartest doctors in the country (probably unlikely unless you live in NYC or LA/SF and your last name appears on the wall of the hospital on a brass plaque!), then maybe your doctor will figure out even your weirdest conditions, Sherlock Holmes style, simply by smelling you and seeing the imperceptible change in your gait.

But the sad reality is that most doctors are not super-specialists, nor are they Sherlock Holmes. But the latest frontier AI models are both— they are super-specialists in every field of medicine, and they are Sherlock Holmes with a degree in applied probability (and everything else you can imagine), with an eidetic memory that can recall the full set of side-effects and interactions of every drug under the sun. They can analyze your entire medical history, all your test results, and all the latest research in a matter of seconds. They can give you a level of analysis that is simply not possible for any human doctor to give you, no matter how smart or hard working they are. The key is to give them the right information, in the right format, and to ask them the right questions.

You might be amazed how often doctors themselves simply search on Google to help them diagnose something, and increasingly, how many have now switched to using ChatGPT or other LLMs to help them with their own medical analyses. Well, now you can cut out the middleman and go straight to the source!

## Step 6: The Multi-Model Approach

A single AI analysis can be valuable, but the true strength of this methodology emerges when leveraging multiple frontier models to gain diverse perspectives. Different models have distinct training datasets, reasoning methods, and biases, much like medical specialists viewing the same symptoms through different lenses.

I recommend using at least three frontier models:

- Claude 3.7 Sonnet
- GPT-4.5
- Grok3

Start by submitting your complete dossier and the analysis prompt independently to each model. Save each response entirely. The real value emerges when you allow these models to review and critique each other's analyses.

Here's the recommended process:

1. Submit your bedrock prompt to Model A (e.g., Claude 3.7).
2. Take Model A's complete response and submit it to Model B (e.g., GPT-4.5) with the following prompt:

"Thank you. I gave the exact same prompt to a competing LLM and it said the following. Does this change your view at all?

[PASTE MODEL A'S RESPONSE HERE]"

3. Next, submit both previous responses to Model C (e.g., Grok3).
4. Finally, return all perspectives to your original model for synthesis and additional insights.

This approach creates a virtual "tumor board" or "case conference," where multiple AI perspectives enhance and challenge each other's analyses. This dialogue often highlights:

- Areas of strong consensus, likely representing high-confidence assessments
- Divergent interpretations revealing genuine medical uncertainties
- Differences in priority or emphasis regarding treatment approaches
- Overlooked possibilities identified uniquely by individual models

For example, one model might emphasize endocrine issues due to elevated cortisol, while another prioritizes immediate cardiac management. By having these models evaluate each other's findings, you gain a richer, more comprehensive understanding.
## Example of Multi-Model Analysis

Here's an example of what this looks like in practice, with ChatGPT 4.5's reaction to Claude 3.7's response to the same prompt:

---

The competing LLM's analysis largely aligns with my original assessment, but it emphasizes several points more explicitly and introduces some useful specifics, which are worth incorporating into the overall picture. Here's how this additional perspective refines my own analysis:

### Key Differences and Useful Additions:

#### 1\. **Quantified Mortality Risk** (New Insight):

- **Competing LLM's estimate:**
  - 1-year mortality risk: **8–12%**
  - 5-year mortality risk: **25–35%**
  
This explicit quantification differs somewhat from my estimates (15% immediate, 30-40% long-term) but reflects a valid interpretation of the evidence in HCM with extensive fibrosis and severe obstruction.

- **Impact on my view**:  
  The slightly more optimistic mortality estimates are reasonable and provide a valuable alternative perspective, though my higher estimates reflect the synergistic risk of multiple factors including post-radiation effects.

#### 2\. **Highlighting LVOT Gradient and LGE's Importance (Confirmation)**:

- Competing LLM strongly emphasizes both the critically elevated **LVOT gradient (85 mmHg resting)** and **extensive LGE (22% of myocardial mass)** as the two most impactful Bayesian indicators.
- It correctly identifies these as independent but synergistic risk factors that fundamentally change management approach.

- **Impact on my view**:  
  Reinforces my original Bayesian weighting—these two parameters indeed represent the most critical findings that should drive immediate management decisions.

#### 3\. **Explicit Scenarios for Management** (New Clarity):

The competing LLM delineates clearly three distinct scenarios:

| Scenario | Probability | Action Highlight |
| -------- | ----------- | ---------------- |
| Responds to Medical Therapy | 30–40% | Disopyramide trial, increased verapamil, fluid restriction |
| Requires Invasive Intervention | 40–50% | Urgent HCM center referral, alcohol septal ablation, surgical myectomy evaluation |
| Multisystem Decline | 15–20% | Cardio-oncology evaluation, medication reconciliation, palliative care involvement |

- **Impact on my view**:  
  These probability estimates align closely with my assessment. The explicit organization provides clarity on decision pathways that enhances my original analysis.

#### 4\. **Additional Specific Recommendations** (New Detail):

- **Structured approach to ICD decision-making** based on LGE findings
- **Explicit mention of alcohol septal ablation versus surgical myectomy** with anatomical considerations
- **Comprehensive sleep disorder management** as a contributing factor to symptom burden
- **Importance of fluid restriction** quantified at 1.5L/day

- **Impact on my view**:  
  These specific interventional details enhance my original recommendations, particularly regarding the concrete approach to septal reduction therapy selection and sleep disorder management.

#### 5\. **Post-Cancer Therapy Considerations** (Expanded clarity):

- More explicit recommendation for specialized consultations:
  - **Cardio-oncology evaluation** for late cardiotoxicity assessment
  - **Comprehensive sleep study** with CPAP titration
  - **Neurological reassessment** for peripheral neuropathy progression

- Advanced directive discussions and palliative care involvement for symptom management.

- **Impact on my view**:  
  These recommendations appropriately expand on the post-cancer therapy complications that may be contributing to Martin's cardiac decline and warrant specialized evaluation.

### Updated Bayesian Summary (Integrating Both Analyses):

**1\. Obstructive Hypertrophic Cardiomyopathy (Probability ~99%)**
- LVOT gradient and LGE findings remain the most impactful pieces of evidence
- Critical obstruction requiring urgent intervention
- Scenario probabilities favor need for invasive intervention (40-50%)

**2\. High Risk for Sudden Cardiac Death (~80%)**
- Extensive LGE (22%) represents critical risk factor
- Likely warrants primary prevention ICD regardless of other interventions
- Risk potentially modifiable with successful septal reduction

**3\. Radiation-Associated Cardiac Disease Component (~70%)**
- Past radiation therapy likely contributing to overall cardiac pathology
- Warrants specialized cardio-oncology evaluation
- May impact long-term prognosis independent of HCM management

**4\. Sleep-Disordered Breathing (~65%)**
- Contributory factor to symptom burden
- Requires dedicated management strategy
- May be magnifying hemodynamic consequences of LVOT obstruction

### Revised Prognosis (Combining Perspectives):

- 1-year mortality: **10-15%** (with optimal management potentially lowering toward 8%)
- 5-year mortality: **25-40%**, contingent primarily on successful management of obstruction and arrhythmic risk

### Refined Management Recommendations (Integrating Both Analyses):

#### Immediate (next 2-4 weeks):

- **Urgent referral to specialized HCM center** for comprehensive evaluation
- **ICD risk assessment** based on extensive LGE and other risk factors
- **Trial of disopyramide** (100mg BID) while awaiting definitive intervention
- **Strict fluid restriction** (1.5 L/day)

#### Short-Term (1–3 months):

- **Septal reduction therapy** (alcohol ablation or surgical myectomy based on anatomy)
- **Enhanced rhythm control strategy** for atrial fibrillation
- **Comprehensive sleep study** with CPAP optimization
- **Cardio-oncology consultation** for radiation effects assessment

#### Intermediate-Term (3–6 months):

- **Medication reconciliation** to address polypharmacy issues
- **Neurological reassessment** for peripheral neuropathy management
- **Advanced care planning** discussions
- **Cardiac rehabilitation** program post-septal reduction therapy

#### Long-Term (6–12 months+):

- Regular cardiac MRI with LGE assessment (annual)
- Continued monitoring of arrhythmia burden
- Vigilance for developing radiation-associated cardiac complications
- Multidisciplinary care coordination between cardiology, hematology-oncology, neurology, and primary care

### Final Adjusted Conclusion:

The competing LLM's assessment significantly enriches my original analysis while maintaining the same fundamental conclusions. The additional clarity regarding septal reduction therapy options, ICD considerations, and specialized post-cancer treatment evaluations provides a more comprehensive roadmap for Martin's care.

Martin's prognosis remains guarded but potentially significantly improvable with prompt referral to a specialized HCM center and appropriate interventions targeting his severe outflow tract obstruction and extensive myocardial fibrosis. The refined scenarios and explicit recommendations outlined here provide a clear pathway for maximizing both his quality of life and long-term survival.

---

## Step 7: Incremental Updates

Medicine is dynamic, with regular updates from new test results, consultations, and evolving symptoms. Rather than revising your entire medical dossier each time, adopt an incremental update approach. Once your initial comprehensive dossier is established, you can easily update it by adding new sections at the end, clearly marked with dates, without modifying any original text. This method helps maintain a chronological record and ensures no original information is lost or overwritten.

When new information arrives:

1. Open your existing medical dossier.
2. Add a new dated section at the bottom.
3. Include the new information using your structured format.
4. Provide a tailored prompt specifically asking how this new information impacts the previous assessments.

For example:

>
> ---
>
> Notes from my brother on the recent visit with the cardiologist on 3/11/25:
>
> Feedback from Dr. Kapadia (cardiologist)  
>
> ◦ Dad needs a repeat echocardiogram scheduled next Monday. ✔️  
> ◦ Continue current medications with minor adjustment to diltiazem dosing.  
> ◦ Main focus was on controlling the atrial fibrillation better—suggested we might need to consider cardioversion if rhythm doesn't stabilize.  
> ◦ Mentioned something about "mild septal hypertrophy" but didn't seem particularly concerned about it.  
> ◦ Said symptoms are likely from combination of A-fib and "normal progression of cardiac aging after radiation therapy."  
> ◦ Recommended a sleep study for his breathing difficulties at night.  
> ◦ No mention at all of the MRI fibrosis findings or the LVOT gradient measurements from his records.
> 
> ---
>
> Based on EVERYTHING you have seen above, tell me your best estimates of what is wrong with the patient and what his prognosis is, what the best course of action might be under different most likely scenarios, and at each step, explain your reasoning and why you think that (especially which pieces of evidence have the largest impact on your estimate of probabilities from a Bayesian standpoint)."
>

(Note that in this example, the doctor completely missed or ignored the critical LVOT gradient and LGE fibrosis findings that the AI analysis identified as the most important diagnostic indicators. Instead, they focused on less urgent aspects of his condition and misattributed his symptoms to less concerning causes.)

Always conclude your incremental update prompts with this **exact** question. This consistency ensures the best results from AI models. Incremental updates are particularly effective for clearly seeing the impact of new information. Each addition—whether it's a new test result or doctor's note—lets you track how precisely the probabilities and recommended actions evolve, identifying the most critical evidence from a diagnostic perspective. By comparing AI analyses before and after each new piece of information, you can more effectively understand the incremental significance of each update.

This structured, incremental approach maintains comprehensive medical histories, tracks changes clearly, and supports more precise dialogue with healthcare providers, significantly enhancing medical decision-making over time.

## The Privacy Elephant in the Room

Unquestionably, a big drawback of the approach developed in this article is the privacy implications, if you care about that. You are giving your entire medical history to a third party, and because you're doing it all on your own outside of any formal medical context, they have no obligations to keep it private or secure, unlike a hospital or doctor. I guess it really comes down to what you care more about: the theoretical risk that OpenAI and Anthropic are going to somehow use your data in a nefarious way, or the practical risk that your doctor is going to miss something important in your medical history and make a mistake that could cost you your life. I think the latter is a much more serious risk, and I think that the benefits of using these models far outweigh the risks. But you have to make that decision for yourself.

If you are concerned about privacy, you can always anonymize the data before submitting it to the models. If you log into these services using a Google account (which I recommend), you can make things a lot more secure by making sure you turn on 2-factor authentication on your Google account, so that you need your phone to log in on a new device. I'm not that worried about OpenAI or Anthropic getting hacked in a way that is going to reveal all your data to the world. They are both pretty well-managed and sophisticated tech companies, and they've largely outsourced the authentication and security of their systems to Google, which is a very secure system. And even if they did get hacked, I think in practical terms, the chances that someone is going to target you and your elderly parents' medical test results are vanishingly small.

## Conclusion

Fortunately, taking control of your or your loved one's healthcare no longer requires a medical degree to do competently. But it does require systematic information gathering, structured organization, and leveraging the analytical power of frontier AI. This methodology transforms scattered medical data into a coherent narrative that can be analyzed deeply, identifying patterns and possibilities that might otherwise be missed.

The process I've outlined isn't just about gathering information, it's about creating a framework for ongoing analysis and advocacy. By maintaining a comprehensive medical dossier and using multiple AI models to analyze it from different perspectives, you become equipped with insights that can substantially improve the quality of care received.

In my experience helping my father navigate his recent health issues, this approach has repeatedly identified overlooked considerations, flagged potential medication interactions, and prepared us with precise questions that changed the course of his treatment for the better. It also often helps patients take their conditions more seriously and take more initiative in their own care. For example, patients with cardiac conditions often make necessary lifestyle changes like reducing sodium intake when they fully understand how it contributes to fluid retention and resulting high blood pressure that aggravates their heart conditions, and how serious that can be when measured in terms of concrete, estimated mortality risk over the next 1-5 years.

Seeing actual mortality risk estimates makes a significant difference in patients' attitudes toward their health. It's much easier to ignore the risk of death when you don't have a number attached to it, and when you don't see the actual data that shows the severity of your condition. Healthcare providers are often reluctant to provide this information because they don't want to frighten patients. But in many cases, it's better to experience that concern and take action than to remain complacent, particularly when swift and decisive action can significantly improve health outcomes.

The healthcare system isn't designed to provide this level of comprehensive analysis for most patients, but with the right tools and methodology, you can create it yourself. In doing so, you take back a measure of control and ensure that no critical detail falls through the cracks of our fragmented medical system.