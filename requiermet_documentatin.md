# 📄 Dichoptic Therapy Web Application – Requirements Document

## 1. **Overview**

This document outlines the specifications for a browser-based dichoptic therapy application. The primary objective is to deliver therapeutic visual stimuli through interactive games that present different images to each eye, thereby promoting binocular vision and reducing suppression of the affected eye.

## 2. **Objectives**

* Implement dichoptic therapy techniques to alleviate diplopia in post-stroke adults.
* Provide an engaging, game-based platform to improve patient compliance.
* Ensure the application operates standalone within modern web browsers.
* Log and monitor user performance for progress tracking.

## 3. **Target Audience**

* Adults experiencing diplopia due to stroke-related neurovisual deficits.
* Individuals with convergence insufficiency or impaired stereopsis post-stroke.
* Patients seeking non-invasive, home-based vision therapy solutions.([NCBI][1], [UHC Provider][2], [Aetna][3])

## 4. **Functional Requirements**

### 4.1 **User Interface**

* Responsive design compatible with desktops, tablets, and mobile devices.
* Intuitive navigation with clear instructions suitable for adults with potential cognitive impairments.
* Accessibility features, including adjustable font sizes, high-contrast modes, and screen reader compatibility.

### 4.2 **Dichoptic Game Mechanics**

* Use of red-green or red-blue anaglyph glasses to present separate images to each eye.
* Games that require binocular coordination, such as:

  * Falling blocks where each eye sees different elements.
  * Maze navigation with obstacles visible to only one eye.
  * Target shooting where targets appear alternately to each eye.
* Adjustable contrast and brightness settings to balance visual input between eyes.

### 4.3 **Performance Logging**

* Track metrics such as:

  * Session duration.
  * Game scores and levels achieved.
  * Response times and accuracy.
* Store data locally using browser storage (e.g., IndexedDB) to maintain user privacy.
* Option to export performance data in CSV or JSON formats for clinical review.([PubMed][4])

### 4.4 **User Management**

* Local user profiles with customizable avatars.
* Password-protected access to prevent unauthorized usage.
* Caregiver or therapist access to monitor and adjust therapy settings.

### 4.5 **Therapy Scheduling**

* Customizable therapy plans (e.g., 30 minutes daily, 5 days a week).
* Automated reminders and notifications for scheduled sessions.
* Progress tracking dashboards for users and caregivers.

## 5. **Non-Functional Requirements**

### 5.1 **Performance**

* Smooth gameplay with minimal latency.
* Quick load times, even on devices with limited resources.

### 5.2 **Security**

* Data encryption for stored performance logs.
* Compliance with data protection regulations (e.g., GDPR) if user data is collected.

### 5.3 **Compatibility**

* Support for major browsers: Chrome, Firefox, Safari, and Edge.
* Functionality without the need for browser plugins or extensions.

### 5.4 **Maintainability**

* Modular codebase to facilitate updates and feature additions.
* Comprehensive documentation for developers and users.

## 6. **Technical Stack**

* **Frontend**: HTML5, CSS3, JavaScript (ES6+), WebGL for graphics rendering.
* **Data Storage**: IndexedDB or LocalStorage for offline data persistence.
* **Frameworks/Libraries**: React or Vue.js for UI components; Phaser.js for game development.

## 7. **Assumptions and Constraints**

* Users will have access to red-green or red-blue anaglyph glasses.
* The application will not require an internet connection post-initial load.
* No backend server will be used; all data processing occurs client-side.

## 8. **Future Enhancements**

* Integration with eye-tracking hardware for advanced diagnostics.
* Cloud synchronization for data backup and multi-device access.
* Multi-language support to cater to a broader user base.

## 9. **References**

* [A dichoptic custom-made action video game as a treatment for adult amblyopia](https://pubmed.ncbi.nlm.nih.gov/25917239/)
* [Treating Neurovisual Deficits and Spatial Neglect](https://www.ncbi.nlm.nih.gov/books/NBK585577/)
* [Best Vision Therapy Games for Lazy Eye and Amblyopia for All Ages](https://www.cookvisiontherapy.com/best-games-for-lazy-eye-amblyopia-fun-vision-therapy-ideas-for-all-ages/)([PubMed][4], [NCBI][1], [Cook Vision Therapy][5])

---

This requirements document serves as a foundational blueprint for developing a browser-based dichoptic therapy application aimed at treating diplopia in adults post-stroke through engaging, interactive games.

[1]: https://www.ncbi.nlm.nih.gov/books/NBK585577/?utm_source=chatgpt.com "Treating Neurovisual Deficits and Spatial Neglect - NCBI"
[2]: https://www.uhcprovider.com/content/dam/provider/docs/public/policies/comm-medical-drug/visual-information-processing-evaluation-orthoptic-vision-therapy.pdf?utm_source=chatgpt.com "[PDF] Visual Information Processing Evaluation and Orthoptic and Vision ..."
[3]: https://www.aetna.com/cpb/medical/data/400_499/0489.html?utm_source=chatgpt.com "Orthoptic Vision Therapy - Medical Clinical Policy Bulletins - Aetna"
[4]: https://pubmed.ncbi.nlm.nih.gov/25917239/?utm_source=chatgpt.com "A dichoptic custom-made action video game as a treatment for adult ..."
[5]: https://www.cookvisiontherapy.com/best-games-for-lazy-eye-amblyopia-fun-vision-therapy-ideas-for-all-ages/?utm_source=chatgpt.com "Best Vision Therapy Games for Lazy Eye and Amblyopia for All Ages"

