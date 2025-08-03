document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('ndt-report-form');
  
  // Simple anti-abuse measures
  let formInteractions = 0;
  let lastRequestTime = 0;
  const minInteractionsRequired = 3;
  const minTimeBetweenRequests = 10000; // 10 seconds
  
  // Track form interactions to verify human user
  form.addEventListener('input', function() {
    formInteractions++;
  });
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Anti-abuse check: require minimum form interactions
    if (formInteractions < minInteractionsRequired) {
      alert('Please fill out the form completely before generating a report.');
      return;
    }
    
    // Anti-abuse check: rate limiting
    const now = Date.now();
    if (now - lastRequestTime < minTimeBetweenRequests) {
      alert('Please wait a moment before generating another report.');
      return;
    }
    lastRequestTime = now;
    
    // Anti-abuse check: check if we're on the correct domain
    const allowedDomains = ['rebelcolony.github.io', 'localhost', '127.0.0.1'];
    const currentDomain = window.location.hostname;
    if (!allowedDomains.includes(currentDomain)) {
      alert('This service is only available from authorized domains.');
      return;
    }
    
    // Collect all form data
    const formData = new FormData(form);
    const reportData = {};
    
    // Convert FormData to regular object
    for (let [key, value] of formData.entries()) {
      reportData[key] = value;
    }
    
    // Structure probe data
    reportData.probes = [];
    for (let i = 1; i <= 4; i++) {
      const probe = {
        angle: reportData[`probe_angle_${i}`] || '',
        frequency: reportData[`probe_frequency_${i}`] || '',
        serial: reportData[`probe_serial_${i}`] || '',
        diameter: reportData[`probe_diameter_${i}`] || ''
      };
      
      // Only add probe if at least one field is filled
      if (probe.angle || probe.frequency || probe.serial || probe.diameter) {
        reportData.probes.push(probe);
      }
      
      // Clean up individual probe fields from reportData
      delete reportData[`probe_angle_${i}`];
      delete reportData[`probe_frequency_${i}`];
      delete reportData[`probe_serial_${i}`];
      delete reportData[`probe_diameter_${i}`];
    }
    
    try {
      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Generating PDF...';
      submitButton.disabled = true;
      
      // Use hardcoded API key with obfuscation
      // This is still not completely secure but better than plaintext
      const apiKey = atob('WW91cl9BUElfS2V5X0hlcmU='); // Base64 encoded API key
      
      const apiUrl = 'https://pdf.rebelcolony.com/generate/ndt-report';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        mode: 'cors',
        body: JSON.stringify(reportData)
      });
      
      if (response.ok) {
        // Handle successful response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NDT_Report_${reportData.inspection_date || 'report'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('PDF report generated successfully!');
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorText}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF report: ${error.message}. Please try again.`);
    } finally {
      // Reset button state
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  });
});
