**TECHNICAL PRODUCT REQUIREMENTS DOCUMENT**

**RegIntel AI**

Agentic AI for RBI Compliance & Policy Adaptation

|**Version: 1.0**|**Date: March 2026**|**Hackathon Build**|
| :- | :- | :- |

# **1. Executive Summary**
Financial institutions in India — banks, NBFCs, payment operators, and fintechs — must continuously track, interpret, and implement regulatory directives issued by the Reserve Bank of India (RBI). The RBI publishes Master Directions, Circulars, Press Releases, and Notifications that carry immediate compliance obligations, often with tight implementation deadlines.

Today, this process is almost entirely manual: compliance teams read PDFs, highlight relevant clauses, write internal memos, and assign action items across departments — a process that is slow, error-prone, and expensive. The RBI's own January 2024 circular mandated that regulated entities implement workflow-based, enterprise-wide compliance monitoring systems.

RegIntel AI is an Agentic AI-powered regulatory intelligence platform that automatically monitors the RBI website, scrapes new policy documents, extracts structured compliance obligations, maps them to affected business units, generates actionable implementation checklists, and sends alerts — reducing compliance lag from days to minutes.

# **2. Problem Context & Market Reality**
## **2.1 The Regulatory Landscape**
The RBI governs over 150,000 regulated entities including scheduled commercial banks, urban cooperative banks, NBFCs, payment banks, and fintech platforms. Key regulatory categories include:

- KYC / AML Master Directions — Updated 12+ times in the last 3 years
- Digital Lending Guidelines — Major overhaul in 2022, amended 2024
- Payment System Regulations — UPI, NACH, BBPS guidelines
- Cybersecurity Framework — CERT-In directives and RBI IT framework
- Priority Sector Lending (PSL) — Quarterly reporting obligations
- Capital Adequacy (Basel III) — Ongoing RBI prudential norms

## **2.2 Current Pain Points**

