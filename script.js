// Configuration array for questions (add, remove, or modify as needed)
const questions = [
    {
      id: 'q1',
      type: 'text',
      label: 'Enter your Discord Username and ID',
      description: 'Example: someonehere | 587932546805792779'
    },
    {
      id: 'q2',
      type: 'scale',
      label: 'Rate your experience with Internal Affairs related activities',
      description: 'Select a number from 1 (least experience) to 10 (most experience).'
    },
    {
      id: 'q3',
      type: 'text-paragraph',
      label: 'Why do you want to join?',
      description: 'Why would you like to join the Professional Standards Command?'
    },
    {
      id: 'q4',
      type: 'text-paragraph',
      label: 'Tell us about yourself.',
      description: 'Tell us about yourself'
    },
    {
      id: 'q5',
      type: 'checkbox',
      label: "What's your GD rank?",
      description: 'Your rank in General Duties.',
      options: ['PCON', 'CON', 'SCON', 'LSCON', 'SGT', 'SSGT', 'CO+'],
      singleSelection: true
    },
    {
      id: 'q6',
      type: 'text-paragraph',
      label: 'What are your strengths and weaknesses?',
      description: 'What are your strengths and weaknesses?'
    },
    {
      id: 'q7',
      type: 'text-paragraph',
      label: 'Do you have any previous experience?',
      description: 'Do you have any previous experience?'
    },
    {
      id: 'q8',
      type: 'text-paragraph',
      label: 'What do you think being part of the PSC involves?',
      description: 'What do you think being part of the PSC involves?'
    },
    {
      id: 'q9',
      type: 'checkbox',
      label: 'Do you understand you must keep confidentiality involving all PSC cases.',
      description: 'Very Important',
      options: ['Yes', 'No'],
      singleSelection: true
    },
    {
      id: 'q10',
      type: 'text-paragraph',
      label: 'Notes',
      description: 'Any further notes you may need to add.'
    }
  ];
  
  /**
   * Creates and returns a DOM element for a question based on its type.
   * @param {Object} question - The question configuration object.
   * @returns {HTMLElement} - The container with the question elements.
   */
  function createQuestionElement(question) {
    const container = document.createElement('div');
    container.classList.add('question');
  
    // Create the label element for the question.
    const label = document.createElement('label');
    label.textContent = question.label;
    label.setAttribute('for', question.id);
    container.appendChild(label);
  
    // Create the description element if provided.
    if (question.description) {
      const description = document.createElement('small');
      description.classList.add('description');
      description.textContent = question.description;
      container.appendChild(description);
    }
  
    // Create input elements based on question type.
    if (question.type === 'text') {
      // Standard single-line text input.
      const input = document.createElement('input');
      input.type = 'text';
      input.id = question.id;
      input.name = question.id;
      container.appendChild(input);
    } else if (question.type === 'text-paragraph') {
      // Multi-line text area that auto-resizes as the user types.
      const textarea = document.createElement('textarea');
      textarea.id = question.id;
      textarea.name = question.id;
      textarea.style.overflow = 'hidden';
      textarea.style.resize = 'none'; // Disable manual resizing if desired.
      // Auto-resize function.
      textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
      container.appendChild(textarea);
    } else if (question.type === 'checkbox') {
      // For checkboxes, create an input for each option.
      question.options.forEach((option, index) => {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.classList.add('checkbox-item');
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${question.id}_${index}`;
        checkbox.name = question.id;
        checkbox.value = option;
        checkboxContainer.appendChild(checkbox);
  
        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', `${question.id}_${index}`);
        checkboxLabel.textContent = option;
        checkboxContainer.appendChild(checkboxLabel);
  
        // Enforce single selection if specified.
        if (question.singleSelection) {
          checkbox.addEventListener('change', function () {
            if (this.checked) {
              // Uncheck all other checkboxes in this group.
              const checkboxes = container.querySelectorAll(`input[name="${question.id}"]`);
              checkboxes.forEach(cb => {
                if (cb !== this) {
                  cb.checked = false;
                }
              });
            }
          });
        }
  
        container.appendChild(checkboxContainer);
      });
    } else if (question.type === 'scale') {
      // For scales, create radio buttons from 1 to 10.
      const scaleContainer = document.createElement('div');
      scaleContainer.classList.add('scale-container');
      for (let i = 1; i <= 10; i++) {
        const radioContainer = document.createElement('div');
        radioContainer.classList.add('radio-item');
  
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `${question.id}_${i}`;
        radio.name = question.id;
        radio.value = i;
        radioContainer.appendChild(radio);
  
        const radioLabel = document.createElement('label');
        radioLabel.setAttribute('for', `${question.id}_${i}`);
        radioLabel.textContent = i;
        radioContainer.appendChild(radioLabel);
  
        scaleContainer.appendChild(radioContainer);
      }
      container.appendChild(scaleContainer);
    }
    return container;
  }
  
  // Render all questions into the #questions container.
  const questionsContainer = document.getElementById('questions');
  questions.forEach(question => {
    questionsContainer.appendChild(createQuestionElement(question));
  });
  
  // Handle form submission.
  document.getElementById('applicationForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    // Rate limiting: allow submission only once per minute.
    const RATE_LIMIT_MS = 60000; // 1 minute in milliseconds
    const lastSubmission = localStorage.getItem('lastSubmission');
    if (lastSubmission && (Date.now() - parseInt(lastSubmission)) < RATE_LIMIT_MS) {
      let remaining = Math.ceil((RATE_LIMIT_MS - (Date.now() - parseInt(lastSubmission))) / 1000);
      alert(`You can only submit once per minute. Please wait ${remaining} seconds.`);
      return;
    }
  
    // Update the timestamp immediately upon submission attempt.
    localStorage.setItem('lastSubmission', Date.now().toString());
  
    const formData = new FormData(e.target);
    const result = {};
  
    // Collect responses for each question.
    questions.forEach(question => {
      if (question.type === 'checkbox') {
        // For checkboxes, collect all checked values.
        const checkedBoxes = document.querySelectorAll(`input[name="${question.id}"]:checked`);
        result[question.label] = Array.from(checkedBoxes)
          .map(box => box.value)
          .join(', ') || 'No answer provided';
      } else {
        // For text, text-paragraph, and scale (radio) inputs.
        result[question.label] = formData.get(question.id) || 'No answer provided';
      }
    });
  
    // Construct embed fields from the results.
    const fields = Object.entries(result).map(([label, answer]) => ({
      name: label,
      value: answer,
      inline: false
    }));
  
    // Create the embed object.
    const embed = {
      title: 'New Form Submission',
      fields,
      color: 0x007bff
    };
  
    // Send the embed via the Discord webhook.
    fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ embeds: [embed] })
    })
      .then(response => {
        if (response.ok) {
          alert('Form submitted successfully!');
          // Optionally, clear the form or redirect the user.
          e.target.reset();
        } else {
          alert('Failed to submit form.');
        }
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        alert('Error submitting form.');
      });
  });
  
