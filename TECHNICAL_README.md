# PDF RAG Application - Technical Documentation

This document provides technical details about the implementation and architecture of the PDF RAG (Retrieval-Augmented Generation) Application.

## Technology Stack

### Frontend (This Repository)
- **Framework**: Next.js 14 with App Router
- **UI Components**: Tailwind CSS, Shadcn/ui
- **State Management**: Zustand
- **PDF Processing**: PDF.js
- **TypeScript**: For type safety and better developer experience

### Backend (Separate Repository)
- **Framework**: FastAPI
- **Vector Database**: Pinecone
- **Embedding Model**: OpenAI Ada-002
- **LLM**: OpenAI GPT-3.5/4
- **PDF Processing**: PyPDF2, pdf2image

## Architecture

### Frontend Architecture
```
client/
├── app/                    # Next.js app directory
│   ├── (nondashboard)/    # Public routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── api/                   # API client functions
├── lib/                   # Utility functions
└── store/                # Zustand state management
```

### Key Features Implementation

1. **PDF Processing**
   - Client-side PDF parsing using PDF.js
   - Image extraction and processing
   - Chunking for better context retrieval

2. **Chat Interface**
   - Real-time message updates
   - Context-aware responses
   - Citation highlighting

3. **State Management**
   - PDF document state
   - Chat history
   - UI state management

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/MinhThieu145/pdf-rag-application.git
cd pdf-rag-application
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=your_backend_url
```

4. Run development server:
```bash
npm run dev
```

## API Integration

The frontend communicates with the backend through RESTful APIs:

- `/api/upload`: PDF document upload
- `/api/chat`: Chat completion endpoint
- `/api/process`: PDF processing endpoint

## Performance Optimizations

- Lazy loading of PDF pages
- Optimized image processing
- Efficient state management
- Caching strategies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Improvements

- [ ] Implement real-time collaboration
- [ ] Add document comparison features
- [ ] Enhance citation accuracy
- [ ] Add support for more document formats

## License

This project is licensed under the MIT License - see the LICENSE file for details.