|**Pain Point**|**Current State**|**Business Impact**|
| :- | :- | :- |
|Detection Lag|Manual monitoring of rbi.org.in — 24-48 hours delay|Penalty exposure during lag window|
|Interpretation Time|Legal team reads 50-200 page documents manually|3-7 days to produce internal guidance|
|Circular Cross-referencing|New circulars amend old ones without explicit references|Missed obligations, audit failures|
|Task Assignment|Email chains across IT, Risk, Ops, Legal departments|Accountability gaps, duplicate work|
|Compliance Tracking|Spreadsheets and macro-enabled Excel files (RBI's own finding)|No real-time visibility for leadership|

## **2.3 Regulatory Mandate**

|**RBI Circular — January 31, 2024: Streamlining of Internal Compliance Monitoring Function**|
| :- |
|The RBI assessed select Supervised Entities and found that compliance automation is 'a work in progress' with many functions relying heavily on manual intervention.|
|Mandate: All regulated entities must implement comprehensive, integrated, enterprise-wide, workflow-based compliance monitoring solutions by June 30, 2024.|
|Scope: Effective communication, automated task assignment, escalation workflows, audit trails, and real-time dashboards for senior management.|
|Additionally, the RBI launched DAKSH — a web-based Supervisory Monitoring System to track compliance from the regulator's side, increasing scrutiny pressure on institutions.|

# **3. Product Vision & Goals**
## **3.1 Vision Statement**
*"RegIntel AI turns RBI regulatory updates into structured, actionable compliance plans within minutes — before your competitors even open the PDF."*

## **3.2 Core Goals**
- Detect new RBI publications within 5 minutes of posting
- Generate plain-language summaries and structured obligation extracts using LLM
- Map obligations to affected business departments automatically
- Create implementation task checklists with deadline tracking
- Answer natural-language compliance questions via a RAG-powered chatbot
- Provide a compliance gap dashboard for management reporting

## **3.3 Success Metrics**

|**Metric**|**Baseline (Manual)**|**RegIntel Target**|
| :- | :- | :- |
|Time to detect new circular|24-48 hours|< 5 minutes|
|Time to produce compliance summary|3-7 days|< 15 minutes|
|Obligation extraction accuracy|~70% (human error)|> 90% (LLM + validation)|
|Task assignment time|1-2 days|Automatic, instant|
|Compliance query response time|Hours (email to legal)|< 30 seconds (chatbot)|

# **4. System Architecture**
## **4.1 High-Level Architecture**
RegIntel AI is built on a multi-agent pipeline with five distinct agents coordinated by an orchestrator. All components are containerized and deployable on AWS / Azure / GCP or on-premise for data localization compliance.

|**Architecture Layers**|
| :- |
|Layer 1 — Ingestion Layer: Web crawler polling rbi.org.in + RSS feeds every 5 minutes. Detects new publications, downloads PDFs, triggers processing pipeline.|
|Layer 2 — Processing Layer: Document parser extracts text from PDFs. LLM (Claude / GPT-4) performs obligation extraction, classification, and summarization via structured prompts.|
|Layer 3 — Knowledge Layer: Vector database (ChromaDB / Pinecone) stores document embeddings. Neo4j knowledge graph maps circular dependencies and amendments.|
|Layer 4 — Agent Orchestration Layer: Five specialized agents (Detector, Analyzer, Mapper, Tasker, Monitor) coordinated by LangGraph/CrewAI orchestrator.|
|Layer 5 — Application Layer: React web dashboard, REST API, notification service (email/Slack/WhatsApp), and compliance chatbot interface.|

## **4.2 Agent Architecture — The Five Agents**

|**Agent**|**Role**|**Input**|**Output**|
| :- | :- | :- | :- |
|**Detector Agent**|Monitors RBI website for new publications|RSS feed / web scrape diff|New document URL + metadata|
|**Analyzer Agent**|Extracts obligations, deadlines, affected entities|Raw PDF text|Structured JSON: obligations[], entities[], deadlines[]|
|**Mapper Agent**|Maps obligations to internal departments|Structured obligations + org chart|Department assignment matrix|
|**Tasker Agent**|Generates actionable implementation checklist|Department assignments + deadlines|JIRA/Notion tasks with owners and due dates|
|**Monitor Agent**|Tracks compliance status, sends alerts|Task completion status|Escalation alerts, dashboard metrics|

## **4.3 Data Flow Diagram**
RBI Website → [Detector Agent] → PDF Download → [Analyzer Agent] → Structured Obligations JSON → [Mapper Agent] → Department Matrix → [Tasker Agent] → Task Tickets → [Monitor Agent] → Compliance Dashboard + Alerts

Parallel Flow: All documents are embedded into Vector DB → RAG Chatbot uses embeddings to answer natural-language queries about any circular.

# **5. Recommended Technology Stack**
## **5.1 Complete Stack Overview**

|**Category**|**Technology**|**Purpose**|**Rationale**|
| :- | :- | :- | :- |
|**Web Scraping**|Python + BeautifulSoup4 + Playwright|Scrape rbi.org.in, detect new PDFs|Handles JS-rendered pages, robust PDF detection|
|**PDF Parsing**|PyMuPDF (fitz) + pdfplumber|Extract text, tables from RBI PDFs|Best accuracy for scanned + native PDFs|
|**LLM / AI**|Claude claude-sonnet-4-20250514 (Primary) + GPT-4 fallback|Obligation extraction, summarization, Q&A|Superior instruction-following, long context (200K tokens)|
|**Agent Framework**|LangGraph + CrewAI|Multi-agent orchestration and state management|Graph-based agent flows with retry logic|
|**Vector DB**|ChromaDB (hackathon) / Pinecone (prod)|Semantic search over all RBI documents|ChromaDB is free, local; Pinecone scales to prod|
|**Graph DB**|Neo4j (Community Edition)|Circular dependency mapping, amendment chains|Native graph queries for linked circulars|
|**Embeddings**|OpenAI text-embedding-3-small / Sentence-Transformers|Convert document chunks to vectors|High accuracy on legal/financial domain text|
|**Backend API**|FastAPI (Python)|REST API for frontend and integrations|Async support, auto-docs, fast development|
|**Task Queue**|Celery + Redis|Async document processing pipeline|Non-blocking PDF processing, retry on failure|
|**Frontend**|React + TypeScript + Tailwind CSS|Compliance dashboard and chatbot UI|Rapid development, component ecosystem|
|**Database**|PostgreSQL + SQLAlchemy ORM|Store circulars, tasks, users, audit logs|ACID compliance essential for audit trails|
|**Notifications**|SendGrid (email) + Slack Webhooks + Twilio (WhatsApp)|Alert compliance teams on new circulars|Multi-channel coverage for critical alerts|
|**Scheduler**|APScheduler / Celery Beat|Every-5-minute scrape cron job|Lightweight, embedded in Python app|
|**Deployment**|Docker + Docker Compose (hackathon) / K8s (prod)|Containerized microservices|One-command setup for demo, scalable for prod|

# **6. Feature Specifications**
## **6.1 Core Features (MVP for Hackathon)**
### **F1 — RBI Document Ingestion**
- Automated polling of https://www.rbi.org.in/Scripts/NotificationUser.aspx every 5 minutes
- Detect new Circulars, Master Directions, Press Releases, Notifications
- Download and store PDFs with metadata: title, date, category, reference number
- Deduplication using MD5 hash of document content

### **F2 — AI-Powered Obligation Extraction**
- Extract: obligation statements, responsible entities, effective dates, penalties
- Categorize by regulation type: KYC, AML, Digital Lending, Cybersecurity, Capital
- Identify if circular amends an existing Master Direction
- Structured output as JSON schema for downstream processing

**Sample LLM Prompt Pattern:**

You are a senior RBI compliance analyst. Analyze the following RBI circular and extract: 1) All compliance obligations (what regulated entities MUST do), 2) Deadline for each obligation, 3) Affected entity types (banks, NBFCs, fintechs), 4) Penalty for non-compliance if mentioned, 5) Whether this amends any previous Master Direction. Return ONLY valid JSON.

