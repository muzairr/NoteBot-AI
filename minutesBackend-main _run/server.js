const express = require('express');
const multer = require('multer');
const fs = require('fs').promises; // Use the promises version
const fsSync = require('fs'); // Add sync version for createReadStream and other sync operations
const { OpenAI } = require('openai');
const { ChatOpenAI } = require('@langchain/openai');
const path = require('path');
const cors = require('cors');
const Stripe = require('stripe');
const dotenv = require('dotenv');
dotenv.config();
const AWS = require('aws-sdk');
const { exec } = require('child_process');
const { Anthropic } = require('@anthropic-ai/sdk');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const pdfParse = require('pdf-parse');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const z = require('zod');
const { v4: uuidv4 } = require('uuid');
const pLimit = require('p-limit')


const JWT_SECRET = process.env.JWT_SECRET; // you can put this in .env in real apps


const openai = new OpenAI({ apiKey: process.env.OpenAiKey });
const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0.1,
  maxTokens: 16384,
  openAIApiKey: process.env.OpenAiKey,
});

console.log("process.env.MONGODB_URI", process.env.MONGODB_URI);


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Create schema for 'authentication' collection
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model('User', UserSchema, 'authentication');

// const stripe = new Stripe(process.env.Stripe_Secret_Key)
// AWS.config.update({
//   region: 'us-east-2',
//   accessKeyId: 'AKIA4xxxxxxxxxx',
//   secretAccessKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
// });

// Initialize CognitoIdentityServiceProvider
const cognito = new AWS.CognitoIdentityServiceProvider();

const app = express();
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      /localhost:3001/,
      /^http:\/\/[a-zA-Z0-9-]+\.localhost:3001$/,
      /^http:\/\/localhost:3001$/,
      /^http:\/\/192\.168\.100\.22:3000$/,
      /^http:\/\/localhost:3000$/,
      /^http:\/\/localhost:3000$/,
      /^http:\/\/soap-frontend-v1\.s3-website\.us-east-2\.amazonaws\.com$/,
      /^https:\/\/d2dl05v6vena4b\.cloudfront\.net$/,
      /^https:\/\/d25deoa4l0ja8c\.cloudfront\.net$/,
      /^https:\/\/www\.slpeace\.com$/,
      /^http:\/\/slpeace-test\.s3-website-us-east-1\.amazonaws\.com$/, // Corrected pattern for slpeace-test
    ];

    if (!origin || allowedOrigins.some(regex => regex.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(session({
  secret: 'your-secret-key', // replace with a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // use true if you're running HTTPS
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // make sure this is set
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

const pdfDir = path.join(__dirname, 'pdfs');
if (!fsSync.existsSync(pdfDir)) {
  fsSync.mkdirSync(pdfDir, { recursive: true });
}

// Multer configuration
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const audioDir = path.join(__dirname, 'uploads', 'audio');
    fsSync.mkdirSync(audioDir, { recursive: true });
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  }
});

const uploadAudio = multer({ storage: audioStorage });

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pdfDir = path.join(__dirname, 'pdfs');
    fsSync.mkdirSync(pdfDir, { recursive: true });
    cb(null, pdfDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${file.originalname}`;
    cb(null, uniqueSuffix);
  }
});

const uploadPdf = multer({ storage: pdfStorage });

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedFormats = ['.flac', '.m4a', '.mp3', '.mp4', '.mpeg', '.mpga', '.oga', '.ogg', '.wav', '.webm'];

  if (!allowedFormats.includes(ext)) {
    return cb(new Error('Invalid file format. Please upload an audio file in one of the supported formats.'));
  }
  cb(null, true);
};

const upload = multer({
  storage: audioStorage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB in bytes
    fieldSize: 500 * 1024 * 1024 // 500MB in bytes
  }
});

app.post('/upload-pdf', uploadPdf.single('pdf'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

  req.session.pdfFile = {
    path: req.file.path,
    originalname: req.file.originalname,
  };

  res.status(200).json({ message: 'PDF uploaded and stored in session' });
});

// Endpoint to handle audio file upload and transcription
app.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (req.fileValidationError) {
    return res.status(400).json({
      sizeError: 'File size is too large. Maximum size is 500MB.',
    });
  }

  const audioPath = req.file.path;
  let userSettings;

  try {
    // Transcribe the audio using OpenAI's Whisper API
    const transcriptionResponse = await transcribeWithTimeoutAndRetry(chunkPath);
    const transcription = transcriptionResponse.text;
    console.log("TRANSCRIPTION: ", transcription)

    if (!transcription || transcription.length < 10) {
      return res.status(400).json({
        sizeError: 'The voice recording is too short or no speech was detected. Please try again with a clearer recording.',
      });
    }

    const gptText = transcription

    // Send the transcription and GPT output as the response
    res.status(200).json({ transcription, gptText });

    // Clean up the uploaded file
    fsSync.unlinkSync(audioPath);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({
      error: 'Unable to generate note. Please check your microphone and contact support if this issue continues.',
      details: error.message
    });

    // Clean up the file in case of error
    if (fsSync.existsSync(audioPath)) {
      fsSync.unlinkSync(audioPath);
    }
  }
});

const splitAudioWindows = (filePath, outputDir) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath); // e.g., '.mp3' or '.wav'
    const outputTemplate = path.join(outputDir, `chunk_%03d${ext}`);

    // Escape backslashes for Windows
    const input = `"${filePath.replace(/\\/g, "/")}"`;
    const output = `"${outputTemplate.replace(/\\/g, "/")}"`;

    const cmd = `ffmpeg -i ${input} -f segment -segment_time 600 -c copy ${output}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error);
      fsSync.readdir(outputDir, (err, files) => {
        if (err) return reject(err);
        const chunks = files
          .filter(f => f.startsWith('chunk_') && f.endsWith(ext))
          .map(f => path.join(outputDir, f))
          .sort();
        resolve(chunks);
      });
    });
  });
};

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed });

  res.json({ message: 'User registered' });
});

// 👉 Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// 👉 Protected route
app.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// LangChain Chains

