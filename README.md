# Jilani Agro - Dynamic E-commerce Website

## Overview
This is a dynamic e-commerce website for Jilani Agro, a company selling agricultural products. The website features a product catalog, shopping cart, and an admin panel for product management.

## Features
- **Dynamic Product Management**: Add, edit, delete, and update products through the admin panel
- **Firebase Integration**: Uses Firebase for authentication, database, and storage
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Shopping Cart**: Add products to cart, adjust quantities, and place orders via WhatsApp
- **Admin Authentication**: Secure login for administrators

## Technology Stack
- HTML5, CSS3, JavaScript (ES6+)
- Firebase Authentication
- Firebase Firestore (Database)
- Firebase Storage (Images)
- Firebase Hosting

## Project Structure
- `index.html` - Main HTML file
- `styles.css` - CSS styles
- `script.js` - Main JavaScript file with UI logic
- `firebase.js` - Firebase configuration and functions
- `firebase.json` - Firebase deployment configuration
- `firestore.rules` - Security rules for Firestore
- `storage.rules` - Security rules for Firebase Storage
- `firestore.indexes.json` - Firestore indexes configuration

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)

### Firebase Setup
1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Enable Storage
5. Update the Firebase configuration in `firebase.js` with your project's credentials

### Admin Setup
1. Create an admin user through Firebase Authentication
2. In the Firebase console, go to Authentication > Users
3. Find your admin user and copy the User UID
4. Go to Firestore Database and create a collection called `admins`
5. Add a document with the ID matching the admin User UID
6. Add a field `role` with value `admin`

### Deployment
1. Login to Firebase: `firebase login`
2. Initialize Firebase in the project directory: `firebase init`
3. Deploy to Firebase: `firebase deploy`

## Maintenance Guide

### Adding New Features
- **New Product Fields**: Update the product form in `index.html`, the product object in `script.js`, and the Firestore schema in `firebase.js`
- **New Pages**: Create new HTML files and link them in the navigation

### Updating Firebase Configuration
- If you need to change Firebase projects or settings, update the configuration in `firebase.js`

### Troubleshooting
- **Authentication Issues**: Check Firebase Authentication console and security rules
- **Database Issues**: Verify Firestore rules and indexes
- **Storage Issues**: Check Storage rules and permissions

## Security Considerations
- Admin authentication is handled through Firebase Authentication
- Firestore security rules restrict access to sensitive data
- Storage rules protect product images from unauthorized modifications

## License
All rights reserved. This project is proprietary and confidential.

## Contact
For support or inquiries, contact support@jilaniagro.com