### **F3 — Compliance Chatbot (RAG)**
- Natural language Q&A: 'What are my KYC obligations for digital lending customers?'
- Retrieval-Augmented Generation over all indexed RBI documents
- Citations: each answer references the specific circular and clause
- Conversation history maintained for contextual follow-up questions

### **F4 — Compliance Dashboard**
- Executive summary: # new circulars this month, overdue tasks, compliance score
- Circular browser: searchable, filterable list of all RBI publications
- Department task tracker: assigned tasks, completion %, upcoming deadlines
- Alert feed: real-time notifications of new publications

### **F5 — Implementation Checklist Generator**
- Auto-generate step-by-step implementation tasks for each new circular
- Assign tasks to departments based on obligation type mapping
- Set deadline dates automatically from circular effective dates
- Export as PDF, Excel, or push to project management tools (JIRA, Notion)

## **6.2 Advanced Features (Post-Hackathon Roadmap)**
- Gap Analysis Report: Compare institution's current policies against new obligations
- Regulatory Change Impact Score: Quantify implementation effort (1-10)
- Amendment Chain Visualization: Graph view of how circulars link to each other
- Multi-regulator support: SEBI, IRDAI, PFRDA alongside RBI
- API integrations: Push tasks directly to JIRA, ServiceNow, Microsoft Planner
- Audit Trail: Immutable log of all compliance actions for regulatory audits

# **7. Data Models**
## **7.1 Core Database Schema**
### **RBIDocument Table**