// 1. Transcript Segmentation Chain
const segmentationPrompt = PromptTemplate.fromTemplate(`
You are an expert in parsing meeting transcripts. Your task is to segment the transcript into logical sections: Opening Remarks, Agenda Item 1, Agenda Item 2, ..., Closing Remarks. Identify transitions based on phrases like "Chairman opened", "Agenda Item", or "meeting ended". Return a JSON object with sections labeled and their corresponding text.
Instructions:
1. Preserve ALL transcript content without summarization.
2. Identify speaker names and their contributions within each section.
3. Label sections clearly (e.g., "Opening Remarks", "Agenda Item 1: [Title]").
4. If unclear, mark segments as "[unclear]" but do not omit.
5. Do not include any extra text before or after the JSON object.
Transcript:
{transcript}
Output format:
{{
  "sections": [
    {{
      "section": "Opening Remarks",
      "content": "..."
    }},
    {{
      "section": "Agenda Item 1: [Title]",
      "content": "..."
    }},
    ...
    {{
      "section": "Closing Remarks",
      "content": "..."
    }}
  ]
}}
`);

const segmentationParser = StructuredOutputParser.fromZodSchema(
  z.object({
    sections: z.array(
      z.object({
        section: z.string(),
        content: z.string(),
      })
    ),
  })
);

async function segmentTranscript(transcript) {
  console.log('Starting enhanced transcript segmentation...');
  
  // Strategy 1: Try structured JSON parsing with retries
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Using structured JSON parsing`);
      
      const enhancedPrompt = `
You are an expert in parsing meeting transcripts. Segment this transcript into logical sections.

CRITICAL: Return ONLY valid JSON with no extra text, markdown, or formatting.

Instructions:
1. Preserve ALL transcript content without summarization
2. Look for transition phrases like "Chairman opened", "Agenda Item", "next topic", "meeting ended"
3. Create clear section titles
4. If unclear transitions, create logical breaks based on topic changes

Transcript:
${transcript}

Return ONLY this JSON structure:
{
  "sections": [
    {
      "section": "Opening Remarks",
      "content": "..."
    },
    {
      "section": "Agenda Item 1: [Title]", 
      "content": "..."
    },
    {
      "section": "Closing Remarks",
      "content": "..."
    }
  ]
}`;

      const result = await llm.invoke(enhancedPrompt);
      let content = result.content || result;
      
      // Clean and parse JSON
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        content = content.substring(firstBrace, lastBrace + 1);
      }
      
      const parsed = JSON.parse(content);
      
      // Validate structure
      if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        // Validate each section has required fields
        const validSections = parsed.sections.filter(s => s.section && s.content);
        if (validSections.length > 0) {
          console.log(`✅ JSON parsing successful! Found ${validSections.length} sections`);
          return validSections;
        }
      }
      
      throw new Error('Invalid JSON structure');
      
    } catch (error) {
      console.error(`❌ JSON parsing attempt ${attempt} failed:`, error.message);
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // Strategy 2: Rule-based fallback (always works)
  console.log('Using rule-based segmentation fallback...');
  
  try {
    const lines = transcript.split('\n').filter(line => line.trim().length > 0);
    const sections = [];
    let currentSection = { section: "Opening Remarks", content: "" };
    let agendaItemCount = 0;
    
    // Keywords for transitions
    const openingKeywords = ['chairman opened', 'meeting started', 'welcome', 'call to order'];
    const agendaKeywords = ['agenda item', 'next item', 'moving to', 'item number', 'topic'];
    const closingKeywords = ['meeting ended', 'concluded', 'closing remarks', 'adjournment'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check for closing
      if (closingKeywords.some(keyword => lowerLine.includes(keyword))) {
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        currentSection = { section: "Closing Remarks", content: line + '\n' };
        continue;
      }
      
      // Check for agenda items
      if (agendaKeywords.some(keyword => lowerLine.includes(keyword))) {
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        agendaItemCount++;
        currentSection = { 
          section: `Agenda Item ${agendaItemCount}`, 
          content: line + '\n' 
        };
        continue;
      }
      
      // Add to current section
      currentSection.content += line + '\n';
    }
    
    // Add final section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    // Ensure at least one section
    if (sections.length === 0) {
      sections.push({ section: "Full Meeting", content: transcript });
    }
    
    console.log(`✅ Rule-based segmentation successful! Found ${sections.length} sections`);
    return sections;
    
  } catch (error) {
    console.error('❌ Rule-based segmentation failed:', error.message);
  }
  
  // Final fallback - always works
  console.log('⚠️ Using final fallback: single section');
  return [{ section: 'Full Meeting', content: transcript }];
}

// 2. Speaker Contribution Extraction Chain
const speakerPrompt = PromptTemplate.fromTemplate(`
You are an expert in converting meeting transcripts into formal narrative text for government minutes, following the updated directives from Secretary Sahib. Transform the provided transcript section into indirect speech, focusing on the generic points and topics discussed, without attributing comments to specific individuals by name. The minutes should be concise and not a detailed account of every statement.
Instructions:
1. Convert direct speech (e.g., "Speaker: I suggest...") into indirect speech (e.g., "A suggestion was made...").
2. Do NOT attribute comments to specific speakers by name or title. Instead, describe points as having been "raised," "suggested," "discussed," "noted," or "clarified," reflecting the generic nature of the discussion.
3. Focus on extracting specific, generic points made on a given topic, rather than providing a detailed, verbatim account of every sentence uttered by each individual.
4. Maintain the chronological order of topics or significant points discussed.
5. Use formal, third-person language typical of Pakistani government records.
6. The resulting minutes should be shorter and concise, reflecting the essence of the discussions on various topics rather than a comprehensive, detailed record of each speaker's contribution.
Section Content: {content}
Output format: A narrative text with numbered paragraphs (start from {startParagraph}), each describing a point or topic discussed in indirect speech, ensuring that the essence of the discussion is captured concisely and without specific speaker attribution.`);

async function extractSpeakerContributions(sectionContent, startParagraph) {
  try {
    // Create the chain inline
    const chain = speakerPrompt.pipe(llm);
    const result = await chain.invoke({
      content: sectionContent,
      startParagraph: startParagraph.toString()
    });
    return result.content || result;
  } catch (error) {
    console.error('Error extracting speaker contributions:', error);
    return `${startParagraph}. Discussion content: ${sectionContent}`;
  }
}

// 3. Agenda Item Formatting Chain (Board Meeting)
const agendaPrompt = PromptTemplate.fromTemplate(`
You are an expert in generating formal Pakistani government meeting minutes. Using the provided agenda item content, create minutes in the EXACT format of Pakistani government records, including a header, background, discussion, and decision box. Preserve ALL details without summarization.

Instructions:
1. Format the header with Item Number, Reference Number, Date, and Title, exactly as in the example.
2. Provide a comprehensive background section with historical context and relevant details.
3. Document all discussion points in numbered paragraphs, using indirect speech and attributing to speakers, format it like discussion emphasising on the point speaker is making by using speaker's words.
4. Include a DECISION box with lettered points (a), b), etc.) for agreed actions, matching the example's indentation and style.
5. Use formal, third-person language and sequential numbering starting from {startParagraph}.

