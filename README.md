# PDF Tool Station

A powerful web application for converting PDF documents to Markdown format and translating PDF content, with a clean and professional interface.

## Features

- **PDF to Markdown Conversion**
  - Extract text while preserving document structure
  - Support for complex document layouts
  - Table extraction capabilities
  - Clean, formatted output

- **PDF Translation**
  - Extract text from PDFs
  - Preserve document formatting
  - Support for multiple languages

- **Internationalization (i18n)**
  - Full multilingual support with 7 languages (English, Spanish, German, French, Chinese, Japanese, more to come)
  - Automatic language detection based on browser settings
  - Easy language switching
  - Localized UI components and messages

- **User Interface**
  - Modern, responsive design
  - Drag-and-drop file upload
  - Real-time preview
  - Raw and formatted view options
  - Download converted files

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pdf-tool-station.git
cd pdf-tool-station
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Technology Stack

- **Frontend**
  - React 18
  - Vite
  - Tailwind CSS
  - PDF.js
  - React Dropzone
  - Marked

- **Internationalization**
  - i18next
  - react-i18next
  - i18next-browser-languagedetector
  - i18next-http-backend

- **Development Tools**
  - TypeScript
  - PostCSS
  - Autoprefixer

## Project Structure

```
pdf-tool-station/
├── src/
│   ├── components/       # React components
│   ├── i18n/            # Internationalization configuration
│   ├── services/        # API and utility services
│   ├── styles/          # Global styles
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Application entry point
├── public/             # Static assets
│   ├── locales/        # Translation files
│   │   ├── en/         # English translations
│   │   ├── es/         # Spanish translations
│   │   ├── de/         # German translations
│   │   ├── fr/         # French translations
│   │   ├── zh/         # Chinese translations
│   │   └── ja/         # Japanese translations
└── dist/              # Production build output
```

## Internationalization

The application supports multiple languages and provides an intuitive language switcher component. To add or modify translations:

1. Navigate to `public/locales/{language_code}/translation.json`
2. Edit the JSON file with your translations
3. For adding a new language, create a new folder with the language code and copy the structure from an existing translation file

See the [DEPLOYMENT.md](./DEPLOYMENT.md) for more information on deployment considerations with i18n.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 更新记录
- 最后更新时间：2025年3月24日 00:05
- 添加了国际化支持，支持英语、西班牙语、德语、法语、中文和日语
- 优化SEO配置