|**Field**|**Type**|**Description**|
| :- | :- | :- |
|id|UUID|Primary key|
|rbi\_reference\_number|VARCHAR(50)|RBI circular reference e.g. RBI/2024-25/72|
|title|TEXT|Full title of the circular/direction|
|publication\_date|TIMESTAMP|Date issued by RBI|
|effective\_date|TIMESTAMP|Date compliance is mandatory|
|doc\_type|ENUM|circular | master\_direction | press\_release | notification|
|category|VARCHAR(100)|KYC | AML | Digital Lending | Cybersecurity | PSL | Capital|
|pdf\_url|TEXT|Source URL on rbi.org.in|
|raw\_text|TEXT|Extracted text from PDF|
|summary\_ai|TEXT|LLM-generated plain-language summary|
|obligations\_json|JSONB|Structured array of extracted obligations|
|affected\_entities|TEXT[]|Array: bank | NBFC | payment\_bank | fintech|
|content\_hash|VARCHAR(64)|MD5 for deduplication|
|processed\_at|TIMESTAMP|When AI processing completed|

### **ComplianceTask Table**

|**Field**|**Type**|**Description**|
| :- | :- | :- |
|id|UUID|Primary key|
|document\_id|UUID FK|References RBIDocument|
|title|TEXT|Task title e.g. 'Update KYC form template'|
|description|TEXT|Detailed implementation steps|
|department|VARCHAR(100)|Assigned department: IT | Risk | Legal | Operations|
|assignee\_email|TEXT|Responsible person email|
|due\_date|DATE|Derived from circular effective\_date|
|status|ENUM|pending | in\_progress | completed | overdue|
|priority|ENUM|critical | high | medium | low|

# **8. LLM Prompt Engineering**
## **8.1 Obligation Extraction Prompt**
The most critical prompt in the system. Uses structured output with JSON schema enforcement.

|**System Prompt — Analyzer Agent**|
| :- |
|You are an expert RBI compliance analyst with 15 years of experience at a major Indian bank.|
|You will be given the text of an RBI circular/master direction. Your job is to extract ALL compliance obligations.|
|Rules: (1) Extract ONLY explicit obligations (MUST, SHALL, SHOULD comply). (2) Include exact deadline text. (3) Identify entity types affected. (4) Note any penalties mentioned. (5) Flag if this amends a previous master direction.|
|Return ONLY a valid JSON object matching this schema: { 'circular\_summary': string, 'effective\_date': 'YYYY-MM-DD or null', 'affected\_entities': string[], 'obligations': [{ 'id': number, 'text': string, 'department': string, 'deadline': string, 'priority': 'critical|high|medium|low', 'penalty': string|null }], 'amends\_circular': string|null }|
|Do not include any text outside the JSON object.|

## **8.2 RAG Chatbot Prompt**

|**System Prompt — Chatbot Agent**|
| :- |
|You are RegIntel, an RBI compliance assistant for financial institutions. You have access to a comprehensive database of all RBI circulars, master directions, and notifications.|
|When answering questions: (1) Base ALL answers on the retrieved document context provided. (2) Always cite the specific circular reference number and date. (3) If the user asks about deadlines, be precise about effective dates. (4) If you are unsure, say so and recommend consulting a qualified compliance officer. (5) Use simple, clear language — assume the user is a compliance officer, not a lawyer.|
|Format: Lead with a direct answer, then provide supporting context with citations.|

# **9. 6-Hour Hackathon Implementation Plan**
## **9.1 Team Roles (Recommended 3-4 people)**
- **Backend + Agent pipeline (Python, LangChain, FastAPI):** Person A
- **Frontend dashboard + chatbot UI (React, Tailwind):** Person B
- **AI/LLM prompt engineering + RAG setup (ChromaDB, Claude API):** Person C
- **Web scraping + PDF parsing + devops (Docker):** Person D (optional)

## **9.2 Hourly Execution Timeline**