Agenda Item Content:
{content}

Item Details:
- Item Number: {itemNumber}
- Reference: {reference}
- Date: {date}
- Title: {title}

Example Format:
| Item No. {itemNumber} | {title} |
| Reference No. {reference} | {date} |

[Background paragraphs]

[Discussion paragraphs]

DECISION
a) [Decision point 1]
b) [Decision point 2]

Output:
Formatted minutes text for the agenda item.
`);

async function formatAgendaMinutes(content, startParagraph, itemNumber, reference, date, title) {
  try {
    // Create the chain inline
    const chain = agendaPrompt.pipe(llm);
    const result = await chain.invoke({
      content,
      startParagraph: startParagraph.toString(),
      itemNumber,
      reference,
      date,
      title
    });
    return result.content || result;
  } catch (error) {
    console.error('Error formatting agenda minutes:', error);
    return `| Item No. ${itemNumber} | ${title} |\n| Reference No. ${reference} | ${date} |\n\n${startParagraph}. ${content}`;
  }
}

// 4. Internal Meeting Record Note Formatting Chain
const internalMeetingPrompt = PromptTemplate.fromTemplate(`
You are an expert in generating formal Pakistani government internal meeting record notes. Create a record note in the EXACT format shown in the example, with proper header, subject line, and numbered paragraph structure.

Instructions:
1. Use the exact header format: "**Government of Pakistan**", "**Ministry of Privatisation**", "**(Privatisation Commission)**", "**RECORD NOTE**"
2. Format the subject line with proper spacing and formatting
3. Create paragraph 2 describing the meeting agenda/purpose
4. Create paragraph 3 starting with "Based on the detailed discussions and deliberations, the following action points were agreed:"
5. List action points using lettered format: a), b), c), etc.
6. Add paragraph 4 for concluding remarks if needed
7. Use numbered paragraphs starting from 2
8. Preserve ALL details without summarization
9. Use formal, third-person language
10. MANDATORY: After the narrative format, add a "TASK ASSIGNMENT TABLE" section with the following format:

| S. No | Decision/Task | Responsibility | Time Line | Comments |
|-------|---------------|----------------|-----------|----------|
| 1     | [Task 1]      | [Officer/Dept] | [Date]    | [Notes]  |
| 2     | [Task 2]      | [Officer/Dept] | [Date]    | [Notes]  |

11. Extract all tasks/decisions from the meeting content and populate the table
12. Use "Immediate" for urgent tasks, specific dates where mentioned
13. Leave Comments column blank if no specific comments provided

Meeting Content:
{content}

Meeting Details:
- Subject: {subject}
- Date: {date}
- Location: {location}
- Chair: {chair}
- Key Participants: {participants}

Output:
Complete record note in the specified format INCLUDING the task assignment table at the end.
`);

async function formatInternalMeeting(content, subject, date, location, chair, participants) {
  try {
    // Create the chain inline
    const chain = internalMeetingPrompt.pipe(llm);
    const result = await chain.invoke({
      content,
      subject,
      date,
      location,
      chair,
      participants
    });
    return result.content || result;
  } catch (error) {
    console.error('Error formatting internal meeting:', error);
    return `**Government of Pakistan**\n**Ministry of Privatisation**\n**(Privatisation Commission)**\n\n**RECORD NOTE**\n\n**Subject: ${subject}**\n\n2. ${content}`;
  }
}

// 5. Opening and Closing Section Formatting Chain (Board Meeting)
const openingClosingPrompt = PromptTemplate.fromTemplate(`
You are an expert in generating formal Pakistani government meeting minutes. Create the header, opening remarks, and closing statements for a meeting, matching the EXACT format and style of Pakistani government records.

Instructions:
1. Format the header with centered ministry name, bold meeting title, and details (date, time, location, chair).
2. Opening remarks include welcome, agenda introduction, and participant details (reference Annex-A).
3. Closing remarks summarize next steps and formal closure.
4. Use sequential numbering starting from {startParagraph} for opening remarks and continue for closing.
5. Preserve formal, third-person tone.

Input:
- Meeting Details: {meetingDetails}
- Opening Content: {openingContent}
- Closing Content: {closingContent}

Output:
Formatted header, opening, and closing sections.
`);

async function formatOpeningClosing(meetingDetails, openingContent, closingContent, startParagraph = 2) {
  try {
    // Create the chain inline
    const chain = openingClosingPrompt.pipe(llm);
    const result = await chain.invoke({
      meetingDetails,
      openingContent,
      closingContent,
      startParagraph: startParagraph.toString()
    });
    return result.content || result;
  } catch (error) {
    console.error('Error formatting opening/closing:', error);
    return `${startParagraph}. ${openingContent}\n\n${startParagraph + 1}. ${closingContent}`;
  }
}

// 6. Combine Minutes Chain (Board Meeting)
const combinePrompt = PromptTemplate.fromTemplate(`
You are an expert in finalizing Pakistani government meeting minutes. Combine the provided sections into a single document, ensuring consistent paragraph numbering, proper formatting, and inclusion of an annexure for participants.

Instructions:
1. Merge header, opening remarks, agenda items, closing remarks, and annexure.
2. Ensure sequential paragraph numbering across all sections, starting from 2 after the unnumbered header.
3. Format the annexure as a participant list table, matching the example.
4. Preserve ALL content without summarization.

