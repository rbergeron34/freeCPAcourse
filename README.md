# Free CPA Course Website

A professional-looking website that organizes free YouTube content into a structured CPA exam preparation course.

## Overview

This website provides a free alternative to expensive CPA review courses by curating high-quality YouTube videos and organizing them by exam section (FAR, AUD, BEC, REG) and topic. The site features:

- Professional course-like layout
- Sections organized by CPA exam topics
- Embedded curated YouTube videos as the main content
- Progress tracking for users
- Mobile-responsive design

## Project Structure

```
Free CPA Course/
├── index.html              # Main landing page
├── styles.css              # Global styles
├── script.js               # Global JavaScript functionality
├── README.md               # Project documentation
├── far/                    # Financial Accounting and Reporting section
│   ├── index.html          # FAR main page
│   └── section.css         # FAR-specific styles
├── aud/                    # Auditing and Attestation section (to be created)
├── bec/                    # Business Environment and Concepts section (to be created)
└── reg/                    # Regulation section (to be created)
```

## Getting Started

This is a static website that can be viewed locally or deployed to any web hosting service.

### Local Development

1. Clone the repository
2. Open `index.html` in your browser to view the website
3. Make changes to HTML, CSS, or JavaScript files as needed
4. Refresh the browser to see your changes

### Deployment

The website can be deployed to any static site hosting service such as:
- GitHub Pages
- Netlify
- Vercel
- Amazon S3
- Any standard web hosting provider

## Future Development

### Planned Features

1. **User Authentication**
   - Allow users to create accounts to save their progress
   - Implement login/signup functionality

2. **Complete All Sections**
   - Create pages for AUD, BEC, and REG sections
   - Curate videos for all major topics in each section

3. **Study Notes**
   - Add downloadable PDF study notes to accompany videos
   - Create flashcards for key concepts

4. **Practice Questions**
   - Add practice questions for each topic
   - Create simulated mini-exams

5. **Community Features**
   - Add a discussion forum for users to ask questions
   - Create a study group feature

## Adding New Content

### Adding a New Topic

1. Create a new topic card in the relevant section's index.html file
2. Follow the existing HTML structure for consistency
3. Find high-quality YouTube videos for the topic
4. Embed the videos using the iframe format shown in existing topics

### Adding a New Section

1. Create a new directory for the section (e.g., `aud/`)
2. Copy the structure from the FAR section
3. Update the content to reflect the new section's topics
4. Update the section header colors in section.css

## Credits

- All videos belong to their respective creators on YouTube
- Icons from Font Awesome
- Responsive design using custom CSS

## License

This project is open source and available for anyone to use and modify for educational purposes.