|**Time**|**Focus**|**What to Build**|**Key Decisions**|
| :- | :- | :- | :- |
|**Hour 1 0:00-1:00**|Setup + Scraper|Project scaffold (FastAPI + React). Python scraper for rbi.org.in. PDF downloader. SQLite/PostgreSQL schema.|Use SQLite for hackathon (skip PostgreSQL setup). Pre-download 10 sample RBI PDFs as fallback.|
|**Hour 2 1:00-2:00**|PDF Parser + LLM|PyMuPDF text extraction. Claude API integration. Obligation extraction prompt + JSON parsing. Test on 5 real circulars.|Hard-code 10 sample circulars from rbi.org.in now. Don't wait for live scraper to work.|
|**Hour 3 2:00-3:00**|Vector DB + Chatbot|ChromaDB setup. Embed all loaded documents. RAG chatbot endpoint (FastAPI). Test 10 compliance questions.|Use sentence-transformers/all-MiniLM-L6-v2 for embeddings — free, fast, good quality.|
|**Hour 4 3:00-4:00**|Task Generator + Frontend|Task checklist generator from obligations JSON. React dashboard skeleton. Circular list view. Alert feed component.|Use pre-built Tailwind UI components. Don't build from scratch — use shadcn/ui or Flowbite.|
|**Hour 5 4:00-5:00**|Integration + Polish|Connect frontend to FastAPI. Chatbot UI working end-to-end. Compliance score widget. Email notification via SendGrid.|If SendGrid setup takes too long, mock email with console log. Demo > perfection.|
|**Hour 6 5:00-6:00**|Demo Prep + Buffer|End-to-end demo flow. Bug fixes. Prepare 5-minute presentation. Record screen demo as backup.|Pre-run the demo 3 times. Load sample data fresh. Have local fallback if API is slow.|

## **9.3 MVP Scope for Hackathon — What to Cut**