Input:
- Header: {header}
- Opening Remarks: {opening}
- Agenda Items: {agendaItems}
- Closing Remarks: {closing}
- Participants: {participants}

Output:
Complete meeting minutes document.
`);

async function combineMinutes(header, opening, agendaItems, closing, participants) {
  try {
    // Create the chain inline
    const chain = combinePrompt.pipe(llm);
    const result = await chain.invoke({
      header,
      opening,
      agendaItems,
      closing,
      participants
    });
    return result.content || result;
  } catch (error) {
    console.error('Error combining minutes:', error);
    return `${header}\n\n${opening}\n\n${agendaItems}\n\n${closing}\n\n${participants}`;
  }
}

// Helper function to check file existence
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Helper function to ensure directory exists
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}



// API Endpoint
// Simple concurrency limiter function - processes items in batches
const processConcurrently = async (items, processor, concurrency = 10) => {
  const limit = pLimit(concurrency); // You'll need: npm install p-limit
  
  const promises = items.map((item, index) => 
    limit(() => processor(item, index))
  );
  
  return Promise.all(promises);
};

app.get('/progress/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store this connection for the session
  if (!global.progressConnections) {
    global.progressConnections = new Map();
  }
  global.progressConnections.set(sessionId, res);

  // Handle client disconnect
  req.on('close', () => {
    global.progressConnections.delete(sessionId);
  });
});

// 2. Helper function to send progress updates
const sendProgress = (sessionId, message, step = null, progress = null) => {
  if (!global.progressConnections) return;
  
  const connection = global.progressConnections.get(sessionId);
  if (connection) {
    const data = {
      message,
      step,
      progress,
      timestamp: new Date().toISOString()
    };
    
    connection.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

// 3. Modified upload route with progress updates
app.post('/upload-chunked-windows', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Get session ID from request body (sent by frontend)
  const sessionId = req.body.sessionId;
  const audioPath = req.file.path;
  const meetingType = req.body.meetingType || 'Board Meeting';
  const uploadedPdfName = req.body.uploadedPdfName;
  
  console.log('Meeting Type:', meetingType);
  console.log('Uploaded PDF Name:', uploadedPdfName);
  console.log('Session ID:', sessionId);

  const tempDir = path.join('uploads', `temp_${Date.now()}`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const transcriptFileName = `transcript_${timestamp}.txt`;
  const transcriptFilePath = path.join('uploads', transcriptFileName);
  const minutesFileName = `meeting_minutes_${timestamp}.txt`;
  const minutesFilePath = path.join('uploads', minutesFileName);
  const pdfFilePath = uploadedPdfName ? path.join(__dirname, 'pdfs', uploadedPdfName) : null;

  try {
    // Send initial progress
    sendProgress(sessionId, 'Starting audio processing...', 'initialization', 5);
    
    // Ensure upload directory exists
    await ensureDir(tempDir);

    // Extract PDF text if provided
    let pdfText = '';
    if (pdfFilePath && await fileExists(pdfFilePath)) {
      try {
        sendProgress(sessionId, 'Extracting PDF content...', 'pdf_extraction', 10);
        const data = await fs.readFile(pdfFilePath);
        const pdfResult = await pdfParse(data);
        pdfText = pdfResult.text;
        console.log('PDF text extracted successfully');
        sendProgress(sessionId, 'PDF content extracted successfully', 'pdf_extraction', 15);
      } catch (pdfError) {
        console.warn('Failed to extract PDF text:', pdfError.message);
        sendProgress(sessionId, 'Warning: Could not extract PDF content', 'pdf_extraction', 15);
      }
    }

    // Step 1: Split Audio
    sendProgress(sessionId, 'Splitting audio into chunks...', 'audio_splitting', 20);
    console.log('Starting audio split...');
    const chunks = await splitAudioWindows(audioPath, tempDir);
    console.log(`Audio split into ${chunks.length} chunks`);
    sendProgress(sessionId, `Audio split into ${chunks.length} chunks`, 'audio_splitting', 25);


    // Step 2: Define chunk processing function with progress updates
    const processChunk = async (chunkPath, index) => {
      const chunkProgress = 25 + ((index / chunks.length) * 40); // 25-65% for transcription
      sendProgress(sessionId, `Transcribing chunk ${index + 1} of ${chunks.length}...`, 'transcription', chunkProgress);
      
      console.log(`Starting chunk ${index + 1}/${chunks.length}: ${chunkPath}`);
      
      try {
        // Check if chunk file exists
        if (!await fileExists(chunkPath)) {
          console.warn(`Chunk file not found: ${chunkPath}`);
          return { index, success: false, error: 'File not found' };
        }

        // Add small staggered delay to avoid hitting rate limits immediately
        await new Promise(resolve => setTimeout(resolve, index * 200));

        // Transcribe using Whisper
        const whisperResponse = await transcribeWithTimeoutAndRetry(chunkPath);

        console.log(`Raw transcription for chunk ${index + 1}:`, whisperResponse.text.substring(0, 100) + '...');

        if (!whisperResponse.text || whisperResponse.text.trim().length === 0) {
          console.warn(`Empty transcription for chunk ${index + 1}`);
          return { index, success: false, error: 'Empty transcription' };
        }

        // Format transcript with speaker attribution
        sendProgress(sessionId, `Formatting transcript for chunk ${index + 1}...`, 'transcription', chunkProgress + 2);
        
        const formatPrompt = `
You are a transcript formatter. Convert this raw transcript text into clean, speaker-separated dialogue format with speaker names.

Instructions:
1. Identify distinct speakers names
2. Clean up filler words, false starts, and unclear speech
3. Maintain chronological order and preserve important context
4. Format each line as: "Speaker Name: [dialogue]"
5. If you cannot clearly identify speakers, label as "Speaker: [dialogue]"

Raw transcript:
${whisperResponse.text}

