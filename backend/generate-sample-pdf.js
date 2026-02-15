/**
 * ============================================================================
 * SAMPLE PDF GENERATOR FOR TESTING
 * ============================================================================
 * 
 * Generates a sample PDF document for testing file upload features
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

async function generateSamplePDF() {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const pdfPath = path.join(uploadsDir, 'sample-document.pdf');

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Create write stream
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // Add title
    doc.fontSize(24).font('Helvetica-Bold').text('Machine Learning: A Complete Guide', 100, 100);
    
    // Add introduction
    doc.fontSize(12).font('Helvetica').text('\n');
    doc.fontSize(14).font('Helvetica-Bold').text('Introduction');
    doc.fontSize(11).font('Helvetica').text(
      'Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. ' +
      'This document provides a comprehensive overview of machine learning concepts, techniques, and applications.',
      { align: 'left', width: 500 }
    );

    // Add section 1
    doc.addPage().fontSize(14).font('Helvetica-Bold').text('1. What is Machine Learning?');
    doc.fontSize(11).font('Helvetica').text(
      'Machine Learning (ML) represents a paradigm shift in how we approach problem-solving and decision-making. ' +
      'Instead of writing explicit instructions for every scenario, ML systems learn patterns from data and ' +
      'generalize to new, unseen examples. This approach has revolutionized fields such as computer vision, ' +
      'natural language processing, and predictive analytics.',
      { align: 'left', width: 500 }
    );

    // Add section 2
    doc.fontSize(14).font('Helvetica-Bold').text('\n2. Types of Machine Learning');
    doc.fontSize(11).font('Helvetica').text('\nSupervised Learning:');
    doc.fontSize(10).font('Helvetica').text(
      'Models trained on labeled data where inputs are paired with desired outputs. Examples: Classification, Regression.',
      { align: 'left', width: 500 }
    );
    
    doc.fontSize(11).font('Helvetica').text('\nUnsupervised Learning:');
    doc.fontSize(10).font('Helvetica').text(
      'Models learn from unlabeled data to find hidden patterns. Examples: Clustering, Dimensionality Reduction.',
      { align: 'left', width: 500 }
    );
    
    doc.fontSize(11).font('Helvetica').text('\nReinforcement Learning:');
    doc.fontSize(10).font('Helvetica').text(
      'Models learn through interaction with an environment, receiving rewards or penalties for actions.',
      { align: 'left', width: 500 }
    );

    // Add section 3
    doc.addPage().fontSize(14).font('Helvetica-Bold').text('3. Applications of Machine Learning');
    doc.fontSize(11).font('Helvetica').text(
      '• Healthcare: Disease diagnosis, drug discovery, personalized treatment\n' +
      '• Finance: Fraud detection, risk assessment, algorithmic trading\n' +
      '• E-commerce: Recommendation systems, price optimization\n' +
      '• Transportation: Autonomous vehicles, route optimization\n' +
      '• Natural Language Processing: Translation, sentiment analysis, chatbots',
      { align: 'left', width: 500 }
    );

    // Add section 4
    doc.fontSize(14).font('Helvetica-Bold').text('\n4. Key Machine Learning Algorithms');
    doc.fontSize(11).font('Helvetica').text(
      '• Linear Regression: Predicting continuous values\n' +
      '• Decision Trees: Creating decision rules from data\n' +
      '• Support Vector Machines: Classification and regression\n' +
      '• Neural Networks: Deep learning for complex patterns\n' +
      '• K-Means Clustering: Grouping similar data points',
      { align: 'left', width: 500 }
    );

    // Add footer
    doc.fontSize(9).font('Helvetica').text(
      '\n\nGenerated for MERNAI Learning Platform | ' + new Date().toLocaleDateString(),
      { align: 'center' }
    );

    // End document
    doc.end();

    // Promise to handle stream completion
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log('✅ Sample PDF created: ' + pdfPath);
        resolve(pdfPath);
      });
      stream.on('error', reject);
      doc.on('error', reject);
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    throw error;
  }
}

generateSamplePDF().catch(err => {
  console.error(err);
  process.exit(1);
});