|**Build This (Must Have)**|
| :- |
|1\. Preloaded database with 15-20 real RBI circulars (download today, don't rely on live scraper during demo)|
|2\. LLM-powered obligation extraction for any uploaded/selected circular|
|3\. RAG chatbot: type a compliance question, get answer with citations|
|4\. Simple dashboard showing: list of circulars, extracted obligations, auto-generated task list|
|5\. One real notification demo (email or Slack webhook alert for 'new circular detected')|
|**Skip This (Nice to Have — Post Hackathon)**|
|1\. Live web scraping (pre-load data instead, mention live scraping in pitch)|
|2\. Neo4j graph database (mention in architecture slides, skip implementation)|
|3\. Task assignment workflow (show static demo instead)|
|4\. Authentication and user management|
|5\. Production deployment (demo locally on localhost, use ngrok if needed)|

## **9.4 Quick Start Commands**
\# Backend Setup pip install fastapi uvicorn langchain anthropic chromadb pymupdf pdfplumber sentence-transformers celery redis  # Frontend Setup npx create-react-app regintel-ui --template typescript cd regintel-ui && npm install axios tailwindcss @shadcn/ui  # Start Services docker-compose up -d  # Redis + PostgreSQL uvicorn main:app --reload  # FastAPI npm run dev  # React

# **10. Project Directory Structure**
regintel-ai/ ├── backend/ │   ├── agents/ │   │   ├── detector\_agent.py      # Web scraper │   │   ├── analyzer\_agent.py      # LLM obligation extractor │   │   ├── mapper\_agent.py        # Dept assignment │   │   ├── tasker\_agent.py        # Checklist generator │   │   └── monitor\_agent.py       # Alert & tracking │   ├── api/ │   │   ├── routes/ │   │   │   ├── circulars.py       # GET /api/circulars │   │   │   ├── chat.py            # POST /api/chat │   │   │   └── tasks.py           # GET/PUT /api/tasks │   │   └── main.py                # FastAPI app │   ├── core/ │   │   ├── llm.py                 # Claude API client │   │   ├── vectordb.py            # ChromaDB setup │   │   └── database.py            # SQLAlchemy models │   ├── data/ │   │   └── sample\_circulars/      # Pre-loaded PDFs │   └── requirements.txt ├── frontend/ │   ├── src/ │   │   ├── components/ │   │   │   ├── Dashboard.tsx │   │   │   ├── CircularList.tsx │   │   │   ├── Chatbot.tsx │   │   │   └── TaskTracker.tsx │   │   └── App.tsx │   └── package.json ├── docker-compose.yml └── README.md

# **11. Hackathon Demo Script (5 Minutes)**
## **11.1 Narrative Flow**
1. Open dashboard — Show alert: 'New RBI Circular Detected 3 minutes ago: Digital Lending Framework Amendment 2025'
1. Click circular — Show AI-generated summary (3 sentences, plain English)
1. Show Obligations tab — Structured list of 6 obligations with deadlines and department assignments
1. Show Task Checklist — Auto-generated 12 implementation tasks assigned to IT, Risk, Legal
1. Open Chatbot — Type: 'What are my obligations under the new digital lending circular?' — Show answer with citation
1. Show Dashboard metrics — 23 circulars this quarter, 8 tasks overdue, compliance score 74%
1. Mention: 'The compliance officer would have received an email and Slack alert within 5 minutes of RBI posting this'

## **11.2 Killer Demo Data — Use These Real RBI Circulars**
- RBI/2024-25/72 — Digital Lending Framework (many obligations, good for demo)
- RBI/2024-25/45 — KYC Master Direction Amendment (clear deadlines)
- RBI/2023-24/101 — Cybersecurity Framework for Banks (IT dept mapping demo)
- RBI/2024-25/88 — Priority Sector Lending Targets (quantitative obligations)

# **12. Risks & Mitigations**

|**Risk**|**Likelihood**|**Impact**|**Mitigation**|
| :- | :- | :- | :- |
|RBI website blocks scraper|Medium|No live data ingestion|Pre-download 20+ PDFs. RBI publishes RSS — use that instead.|
|LLM hallucination on obligations|Medium|Wrong compliance actions|Always show source text alongside LLM output. Add human review flag.|
|Claude API rate limits during demo|Low|Demo fails live|Pre-cache LLM responses for demo documents. Use local cache.|
|Data localization compliance|Low (hackathon)|Prod deployment regulatory issue|Architecture supports on-premise deployment. Mention in pitch.|

# **13. Competitive Differentiation**
## **13.1 Why RegIntel AI Wins**

|**Feature**|**Existing Tools**|**RegIntel AI**|
| :- | :- | :- |
|Detection Speed|24-48 hours (manual)|< 5 minutes (automated)|
|Obligation Extraction|Human reads PDF|Agentic AI with JSON output|
|Cross-circular linking|Not available|Knowledge graph (Neo4j)|
|Q&A Interface|Call legal team|RAG chatbot with citations|
|Task automation|Manual email chains|Auto-generated JIRA tasks|
|Cost|₹10-50L/year (legal team)|₹2-5L/year (SaaS)|

# **14. Post-Hackathon Product Roadmap**
### **Phase 1 — Production (Month 1-3)**
- Live scraper with RBI RSS feed + DAKSH API integration
- Multi-user authentication with role-based access (CISO, CCO, CEO)
- Mobile app (React Native) for on-the-go compliance alerts
- JIRA / ServiceNow / Notion task push integration

### **Phase 2 — Intelligence (Month 4-6)**
- Knowledge graph: visualize how 300+ circulars interconnect
- Gap analysis: upload institution's policy documents, AI finds compliance gaps
- Regulatory change impact scoring: predict effort required
- Multi-regulator: add SEBI, IRDAI, PFRDA, MCA

### **Phase 3 — Scale (Month 7-12)**
- White-label SaaS for banks, NBFCs, audit firms
- Regulatory sandbox integration for new product pre-compliance checks
- AI-generated board-level compliance reports
- API marketplace: sell compliance data feeds to other fintech tools

RegIntel AI — Confidential | Hackathon Build | March 2026

*"Compliance at the speed of regulation"*