Return only the formatted dialogue, no additional commentary.

        `;

        const formatResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: formatPrompt }],
          temperature: 0.1,
          max_tokens: 3000,
        });

        const formattedTranscript = formatResponse.choices[0].message.content;
        console.log(`Formatted transcript for chunk ${index + 1}:`, formattedTranscript.substring(0, 100) + '...');
        
        return { 
          index, 
          success: true, 
          transcript: formattedTranscript 
        };

      } catch (chunkError) {
        console.error(`Error processing chunk ${index + 1}:`, chunkError.message);
        sendProgress(sessionId, `Error processing chunk ${index + 1}: ${chunkError.message}`, 'transcription', chunkProgress);
        return { 
          index, 
          success: false, 
          error: chunkError.message 
        };
      }
    };

    // Step 3: Process chunks in parallel (5 at a time)
    console.log(`Processing ${chunks.length} chunks with max 10 concurrent...`);
    sendProgress(sessionId, `Processing ${chunks.length} chunks with parallel processing...`, 'transcription', 30);
    
    const results = await processConcurrently(chunks, processChunk, 10);
    
    // Filter successful transcriptions and sort by original index
    const successfulResults = results
      .filter(result => result.success)
      .sort((a, b) => a.index - b.index);

    if (successfulResults.length === 0) {
      throw new Error('No successful transcriptions were generated');
    }

    console.log(`Successfully processed ${successfulResults.length}/${chunks.length} chunks`);
    sendProgress(sessionId, `Successfully processed ${successfulResults.length}/${chunks.length} chunks`, 'transcription', 65);

    // Log any failed chunks
    const failedResults = results.filter(result => !result.success);
    if (failedResults.length > 0) {
      console.warn(`Failed chunks: ${failedResults.map(r => r.index + 1).join(', ')}`);
      sendProgress(sessionId, `Warning: ${failedResults.length} chunks failed processing`, 'transcription', 65);
    }

    // Combine successful transcriptions in order
    const finalTranscript = successfulResults.map(result => result.transcript).join('\n');
    await fs.writeFile(transcriptFilePath, finalTranscript, 'utf8');
    sendProgress(sessionId, 'Transcript saved successfully', 'transcription', 70);

    // Step 4: Segment Transcript
    sendProgress(sessionId, 'Segmenting transcript into sections...', 'segmentation', 75);
    console.log('Segmenting transcript...' + meetingType);
    const sections = await segmentTranscript(finalTranscript + (pdfText || ''));
    console.log(`Transcript segmented into ${sections.length} sections`);
    sendProgress(sessionId, `Transcript segmented into ${sections.length} sections`, 'segmentation', 80);

    // Step 5: Process Sections Based on Meeting Type
    const currentDate = new Date().toLocaleDateString('en-GB');
    let finalMinutes;


    if (meetingType.includes('Internal Meeting') || meetingType.includes('record')) {
      // Handle Internal Meeting - Record Note Format
      sendProgress(sessionId, 'Processing as internal meeting...', 'formatting', 85);
      console.log('Processing as internal meeting...');

      const allContent = sections.map(s => s.content).join('\n\n');
      const subject = `Meeting to Discuss ${meetingType}`;
      const location = 'Committee Room of Privatisation Commission (PC), 4th floor, Kohsar Block, New Pak Secretariat, Islamabad';
      const chair = 'Chairman PC';
      const participants = 'FA representatives, Power Division officials, and other stakeholders';

      finalMinutes = await formatInternalMeeting(
        allContent,
        subject,
        currentDate,
        location,
        chair,
        participants
      );

    } else {
      // Handle Board Meeting - Traditional Format
      sendProgress(sessionId, 'Processing as board meeting...', 'formatting', 85);
      console.log('Processing as board meeting...');

      let paragraphCounter = 2;
      const openingContent = sections.find(s => s.section.toLowerCase().includes('opening'))?.content ||
        sections.find(s => s.section.toLowerCase().includes('start'))?.content ||
        'Meeting commenced with opening remarks.';

      const closingContent = sections.find(s => s.section.toLowerCase().includes('closing'))?.content ||
        sections.find(s => s.section.toLowerCase().includes('end'))?.content ||
        'Meeting concluded with closing remarks.';

      const agendaSections = sections.filter(s =>
        s.section.toLowerCase().includes('agenda') ||
        s.section.toLowerCase().includes('item')
      );

      // If no agenda sections found, treat all non-opening/closing as agenda
      if (agendaSections.length === 0) {
        const nonOpeningClosing = sections.filter(s =>
          !s.section.toLowerCase().includes('opening') &&
          !s.section.toLowerCase().includes('closing') &&
          !s.section.toLowerCase().includes('start') &&
          !s.section.toLowerCase().includes('end')
        );
        agendaSections.push(...nonOpeningClosing.map((section, index) => ({
          section: `Agenda Item ${index + 1}: ${section.section}`,
          content: section.content
        })));
      }

      // Generate Header
      const header = `
**Government of Pakistan**
**Ministry of Privatisation**
**(Privatisation Commission)**

**Subject: MINUTES OF THE ${meetingType.toUpperCase()}**

A meeting was held on ${meetingType}, on ${currentDate} and attended by participants as listed **at Annex-A**.
      `.trim();

      // Format Opening and Closing
      sendProgress(sessionId, 'Formatting opening remarks...', 'formatting', 87);
      console.log('Formatting opening remarks...');
      const opening = await formatOpeningClosing(
        `Meeting on ${currentDate}, at 1209 hours, Committee Room, Privatisation Commission, Islamabad, chaired by Mr. Muhammad Ali`,
        openingContent,
        '',
        paragraphCounter
      );

      const openingParagraphs = (opening.match(/\n\d+\./g) || []).length;
      paragraphCounter += Math.max(openingParagraphs, 1);

      // Format Agenda Items
      sendProgress(sessionId, 'Formatting agenda items...', 'formatting', 90);
      console.log('Formatting agenda items...');
      const agendaItems = [];
      for (let i = 0; i < agendaSections.length; i++) {
        sendProgress(sessionId, `Formatting agenda item ${i + 1} of ${agendaSections.length}...`, 'formatting', 90 + (i / agendaSections.length) * 5);
        
        const agendaContent = agendaSections[i].content;
        const narrative = await extractSpeakerContributions(agendaContent, paragraphCounter);
        const formattedAgenda = await formatAgendaMinutes(
          narrative,
          paragraphCounter,
          i + 1,
          `0${i + 1}(02)2025`,
          currentDate,
          agendaSections[i].section.replace(/^Agenda Item \d+:\s*/, '').trim() || `Discussion Item ${i + 1}`
        );
        agendaItems.push(formattedAgenda);

        const agendaParagraphs = (formattedAgenda.match(/\n\d+\./g) || []).length;
        paragraphCounter += Math.max(agendaParagraphs, 2);
      }

      // Format Closing
      sendProgress(sessionId, 'Formatting closing remarks...', 'formatting', 95);
      console.log('Formatting closing remarks...');
      const closing = await formatOpeningClosing(
        '',
        '',
        closingContent,
        paragraphCounter
      );

      // Step 6: Combine Minutes
      sendProgress(sessionId, 'Combining final minutes...', 'formatting', 98);
      console.log('Combining final minutes...');
      finalMinutes = await combineMinutes(

        header, 
        opening, 
        agendaItems.join('\n\n'), 
        closing
      );
    }

    await fs.writeFile(minutesFilePath, finalMinutes, 'utf8');
    sendProgress(sessionId, 'Meeting minutes generated successfully!', 'completed', 100);
    console.log(`Meeting minutes saved to ${minutesFilePath}`);

    // Step 7: Return Response
    res.status(200).json({
      sessionId: sessionId, // Include session ID in response
      transcription: successfulResults.map(r => r.transcript),
      transcriptFile: transcriptFileName,
      minutesFile: minutesFileName,
      gptText: finalMinutes,
      sectionsProcessed: sections.length,
      meetingType: meetingType,
      format: meetingType.toLowerCase().includes('internal') || meetingType.toLowerCase().includes('record') ? 'Record Note' : 'Board Minutes',
      chunksProcessed: successfulResults.length,
      totalChunks: chunks.length,
      failedChunks: failedResults.length
    });

    // Clean up the progress connection
    setTimeout(() => {
      if (global.progressConnections && global.progressConnections.has(sessionId)) {
        global.progressConnections.get(sessionId).end();
        global.progressConnections.delete(sessionId);
      }
    }, 5000);

  } catch (err) {
    console.error('Error in chunked Windows upload:', err);
    sendProgress(sessionId, `Error: ${err.message}`, 'error', 0);
    
    res.status(500).json({
      error: 'Failed to process large file on Windows.',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  } finally {
    // Cleanup files
    console.log('Starting cleanup...');
    try {
      if (await fileExists(audioPath)) {
        await fs.unlink(audioPath);
        console.log('Original audio file cleaned up');
      }

      if (await fileExists(tempDir)) {
        const files = await fs.readdir(tempDir);
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          try {
            await fs.unlink(filePath);
          } catch (unlinkError) {
            console.warn(`Failed to delete file ${filePath}:`, unlinkError.message);
          }
        }

        try {
          await fs.rmdir(tempDir);
          console.log('Temporary directory cleaned up');
        } catch (rmdirError) {
          console.warn('Failed to remove temp directory:', rmdirError.message);
        }
      }
    } catch (cleanupError) {
      console.warn('Cleanup error:', cleanupError.message);
    }
  }
});


app.post('/temp-chunked-windows', upload.single('audio'), async (req, res) => {
    try {
        // Hardcoded response for testing
        const hardcodedResponse = {
            "transcription": [
                "Khan: Hi, my name is Khan, and I am not a terrorist."
            ],
            "transcriptFile": "transcript_2025-06-10T15-43-03-529Z.txt",
            "minutesFile": "meeting_minutes_2025-06-10T15-43-03-529Z.txt",
            "gptText": "**Government of Pakistan**  \n**Ministry of Privatisation**  \n**(Privatisation n Doe        | PC Board Member                 | Privatisation Commission         |  \n\n--- \n\n[Note: Please fill in any additional participant details if necessary before finalizing the document.]",
            "sectionsProcessed": 3,
            "meetingType": "Board Meeting",
            "format": "Board Minutes"
        };

        // Return the hardcoded response
        res.status(200).json(hardcodedResponse);
    } catch (error) {
        console.error('Error in temp-chunked-windows route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


async function transcribeWithTimeoutAndRetry(chunkPath, maxRetries = 3, timeoutMs = 120000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create a promise that rejects after timeoutMs
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Transcription timed out after ${timeoutMs / 1000} seconds`)), timeoutMs);
      });

      // Race the transcription against the timeout
      const transcription = await Promise.race([
        openai.audio.translations.create({
          file: fsSync.createReadStream(chunkPath),
          model: 'whisper-1',
          language: 'en',
        }),
        timeoutPromise
      ]);

      if (!transcription.text || transcription.text.trim().length === 0) {
        throw new Error(`Empty transcription for chunk ${chunkPath}`);
      }

      console.log(`Transcription successful for chunk ${chunkPath} on attempt ${attempt}`);
      return transcription;
    } catch (error) {
      console.error(`Attempt ${attempt} failed for chunk ${chunkPath}:`, error.message);
      if (attempt === maxRetries) {
        console.warn(`Max retries reached for chunk ${chunkPath}. Skipping.`);
        return null; // Return null to indicate failure after max retries
      }
      // Wait before retrying (e.g., 1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}


app.post('/uploads-chunked-windows', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    console.log('Meeting Type:', req.body.meetingType);
    console.log('Uploaded PDF Name:', req.body.uploadedPdfName);
    console.log('Audio File Name:', req.file.originalname);
    console.log('Audio File Buffer Size:', req.file.buffer.length);

    const audioPath = req.file.path;
    const tempDir = path.join('uploads', `temp_${Date.now()}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const transcriptFileName = `transcript_${timestamp}.txt`;
    const transcriptFilePath = path.join('uploads', transcriptFileName);
    const minutesFileName = `meeting_minutes_${timestamp}.txt`;
    const minutesFilePath = path.join('uploads', minutesFileName);

    await fsp.mkdir(tempDir, { recursive: true });

    // 1. Split audio file into chunks
    console.log('Splitting audio file...');
    const chunks = await splitAudioWindows(audioPath, tempDir);
    console.log(`Split into ${chunks.length} chunks`);

    res.status(500).json({ message: 'File processed and split successfully', chunks: chunks });

  } catch (error) {
    console.error('Error occurred during file processing:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});







/**
 * Split text into overlapping chunks
 * @param {string} text - The full text to split
 * @param {number} chunkSize - Maximum size of each chunk
 * @param {number} overlap - Number of characters to overlap between chunks
 * @returns {string[]} - Array of text chunks
 */
function splitTextIntoChunks(text, chunkSize, overlap) {
  const chunks = [];
  let startPos = 0;

  while (startPos < text.length) {
    const endPos = Math.min(startPos + chunkSize, text.length);
    chunks.push(text.substring(startPos, endPos));
    startPos = endPos - overlap;

    // If we're near the end, just include the rest and break
    if (text.length - startPos < chunkSize / 2) {
      if (startPos < text.length) {
        chunks.push(text.substring(startPos));
      }
      break;
    }
  }

  return chunks;
}

async function getAttributes(email) {
  const userPoolId = 'us-east-2_CXSPP8aex';

  const params = {
    UserPoolId: userPoolId, // Your Cognito User Pool ID
    Username: email,         // The email of the user
  };

  try {
    const response = await cognito.adminGetUser(params).promise();

    // Parse user attributes
    const attributes = response.UserAttributes.reduce((acc, attr) => {
      acc[attr.Name] = attr.Value;
      return acc;
    }, {});

    return attributes;
  } catch (error) {
    console.error('Error fetching user attributes:', error);
    throw error;
  }
}

app.get('/user/attributes', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const attributes = await getAttributes(email);
    res.json({ email, attributes });
  } catch (error) {
    res.status(500).send('Error fetching user attributes');
  }
});

app.post('/create-checkout-session', async (req, res) => {
  const { email, plan } = req.body;

  const individualMonthly = process.env.Stripe_individualMonthly;
  const individualAnnual = process.env.Stripe_individualAnnual;

  // Map "free" to individualMonthly and apply a trial later
  const plantype = (plan === 'individual-monthly' || plan === 'free' ? individualMonthly : individualAnnual);

  try {
    // Create or retrieve a customer with the provided email
    let customer = await stripe.customers.list({ email });

    if (customer.data.length > 0) {
      customer = customer.data[0]; // Use existing customer
    } else {
      customer = await stripe.customers.create({
        email, // Fixed email assigned to the customer
      });
    }

    const sessionData = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customer.id, // Assign the fixed customer
      line_items: [
        {
          price: plantype,
          quantity: 1,
        },
      ],
      success_url: `https://www.slpeace.com/subscription/success/?email=${email}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.slpeace.com/subscription/cancel`,
      metadata: {
        email: email, // Still storing in metadata, but now it's also enforced in the customer object
        plan: plan
      },
      subscription_data: {
        metadata: {
          email: email,
          plan: plan
        },
      }
    };

    // Add trial period only if the plan is "free"
    if (plan === 'free') {
      sessionData.subscription_data.trial_period_days = 3;
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});




app.post('/verify-payment', async (req, res) => {
  try {
    const { sessionId } = req.body;
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check payment status
    if (session.payment_status === 'paid') {
      return res.status(200).json({ paid: true });
    } else {
      return res.status(200).json({ paid: false, error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error.message);
    return res.status(500).json({ paid: false, error: 'Internal server error' });
  }
});

// app.get('/active-subscriptions', async (req, res) => {
//   const { email, sub } = req.query;
//   try {
//     const userAttributes = await getAttributes(email);
//     if (!userAttributes) {
//       return res.status(404).send({ error: 'User not found in Cognito' });
//     }

//     // Check if the user identity matches the 'sub' from the query
//     if (userAttributes.sub !== sub) {
//       return res.status(400).send({ error: 'User identity mismatch' });
//     }

//     // First find the Stripe customer ID for this email
//     const customers = await stripe.customers.list({ email: email });
//     if (!customers.data.length) {
//       return res.status(200).json({ paid: false, filteredSubscriptions: [] });
//     }

//     const customerId = customers.data[0].id;

//     // Retrieve subscriptions for this specific customer
//     const activeSubscriptions = await stripe.subscriptions.list({ 
//       customer: customerId,
//       status: 'active'
//     });
//     const trialingSubscriptions = await stripe.subscriptions.list({ 
//       customer: customerId,
//       status: 'trialing'
//     });
//     const canceledSubscriptions = await stripe.subscriptions.list({ 
//       customer: customerId,
//       status: 'canceled'
//     });

//     // Combine all subscriptions
//     const subscriptions = [
//       ...activeSubscriptions.data,
//       ...trialingSubscriptions.data,
//       ...canceledSubscriptions.data
//     ];

//     const now = Math.floor(Date.now() / 1000);

//     // Add renewal date to each subscription
//     subscriptions.forEach(subscription => {
//       subscription.renewalDate = new Date(subscription.current_period_end * 1000).toISOString();
//     });

//     // Determine if the user has an active, trialing, or valid canceled subscription
//     const paid = subscriptions.some(subscription =>
//       subscription.status !== 'canceled' || subscription.current_period_end > now
//     );

//     res.status(200).json({ paid, filteredSubscriptions: subscriptions });
//   } catch (error) {
//     console.error('Error fetching subscriptions:', error);
//     res.status(500).send({ error: error.message });
//   }
// });



app.get('/check-payment-status', async (req, res) => {
  const { email } = req.query;
  console.log(email);


  try {
    // Retrieve all sessions with email metadata
    const sessions = await stripe.checkout.sessions.list({
      limit: 10, // Adjust as needed
    });

    // Filter sessions with the given email and check payment status
    const completedSessions = sessions.data.filter(session =>
      session.metadata.email === email && session.payment_status === 'paid'
    );

    if (completedSessions.length > 0) {
      res.status(200).send({ paid: true, sessions: completedSessions });
    } else {
      res.status(200).send({ paid: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
  }
});

app.get('/active-subscriptions', async (req, res) => {
  const { email, sub } = req.query;

  try {
    const userAttributes = await getAttributes(email);
    if (!userAttributes) {
      return res.status(404).send({ error: 'User not found in Cognito' });
    }

    if (userAttributes.sub !== sub) {
      return res.status(400).send({ error: 'User identity mismatch' });
    }

    // Create a search parameter object
    const searchParams = {
      limit: 100, // Adjust this number based on your needs
      expand: ['data.customer'],
    };

    // Add email filter using Stripe's search capabilities
    if (email) {
      searchParams.query = `metadata['email']:'${email}'`;
    }

    // Fetch subscriptions with the correct search parameters
    const activeSubscriptions = await stripe.subscriptions.search({
      ...searchParams,
      query: `${searchParams.query || ''} status:'active'`.trim(),
    });

    const trialingSubscriptions = await stripe.subscriptions.search({
      ...searchParams,
      query: `${searchParams.query || ''} status:'trialing'`.trim(),
    });

    const canceledSubscriptions = await stripe.subscriptions.search({
      ...searchParams,
      query: `${searchParams.query || ''} status:'canceled'`.trim(),
    });

    // Combine all subscriptions
    const subscriptions = [
      ...activeSubscriptions.data,
      ...trialingSubscriptions.data,
      ...canceledSubscriptions.data
    ];

    const now = Math.floor(Date.now() / 1000);

    // Add renewal date to each subscription
    const enhancedSubscriptions = subscriptions.map(subscription => ({
      ...subscription,
      renewalDate: new Date(subscription.current_period_end * 1000).toISOString()
    }));

    // Determine if user has an active subscription
    const paid = enhancedSubscriptions.some(subscription =>
      subscription.status !== 'canceled' || subscription.current_period_end > now
    );

    res.status(200).json({
      paid,
      filteredSubscriptions: enhancedSubscriptions
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).send({ error: error.message });
  }
});

app.get('/subscription/:subscriptionId', async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    // Retrieve subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Add a renewal date field for easier handling
    const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();

    res.status(200).json({
      subscription,
      renewalDate,
      paid: subscription.status !== 'canceled'
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// app.get('/active-subscriptions', async (req, res) => {
//   const { email, sub } = req.query;

//   try {
//     const userAttributes = await getAttributes(email);
//     if (!userAttributes) {
//       return res.status(404).send({ error: 'User not found in Cognito' });
//     }

//     // Validate user identity
//     if (userAttributes.sub !== sub) {
//       return res.status(400).send({ error: 'User identity mismatch' });
//     }

//     // Try to get the Stripe customer by email
//     const customers = await stripe.customers.list({ email });
//     let customerId = customers.data.length ? customers.data[0].id : null;

//     let subscriptions = [];

//     if (customerId) {
//       // Fetch subscriptions for the specific customer
//       const activeSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'active' });
//       const trialingSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'trialing' });
//       const canceledSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'canceled' });

//       subscriptions = [
//         ...activeSubscriptions.data,
//         ...trialingSubscriptions.data,
//         ...canceledSubscriptions.data
//       ];
//     } else {
//       // Fetch all subscriptions and filter manually if customer isn't found
//       const activeSubscriptions = await stripe.subscriptions.list({ status: 'active' });
//       const trialingSubscriptions = await stripe.subscriptions.list({ status: 'trialing' });
//       const canceledSubscriptions = await stripe.subscriptions.list({ status: 'canceled' });

//       subscriptions = [
//         ...activeSubscriptions.data,
//         ...trialingSubscriptions.data,
//         ...canceledSubscriptions.data
//       ].filter(subscription => subscription.metadata.email === email);
//     }

//     const now = Math.floor(Date.now() / 1000);

//     // Add renewal date and determine if user has an active/trialing/valid canceled subscription
//     subscriptions.forEach(subscription => {
//       subscription.renewalDate = new Date(subscription.current_period_end * 1000).toISOString();
//     });

//     const paid = subscriptions.some(subscription =>
//       subscription.status !== 'canceled' || subscription.current_period_end > now
//     );

//     res.status(200).json({ paid, filteredSubscriptions: subscriptions });

//   } catch (error) {
//     console.error('Error fetching subscriptions:', error);
//     res.status(500).send({ error: error.message });
//   }
// });



app.get('/all-live-subscriptions', async (req, res) => {
  try {
    console.log(`[INFO] Fetching all subscriptions from Stripe...`);

    // Retrieve all subscriptions (paginated, if necessary)
    const activeSubscriptions = await stripe.subscriptions.list({ status: 'active' });
    const trialingSubscriptions = await stripe.subscriptions.list({ status: 'trialing' });
    const canceledSubscriptions = await stripe.subscriptions.list({ status: 'canceled' });

    // Combine all subscriptions
    const allSubscriptions = [
      ...activeSubscriptions.data,
      ...trialingSubscriptions.data,
      ...canceledSubscriptions.data
    ];

    // Filter only live-mode subscriptions
    const liveSubscriptions = allSubscriptions.filter(sub => sub.livemode);

    console.log(`[INFO] Retrieved ${liveSubscriptions.length} live subscriptions.`);

    res.status(200).json({ allSubscriptions });
  } catch (error) {
    console.error('[ERROR] Failed to fetch subscriptions:', error);
    res.status(500).send({ error: error.message });
  }
});



app.post('/cancel-subscription', async (req, res) => {
  const { subscriptionId } = req.body; // The subscription ID to cancel
  console.log(subscriptionId);


  try {
    // Cancel the subscription using the subscription ID
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

    res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully',
      canceledSubscription: canceledSubscription
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


app.get('/promoCode', async (req, res) => {
  const promoCode1 = process.env.Promo_Code;
  const promoCode2 = process.env.Promo_Code_90Days;
  const { code } = req.query;

  // Adding a delay of 2 seconds (2000 ms)
  setTimeout(() => {
    if (code === promoCode1) {
      res.status(200).json({ valid: true });
    } else if (code === promoCode2) {
      res.status(200).json({ valid: true, days: 90 });
    } else {
      res.status(200).json({ valid: false });
    }
  }, 2); // 2000 ms = 2 seconds delay
});





app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        sizeError: 'File size is too large. Maximum size is 200MB.',
      });
    }
  }
  console.log(err)
  // For other errors, return a 500 status code
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});